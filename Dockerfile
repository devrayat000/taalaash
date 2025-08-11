FROM oven/bun:latest AS base

FROM base AS installer

WORKDIR /app

COPY package.json bun.lock ./

FROM installer AS watcher

WORKDIR /app

# Install dependencies as root first
RUN bun install

# Create user and change ownership
RUN useradd -ms /bin/sh -u 1001 app
RUN chown -R app:app /app

# Switch to app user
USER app

ENV NODE_ENV=development

COPY --chown=app:app . ./

EXPOSE 3000
CMD ["bun", "dev", "--port", "3000", "--host", "0.0.0.0"]

FROM installer AS builder

WORKDIR /app

ENV NODE_ENV=production

RUN bun install --frozen-lockfile --production

COPY . ./

# syntax=docker/dockerfile:1.7

# syntax=docker/dockerfile:1.7

RUN --mount=type=secret,id=envfile \
    /bin/sh -c '\
      echo "===== RAW ENVFILE ====="; \
      cat /run/secrets/envfile; \
      echo "===== STRIPPED COMMENTS/BLANKS ====="; \
      grep -v "^\s*#" /run/secrets/envfile | sed "/^\s*$/d"; \
      echo "===== PARSING & EXPORTING ====="; \
      while IFS= read -r line || [ -n "$line" ]; do \
        case "$line" in \
          \#*|"") \
            echo "Skipping line: $line"; \
            continue ;; \
        esac; \
        key=$(printf "%s" "$line" | cut -d= -f1); \
        val=$(printf "%s" "$line" | cut -d= -f2-); \
        val=${val%\"}; val=${val#\"}; \
        echo "Exporting: $key=$val"; \
        export "$key=$val"; \
      done < /run/secrets/envfile; \
      echo "===== ENV VARS AVAILABLE NOW ====="; \
      env; \
      echo "===== RUNNING BUILD ====="; \
      bun run build \
    '



FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
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

RUN --mount=type=secret,id=REDIS_URL \
    --mount=type=secret,id=PINECONE_API_KEY \
    --mount=type=secret,id=PINECONE_INDEX_NAME \
    export REDIS_URL=$(cat /run/secrets/REDIS_URL) && \
    export PINECONE_API_KEY=$(cat /run/secrets/PINECONE_API_KEY) && \
    export PINECONE_INDEX_NAME=$(cat /run/secrets/PINECONE_INDEX_NAME) && \
    bun run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
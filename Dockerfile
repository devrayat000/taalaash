FROM oven/bun:latest AS base

FROM base AS builder

WORKDIR /app

COPY package.json ./
COPY bun.lock ./

RUN bun install --frozen-lockfile

COPY . ./

ENV NODE_ENV=production
ENV NITRO_PRESET=bun
RUN bun run build

FROM base AS setup

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

ENV PORT=3000
ENV NODE_ENV=production

FROM setup AS runner

WORKDIR /app

EXPOSE $PORT
CMD ["bun", "run", ".output/server/index.mjs"]
FROM --platform=$BUILDPLATFORM oven/bun:1.4.2@sha256:9114c058aeae42162ee16dd5084b95fe9473970bb6bcb5b232ab1630f0546895 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx vp run build

FROM --platform=$BUILDPLATFORM oven/bun:1.4.2@sha256:9114c058aeae42162ee16dd5084b95fe9473970bb6bcb5b232ab1630f0546895 AS deps
ARG TARGETARCH
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts --os=linux \
  --cpu=$([ "$TARGETARCH" = amd64 ] && echo x64 || echo "$TARGETARCH")
RUN mkdir /data

FROM oven/bun:1.4.2-slim@sha256:cb3bbbb08e13a4a2ff400f24c7a2a1d5efa83f6ef8544d52d95a519631e2fc61
WORKDIR /app
ENV NODE_ENV=production DATA_DIR=/data PORT=3000 PRISMA_DISABLE_TELEMETRY=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY prisma ./prisma
COPY prisma.config.ts package.json ./
COPY --from=deps --chown=bun:bun /data /data
USER bun
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["bun", "-e", "fetch('http://localhost:3000/healthz').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["sh", "-c", "bunx --bun prisma db migrate && exec bun ./build/index.js"]

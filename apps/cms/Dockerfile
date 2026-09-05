# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
# sharp needs this on Alpine, both to build and to run
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Payload wants these present at build. They are throwaway values scoped to a
# single RUN rather than baked into an image layer, so nothing secret-shaped is
# persisted in the image history.
RUN DATABASE_URL=postgres://build:build@localhost:5432/build \
    PAYLOAD_SECRET=build-only-not-a-real-secret \
    npm run build

FROM node:22-alpine AS runner
WORKDIR /app
# libc6-compat must be present in the RUNNER stage too, or sharp fails at
# upload time rather than at build time — the classic Payload-on-Alpine trap.
RUN apk add --no-cache libc6-compat && addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=app:app /app/scripts ./scripts
USER app
EXPOSE 3000
CMD ["node", "server.js"]

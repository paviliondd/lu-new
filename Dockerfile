# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --include=optional

FROM base AS deps-prod

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --include=optional

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends wget \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nextjs \
  && useradd --system --uid 1001 --gid nextjs --home-dir /app --shell /usr/sbin/nologin nextjs

COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/content ./content
COPY --from=builder --chown=nextjs:nextjs /app/scripts ./scripts
COPY --from=deps-prod --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/src/app/data.ts ./src/app/data.ts
COPY --from=builder --chown=nextjs:nextjs /app/src/payload.config.ts ./src/payload.config.ts
COPY --from=builder --chown=nextjs:nextjs /app/src/migrations ./src/migrations
COPY --from=builder --chown=nextjs:nextjs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nextjs /app/package.json ./package.json

RUN mkdir -p /app/public/uploads && chown -R nextjs:nextjs /app/public/uploads

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "npm run payload -- migrate && node server.js"]

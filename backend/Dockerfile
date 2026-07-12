FROM node:24-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS deps-prod
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache libc6-compat \
  && addgroup -S nextjs \
  && adduser -S nextjs -G nextjs

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

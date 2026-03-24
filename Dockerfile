FROM node:22-slim AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --home /home/nextjs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads
USER nextjs
ENV HOME=/home/nextjs
EXPOSE 3847
ENV PORT=3847
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]

# syntax=docker/dockerfile:1
# Multi-stage build dla Next.js standalone

# Stage 1: deps
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Stage 2: builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Placeholder env vars for build (Next.js collects page data; Stripe/Supabase need init)
# Real values come from .env.local at runtime via docker-compose
ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ARG SUPABASE_SERVICE_ROLE_KEY=placeholder
ARG STRIPE_SECRET_KEY=sk_test_placeholder

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: runner (production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiuj output standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

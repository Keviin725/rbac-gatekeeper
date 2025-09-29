# Multi-stage build for RBAC System
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN yarn build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rbac

# Copy the built application
COPY --from=builder --chown=rbac:nodejs /app/dist ./dist
COPY --from=builder --chown=rbac:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=rbac:nodejs /app/package.json ./package.json

USER rbac

EXPOSE 3000

ENV PORT=3000

CMD ["node", "dist/server.js"]

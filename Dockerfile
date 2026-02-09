# Base
FROM node:24-alpine3.23 AS base
RUN corepack enable
WORKDIR /app
RUN corepack prepare pnpm@10.28.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Development
FROM base AS development
COPY --chown=node:node . .
USER node
CMD ["tail", "-f", "/dev/null"]

# Builder
FROM base AS builder
WORKDIR /app
COPY tsconfig*.json nest-cli.json mikro-orm.config.ts ./
COPY src ./src
RUN pnpm build
RUN pnpm prune --prod

# Production
FROM node:24-alpine3.23 AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
CMD ["npm", "run", "start:prod"]
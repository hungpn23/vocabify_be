# ================================
# Stage 1: Base - Common setup
# ================================
FROM node:24-alpine3.23 AS base
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack prepare pnpm@10.28.0 --activate

# ================================
# Stage 2: Development
# ================================
FROM base AS development
COPY --chown=node:node . .
RUN pnpm install --frozen-lockfile
USER node
CMD ["tail", "-f", "/dev/null"]

# ================================
# Stage 3: Builder - Build for production
# ================================
FROM base AS builder
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/src ./src
COPY --from=development /app/tsconfig.json ./tsconfig.json
COPY --from=development /app/tsconfig.build.json ./tsconfig.build.json
COPY --from=development /app/nest-cli.json ./nest-cli.json
COPY --from=development /app/mikro-orm.config.ts ./mikro-orm.config.ts
RUN pnpm build
RUN pnpm prune --prod

# ================================
# Stage 4: Production
# ================================
FROM node:24-alpine3.23 AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
CMD ["npm", "run", "start:prod"]
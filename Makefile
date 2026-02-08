build:
	docker compose up -d --build
up:
	docker compose up -d
upLocal:
	docker compose -f compose.local.yml --env-file .env.local up -d
down:
	docker compose down
downLocal:
	docker compose -f compose.local.yml --env-file .env.local down
db:
	docker compose exec db bash
node:
	docker compose exec node sh
install:
	docker compose exec node pnpm install
buildApp:
	docker compose exec node pnpm build
schemaFresh:
	docker compose exec node pnpm schema:fresh
migrate:
	docker compose exec node pnpm migration:up
dev:
	docker compose exec node pnpm start:dev
prod:
	docker compose exec node pnpm start:prod

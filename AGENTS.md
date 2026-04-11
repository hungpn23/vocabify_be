# Repository Guidelines

## Project Structure & Module Organization
Core application code lives in `src/`. Reusable modules currently include `auth`, `user`, `notification`, `mail`, `redis`, and `image-kit`. Shared decorators, guards, DTOs, utilities, and enums are in `src/common`. Database entities, migrations, and seeders are in `src/db`. Configuration namespaces live in `src/config`. Infrastructure files are at the repo root: `compose*.yml`, `Dockerfile`, `Makefile`, `mikro-orm.config.ts`, and `caddy/`.

## Build, Test, and Development Commands
Use `pnpm` for local development.

- `pnpm start:dev`: run NestJS with `.env.local` and file watch.
- `pnpm build`: compile to `dist/`.
- `pnpm test`: run Jest unit tests.
- `pnpm test:cov`: generate coverage in `coverage/`.
- `pnpm migration:up`: apply MikroORM migrations.
- `pnpm seeder:run`: run seeders with `.env.local`.
- `make upLocal`: start PostgreSQL and Redis from `compose.local.yml`.
- `make dev`: run the app inside the Docker `node` service.

## Coding Style & Naming Conventions
This project uses TypeScript with Biome for formatting and linting. Run `pnpm check` before opening a PR and `pnpm check:fix` to auto-fix issues. Biome is configured for tab indentation and double quotes. Follow NestJS naming patterns: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.res.dto.ts`. Keep feature-specific DTOs inside the owning module, and place reusable helpers in `src/common`.

## Testing Guidelines
Jest is configured to discover `*.spec.ts` under `src/`. Add tests next to the code they cover, for example `src/modules/auth/auth.service.spec.ts`. Use `pnpm test:watch` while developing. `pnpm test:e2e` is defined, but the current `test/` directory is empty, so add the matching Jest config/files before relying on e2e coverage.

## Commit & Pull Request Guidelines
Commits follow Conventional Commits, e.g. `feat: add notification seed data` or `refactor: simplify auth flow`. Husky runs `lint-staged` on pre-commit and `commitlint` on commit messages. PRs should include a short summary, note any schema or env changes, list verification steps, and attach request/response examples for API changes when useful.

## Security & Agent-Specific Notes
Do not commit real `.env` values or generated upload artifacts. Base new config keys on `.env.example`. Keep contributor responses focused; do not add extra code or scope beyond the requested change without explicit approval.

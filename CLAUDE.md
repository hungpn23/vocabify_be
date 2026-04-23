# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.


## Commands

Package manager is **pnpm**. Formatter/linter is **Biome** (tabs, double quotes).

- `pnpm start:dev` — run NestJS in watch mode using `.env.local`
- `pnpm build` — compile to `dist/`
- `pnpm check` / `pnpm check:fix` — run all Biome checks (lint + format); use before committing
- `pnpm test` — run Jest unit tests (discovers `*.spec.ts` under `src/`)
- `pnpm test -- path/to/file.spec.ts` — run a single test file
- `pnpm test:e2e` — uses `test/jest-e2e.json`; the `test/` directory is currently empty, add config/files before relying on it
- `pnpm migration:create:local` / `pnpm migration:up:local` — MikroORM migrations against `.env.local`
- `pnpm schema:fresh:local` — drop and recreate schema (destructive)
- `pnpm seeder:run` — run seeders
- `pnpm email:dev` — preview React Email templates from `src/integrations/mail/templates`

Docker shortcuts via Makefile: `make upLocal` (Postgres/Redis/Qdrant only), `make downLocal`, `make dev` (run dev server inside the `node` container), `make db` (psql shell), `make migrate`, `make schemaFresh`.

## Architecture

NestJS + TypeScript app. Entry point `src/main.ts` wires CORS, helmet, compression, global `FieldsValidationPipe`, global `AuthGuard` + `RoleBasedAccessControlGuard`, `GlobalExceptionFilter`, Swagger, and the custom `SocketIOAdapter` (JWT-authenticated WebSocket handshakes). Root module is `src/app.module.ts`.

### Modules layout
- `src/modules/<feature>/` — feature modules (`auth`, `deck`, `study`, `suggestion`, `user`, `notification`, `mail`, `redis`, `image-kit`). Aggregated in `modules/modules.module.ts`.
- `src/common/` — shared decorators, guards, filters, interceptors, pipes, enums, DTOs, types, utils. Notable decorators: `@ApiPublic()` (skips global auth), `@RoleBaseAccessControl()` (RBAC), `@ApiEndpoint()` (combined Swagger + auth), `@ApiFile()`, `@UseCache()`, `@User()`.
- `src/config/` — `@nestjs/config` namespaces (`app`, `auth`, `database`, `google`, `integration`, `mail`, `redis`, `vector-db`) plus `validate-config.ts`.
- `src/db/` — MikroORM entities (`base.entity.ts` provides `BaseEntity` and `SoftDeleteBaseEntity` with `deletedAt` filter), `migrations/`, `seeders/`. ORM CLI config is `mikro-orm.config.ts` at repo root.

### Cross-cutting concerns
- **Auth**: JWT access + refresh tokens with rotation. Session JTI tracked in Redis for invalidation across multiple devices. Supports local (username/password + email OTP), Google OAuth, and magic link flows. Auth is global — endpoints must opt out with `@ApiPublic()`.
- **Spaced repetition**: `Card` entity transitions `new → learning → known` automatically via MikroORM `@BeforeCreate` / `@BeforeUpdate` lifecycle hooks based on `reviewDate`. Don't duplicate that logic in services.
- **Soft delete**: Decks (and other `SoftDeleteBaseEntity` subclasses) rely on a MikroORM filter on `deletedAt`; queries that need deleted rows must disable the filter explicitly.
- **Background jobs (BullMQ over Redis)**:
  - `STUDY` queue → `StudyProcessor` updates user statistics after answers are saved.
  - `IMAGE` queue → `UserProcessor` uploads avatars to ImageKit and cleans up local `uploads/` files.
  - `MAIL` queue → `MailConsumer` renders React Email templates and sends via Resend (`MailProducer` enqueues).
  Queue/job names live in `src/common/enums`.
- **Caching**: `@nestjs/cache-manager` + Keyv/Redis. HTTP responses can opt in via `@UseCache()` + `HttpCacheInterceptor`. `RedisService` also handles attempt-counter rate limiting for OTP/password-reset flows.
- **AI suggestions**: `suggestion` module queries Qdrant using Cohere `embed-multilingual-v3.0` embeddings (LangChain). Results are cached in Redis. Embedding bulk data is an admin-only endpoint.
- **Realtime**: `notification.gateway.ts` uses Socket.IO with per-user rooms; the custom `SocketIOAdapter` verifies JWTs on handshake.

### Conventions
- File naming follows NestJS: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.res.dto.ts`. Keep feature DTOs inside their module; reusable helpers go in `src/common`.
- Conventional Commits enforced by commitlint; Husky runs `lint-staged` (`pnpm check:fix`) on pre-commit.
- Don't commit real `.env` values or files under `uploads/`. New config keys should be added to `.env.example`.

# NestJS Boilerplate

Boilerplate backend dùng **NestJS** và **TypeScript**, giữ lại phần hạ tầng tái sử dụng được từ branch gốc và đã loại bỏ toàn bộ nghiệp vụ `deck`, `card`, `study`, `suggestion`.

## Những gì còn lại

- JWT auth với login, sign-up, refresh token, magic link, reset password, Google callback
- Quản lý hồ sơ người dùng và upload avatar qua ImageKit
- Notification API + WebSocket gateway cho realtime notification
- BullMQ + Redis cho background jobs của email
- MikroORM + PostgreSQL với migration và seeder mẫu
- Swagger, global guards/pipes/filters, Docker Compose cho môi trường local

## Project Structure

```text
src/
├── app.module.ts
├── main.ts
├── app.controller.ts
├── socket-io.adapter.ts
├── common/
├── config/
├── db/
│   ├── entities/
│   ├── migrations/
│   └── seeders/
└── modules/
    ├── auth/
    ├── image-kit/
    ├── mail/
    ├── notification/
    ├── redis/
    └── user/
```

## Environment

Copy `.env.example` thành `.env.local` cho local dev hoặc `.env` cho Docker/runtime.

Các nhóm biến chính:

- App: `NODE_ENV`, `APP_HOST`, `APP_PORT`, `API_PREFIX`, `FRONTEND_URL`
- Database: `DB_CONNECTION_STRING` hoặc bộ `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_DATABASE/DB_SCHEMA`
- Auth: `AUTH_JWT_SECRET`, `AUTH_JWT_EXPIRES_IN`, `AUTH_REFRESH_TOKEN_EXPIRES_IN`, `AUTH_JWT_ALGORITHM`
- Redis: `REDIS_CONNECTION_STRING` hoặc bộ `REDIS_HOST/REDIS_PORT/REDIS_USERNAME/REDIS_PASSWORD`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Integrations: `IMAGEKIT_PRIVATE_KEY`, `RESEND_API_KEY`
- Mail: `MAIL_FROM` và các biến SMTP nếu cần

## Development

```bash
pnpm install
cp .env.example .env.local
make upLocal
pnpm migration:up
pnpm start:dev
```

Swagger sẽ có tại `http://localhost:3001/api/docs` với cấu hình mặc định trong `.env.example`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm start:dev` | Chạy app ở chế độ watch với `.env.local` |
| `pnpm build` | Build ra `dist/` |
| `pnpm test` | Chạy Jest unit tests |
| `pnpm check` | Chạy Biome check |
| `pnpm migration:up` | Apply migration |
| `pnpm seeder:run` | Seed dữ liệu mẫu |
| `make upLocal` | Khởi động PostgreSQL và Redis local |
| `make dev` | Chạy app trong container `node` |

## Database Bootstrap

Seeder hiện tạo sẵn:

- `admin@example.com` / `Password@123`
- `demo@example.com` / `Password@123`
- Một notification mẫu cho tài khoản demo

## Docker

- `compose.local.yml`: chỉ dựng PostgreSQL và Redis cho local development
- `compose.dev.yml`: dựng app + PostgreSQL + Redis
- `compose.yml`: cấu hình production-style với `caddy`, migration job, app, PostgreSQL, Redis

## Notes

- `README` này phản ánh trạng thái boilerplate của branch hiện tại, không còn mô tả nghiệp vụ học từ vựng.
- Nếu muốn thêm module nghiệp vụ mới, nên tạo module dưới `src/modules/<feature>` và thêm migration/seeder tương ứng.

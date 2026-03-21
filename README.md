# Vocabify Backend

A RESTful API backend for a vocabulary learning application, built with **NestJS** and **TypeScript**. Features include multi-method authentication, spaced repetition study tracking, AI-powered vocabulary suggestions, real-time notifications, and background job processing.

---

## 🎯 Features

### 🔐 Authentication & Authorization
- **Local Authentication**: Username/password sign-up with email verification (OTP via email)
- **Google OAuth 2.0**: Authorization Code Flow with automatic user provisioning
- **Magic Link**: Passwordless email sign-in with time-limited verification tokens
- **JWT Token Management**: Access token + refresh token pair with **Token Rotation** strategy
  - Access token expires in configurable duration (default: 30 min)
  - Refresh token expires in configurable duration (default: 14 days)
  - Session-based JTI (JWT ID) stored in Redis for token invalidation
  - Supports multiple concurrent device sessions
- **Password Management**: Change password & reset password (OTP-based) flows
- **Rate Limiting**: Configurable attempt limits on email verification and password reset requests
- **Role-Based Access Control (RBAC)**: Global `AuthGuard` + `RoleBasedAccessControlGuard` with decorator-based configuration

### 📚 Deck Management
- Full CRUD operations for vocabulary decks
- **Visibility control**: PUBLIC / PROTECTED (passcode) / PRIVATE
- **Deck cloning**: Clone shared decks with learner count tracking & real-time notification to owner
- **Restart progress**: Reset all card streaks and review dates
- **Soft delete**: Decks use `deletedAt` filter for soft deletion
- **Auto-slug generation**: Deck slugs generated automatically via `slugify` on create/update
- **Pagination**: Configurable limit, offset, search, orderBy, and sort order
- **Unique constraints**: Deck name and slug are unique per owner

### 🧠 Spaced Repetition System
- Cards track `streak` (consecutive correct answers), `reviewDate`, and `status`
- **Automatic status transitions** via MikroORM lifecycle hooks (`@BeforeCreate`, `@BeforeUpdate`):
  - `new` → no `reviewDate` set
  - `learning` → `reviewDate ≤ today`
  - `known` → `reviewDate > today`
- Study answers saved in batch with background job to update user statistics

### 📊 User Statistics (Background Processing)
- **Study streaks**: Current streak and longest streak tracking
- **Total cards learned**: Cumulative count of mastered cards
- **Mastery rate**: Percentage of known cards across all decks
- **Last study date**: Tracked for streak calculations
- Statistics updated asynchronously via BullMQ background jobs (`StudyProcessor`)

### 💡 AI-Powered Vocabulary Suggestions
- **Semantic similarity search** using Qdrant vector database
- **Cohere embedding model** (`embed-multilingual-v3.0`) via LangChain for multilingual support
- **Term suggestion**: Look up card definitions from a pre-embedded vocabulary dataset (cached in Redis)
- **Next card suggestion**: Recommend related vocabulary cards based on semantic similarity
- **Batch data embedding**: Admin-only endpoint to embed vocabulary data into Qdrant

### 🔔 Real-time Notifications
- **WebSocket gateway** using Socket.IO with custom `SocketIOAdapter`
- Authenticated WebSocket connections (JWT verification on handshake)
- Room-based notification delivery (user-specific rooms)
- Clone notifications sent in real-time when a user clones another's deck

### 📧 Email Service
- **Transactional emails** via Resend
- **React Email templates** for OTP verification and magic link emails
- **Asynchronous processing**: Emails sent through BullMQ queue (`MailProducer` → `MailConsumer`)
- Template preview available via `pnpm email:dev`

### 🖼️ Image Processing
- **Avatar upload**: File upload with validation (image type/size)
- **Background processing**: Images uploaded to ImageKit asynchronously via BullMQ (`UserProcessor`)
- Local file cleanup after successful upload

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [NestJS](https://nestjs.com/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [MikroORM](https://mikro-orm.io/) (with migrations & seeding) |
| **Caching** | [Redis](https://redis.io/) via [@nestjs/cache-manager](https://docs.nestjs.com/techniques/caching) + [Keyv](https://keyv.org/) |
| **Message Queue** | [BullMQ](https://docs.bullmq.io/) (Redis-backed) |
| **Vector Database** | [Qdrant](https://qdrant.tech/) |
| **AI/Embeddings** | [LangChain](https://js.langchain.com/) + [Cohere](https://cohere.com/) |
| **WebSocket** | [Socket.IO](https://socket.io/) via [@nestjs/websockets](https://docs.nestjs.com/websockets/gateways) |
| **Authentication** | [JWT](https://jwt.io/) + [argon2](https://github.com/ranisalt/node-argon2) + Google OAuth 2.0 |
| **Image Storage** | [ImageKit](https://imagekit.io/) |
| **Email** | [Resend](https://resend.com/) + [React Email](https://react.email/) |
| **API Documentation** | [Swagger](https://swagger.io/) via [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) |
| **Validation** | [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer) |
| **Security** | [helmet](https://helmetjs.github.io/), [compression](https://github.com/expressjs/compression), CORS |
| **Linting & Formatting** | [Biome](https://biomejs.dev/) |
| **Commit Convention** | [Commitlint](https://commitlint.js.org/) + [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) |
| **Testing** | [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) |
| **Containerization** | [Docker](https://www.docker.com/) (multi-stage build, Node 24 Alpine) |
| **Reverse Proxy** | [Caddy](https://caddyserver.com/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |

---

## 📁 Project Structure

```
vocabify_be/
├── src/
│   ├── main.ts                          # Application bootstrap (CORS, guards, pipes, filters, Swagger, WebSocket adapter)
│   ├── app.module.ts                    # Root module (ConfigModule, MikroORM, CacheModule, BullModule)
│   ├── app.controller.ts               # Health check endpoint
│   ├── socket-io.adapter.ts            # Custom Socket.IO adapter with JWT authentication
│   │
│   ├── config/                          # Environment configuration namespaces
│   │   ├── app.config.ts               # App settings (host, port, environment, API prefix, frontend URL)
│   │   ├── auth.config.ts              # JWT expiry settings
│   │   ├── database.config.ts          # PostgreSQL connection settings
│   │   ├── google.config.ts            # Google OAuth credentials
│   │   ├── integration.config.ts       # Third-party API keys (Cohere, ImageKit)
│   │   ├── mail.config.ts              # Email service settings (Resend)
│   │   ├── redis.config.ts             # Redis connection settings
│   │   ├── vector-db.config.ts         # Qdrant connection settings
│   │   └── validate-config.ts          # Configuration validation helper
│   │
│   ├── db/                              # Database layer
│   │   ├── entities/                    # MikroORM entities
│   │   │   ├── base.entity.ts          # BaseEntity (id, createdAt, updatedAt) & SoftDeleteBaseEntity (+deletedAt)
│   │   │   ├── user.entity.ts          # User (username, email, password, role, avatarUrl)
│   │   │   ├── deck.entity.ts          # Deck (name, slug, visibility, passcode, viewCount, learnerCount)
│   │   │   ├── card.entity.ts          # Card (term, definition, languages, streak, reviewDate, status)
│   │   │   ├── card-suggestion.entity.ts  # CardSuggestion (pre-loaded vocabulary data)
│   │   │   ├── notification.entity.ts  # Notification (content, readAt, actor, recipient)
│   │   │   └── user-statistics.entity.ts  # UserStatistic (streaks, masteryRate, totalCardsLearned)
│   │   ├── migrations/                  # Database migrations
│   │   └── seeders/                     # Data seeders
│   │
│   ├── modules/                         # Feature modules
│   │   ├── auth/                        # Authentication & authorization
│   │   │   ├── auth.controller.ts      # Auth endpoints (login, sign-up, logout, refresh, OAuth, magic-link, password reset)
│   │   │   ├── auth.service.ts         # Auth business logic (token creation, verification, OTP)
│   │   │   ├── auth.dto.ts             # Request DTOs
│   │   │   └── auth.res.dto.ts         # Response DTOs
│   │   │
│   │   ├── deck/                        # Deck management
│   │   │   ├── deck.controller.ts      # CRUD + clone + restart + shared deck endpoints
│   │   │   ├── deck.service.ts         # Deck business logic
│   │   │   ├── deck.enum.ts            # Visibility, CardStatus enums
│   │   │   └── dtos/                   # Request & response DTOs
│   │   │
│   │   ├── study/                       # Study & spaced repetition
│   │   │   ├── study.controller.ts     # Save answers, get user stats
│   │   │   ├── study.service.ts        # Save answers with batch card updates
│   │   │   └── study.processor.ts      # BullMQ worker: update user statistics asynchronously
│   │   │
│   │   ├── suggestion/                  # AI-powered vocabulary suggestions
│   │   │   ├── suggestion.controller.ts  # Term suggestion, next card suggestion, embed data (admin)
│   │   │   └── suggestion.service.ts   # Qdrant vector search + Cohere embeddings + Redis caching
│   │   │
│   │   ├── user/                        # User management
│   │   │   ├── user.controller.ts      # Avatar upload endpoint
│   │   │   ├── user.service.ts         # User business logic
│   │   │   └── user.processor.ts       # BullMQ worker: upload avatar to ImageKit asynchronously
│   │   │
│   │   ├── notification/                # Real-time notifications
│   │   │   ├── notification.gateway.ts # WebSocket gateway (Socket.IO)
│   │   │   └── notification.service.ts # Notification business logic
│   │   │
│   │   ├── mail/                        # Email service
│   │   │   ├── mail.producer.ts        # Enqueues email jobs to BullMQ
│   │   │   ├── mail.consumer.ts        # Processes email jobs from queue
│   │   │   ├── mail.service.ts         # Sends emails via Resend
│   │   │   ├── render-email.tsx        # React Email renderer
│   │   │   └── templates/              # React Email templates
│   │   │
│   │   ├── redis/                       # Redis wrapper service
│   │   │   └── redis.service.ts        # Get/set/delete values, rate limiting (attempt tracking)
│   │   │
│   │   └── image-kit/                   # ImageKit integration
│   │       └── image-kit.module.ts     # Provides ImageKit client as injectable token
│   │
│   └── common/                          # Shared utilities & components
│       ├── constants/                   # App-wide constants (rate limits, etc.)
│       ├── decorators/                  # Custom decorators
│       │   ├── api-endpoint.decorator.ts   # Combined Swagger + auth decorator
│       │   ├── api-file.decorator.ts       # File upload decorator
│       │   ├── api-public.decorator.ts     # Mark endpoints as public (skip auth)
│       │   ├── rbac.decorator.ts           # Role-based access control
│       │   ├── use-cache.decorator.ts      # HTTP response caching
│       │   ├── user.decorator.ts           # Extract user from JWT payload
│       │   ├── validators.decorator.ts     # Custom validation decorators
│       │   └── transforms.decorator.ts     # DTO transform decorators
│       ├── dtos/                         # Shared DTOs (PaginatedDto, SuccessResponseDto)
│       ├── enums/                        # Shared enums (NodeEnv, UserRole, JwtToken, QueueName, JobName)
│       ├── filters/                      # GlobalExceptionFilter
│       ├── guards/                       # AuthGuard, RoleBasedAccessControlGuard
│       ├── interceptors/                 # HttpCacheInterceptor
│       ├── interfaces/                   # Shared interfaces
│       ├── pipes/                        # FieldsValidationPipe, image validation pipe
│       ├── types/                        # Shared types (UUID, JWT payloads, job data types)
│       └── utils/                        # Utility functions (UUID, Redis keys, pagination, etc.)
│
├── test/                                # End-to-end tests
├── uploads/                             # Temporary local file uploads
│
├── .docker/                             # Docker base service definitions
├── caddy/                               # Caddy reverse proxy configuration
├── compose.yml                          # Production Docker Compose
├── compose.dev.yml                      # Development Docker Compose
├── compose.local.yml                    # Local development (DB, Redis, Qdrant only)
├── Dockerfile                           # Multi-stage build (Node 24 Alpine)
├── Makefile                             # Shortcut commands for Docker operations
│
├── mikro-orm.config.ts                  # MikroORM CLI configuration
├── biome.json                           # Biome linter & formatter config
├── commitlint.config.ts                 # Commit message linting
├── jest.config.ts                       # Jest test configuration
├── tsconfig.json                        # TypeScript configuration (path aliases)
└── package.json
```

---

## 🏗️ Architecture

### Entity Relationship

```
User ──1:N──▶ Deck ──1:N──▶ Card
 │                │
 │                ├── clonedFrom ──▶ Deck (self-reference)
 │                │
 │                └── createdBy / updatedBy ──▶ UUID
 │
 ├──1:1──▶ UserStatistic
 │
 └──1:N──▶ Notification (recipient)
                └── actor ──▶ User (nullable)

CardSuggestion (standalone, pre-loaded vocabulary data for AI suggestions)
```

### Background Job Queues

| Queue | Job | Processor | Description |
|-------|-----|-----------|-------------|
| `STUDY` | `UPDATE_USER_STATS` | `StudyProcessor` | Updates streak, mastery rate, total cards learned |
| `IMAGE` | `UPLOAD_USER_AVATAR` | `UserProcessor` | Uploads avatar to ImageKit, updates DB, cleans up local file |
| `MAIL` | `SEND_OTP` / `SEND_MAGIC_LINK` | `MailConsumer` | Sends transactional emails via Resend |

### Global Middleware & Components

| Component | Description |
|-----------|-------------|
| `helmet` | HTTP security headers |
| `compression` | Response compression |
| `CORS` | Configured for frontend origin with credentials |
| `AuthGuard` | Global JWT authentication (skippable via `@ApiPublic()`) |
| `RoleBasedAccessControlGuard` | RBAC enforcement via `@RoleBaseAccessControl()` |
| `FieldsValidationPipe` | Global DTO validation (transform + whitelist) |
| `GlobalExceptionFilter` | Centralized error handling |
| `SocketIOAdapter` | Custom WebSocket adapter with JWT auth on handshake |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.0.0
- **pnpm**
- **Docker** & **Docker Compose** (for PostgreSQL, Redis, Qdrant)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vocabify_be

# Install dependencies
pnpm install
```

### Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the required environment variables:
   - **Database**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - **Redis**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
   - **Auth**: `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`
   - **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
   - **ImageKit**: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
   - **Cohere**: `COHERE_API_KEY`
   - **Qdrant**: `VECTOR_DB_HOST`, `VECTOR_DB_PORT`, `VECTOR_DB_COLLECTION_NAME`
   - **Mail**: Resend API key and sender configuration
   - **App**: `HOST`, `PORT`, `NODE_ENV`, `API_PREFIX`, `FRONTEND_URL`

### Start Infrastructure

```bash
# Start PostgreSQL, Redis, and Qdrant containers
docker compose -f compose.local.yml --env-file .env.local up -d

# Or use Makefile shortcut
make upLocal
```

### Running the Application

```bash
# Development (watch mode)
pnpm start:dev

# Production
pnpm start:prod
```

### API Documentation

Once running, Swagger UI is available at: `http://localhost:<PORT>/<API_PREFIX>/docs`

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm start:dev` | Start in development mode with watch & `.env.local` |
| `pnpm start:debug` | Start in debug mode with watch |
| `pnpm start:prod` | Start production build |
| `pnpm build` | Build the application |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Check code formatting |
| `pnpm format:fix` | Fix formatting issues |
| `pnpm check` | Run all Biome checks |
| `pnpm check:fix` | Fix all Biome issues |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm test:cov` | Run tests with coverage |
| `pnpm email:dev` | Preview React Email templates |
| `pnpm schema:fresh` | Drop & recreate database schema |
| `pnpm migration:create` | Create a new migration |
| `pnpm migration:up` | Run pending migrations |
| `pnpm mikro:debug` | Debug MikroORM configuration |

### Makefile Shortcuts

| Command | Description |
|---------|-------------|
| `make upLocal` | Start local infrastructure (DB, Redis, Qdrant) |
| `make downLocal` | Stop local infrastructure |
| `make build` | Build and start production containers |
| `make up` | Start production containers |
| `make down` | Stop production containers |
| `make db` | Access PostgreSQL container shell |
| `make dev` | Run dev server inside Docker |
| `make prod` | Run production server inside Docker |

---

## 🐳 Deployment

### Docker

The project uses a **multi-stage Dockerfile** (Node 24 Alpine):

1. **Base**: Install dependencies with `pnpm install --frozen-lockfile`
2. **Development**: Full source code with dev dependencies
3. **Builder**: Compile TypeScript & prune dev dependencies
4. **Production**: Minimal image with only compiled code & production dependencies

### Docker Compose Configurations

| File | Purpose |
|------|---------|
| `compose.local.yml` | Local development — PostgreSQL, Redis, Qdrant only |
| `compose.dev.yml` | Development — includes app container |
| `compose.yml` | Production — full stack with Caddy reverse proxy |

---

## 📄 License

This project is private and proprietary.

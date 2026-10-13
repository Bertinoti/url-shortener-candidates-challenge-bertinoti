# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React Router delivery and infrastructure adapters
├── libs/engine/         # Domain and application logic
└── prisma/              # PostgreSQL schema and migrations
```

| Technology                                    | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [pnpm](https://pnpm.io/)                      | Fast, disk-efficient package manager with built-in monorepo support via workspaces                |
| [Turbo](https://turbo.build/)                 | High-performance build system for monorepos. Runs tasks in parallel and caches results            |
| [React](https://react.dev/)                   | Library for building user interfaces with components                                              |
| [React Router v7](https://reactrouter.com/)   | Full-stack React framework. Handles routing, data loading (loaders), mutations (actions), and SSR |
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript for catching errors at compile time                                  |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first CSS framework for rapid UI development                                              |
| [Vite](https://vite.dev/)                     | Fast build tool and dev server with hot module replacement                                        |

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:5173`

## Docker Setup

```bash
docker compose up --build
```

Open `http://localhost:3000`

The compose setup starts PostgreSQL first, waits for its healthcheck, applies
Prisma migrations, and then starts the web server. The `postgres-data` named
volume keeps shortened URLs and click counts across container restarts. To
reset local data, remove the volume with `docker compose down -v`.

## Design notes

- The web layer coordinates HTTP concerns and owns infrastructure adapters;
  validation and persistence are accessed through the `UrlRepository` port.
- Prisma implements the repository against PostgreSQL. The unique code index
  protects creation from collisions, and click counts use an atomic increment.
- Short codes use cryptographically secure random bytes and a uniqueness check.
- Redirects increment click counts before returning the redirect response.
- URL validation accepts only HTTP(S), limits input size, and the create action
  includes a small per-client rate limit to reduce abuse.

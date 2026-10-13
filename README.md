# URL Shortener

## Tech Stack

```
url-shortener/
├── applications/web/    # React + React Router v7
└── libs/engine/         # Domain logic
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
docker-compose up --build
```

Open `http://localhost:3000`

The compose setup mounts the `url-data` volume so shortened URLs and click
counts survive container restarts. To reset local challenge data, remove the
volume with `docker compose down -v`.

## Design notes

- The web layer only coordinates HTTP concerns; validation and persistence live
  in `libs/engine` behind the `UrlRepository` abstraction.
- `FileUrlRepository` is deliberately dependency-light for this timed
  challenge. It writes atomically and can be replaced by a Prisma/PostgreSQL
  implementation without changing the routes.
- Short codes use cryptographically secure random bytes and a uniqueness check.
- Redirects increment click counts before returning the redirect response.
- URL validation accepts only HTTP(S), limits input size, and the create action
  includes a small per-client rate limit to reduce abuse.

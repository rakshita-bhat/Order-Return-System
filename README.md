# Order Returns System

A full-stack web application for managing product return requests. Customers can submit return requests within a configurable time window, and employees can review, approve, or reject them.

## Technology Stack

### Backend
- **Java 21** + **Spring Boot 3.4.4**
- **Spring Data JPA** with **PostgreSQL**
- **Spring Security** with **JWT** (access + refresh tokens)
- **BCrypt** password hashing
- **Maven** build tool

### Frontend
- **React 19** + **Vite 8**
- **React Router v7** for routing
- Vanilla CSS with CSS variables, animations, and `backdrop-filter`

### Database
- **PostgreSQL 14+** (local instance)

## Setup and Run

### Prerequisites

- Java 21+ (`brew install java` / SDKMAN)
- Maven 3.9+ (`brew install maven`)
- Node.js 22+ (`brew install node`)
- PostgreSQL 14+ running locally (`brew install postgresql@16 && brew services start postgresql@16`)

### Quick Start

```bash
# From the project root
make run
```

This will:
1. Create the `returnsystem` database if it doesn't exist
2. Compile the backend and start it on `http://localhost:8080`
3. Install frontend dependencies and start it on `http://localhost:5173`

### Manual Steps

```bash
# Terminal 1 — Backend
make backend-run

# Terminal 2 — Frontend
make frontend-run
```

### Make Targets

| Target | Description |
|---|---|
| `make run` | Start both servers |
| `make backend-run` | Create DB, compile, start backend on `:8080` |
| `make frontend-run` | Install deps, start frontend on `:5173` |
| `make backend-build` | Package backend JAR |
| `make frontend-build` | Production build of frontend |
| `make build` | Build both |
| `make backend-stop` | Kill backend process |
| `make db-create` | Create PostgreSQL database |
| `make db-drop` | Drop PostgreSQL database |
| `make clean` | Clean build artifacts |

## Assumptions

- **Local PostgreSQL** — the app connects to `localhost:5432` with the system username. Adjust `application.properties` if using a different user/password.
- **Development credentials** — CORS allows all origins (`allowedOriginPatterns("*")`) for dev convenience. Restrict this in production.
- **JWT secret** — generated once and hardcoded in `application.properties`. In production, use an environment variable or secrets manager.
- **30-day return window** — configurable via `return.policy.window-days` in `application.properties`.
- **Role-based access** — enforced server-side. The frontend hides unavailable actions but the backend rejects unauthorized requests regardless.

## AI Tools Used

This project was built iteratively using **opencode (agentic CLI)** with the **DeepSeek V4 Flash** model as the primary development assistant. The AI was used for scaffolding the full project structure from `pom.xml` and Spring Boot configuration to React components and routing, designing the warm-industrial CSS theme (copper/gold palette, Fraunces/DM Sans typography, staggered animations) through iterative prompt feedback, troubleshooting issues such as CORS errors, body-stream-already-read exceptions, stale schema columns, and role propagation bugs, and implementing the JWT auth flow with access/refresh tokens, role-based access control, and the PostgreSQL migration from H2.

The main challenges were around state management across sessions (stale localStorage auth without a `role` field crashing the dashboard) and CORS configuration interplay between Spring Security and the Vite dev proxy. Both were resolved by tracing the error messages back to their root cause in the respective configuration layers.

# SAFE CITY - ET

Multi-agency emergency intelligence platform built with a FastAPI backend and a React + Vite command-center frontend. This repository captures the first implementation sprint covering all 12 specification pillars.

## Project Structure

```
Final Project/
|-- backend/
|   |-- app/
|   |   |-- core/        # configuration, dependencies, auth, pagination
|   |   |-- models/      # SQLAlchemy ORM entities
|   |   |-- schemas/     # Pydantic request/response models
|   |   |-- routers/     # API modules (auth, users, incidents, admin, health, notifications)
|   |   |-- services/    # AI heuristics, audit logging, notifications
|   |   `-- tests/       # FastAPI smoke tests
|   |-- main.py          # FastAPI entrypoint
|   `-- pyproject.toml   # Backend dependency list
|-- frontend/
|   |-- src/
|   |   |-- components/  # Layout shell, leaflets, tables, cards, guards
|   |   |-- pages/       # Role-specific portals and login
|   |   |-- theme/       # Command-center Material UI theme
|   |   |-- stores/      # Zustand auth store
|   |   `-- features/    # API hooks (incidents, etc.)
|   `-- package.json
`-- README.md
```

## Backend - FastAPI + SQLAlchemy

- **Core foundations** (`backend/app/main.py`, `backend/app/core/config.py`, `backend/app/database.py`):
  FastAPI factory with CORS, router registration, JWT settings, and SQLite dev database (override `DATABASE_URL` for Postgres).
- **Database migrations**: Alembic is configured (`alembic.ini`, `migrations/`); run `alembic upgrade head` to apply schema changes and `alembic revision --autogenerate -m "..."` for future updates.
- **User management & auth** (`backend/app/routers/auth.py`, `backend/app/core/security.py`):
  Signup/login/me routes, bcrypt hashing, JWT + refresh tokens, login rate limiting, password reset flow, and admin-visible disabled/suspended states.
- **RBAC** (`backend/app/core/deps.py`, `backend/app/models/user.py`):
  Role association table and decorator-based enforcement for admin, agency, and citizen scopes.
- **Incident lifecycle** (`backend/app/routers/incidents.py`):
  Role-aware listing, AI-assisted creation with severity/confidence scoring, analytics endpoints, and admin moderation tools.
- **Audit visibility** (`backend/app/routers/audit.py`):
  Admins/super-admins can filter and export audit logs via `/audit/logs`.
- **Incident intelligence**:
  `/incidents/analytics/*` outputs status/type/priority summaries & clusters, and `/incidents/recommendations/nearest-responders` mocks responder proximity rankings for agency dashboards.
- **Seed script**: `python scripts/seed.py --admin-email admin@example.com --admin-password Secure123!` populates default roles and a bootstrap admin account.
- **External provider hooks**: configure ENV vars (`AI_PROVIDER`, `AI_ENDPOINT`, `AI_API_KEY`, `NOTIFICATION_EMAIL_ENABLED`, `NOTIFICATION_EMAIL_FROM`, `NOTIFICATION_SMS_ENABLED`) to integrate third-party AI and comms services; by default, stubs log to the console for visibility.
  - Auth ENV additions: `REFRESH_TOKEN_EXPIRE_MINUTES` (optional) and login rate limits (`RATE_LIMIT_LOGIN_ATTEMPTS`, `RATE_LIMIT_WINDOW_SECONDS`).
- **AI + notifications + audit** (`backend/app/services/ai.py`, `backend/app/services/notifications.py`, `backend/app/services/audit.py`):
  AI classification can call an external provider (`AI_PROVIDER`) or fall back to heuristics, severity/confidence are stored, in-app/email/SMS notifications are supported with unread tracking and admin broadcast, and audit logs capture key events.
- **Admin summary endpoint** (`backend/app/routers/admin.py`):
  Provides per-agency metric snapshot for dashboards.
- **Testing**: `pytest app/tests/test_health.py` ensures the service boots (install `pytest` locally).

Run locally:

```
cd backend
uvicorn app.main:app --reload
```

Use `backend/.env.example` as the base for environment variables.

## Frontend - React + Vite + MUI

- **Theme + layout shell** (`frontend/src/theme/index.ts`, `frontend/src/layouts/DashboardLayout.tsx`, `frontend/src/components/SidebarNav.tsx`): dark-mode command center aesthetic with sidebar, top bar, and nav aware of roles.
- **Routing + guards** (`frontend/src/App.tsx`, `frontend/src/components/ProtectedRoute.tsx`): React Router v7 plus nested role-based gates per portal.
- **Auth state + API client** (`frontend/src/stores/useAuthStore.ts`, `frontend/src/hooks/useAuth.ts`, `frontend/src/lib/api-client.ts`): Zustand-managed tokens, profile hydration, and axios wrapper for backend calls.
- **Role portals** (`frontend/src/pages/*Portal.tsx`): Public, Police, Fire, Medical, Military, and Admin experiences with stats, tables, notifications, and React Leaflet maps. Agency dashboards now include responder queues, water-source inventories, hospital load indicators, threat feeds, and hotspot summaries driven by analytics endpoints.
- **UI building blocks** (`frontend/src/components/CommandCenterMap.tsx`, `frontend/src/components/IncidentTable.tsx`, `frontend/src/components/StatCard.tsx`): reusable widgets shared across portals.

Run locally:

```
cd frontend
npm install
npm run dev    # http://localhost:5173
npm run build  # type-check + optimized bundle in dist/
```

Set `VITE_API_URL` to point at the FastAPI instance when wiring environments.

## 12-Pillar Delivery Map

| Pillar | Status | Notes |
| --- | --- | --- |
| Core Platform Foundations | Done | Modular FastAPI back end, Vite/MUI front end, health checks |
| User Management & Authentication | Done | JWT auth, bcrypt hashing, Zustand store |
| Role-Based Access Control | Done | Role assignments, decorators, protected front-end routes |
| Incident Reporting & Management | Done | CRUD API, severity scoring, admin moderation |
| Geospatial & Mapping | Done | Lat/lng storage and Leaflet-based incident map |
| AI Intelligence Layer | In Progress | Heuristic classifier outputs severity + confidence, analytics + responder endpoints live |
| Multi-Agency Dashboards | Done | Dedicated portals for every persona |
| Admin & Super Admin Controls | Done | Metrics endpoint and admin dashboard scaffolding |
| Notifications & Communications | In Progress | In-app feed with unread tracking + admin broadcast; external channels next |
| Audit Logs, Security & Compliance | In Progress | Audit logging covers key actions with filterable admin UI |
| Frontend Infrastructure | Done | Theme, layout, reusable components, responsive grid |
| DevOps & Deployment | Planned | Roadmap documented below (Docker, CI/CD, monitoring) |

## DevOps & Scaling Roadmap

1. **Environment management**: `.env` for backend secrets and database URLs, `.env.local` for `VITE_API_URL` values.
2. **Containerization**: Dockerize Uvicorn and Vite build output (served via Nginx), compose for local multi-service runs.
3. **CI/CD**: GitHub Actions pipeline (lint + pytest + npm build + docker push) with Snyk/Trivy scans.
4. **Hosting**: AWS Lightsail, Render, Railway, or municipal servers behind Nginx/Akamai; promote Postgres as the primary datastore.
5. **Scale features**: Introduce Redis queues for AI + notification workers, WebSockets for live incident feeds, and OpenTelemetry/Prometheus for monitoring.

## Next Engineering Tasks

1. Integrate Alembic migrations and seed scripts for default agencies/roles.
2. Expand the AI module with NLP classification, severity scoring, and responder recommendation endpoints.
3. Build admin UI for audit logs, notification broadcasting, and user provisioning workflows.
4. Implement login rate limiting and richer account state transitions (disabled, suspended, etc.).
5. Add automated testing layers (pytest coverage, React component tests, Storybook).

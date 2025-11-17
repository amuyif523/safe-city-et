# SAFE CITY – ET Setup Guide

Use this document to configure, run, and validate the whole stack locally.

## 1. Prerequisites

- **Python 3.11+** with `pip`
- **Node.js 18+** and `npm`
- **Git** (optional but recommended)
- (Optional) **PostgreSQL** if you plan to run against Postgres instead of SQLite

## 2. Backend (FastAPI) Setup

1. **Create and activate a virtual environment** (recommended):
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate     # Windows PowerShell
   # source .venv/bin/activate   # macOS/Linux
   ```
2. **Install dependencies** using the provided requirements file:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure environment variables**:
   - Copy `.env.example` to `.env`.
   - Update values such as `SECRET_KEY`, `DATABASE_URL`, etc. Example for SQLite (dev):
     ```
     ENVIRONMENT=development
     SECRET_KEY=super-secret-key
     DATABASE_URL=sqlite:///./safe_city.db
     AUTO_CREATE_SCHEMA=true
     ```
4. **Initialize the database**:
   - On first run FastAPI auto-creates tables when `AUTO_CREATE_SCHEMA=true`.
   - For Postgres, ensure the database exists and update `DATABASE_URL` accordingly (`postgresql+psycopg://user:pass@host:5432/dbname`).
   - If you set up the database before the latest schema changes (notifications payloads, incident intelligence columns), drop the SQLite file or run migrations before restarting the API.
5. **Run the API locally**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. **Verify**:
   - Open `http://localhost:8000/health` → expect `{"status":"ok"}`
   - Visit docs at `http://localhost:8000/docs`
7. **Tests** (Pytest):
   ```bash
   pip install pytest
   pytest
   ```

## 3. Frontend (React + Vite) Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Environment config**:
   - Create `frontend/.env` and set `VITE_API_URL` to the FastAPI base URL.
     ```
     VITE_API_URL=http://localhost:8000
     ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   - Open `http://localhost:5173` to access the command-center UI.
4. **Production build** (also runs TypeScript checks):
   ```bash
   npm run build
   ```
   Output is located in `frontend/dist`.

## 4. Full System Workflow

1. **Run backend** (`uvicorn ...`) and frontend (`npm run dev`) simultaneously.
2. **Sign up a user** via `POST /auth/signup` (Swagger UI or API client). Default role is `public`.
3. **Login** through the React UI using the credentials you created.
4. **Report incidents** from the Public portal; verify they appear in role-restricted portals (e.g., Police portal shows crime incidents).
5. **Check notifications** via `/notifications` endpoint or Notifications panel in the UI.
6. **Admin metrics**: create an admin user (assign `admin` role) and visit `/admin` portal for summary stats.

## 5. Switching to Postgres (Optional)

1. Create a Postgres database and user.
2. Update `backend/.env`:
   ```
   DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/safecity
   AUTO_CREATE_SCHEMA=true
   ```
3. Install `psycopg[binary]`:
   ```bash
   pip install "psycopg[binary]"
   ```
4. Restart the backend to let SQLAlchemy build tables in Postgres.

## 6. Troubleshooting

- **CORS errors**: ensure `VITE_API_URL` matches the backend origin and that the backend is running.
- **JWT errors**: confirm `SECRET_KEY` is identical in backend instance you’re calling.
- **Dependency install issues**: upgrade `pip`/`npm` and ensure you are inside the correct directory before running commands.
- **Missing `pytest`**: install it globally or inside the virtual environment before running tests.

With these steps you can consistently bootstrap the SAFE CITY – ET stack, run it locally, and validate its behavior end-to-end. For deployment hardening (Docker, CI/CD, etc.), see `README.md`.

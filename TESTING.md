# SAFE CITY – ET Testing Guide

Use this checklist to verify every feature delivered in the initial build. The steps assume you have followed `SETUP.md` and both backend (`uvicorn`) and frontend (`npm run dev`) are running locally.

---

## 1. Environment Preparation

1. **Backend**
   ```bash
   cd backend
   .venv\Scripts\activate   # or source .venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```
   - Confirm `http://127.0.0.1:8000/health` returns `{"status":"ok"}`.
2. **Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   - Confirm `http://127.0.0.1:5173` (should show login page if no token).

---

## 2. API-Level Tests (Swagger or HTTP client)

Open `http://127.0.0.1:8000/docs` and run the following in order:

### 2.1 User + Auth
1. `POST /auth/signup`
   ```json
   {
     "full_name": "Citizen One",
     "email": "citizen@example.com",
     "password": "CitizenPass123",
     "phone": "+251900000001",
     "roles": ["public"]
   }
   ```
2. `POST /auth/login`
   - username = `citizen@example.com`
   - password = `CitizenPass123`
   - Save the JWT from the response.
3. `GET /auth/me` (Bearer token)
   - Expect user info with `public` role.

### 2.2 Admin Bootstrap
1. Sign up a second user using `roles: ["admin"]`.
2. Login with that user to obtain an admin JWT.

### 2.3 Incident Lifecycle
1. `POST /incidents` (Authenticated as citizen)
   ```json
   {
     "title": "Car accident",
     "description": "Two cars collided near Meskel Square.",
     "priority": "high",
     "latitude": 9.0102,
     "longitude": 38.7613
   }
   ```
2. `GET /incidents?page=1&size=20`
   - As citizen: should only return incidents reported by that user.
3. `PATCH /incidents/{id}`
   - Use admin token, update `status` to `acknowledged`.
4. `DELETE /incidents/{id}`
   - Confirm admin can delete; citizens cannot.

### 2.4 Notifications & Admin Summary
1. `GET /notifications` (citizen token) → expect status update notification.
2. `GET /notifications/summary` → confirms unread count.
3. `POST /notifications/{notification_id}/read` → unread count decreases.
2. `GET /admin/summary` (admin token) → see counts for users/incidents.
3. `POST /notifications/broadcast` (admin token)
   ```json
   {
     "message": "City-wide drill tonight at 9PM.",
     "event_type": "broadcast",
     "target_roles": ["police", "fire"]
   }
   ```
   - Re-login as role-based users to confirm they receive the alert.

### 2.5 Error Cases
1. Try accessing `/incidents` without token → expect 401.
2. Try `PATCH /incidents/{id}` as public user → expect 403.

---

## 3. Frontend Tests

### 3.1 Login Flow
1. Navigate to `http://127.0.0.1:5173`.
2. Log in as the citizen account.
3. Confirm redirect to the Public portal dashboard (stat cards, map, table).

### 3.2 Incident Creation via API + UI Display
1. Create incidents via Swagger (medical/police types).
2. Refresh Public portal to see the table update.
3. Log in as admin and visit `/admin` route (use browser navigation or sidebar).
4. Confirm admin stat cards show counts from `/admin/summary`.

### 3.3 Role-Based Routing
1. Try accessing `/police` while logged in as `public` → should redirect to `/`.
2. Log in as a user with `police` role → `/police` dashboard should load with map/table filtered to police incidents.

### 3.4 Notifications Panel
1. After status updates/broadcasts, check the Notifications panel and top-bar dropdown.
2. Use the dropdown “Mark all read” control and confirm the unread badge clears.
3. In the citizen portal, mark individual notifications read via the panel buttons.

### 3.5 Mobile Responsiveness
1. Use browser dev tools to simulate smaller screens and confirm layout adjusts (stat cards stack, map/table widths shrink).

---

## 4. Automated Tests

Backend currently has a health-check smoke test. Run:
```bash
cd backend
pytest
```

Frontend build (type-check + prod bundle):
```bash
cd frontend
npm run build
```

---

## 5. Common Issues & Fixes

| Symptom | Resolution |
| --- | --- |
| Login button spins forever | Ensure backend is running and `VITE_API_URL` matches backend origin. |
| 500 errors on signup | Keep passwords ≤72 characters and install `bcrypt==4.0.1` to avoid passlib/bcrypt mismatch. |
| Notifications badge doesn’t update | Refresh via gear icon or ensure backend `/notifications` endpoints are reachable. |
| CORS errors | Confirm APIs are accessed via the same host defined in backend CORS settings. |

---

This guide mirrors every implemented feature so far. Repeat these steps to validate future changes quickly, and expand the document as new modules land (notifications channels, AI services, etc.).

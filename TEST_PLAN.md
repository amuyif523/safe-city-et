# SAFE CITY – ET Testing Plan

This document explains how to validate the entire platform using Postman (or any REST client) and the React UI. Copy/paste payloads exactly as shown.

---

## 0. Preparation

1. **Backend**
   ```powershell
   cd "C:\Users\Amanuel\Documents\Final Project\backend"
   .\.venv\Scripts\activate
   uvicorn app.main:app --reload --port 8000
   ```
   - Apply migrations (once per DB): `.\.venv\Scripts\python -m alembic upgrade head`
   - Seed defaults (once): `python scripts/seed.py --admin-email admin@example.com --admin-password AdminPass123!`
2. **Frontend**
   ```powershell
   cd "C:\Users\Amanuel\Documents\Final Project\frontend"
   npm install   # first time only
   npm run dev
   ```
   - Browse to `http://127.0.0.1:5173`
3. **Postman Environment**
   - Create environment `SafeCity` with variable `base_url = http://127.0.0.1:8000`
   - Add variables as you go (`admin_access_token`, `admin_refresh_token`, `citizen_access_token`, etc.)

---

## 1. Authentication & User Management (Postman)

### 1.1 Citizen Signup
- **POST** `{{base_url}}/auth/signup`
- Body:
  ```json
  {
    "full_name": "Citizen One",
    "email": "citizen1@example.com",
    "password": "CitizenPass123!",
    "phone": "+251900000001",
    "roles": ["public"]
  }
  ```

### 1.2 Admin Signup
- Same endpoint, new payload:
  ```json
  {
    "full_name": "Admin One",
    "email": "admin1@example.com",
    "password": "AdminPass123!",
    "roles": ["admin"]
  }
  ```

### 1.3 Admin Login (captures refresh token)
- **POST** `{{base_url}}/auth/login`
- Body (x-www-form-urlencoded):
  - `username=admin1@example.com`
  - `password=AdminPass123!`
- Store `access_token` / `refresh_token` in Postman environment.

### 1.4 Token Refresh
- **POST** `{{base_url}}/auth/refresh`
- Body:
  ```json
  { "refresh_token": "{{admin_refresh_token}}" }
  ```
- Update stored tokens with response.

### 1.5 Profile Read
- **GET** `{{base_url}}/auth/me` (Header: `Bearer {{admin_access_token}}`)
- Confirms roles/states.

### 1.6 Password Reset Flow
1. `POST /auth/request-password-reset`:
   ```json
   { "email": "citizen1@example.com" }
   ```
   - Check backend console logs for reset token.
2. `POST /auth/reset-password`:
   ```json
   {
     "token": "PASTE_TOKEN_FROM_LOG",
     "new_password": "CitizenPass456!"
   }
   ```
3. Re-login as citizen with new password to verify.

### 1.7 Rate Limiting
- Attempt incorrect logins > `RATE_LIMIT_LOGIN_ATTEMPTS` (default 5) within window. Expect HTTP 429 on next attempt.

### 1.8 Disable/Suspend via Admin
- After creating roles/users, later steps will cover toggling states through the UI (Section 3.5).

---

## 2. Incident Lifecycle & Analytics (Postman)

### 2.1 Citizen Login
- `POST /auth/login` with `citizen1@example.com` / `CitizenPass456!`
- Save `citizen_access_token`.

### 2.2 Create Incident
- **POST** `{{base_url}}/incidents`
- Headers: `Authorization: Bearer {{citizen_access_token}}`
- Body:
  ```json
  {
    "title": "Car accident at Meskel",
    "description": "Two cars collided near Meskel Square. Smoke present.",
    "priority": "high",
    "latitude": 9.0102,
    "longitude": 38.7613
  }
  ```

### 2.3 Citizen View
- **GET** `{{base_url}}/incidents?page=1&size=10`
- Should list only the citizen’s incidents.

### 2.4 Admin Update / Reclassify
- **PATCH** `{{base_url}}/incidents/{incident_id}?reclassify=true`
- Body:
  ```json
  { "status": "acknowledged" }
  ```

### 2.5 Admin Delete
- **DELETE** `{{base_url}}/incidents/{incident_id}`

### 2.6 Analytics Endpoints
- `GET /incidents/analytics/overview`
- `GET /incidents/analytics/clusters`
- `GET /incidents/analytics/hospital-load`
- `GET /incidents/analytics/fire-water-sources`
- `GET /incidents/recommendations/nearest-responders?latitude=9.01&longitude=38.74`

---

## 3. Notifications & Audit (Postman)

### 3.1 Citizen Notifications
- `GET /notifications` (citizen token) → verify entries.
- `POST /notifications/{id}/read` → unread count drops.
- `GET /notifications/summary` → confirm unread count = 0.

### 3.2 Admin Broadcast
- **POST** `{{base_url}}/notifications/broadcast`
- Body:
  ```json
  {
    "message": "City drill tonight at 21:00",
    "event_type": "broadcast",
    "target_roles": ["police", "fire"],
    "channels": ["in_app", "email", "sms"]
  }
  ```
- Check citizen notifications; backend logs show email/SMS stubs.

### 3.3 Audit Logs
- `GET /audit/logs?size=10&page=1` → verify entries for signup/login/broadcast.
- Apply filter `?action=notification_broadcast` to confirm filtering works.

---

## 4. Frontend Portal Testing

### 4.1 Citizen Portal
1. Visit `http://127.0.0.1:5173`, log in as citizen.
2. Use the “Report Incident” form, submit, and confirm table updates.
3. Review notifications panel; mark individual notifications read, use Refresh button.

### 4.2 Admin Portal
1. Log in as admin via the UI.
2. Verify stat cards & analytics panels refresh after incidents.
3. Incident moderation: update statuses, ensure notifications fire.
4. Broadcast form: toggle channels (in-app/email/SMS), send a message; confirm recipients see notifications.
5. User management table:
   - Use `Disable` button to toggle `is_active`/`is_disabled`. Attempt login as disabled user to confirm block.
   - Use `Suspend` button (enter reason). Attempt login; the UI should show suspension message. Unsuspend to restore access.
6. Audit log panel: filter by action, export JSON, compare export to `GET /audit/logs` output.

### 4.3 Police Portal
1. Create a police user via POST `/users` (roles `["police"]`); log in via UI.
2. Check:
   - Map shows only police incidents.
   - Nearest Responders panel lists resources.
   - Dispatch Queue shows unresolved high-severity incidents.
   - Hotspot list includes top clusters from analytics endpoint.

### 4.4 Fire Portal
1. Create a fire user; log in.
2. Confirm water source list matches `/incidents/analytics/fire-water-sources`.
3. Incident table/map show fire cases.

### 4.5 Medical Portal
1. Create medical user; log in.
2. Hospital load panel displays bar chart data from `/incidents/analytics/hospital-load`.

### 4.6 Military Portal
1. Create military user; log in.
2. Threat Intel panel lists high-severity incidents; hotspot list shows clusters.

### 4.7 Notifications UI (top bar)
- Check unread badge updates as you mark notifications read.
- Use “Mark all read” to reset badge.

### 4.8 Responsive Layout
- Use browser dev tools → toggle mobile view.
- Ensure navigation collapses properly and critical widgets remain accessible.

---

## 5. Automated Tests

- Backend smoke (if pytest installed):
  ```powershell
  cd backend
  pytest
  ```
- Frontend build:
  ```powershell
  cd frontend
  npm run build
  ```

---

## 6. Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `401` / `403` on login | Check user states (disabled/suspended). Reset password if needed. |
| `429 Too Many Requests` | Wait `RATE_LIMIT_WINDOW_SECONDS` or restart backend to clear limiter. |
| Notifications silent | Ensure `NOTIFICATION_EMAIL_ENABLED` / `NOTIFICATION_SMS_ENABLED` are set; otherwise watch backend logs for stub output. |
| Migration errors | Run `.\.venv\Scripts\python -m alembic upgrade head`; delete `safe_city.db` for a fresh start. |
| Refresh loop | Ensure refresh token is stored (localStorage key `safe_city_refresh`) and backend `/auth/refresh` is reachable. |

---

Follow these steps to thoroughly test SAFE CITY – ET without using Swagger. Use Postman for API validation and the UI for end-to-end workflows. Adjust payloads as needed for additional scenarios. Good luck!

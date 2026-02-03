# Video Uploader

This project is a full-stack **Video Uploader platform**.

It includes:
- Spring Boot REST API (Java)
- React SPA frontend
- PostgreSQL database
- JWT authentication + strict privacy enforcement
- Video upload + thumbnail generation using FFmpeg
- Docker Compose local development setup

---

## Features

### Authentication
- User signup and signin with JWT tokens
- Protected upload endpoint

### Video Platform
- Public + private video support
- Private videos visible only to uploader
- Search with autocomplete
- Video playback page with metadata + uploader info
- Private indicator shown for owner videos

### Media Handling
Private videos and thumbnails are loaded securely using **blob fetch + object URL**, since HTML `<video>` tags do not send Authorization headers.

---

## Tech Stack

### Backend
- Java 21 + Spring Boot
- Spring Security + JWT
- PostgreSQL
- FFmpeg thumbnail generation

### Frontend
- React + Vite
- Axios API client
- AuthContext for session handling

### DevOps
- Docker Compose for local development

---

# Running Locally (Docker Compose)

## 1) Create environment file
Create a `.env` file in the project root:

```env
POSTGRES_USER=video_user
POSTGRES_PASSWORD=video_pass
POSTGRES_DB=video_db
JWT_SECRET=super-secret-key
```

## 2) Start everything
```bash
docker compose up --build
```
## 2.1) Start only the backend
```bash
docker compose up --build db 
```
```bash
docker compose up --build backend
```
## 2.2) Start only the frontend
```bash
docker compose up --build frontend
```

## 3) Open
- Frontend: http://localhost:3000 
- Backend: http://localhost:8080

---

# API Endpoints (Summary)

## Auth
- `POST /api/auth/signup`
- `POST /api/auth/signin`

## Videos
- `GET /api/videos`
- `GET /api/videos?search=...`
- `GET /api/videos/{id}`
- `GET /api/videos/{id}/download`
- `GET /api/videos/{id}/thumbnail`
- `POST /api/videos/upload` (protected)

---

# Testing with Postman (Every Endpoint)

## Postman setup (recommended)
1) Create a new **Collection** (e.g. `Video Uploader`).
2) Create **Collection Variables**:
   - `baseUrl` = `http://localhost:8080`
   - `token` = *(leave empty for now)*
   - `videoId` = *(leave empty for now)*

In requests, use:
- URL like: `{{baseUrl}}/api/...`
- Auth header like: `Bearer {{token}}`

---

## 1) Signup — `POST /api/auth/signup`
**Request**
- Method: `POST`
- URL: `{{baseUrl}}/api/auth/signup`
- Headers:
  - `Content-Type: application/json`
- Body → raw → JSON:
```json
{
  "username": "user",
  "email": "user@test.com",
  "password": "password123"
}
```

**Expected**
- `200 OK` 
- Response contains a JWT token.

**Save token automatically (optional)**
In Postman → **Tests** tab:
```js
const json = pm.response.json();
pm.collectionVariables.set("token", json.token);
```

---

## 2) Signin — `POST /api/auth/signin`
**Request**
- Method: `POST`
- URL: `{{baseUrl}}/api/auth/signin`
- Headers:
  - `Content-Type: application/json`
- Body → raw → JSON:
```json
{
  "username": "user",
  "password": "password123"
}
```

**Expected**
- `200 OK`
- Response contains a JWT token.

**Save token automatically (optional)**
Tests tab:
```js
const json = pm.response.json();
pm.collectionVariables.set("token", json.token);
```

---

## 3) Upload video (protected) — `POST /api/videos/upload`
**Request**
- Method: `POST`
- URL: `{{baseUrl}}/api/videos/upload`
- Headers:
  - `Authorization: Bearer {{token}}`
- Body → **form-data**:
  - Key: `file` (type **File**) → choose an `.mp4`
  - Key: `title` (type **Text**) → `My first upload`
  - Key: `description` (type **Text**) → `optional description`
  - Key: `private` (type **Text**) → `true` or `false`

**Expected**
- `200 OK`
- Response returns video metadata including an `id`.

**Save videoId automatically (optional)**
Tests tab:
```js
const json = pm.response.json();
pm.collectionVariables.set("videoId", json.id);
```

**Common errors**
- `401 Unauthorized`: token missing/invalid
- `400 Bad Request`: missing `title` or missing `file`

---

## 4) List newest videos — `GET /api/videos`
**Request**
- Method: `GET`
- URL: `{{baseUrl}}/api/videos`

**Expected**
- `200 OK`
- If you are **not authenticated**: you should only see public videos.
- If you are authenticated: you should see public videos + your own private videos.

**Optional: test authenticated list**
Add header:
- `Authorization: Bearer {{token}}`

---

## 5) Search videos — `GET /api/videos?search=...`
**Request**
- Method: `GET`
- URL: `{{baseUrl}}/api/videos?search=test`

**Expected**
- `200 OK`
- Same privacy rules as list:
  - anonymous sees only public matches
  - logged-in sees public + own private matches

**Optional authenticated search**
Header:
- `Authorization: Bearer {{token}}`

---

## 6) Get single video metadata — `GET /api/videos/{id}`
**Request**
- Method: `GET`
- URL: `{{baseUrl}}/api/videos/{{videoId}}`

**Expected**
- `200 OK` for public videos
- For private videos:
  - owner gets `200 OK`
  - non-owner gets `403 Forbidden`

**If testing private access**
- Owner request: include `Authorization: Bearer {{token}}`
- Non-owner test: signin as a different user, set `token` to that user’s token, then call the same request → expect `403`

---

## 7) Download / stream video file — `GET /api/videos/{id}/download`
**Request**
- Method: `GET`
- URL: `{{baseUrl}}/api/videos/{{videoId}}/download`

**Expected**
- Public video: `200 OK` without token
- Private video:
  - owner: `200 OK` with token
  - non-owner: `403 Forbidden`

**Postman tip**
- In the response, Postman may show binary output.
- You can use **Save Response** to save the file locally and verify playback.

---

## 8) Get thumbnail image — `GET /api/videos/{id}/thumbnail`
**Request**
- Method: `GET`
- URL: `{{baseUrl}}/api/videos/{{videoId}}/thumbnail`

**Expected**
- Public video: `200 OK` without token
- Private video:
  - owner: `200 OK` with token
  - non-owner: `403 Forbidden`

---

# Requirements Covered

✔ REST API endpoints  
✔ JWT Authentication  
✔ Upload + Private media  
✔ Thumbnail generation  
✔ React SPA frontend  
✔ Search autocomplete  
✔ Docker Compose local setup  
✔ Full privacy enforcement  

---

# Author 
Built by: **Irfan Imširović**

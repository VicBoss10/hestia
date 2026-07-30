# Hestia

Hestia is a gesture-based computer control system. A webcam feed is processed in real time with **MediaPipe** to recognize hand gestures, which are translated into mouse and system actions (click, scroll, volume, etc.). A web dashboard lets users authenticate, watch the live camera feed, and review gesture usage statistics.

## Architecture

The project is split into three independent services:

| Service | Path | Stack | Responsibility |
|---|---|---|---|
| Frontend | [`hestia-frontend/`](hestia-frontend) | Angular 19 | Dashboard UI: login/register, live camera view, gesture and usage stats |
| Backend | [`hestia-backend/`](hestia-backend) | NestJS, TypeORM, PostgreSQL | REST API for users, gestures and detection stats; verifies Firebase auth tokens |
| Gesture engine | [`hestia-mp/`](hestia-mp) | Python, OpenCV, MediaPipe, Flask | Reads the webcam, detects hand gestures, drives the mouse (`pyautogui`) and streams the annotated video feed |

Authentication is handled by **Firebase Auth**: the frontend signs users in with the Firebase client SDK, and the backend verifies the resulting ID tokens with the Firebase Admin SDK.

## Prerequisites

- Node.js 18+
- Python 3.10+
- Docker (for PostgreSQL) or a local PostgreSQL instance
- A Firebase project (Authentication enabled) with:
  - A **web app** config (for the frontend)
  - A **service account key** (for the backend)
- A webcam (for the gesture engine)

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` at the **project root** and fill in your Firebase and DB credentials. It's shared by the backend and `docker-compose.yml`.

```bash
cp .env.example .env
```

### 2. Database

```bash
docker compose up -d postgres
```

### 3. Backend (`hestia-backend/`)

```bash
cd hestia-backend
npm install
npm run start:dev
```

The API runs on `http://localhost:3000`, with Swagger docs at `http://localhost:3000/docs`.

### 4. Frontend (`hestia-frontend/`)

```bash
cd hestia-frontend
npm install
ng serve
```

Set your Firebase web app config in `src/environments/environment.ts`. The app runs on `http://localhost:4200`.

### 5. Gesture engine (`hestia-mp/`)

```bash
cd hestia-mp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python src/app.py
```

Serves the annotated video stream and `/start` `/stop` controls on `http://localhost:5000`.

## Security notes

- Never commit Firebase service account keys or `.env` files — both the root `.env` and the service account JSON are gitignored.
- The Firebase **web** API key in `environment.ts` is safe to expose publicly (it's restricted by Firebase Security Rules), unlike the backend's service account key.

## License

Not yet specified.

# Hestia MediaPipe Gesture Engine

Reads the webcam feed, detects hand gestures with MediaPipe, and drives mouse/system actions accordingly. Exposes a small Flask API to start/stop streaming and view the annotated video feed.

## Setup

```bash
# 1. Create a virtual environment (from this directory)
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Run

```bash
python src/app.py
```

- `GET /` — MJPEG video stream with gesture annotations
- `POST /start` — start gesture detection
- `POST /stop` — stop gesture detection

Runs on `http://localhost:5000` by default.

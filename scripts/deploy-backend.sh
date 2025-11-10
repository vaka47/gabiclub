#!/usr/bin/env bash
set -euo pipefail

# Configuration
REPO_DIR="/srv/gabiclub/backend"
APP_DIR="$REPO_DIR/backend"
SERVICE_NAME="gunicorn-gabiclub"

echo "[deploy] Starting backend deploy on $(hostname)"

# Ensure repo exists
if [ ! -d "$REPO_DIR/.git" ]; then
  echo "[deploy] ERROR: $REPO_DIR is not a git repository" >&2
  exit 1
fi

cd "$REPO_DIR"
echo "[deploy] Updating git repo in $REPO_DIR"
git fetch --all --prune
git reset --hard origin/main

cd "$APP_DIR"

# Pick or create virtualenv under backend/.venv
if [ -x "$APP_DIR/.venv/bin/python3" ]; then
  VENV="$APP_DIR/.venv"
elif [ -x "$APP_DIR/venv/bin/python3" ]; then
  VENV="$APP_DIR/venv"
else
  echo "[deploy] Creating virtualenv at $APP_DIR/.venv"
  python3 -m venv "$APP_DIR/.venv"
  VENV="$APP_DIR/.venv"
fi

echo "[deploy] Using venv: $VENV"
source "$VENV/bin/activate"

echo "[deploy] Installing requirements"
python3 -m pip install --upgrade pip wheel
python3 -m pip install -r requirements.txt

echo "[deploy] Applying migrations"
python3 manage.py migrate --noinput

echo "[deploy] Collecting static files"
python3 manage.py collectstatic --noinput

echo "[deploy] Restarting service: $SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl is-active --quiet "$SERVICE_NAME"
echo "[deploy] Service is active"

echo "[deploy] Backend deploy completed"


#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/srv/gabiclub/backend}"
APP_DIR="$REPO_DIR/backend"
SERVICE_NAME="${SERVICE_NAME:-gunicorn-gabiclub}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-main}"
APP_USER="${APP_USER:-app}"
WEB_USER="${WEB_USER:-www-data}"
STATIC_OWNER="${STATIC_OWNER:-$APP_USER}"
STATIC_GROUP="${STATIC_GROUP:-$WEB_USER}"
STATIC_ROOT_PATH="${GABI_STATIC_ROOT:-$APP_DIR/static}"

run_as_app() {
  if [ "$(id -un)" = "$APP_USER" ]; then
    "$@"
  else
    sudo -u "$APP_USER" "$@"
  fi
}

run_manage_as_app() {
  local manage_args=("$@")
  local quoted_args=""
  printf -v quoted_args '%q ' "${manage_args[@]}"
  run_as_app bash -lc "cd $(printf '%q' "$APP_DIR") && umask 022 && $(printf '%q' "$VENV/bin/python3") manage.py ${quoted_args}"
}

repair_static_permissions() {
  local static_root="$1"
  if [ ! -d "$static_root" ]; then
    echo "[deploy] ERROR: static root is missing: $static_root" >&2
    exit 1
  fi

  echo "[deploy] Normalizing static permissions in $static_root"
  if [ "$(id -u)" -eq 0 ]; then
    chown -R "$STATIC_OWNER:$STATIC_GROUP" "$static_root"
  fi
  find "$static_root" -type d -exec chmod 755 {} +
  find "$static_root" -type f -exec chmod 644 {} +

  local admin_css="$static_root/admin/css/base.css"
  if [ ! -f "$admin_css" ]; then
    echo "[deploy] ERROR: expected admin CSS is missing: $admin_css" >&2
    exit 1
  fi

  if id "$WEB_USER" >/dev/null 2>&1; then
    echo "[deploy] Verifying that $WEB_USER can read $admin_css"
    sudo -u "$WEB_USER" test -r "$admin_css"
  fi
}

echo "[deploy] Starting backend deploy on $(hostname)"
echo "[deploy] Repo: $REPO_DIR | Branch: $GIT_REMOTE/$GIT_BRANCH | Service: $SERVICE_NAME"

# Ensure repo exists
if [ ! -d "$REPO_DIR/.git" ]; then
  echo "[deploy] ERROR: $REPO_DIR is not a git repository" >&2
  exit 1
fi

cd "$REPO_DIR"
echo "[deploy] Updating git repo in $REPO_DIR"
git fetch --all --prune
git reset --hard "$GIT_REMOTE/$GIT_BRANCH"

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
run_manage_as_app migrate --noinput

echo "[deploy] Collecting static files"
run_manage_as_app collectstatic --noinput
repair_static_permissions "$STATIC_ROOT_PATH"

echo "[deploy] Restarting service: $SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl is-active --quiet "$SERVICE_NAME"
echo "[deploy] Service is active"

echo "[deploy] Backend deploy completed"

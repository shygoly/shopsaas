#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/provision-shop.sh --app APP_NAME --shop SHOP_NAME --email ADMIN_EMAIL --password ADMIN_PASSWORD [--force-destroy] [--check-only]

Automates triggering the EverShop Fly.io deployment workflow for a child shop.

Required arguments:
  --app            Fly.io app name (e.g. evershop-fly-myshop)
  --shop           Human readable shop name
  --email          Admin email address for the shop
  --password       Admin password

Optional flags:
  --force-destroy  Destroy any existing Fly app with the same name before deploying
  --check-only     Do not trigger the workflow, only report current status/URL
  --help           Show this help text

Environment requirements:
  - Logged into Fly CLI (`fly auth whoami`)
  - Logged into GitHub CLI (`gh auth status`)
  - Repo `shygoly/evershop-fly` accessible with required secrets configured

Example:
  scripts/provision-shop.sh \
    --app evershop-fly-ebooks \
    --shop "ebooks" \
    --email admin-ebooks@shopsaas.dev \
    --password 'EbooksAdmin#2024'
EOF
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: command '$cmd' not found in PATH" >&2
    exit 1
  fi
}

# Parse arguments
APP_NAME=""
SHOP_NAME=""
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
FORCE_DESTROY=0
CHECK_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app) APP_NAME="$2"; shift 2 ;;
    --shop) SHOP_NAME="$2"; shift 2 ;;
    --email) ADMIN_EMAIL="$2"; shift 2 ;;
    --password) ADMIN_PASSWORD="$2"; shift 2 ;;
    --force-destroy) FORCE_DESTROY=1; shift ;;
    --check-only) CHECK_ONLY=1; shift ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ $CHECK_ONLY -eq 0 ]]; then
  if [[ -z "$APP_NAME" || -z "$SHOP_NAME" || -z "$ADMIN_EMAIL" || -z "$ADMIN_PASSWORD" ]]; then
    echo "Error: --app, --shop, --email, and --password are required unless --check-only is used." >&2
    usage
    exit 1
  fi
fi

require_cmd fly
require_cmd gh
require_cmd jq

if ! fly auth whoami >/dev/null 2>&1; then
  echo "Error: not logged into Fly CLI. Run 'fly auth login'." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: not logged into GitHub CLI. Run 'gh auth login'." >&2
  exit 1
fi

APP_EXISTS=0
if fly apps list --json >/dev/null 2>&1; then
  if fly apps list --json | jq -er --arg app "$APP_NAME" '.[] | select(.Name == $app)' >/dev/null; then
    APP_EXISTS=1
  fi
fi

APP_URL="https://${APP_NAME}.fly.dev"

if [[ $CHECK_ONLY -eq 1 ]]; then
  if [[ $APP_EXISTS -eq 1 ]]; then
    echo "App '$APP_NAME' exists. Health:"
    fly status -a "$APP_NAME" || true
    if curl -fsS "$APP_URL" >/dev/null; then
      echo "✅ Reachable at $APP_URL"
    else
      echo "⚠️  $APP_URL not responding successfully"
    fi
  else
    echo "App '$APP_NAME' does not exist on Fly."
  fi
  exit 0
fi

if [[ $FORCE_DESTROY -eq 1 && $APP_EXISTS -eq 1 ]]; then
  echo "Destroying existing Fly app '$APP_NAME'..."
  fly apps destroy "$APP_NAME" --yes
  APP_EXISTS=0
fi

echo "Triggering workflow dispatch..."
gh workflow run deploy-new-shop.yml \
  -R shygoly/evershop-fly \
  -f app_name="$APP_NAME" \
  -f shop_name="$SHOP_NAME" \
  -f admin_email="$ADMIN_EMAIL" \
  -f admin_password="$ADMIN_PASSWORD"

echo "Waiting for workflow to appear..."
sleep 5

RUN_ID=$(gh run list -R shygoly/evershop-fly --workflow deploy-new-shop.yml --limit 1 --json databaseId -q '.[0].databaseId')
if [[ -z "$RUN_ID" ]]; then
  echo "Error: unable to determine workflow run ID." >&2
  exit 1
fi

echo "Attached to run $RUN_ID"
if ! gh run watch "$RUN_ID" -R shygoly/evershop-fly --exit-status; then
  echo "Workflow failed. Fetching logs..."
  gh run view "$RUN_ID" -R shygoly/evershop-fly --log || true
  exit 1
fi

echo "Checking Fly app status..."
fly status -a "$APP_NAME"

if curl -fsS "$APP_URL" >/dev/null; then
  echo "✅ App reachable at $APP_URL"
else
  echo "⚠️  App deployed but HTTP check failed for $APP_URL"
fi

echo "Done."

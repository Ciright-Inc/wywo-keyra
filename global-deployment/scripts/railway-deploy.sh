#!/usr/bin/env bash
# Deploy keyra-global-deployment to Railway (Keyra-Projects / SAT).
# Prerequisite: railway login  (token expired? run that first)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="161cc1ec-95ff-49d6-a0be-75c3769be820"
ENV_ID="fbd61323-77ec-4c1b-ba20-6a5c505496f7"
SERVICE_NAME="global-deployment"

echo "→ Checking Railway auth…"
railway whoami

echo "→ Linking ${SERVICE_NAME} in Keyra-Projects (production)…"
if ! railway link --project "$PROJECT_ID" --environment "$ENV_ID" --service "$SERVICE_NAME" 2>/dev/null; then
  echo "→ Service not found; creating ${SERVICE_NAME}…"
  railway link --project "$PROJECT_ID" --environment "$ENV_ID"
  railway add --service "$SERVICE_NAME"
  railway service "$SERVICE_NAME"
fi

railway status

echo "→ Setting variables (shared Postgres + Keyra links)…"
railway variable set 'DATABASE_URL=${{ Postgres.DATABASE_URL }}'
railway variable set 'NEXT_PUBLIC_KEYRA_SITE_URL=https://keyra.ie'

if [[ -z "${NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL:-}" ]]; then
  echo "⚠ Set public URL after first deploy:"
  echo "  railway domain"
  echo "  railway variable set 'NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL=https://YOUR-RAILWAY-DOMAIN'"
else
  railway variable set "NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL=${NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL}"
fi

echo "→ Deploying from ${ROOT}…"
railway up --ci -m "Deploy global-deployment standalone site"

echo "→ Done. Logs:"
railway logs --tail 30

# Render Deployment Guide

This project is now configured for Render via `render.yaml`.

## 1) Push the latest code

Make sure these files are in your Git branch:

- `render.yaml`
- build fixes in `client/src/components/seo/*`

## 2) Create the service on Render

1. Open Render dashboard
2. Click `New` -> `Blueprint`
3. Connect your GitHub repo/branch
4. Render will detect `render.yaml` and create `brandentifier`

## 3) Set required environment variables

In Render service settings, set at minimum:

- `DATABASE_URL`
- `JWT_SECRET`

Set AI keys only if those features are needed:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`

Optional cache:

- `REDIS_URL`

Already configured in `render.yaml`:

- `NODE_ENV=production`
- `TRUST_PROXY=1`

## 4) Deploy

Render runs:

- Build: `npm ci && npm run build`
- Start: `npm start`

Health check:

- `GET /health`

## 5) Post-deploy checks

Run these against your Render URL:

- `/health` returns `200`
- `/api/deployment-test` returns success JSON
- Sign-in, API calls, and one upload flow

## Free plan caveats

- Free web service spins down after idle time, cold starts are expected.
- Local filesystem is ephemeral on restarts/redeploys/spin-down.
- In-process schedulers are not reliable on sleeping free instances.

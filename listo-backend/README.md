# Listo Backend

Microservice for username-to-wallet resolution.

## Tech Stack
- Node.js / Express
- SQLite (Self-hosted database)
- CORS enabled for frontend access

## Setup
1. `npm install`
2. `npm run dev`

## API Endpoints
- `POST /api/register`: Register `@username` to `wallet_address`
- `GET /api/lookup/:username`: Get `wallet_address` for a username

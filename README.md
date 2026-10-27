# Apple Worm Adventure

A responsive grid-based worm puzzle prototype inspired by the *gameplay concept* of strategic apple collection and portal navigation. This is an original implementation: branding, artwork, UI, levels, and code are independently created.

> **Implementation status:** The client currently provides playable prototype mechanics and 50 data-driven level entries. The Express/MongoDB API scaffold includes registration/login, economy configuration, reward-opportunity records, progress, and wallet history. Real rewarded-ad provider verification is **not connected**; the API deliberately refuses to grant an ad reward without a provider-verified event. Do not describe the demo coin interactions in the client as production-secure rewards.

## Features

- React + Vite frontend with responsive desktop/mobile layouts.
- `VITE_GAME_NAME` is centralized in `client/src/config/gameConfig.js`; backend name is centralized in `server/src/config/gameConfig.js`.
- Grid movement with arrow keys/WASD and on-screen directional controls.
- Apple collection grows the worm; wall, boundary and body collisions fail the level; portal only completes after all apples are collected.
- Restart, undo, hint, score/move counters, level map, 50 data-driven level entries, and sequential unlock flow.
- Dashboard-style reward center and explicit UI note about provider verification.
- Express API, MongoDB models, JWT auth, bcrypt password hashing, basic rate limits, helmet, reward/wallet ledger models and API-level caps.
- `.env.example` files; secrets are excluded from Git.

## Stack

- Client: React 18, Vite, Lucide React, CSS
- Server: Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs
- Suggested hosting: Vercel for client, Render for API, MongoDB Atlas for database

## Project structure

```text
apple-worm-adventure/
├── client/
│   ├── src/config/gameConfig.js
│   ├── src/data/levels.js
│   ├── src/game/engine.js
│   ├── src/main.jsx
│   ├── src/style.css
│   └── .env.example
├── server/
│   ├── src/config/
│   ├── src/middleware/
│   ├── src/models/
│   ├── src/routes/
│   └── src/index.js
├── .env.example
├── .gitignore
└── README.md
```

## Run locally

Requirements: Node.js 20+ and MongoDB (local or Atlas).

1. Create `client/.env` from `client/.env.example`:

   ```env
   VITE_GAME_NAME=APPLE WORM ADVENTURE
   VITE_API_URL=http://localhost:5000/api
   ```

2. Create `server/.env` from the root `.env.example`, set `MONGODB_URI`, and use a long random `JWT_SECRET`. Set `CLIENT_ORIGIN=http://localhost:5173`.
3. Start the API:

   ```bash
   cd server
   npm install
   npm run dev
   ```

4. In another terminal, start the client:

   ```bash
   cd client
   npm install
   npm run dev
   ```

5. Open the Vite URL printed in the terminal. API health check: `http://localhost:5000/api/health`.

## Game controls

- Move: arrow keys or WASD.
- Mobile: use the on-screen directional pad.
- Undo: restores the previous client-side game snapshot.
- Restart: resets the current puzzle.
- Hint: explains the objective; it is not yet a pathfinding solver.

## Level system

Levels are generated as structured data in `client/src/data/levels.js`, not as separate React pages. Difficulty labels progress through Beginner, Easy, Medium, Hard and Expert. The current prototype cycles through a small set of handcrafted layouts and adjusts some walls/move limits for later entries. **A complete solver-based solvability audit for all 50 levels is still required before production submission.**

## Economy design

### How users earn

- First-time level completion: 25 coins in the current API progress scaffold.
- Future supported earn sources include verified rewarded-ad events, daily challenges and achievements.

### How users spend

The wallet can support hints, undo, boosters and cosmetics. Prices and rewards should be configured centrally rather than embedded in UI components.

### Rewarded ads and verification

Intended opt-in placements: `REVIVE`, `HINT`, `DOUBLE_SCORE`, `DOUBLE_COINS`, `EXTRA_MOVES`, and `BOOSTER`. The production flow must be:

`Create opportunity → provider plays ad → provider sends signed server callback → verify signature/event/eligibility → enforce caps → idempotent reward transaction → wallet ledger entry → update UI`.

The current `/api/economy/ad/verify` and `/api/economy/ad/claim` routes intentionally do **not** grant rewards. Integrate a real provider and verify its server-to-server callback before enabling rewards. Never trust a browser's `adFinished`, reward amount, or client-supplied event as proof of ad completion.

### Economic safety

- Centralized server-side limits for daily rewarded ads, cooldown, revive and multipliers.
- Unique `adEventId` index provides a basis for idempotency.
- `RewardTransaction` and `WalletTransaction` models preserve audit history.
- Authenticated routes and request rate limiting are enabled.
- Further production work: atomic MongoDB transactions, session-level caps, expired-opportunity cleanup, signed provider callbacks, server-simulated game sessions, admin controls and fraud monitoring.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login and return JWT |
| GET | `/api/auth/me` | Current account |
| POST | `/api/auth/logout` | Client token logout acknowledgement |
| GET | `/api/economy/config` | Public economy configuration |
| GET | `/api/economy/balance` | Authenticated wallet balance |
| GET | `/api/economy/history` | Reward history |
| POST | `/api/economy/ad/opportunity` | Create capped reward opportunity |
| POST | `/api/economy/ad/verify` | Deliberately disabled until provider verification is integrated |
| POST | `/api/economy/ad/claim` | Rejects unverified claims |
| GET | `/api/player/dashboard` | Player dashboard data |
| GET | `/api/player/wallet/history` | Wallet ledger history |
| POST | `/api/player/progress` | Bounded progress record (not yet authoritative game simulation) |
| GET | `/api/health` | Health check |

All protected API requests use `Authorization: Bearer <token>`.

## Authentication and security notes

Passwords are hashed with bcrypt. JWTs expire after seven days. Helmet, CORS allow-listing, JSON size limits and rate limiting are configured. For production, add secure HttpOnly cookie-based session handling or carefully managed short-lived access/refresh tokens, CSRF protection if cookies are used, schema validation, audit logging and secret rotation.

## Deployment

### Frontend — Vercel

- Import the repository in Vercel and set **Root Directory** to `client`.
- Build command: `npm run build`; output directory: `dist`.
- Set `VITE_GAME_NAME` and `VITE_API_URL` to the public API URL.
- Add SPA rewrites if adding client-side routes.

### Backend — Render

- Create a Web Service with **Root Directory** `server`, build command `npm install`, start command `npm start`.
- Set `NODE_ENV=production`, `PORT` (Render injects this), `GAME_NAME`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` to the deployed client origin.
- Keep `ALLOW_DEMO_ADS` false in production. Configure a real ad provider callback before offering real ad-backed rewards.

### Database — MongoDB Atlas

Create a database user with least privilege, allow the hosting provider's network access, and use the Atlas connection URI as `MONGODB_URI`. Never commit credentials.

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `VITE_GAME_NAME` | client | Display name source of truth |
| `VITE_API_URL` | client | API base URL |
| `GAME_NAME` | server | Backend display/product name |
| `PORT` | server | HTTP port |
| `CLIENT_ORIGIN` | server | Allowed client origin(s), comma-separated |
| `MONGODB_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Long random signing secret |
| `NODE_ENV` | server | Runtime environment |
| `ALLOW_DEMO_ADS` | server | Development flag only; no reward granting is implemented by the demo verifier |

## Known limitations / next steps

1. The current client wallet and progress notifications are prototype UX, not a production-secure wallet.
2. Authentication API exists but login/register screens and client API integration remain to be connected.
3. Real ad SDK/provider verification and signed callbacks are not implemented; reward routes deny unverified claims.
4. All 50 level entries need automated solvability tests and more diverse authored layouts.
5. Server-side authoritative movement simulation, secure game sessions/checkpoints, robust anti-cheat and atomic wallet transactions are required before production.
6. Audio/music, particle effects, 10+ achievements, leaderboard, full admin economy analytics, daily challenge, screenshots and demo video remain follow-up work.
7. Play and study the reference game on a compatible Android device before final submission, as requested by the task.

## Submission checklist

- [ ] Test mobile and desktop layouts
- [ ] Run `npm run build` in `client`
- [ ] Add automated game-engine and API tests
- [ ] Validate every level is solvable
- [ ] Configure Atlas, Vercel and Render environment variables
- [ ] Connect a real ad provider's server verification callback
- [ ] Capture screenshots and record the required demo video
- [ ] Push to a public GitHub repository
- [ ] Add real GitHub, frontend, backend and demo URLs to the submission form

## Reference

Gameplay concept reference supplied by the assignment: [Snake Puzzle: Slither to Eat](https://play.google.com/store/apps/details?id=puzzle.snakes.puzzle.slithereat.gaming). The implementation must not copy its branding, art, level layouts, UI or source code.

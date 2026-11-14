# Apple Worm Adventure

A premium, responsive grid-based worm puzzle game inspired by the gameplay concept of strategic apple collection and portal navigation. This is an original implementation with polished visuals, smooth animations, and professional design.

## Features

### Premium Worm Character
- **Realistic earthworm anatomy**: Detailed SVG worm with segmented rings, clitellum band, and expressive eyes
- **Smooth animations**: Breathing, blinking, eating, and moving animations with peristaltic movement
- **Multiple skins**: 6 premium worm skins (Emerald, Golden Sun, Ruby Flame, Cosmic Violet, Neon Cyber, Rose Quartz)
- **Expressive reactions**: Worm shows different expressions for idle, moving, eating, and happy states

### Engaging Gameplay
- **50 handcrafted levels** across 5 mystical realms (Mossy Meadow, Stone Ruins, Crystal Caverns, Mystic Orchard, Celestial Sanctuary)
- **Smooth tile-to-tile movement** with eased interpolation
- **Apple collection** grows the worm; wall, boundary, and body collisions fail the level
- **Cosmic portal** unlocks after all apples are collected
- **Progressive difficulty**: Beginner to Expert with increasing complexity

### Professional UI/UX
- **Responsive design** for desktop, tablet, and mobile
- **Premium glassmorphism** with backdrop blur and subtle shadows
- **Smooth animations** throughout the game
- **Accessibility features**: Reduced motion, high contrast, colorblind mode
- **Comprehensive settings**: Music/SFX volume, motion preferences

### Advanced Mechanics
- **Power-ups**: Bomb, Lightning, Rainbow, Hammer, Extra Moves, Magic Key
- **Star rating system**: 3-star scoring based on move efficiency
- **Achievements**: 10+ achievements with coin rewards
- **Daily challenges** with bonus rewards
- **Leaderboard** for competitive play
- **Undo system** with timeline
- **BFS hint solver** for optimal pathfinding

### Premium Visuals
- **Detailed environments**: World-specific atmospheric effects, particles, and lighting
- **Animated elements**: Floating apples, cosmic portals, grass tiles, stone blocks, crates, ice, treasure
- **Particle effects**: Screen shake, confetti, worm trail, ambient particles
- **Premium modals**: Victory celebrations, failure diagnostics, level map, shop, settings, achievements

### Social & Progression
- **Authentication**: Register/login with JWT tokens
- **Cloud sync**: Progress, coins, skins, and settings sync across devices
- **Leaderboard**: Compete with other players globally
- **Achievements**: Unlock badges and earn rewards
- **Daily rewards**: Streak calendar and bonus coins

## Stack

- **Client**: React 18, Vite, Lucide React, CSS with custom properties
- **Server**: Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs
- **Suggested hosting**: Vercel for client, Render for API, MongoDB Atlas for database

## Project structure

```text
apple-worm-adventure/
├── client/
│   ├── src/config/gameConfig.js
│   ├── src/data/levels.js
│   ├── src/game/engine.js
│   ├── src/game/audio.js
│   ├── src/game/solver.js
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

- **Move**: Arrow keys or WASD.
- **Mobile**: Use the on-screen directional pad or swipe gestures.
- **Undo**: Restores the previous client-side game snapshot (Z key).
- **Restart**: Resets the current puzzle (R key).
- **Hint**: Shows optimal path using BFS solver (H key).
- **Fullscreen**: Toggle fullscreen mode (F key).
- **Music**: Toggle background music (M key).

## Level system

Levels are structured data in `client/src/data/levels.js`, not separate React pages. Difficulty progresses through Beginner, Easy, Medium, Hard, and Expert. Each level has:
- Unique worm starting position
- Apple placements
- Wall configurations
- Move limits and par moves for 3-star scoring
- Optional mechanics (grass, treasure, keys, doors, hazards, blocks, ice)

All 50 levels are validated for solvability.

## Economy design

### How users earn

- First-time level completion: 25 coins
- Daily challenges: Bonus coins
- Achievements: Coin rewards
- Future: Verified rewarded-ad events

### How users spend

- Worm skins (500-1500 coins)
- Apple Boost (+5 moves for 30 coins)
- Power-ups and hints

### Rewarded ads and verification

Intended opt-in placements: `REVIVE`, `HINT`, `DOUBLE_SCORE`, `DOUBLE_COINS`, `EXTRA_MOVES`, and `BOOSTER`. Production flow:

`Create opportunity → provider plays ad → provider sends signed server callback → verify signature/event/eligibility → enforce caps → idempotent reward transaction → wallet ledger entry → update UI`

The current `/api/economy/ad/verify` and `/api/economy/ad/claim` routes intentionally do **not** grant rewards. Integrate a real provider and verify its server-to-server callback before enabling rewards.

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
| POST | `/api/player/progress` | Bounded progress record |
| GET | `/api/health` | Health check |

All protected API requests use `Authorization: Bearer <token>`.

## Authentication and security notes

Passwords are hashed with bcrypt. JWTs expire after seven days. Helmet, CORS allow-listing, JSON size limits, and rate limiting are configured. For production, add secure HttpOnly cookie-based session handling, CSRF protection, schema validation, audit logging, and secret rotation.

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
4. Server-side authoritative movement simulation, secure game sessions/checkpoints, robust anti-cheat, and atomic wallet transactions are required before production.
5. Audio/music, particle effects, 10+ achievements, leaderboard, full admin economy analytics, daily challenge, screenshots and demo video remain follow-up work.
6. Play and study the reference game on a compatible Android device before final submission, as requested by the task.

## Submission checklist

- [x] Test mobile and desktop layouts
- [x] Run `npm run build` in `client`
- [x] Add automated game-engine and API tests
- [x] Validate every level is solvable
- [ ] Configure Atlas, Vercel and Render environment variables
- [ ] Connect a real ad provider's server verification callback
- [ ] Capture screenshots and record the required demo video
- [ ] Push to a public GitHub repository
- [ ] Add real GitHub, frontend, backend and demo URLs to the submission form

## Reference

Gameplay concept reference supplied by the assignment: [Snake Puzzle: Slither to Eat](https://play.google.com/store/apps/details?id=puzzle.snakes.puzzle.slithereat.gaming). The implementation must not copy its branding, art, level layouts, UI or source code.

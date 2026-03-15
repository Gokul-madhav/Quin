# Quin Backend

Backend APIs for Quin — Node.js + Express. Agora voice calls, QR code generation, web-to-mobile call routing. Deploy on Vercel (website and APIs).

## Stack

- **Node.js** + **Express** (no Vercel packages; Vercel is used only for hosting)
- Same API routes as before; single Express app in `app.js`, entry for Vercel in `api/index.js`

## Setup

### 1. Install dependencies

```bash
cd quin_backend
npm install
```

### 2. Environment variables

Create a `.env` file (and in Vercel → Project → Settings → Environment Variables):

```env
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
BASE_URL=https://your-app.vercel.app
```

**Agora:** [Agora Console](https://console.agora.io) → create project → enable Voice (RTC) → copy App ID and App Certificate.

### 3. Local development

```bash
npm run dev
```

Server runs at `http://localhost:3000`. Use `GET /api/health` to check.

### 4. Deploy to Vercel

- Push to GitHub and connect the repo in [Vercel](https://vercel.com), or use **Import** and point to this repo.
- Set **Root Directory** to `quin_backend` if the repo root is the parent folder.
- Add `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` (and optionally `BASE_URL`) in the project’s Environment Variables.
- Deploy. All `/api/*` requests are handled by the Express app via `api/index.js`.

---

## API Reference

### Agora

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agora/token` | POST | Generate RTC token for a channel |
| `/api/agora/call/create` | POST | Create a new call session |
| `/api/agora/call/join` | POST | Join a call (with callId or channelName) |

### QR Code

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/qrcode/generate` | POST | Generate unique QR code (call, link, or custom payload) |

### Call routing (web → mobile)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/call/create-with-qr` | POST | Create call + QR code for mobile to scan |
| `/api/call/join-by-code` | POST | Join call by short code (from scanned QR) |

### Health

| Endpoint | Method |
|----------|--------|
| `/api/health` | GET |

---

## Web → Mobile flow

1. **Web** calls `POST /api/call/create-with-qr`
   - Returns: `token`, `channelName`, `appId`, `qrDataUrl`, `shortCode`
   - Web displays QR code and joins the call

2. **Mobile** scans QR code (contains `callId`, `channelName`, `appId`, `joinApiUrl`)

3. **Mobile** calls `POST /api/call/join-by-code` with `{ code: callId }`
   - Returns: `token`, `channelName`, `uid`, `appId`

4. Both web and mobile join the same Agora channel with their tokens

---

## Request examples

### Create call with QR (web)

```bash
curl -X POST https://your-app.vercel.app/api/call/create-with-qr \
  -H "Content-Type: application/json" \
  -d '{"userName": "Host"}'
```

### Join by code (mobile)

```bash
curl -X POST https://your-app.vercel.app/api/call/join-by-code \
  -H "Content-Type: application/json" \
  -d '{"code": "abc123def456"}'
```

### Generate custom QR

```bash
curl -X POST https://your-app.vercel.app/api/qrcode/generate \
  -H "Content-Type: application/json" \
  -d '{"type": "call", "size": 300}'
```

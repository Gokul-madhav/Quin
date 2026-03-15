# Quin Backend

Backend APIs for Quin - Agora voice calls, unique QR code generation, and web-to-mobile call routing. Deployable on Vercel.

## Setup

### 1. Install dependencies

```bash
cd quin_backend
npm install
```

### 2. Environment variables

Create a `.env` file (or set in Vercel Dashboard):

```env
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
BASE_URL=https://your-app.vercel.app  # optional, auto on Vercel
```

**Agora setup:**
1. Go to [Agora Console](https://console.agora.io)
2. Create a project → enable Voice (RTC)
3. Get **App ID** and **App Certificate**
4. Add them to `.env` and Vercel env vars

### 3. Local development

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
npm run deploy
```

Or connect your repo in [Vercel Dashboard](https://vercel.com) and add env vars there.

**If the repo root is `Quin` (with `quin_backend` inside):**
1. Vercel → your project → **Settings** → **General**
2. Set **Root Directory** to `quin_backend` and Save
3. Redeploy so only the backend is built (deploy should finish in ~1–2 min)

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

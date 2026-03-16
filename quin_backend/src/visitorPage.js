/* eslint-disable max-len */

/**
 * Shared HTML template for the public visitor page when a QR is scanned.
 * Used both by the local Express server (/v/:qrId) and the Vercel
 * serverless handler (via /api/index/v/:qrId).
 */
// eslint-disable-next-line import/prefer-default-export
function renderVisitorPage(qrId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quin vehicle tag</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d0d0f;
      --surface: #161618;
      --border: #2a2a2e;
      --gold: #c9a962;
      --gold-muted: #8b7355;
      --text: #f5f5f5;
      --text-muted: #9e9e9e;
      --danger: #ff6b6b;
    }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #1f1f23 0, #050507 55%);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      padding: 16px;
    }
    .card {
      width: 100%;
      max-width: 480px;
      background: linear-gradient(145deg, #111115, #18181c);
      border-radius: 20px;
      border: 1px solid rgba(201,169,98,0.14);
      box-shadow:
        0 30px 60px rgba(0,0,0,0.75),
        0 0 0 1px rgba(255,255,255,0.02);
      padding: 22px 20px 20px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .title {
      font-size: 1.1rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--gold);
    }
    .badge {
      font-size: 0.7rem;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid rgba(201,169,98,0.35);
      color: var(--gold);
      background: rgba(201,169,98,0.08);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .section {
      background: rgba(15,15,19,0.9);
      border-radius: 14px;
      border: 1px solid var(--border);
      padding: 14px 14px 12px;
      margin-bottom: 12px;
    }
    .section h2 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .vehicle-main {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .vehicle-icon {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      background: radial-gradient(circle at 30% 0%, #fdf5d4 0, #c9a962 36%, #5c4729 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #080609;
      font-size: 18px;
    }
    .vehicle-text-main {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.12em;
    }
    .vehicle-text-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .meta-pill {
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
    }
    label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    select, textarea {
      width: 100%;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: rgba(10,10,14,0.9);
      color: var(--text);
      padding: 8px 10px;
      font-size: 0.85rem;
      outline: none;
      resize: vertical;
    }
    select:focus, textarea:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 1px rgba(201,169,98,0.35);
    }
    textarea {
      min-height: 64px;
      max-height: 140px;
    }
    .helper {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .actions button {
      flex: 1;
    }
    button {
      border-radius: 999px;
      border: none;
      padding: 10px 14px;
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease-out;
    }
    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .btn-primary {
      background: var(--gold);
      color: #050507;
      box-shadow: 0 10px 25px rgba(201,169,98,0.35);
    }
    .btn-secondary {
      background: rgba(34,34,40,1);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:not(:disabled):hover {
      border-color: rgba(201,169,98,0.55);
    }
    .status {
      margin-top: 8px;
      font-size: 0.78rem;
      color: var(--text-muted);
      min-height: 16px;
    }
    .status.error {
      color: var(--danger);
    }
    .status.success {
      color: var(--gold);
    }
    .disclaimer {
      margin-top: 10px;
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .qr-id {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 8px;
      align-items: end;
    }
    .inline-input {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  </style>
</head>
<body>
  <main class="card">
    <header class="header">
      <div>
        <div class="title">Quin tag</div>
        <div class="qr-id" id="qr-id-text">QR ID: ${qrId}</div>
      </div>
      <div class="badge">Visitor</div>
    </header>

    <section class="section" id="vehicle-section">
      <h2>Vehicle details</h2>
      <div id="vehicle-loading">Loading vehicle…</div>
      <div id="vehicle-content" style="display:none;">
        <div class="vehicle-main">
          <div class="vehicle-icon">🚗</div>
          <div>
            <div class="vehicle-text-main" id="vehicle-number"></div>
            <div class="vehicle-text-sub" id="owner-name"></div>
          </div>
        </div>
        <div class="meta-row" id="vehicle-meta"></div>
      </div>
    </section>

    <section class="section">
      <h2>Why do you want to contact the owner?</h2>
      <div style="margin-top:6px;" class="two-col">
        <div class="inline-input">
          <label for="reason">Select a reason</label>
          <select id="reason">
            <option value="">Choose a reason…</option>
            <option>Vehicle blocking road</option>
            <option>Wrong parking</option>
            <option>Accident or damage</option>
            <option>Security alert</option>
            <option>Other</option>
          </select>
        </div>
        <div class="inline-input">
          <label for="last4">Last 4 of vehicle number</label>
          <input id="last4" type="text" maxlength="4" pattern="[A-Za-z0-9]{4}" placeholder="••••" style="width:100%;border-radius:10px;border:1px solid var(--border);background:rgba(10,10,14,0.9);color:var(--text);padding:8px 10px;font-size:0.85rem;outline:none;" />
        </div>
      </div>
      <div style="margin-top:4px;" class="helper">You must enter the correct last 4 characters of the plate before you can call or message.</div>
      <div style="margin-top:8px;">
        <label for="message">Optional message</label>
        <textarea id="message" maxlength="2000" placeholder="Add details that help the owner understand the situation."></textarea>
        <p class="helper">Reason and last 4 digits are required before you can message or call the owner.</p>
      </div>
      <div class="actions">
        <button id="message-btn" class="btn-secondary" disabled>Send message</button>
        <button id="call-btn" class="btn-primary" disabled>Call owner</button>
        <button id="end-call-btn" class="btn-secondary" disabled>End call</button>
      </div>
      <div id="status" class="status"></div>
      <p class="disclaimer">
        Calls and messages are routed securely via Quin. The owner’s phone number is not exposed. Even if the tag is locked for editing, visitors can still contact the owner.
      </p>
    </section>
  </main>

  <script>
    (function() {
      const qrId = ${JSON.stringify(qrId)};
      const reasonSelect = document.getElementById('reason');
      const last4Input = document.getElementById('last4');
      const messageInput = document.getElementById('message');
      const messageBtn = document.getElementById('message-btn');
      const callBtn = document.getElementById('call-btn');
      const endCallBtn = document.getElementById('end-call-btn');
      const statusEl = document.getElementById('status');
      let serverLast4 = null;

      function setStatus(text, kind) {
        statusEl.textContent = text || '';
        statusEl.className = 'status' + (kind ? ' ' + kind : '');
      }

      function hasValidLast4() {
        const val = (last4Input.value || '').trim();
        return val.length === 4 && /^[A-Za-z0-9]{4}$/.test(val);
      }

      function updateButtons() {
        const hasReason = !!reasonSelect.value;
        const last4Ok = hasValidLast4();
        const canContact = hasReason && last4Ok;
        messageBtn.disabled = !canContact;
        if (!window.__quin_inCall) {
          callBtn.disabled = !canContact;
        }
        endCallBtn.disabled = !window.__quin_inCall;
      }

      reasonSelect.addEventListener('change', updateButtons);
      last4Input.addEventListener('input', updateButtons);

      async function fetchVehicle() {
        const loadingEl = document.getElementById('vehicle-loading');
        const contentEl = document.getElementById('vehicle-content');
        try {
          const res = await fetch('/api/qr/' + encodeURIComponent(qrId));
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data && data.error || 'Failed to load vehicle');
          }

          loadingEl.style.display = 'none';
          contentEl.style.display = 'block';

          const fullNumber = data.vehicle_number || 'Vehicle';
          const blurred = fullNumber.replace(/(.+)(.{4})$/, (m, head, tail) => {
            if (head.length <= 0) return '****';
            serverLast4 = tail.toUpperCase();
            return head + '****';
          });
          if (!serverLast4 && fullNumber.length >= 4) {
            serverLast4 = fullNumber.slice(-4).toUpperCase();
          }
          document.getElementById('vehicle-number').textContent = blurred;

          const ownerNameEl = document.getElementById('owner-name');
          ownerNameEl.textContent = data.owner_name || 'Owner (identity hidden)';

          const metaRow = document.getElementById('vehicle-meta');
          metaRow.innerHTML = '';

          const model = data.model;
          const color = data.color;

          if (model) {
            const pill = document.createElement('span');
            pill.className = 'meta-pill';
            pill.textContent = model;
            metaRow.appendChild(pill);
          }

          if (color) {
            const pill = document.createElement('span');
            pill.className = 'meta-pill';
            pill.textContent = color;
            metaRow.appendChild(pill);
          }

          if (data.privacy_settings && data.privacy_settings.note) {
            const pill = document.createElement('span');
            pill.className = 'meta-pill';
            pill.textContent = data.privacy_settings.note;
            metaRow.appendChild(pill);
          }
        } catch (err) {
          loadingEl.textContent = 'This QR is not active or the vehicle could not be found.';
        }
      }

      async function postJson(path, body) {
        const res = await fetch(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body || {})
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data && data.error) || 'Request failed');
        }
        return data;
      }

      messageBtn.addEventListener('click', async () => {
        const reason = reasonSelect.value;
        if (!reason) {
          setStatus('Please choose a reason first.', 'error');
          return;
        }
        if (!hasValidLast4() || !serverLast4 || last4Input.value.trim().toUpperCase() !== serverLast4) {
          setStatus('The last 4 characters of the plate do not match.', 'error');
          return;
        }
        setStatus('Sending message…');
        messageBtn.disabled = true;
        try {
          await postJson('/api/contact/request', {
            qr_id: qrId,
            reason,
            message: messageInput.value || '',
            visitor_id: null,
            last4: last4Input.value.trim().toUpperCase(),
          });
          setStatus('Message sent to the vehicle owner.', 'success');
        } catch (err) {
          setStatus(err.message || 'Failed to send message.', 'error');
        } finally {
          updateButtons();
        }
      });

      let callSessionId = null;
      let pollTimer = null;

      function startPollingSession() {
        if (!callSessionId) return;
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(async () => {
          try {
            const res = await fetch('/api/call/session/' + encodeURIComponent(callSessionId));
            const data = await res.json();
            if (!res.ok) return;
            const status = data && data.session && data.session.status;
            if (!status) return;

            if (status === 'declined' || status === 'ended' || status === 'timeout') {
              if (window.__quin_endCall) {
                window.__quin_endCall(status);
              }
            }
          } catch (_) {
          }
        }, 1500);
      }

      callBtn.addEventListener('click', async () => {
        const reason = reasonSelect.value;
        if (!reason) {
          setStatus('Please choose a reason first.', 'error');
          return;
        }
        if (!hasValidLast4() || !serverLast4 || last4Input.value.trim().toUpperCase() !== serverLast4) {
          setStatus('The last 4 characters of the plate do not match.', 'error');
          return;
        }
        setStatus('Starting call session…');
        callBtn.disabled = true;
        try {
          const data = await postJson('/api/call/start', {
            qr_id: qrId,
            reason,
            visitor_id: null,
            last4: last4Input.value.trim().toUpperCase(),
          });
          window.__quin_inCall = true;
          updateButtons();
          callSessionId = data.session_id;
          startPollingSession();
          setStatus('Connecting audio call… Allow microphone access.', 'success');
          await startAgoraCall(data);
        } catch (err) {
          window.__quin_inCall = false;
          updateButtons();
          setStatus(err.message || 'Failed to start call.', 'error');
        }
      });

      function loadAgoraSdk() {
        return new Promise((resolve, reject) => {
          if (window.AgoraRTC) return resolve();
          const script = document.createElement('script');
          script.src = 'https://download.agora.io/sdk/release/AgoraRTC_N-4.20.2.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Agora SDK'));
          document.head.appendChild(script);
        });
      }

      async function startAgoraCall(callData) {
        await loadAgoraSdk();

        const appId = callData.agora_app_id;
        const token = callData.agora_token;
        const channel = callData.channel_name;
        const uid = callData.agora_uid;

        if (!appId || !token || !channel) {
          throw new Error('Call credentials missing');
        }

        const client = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        const localTrack = await window.AgoraRTC.createMicrophoneAudioTrack();

        let ended = false;
        window.__quin_inCall = true;
        updateButtons();
        async function endLocal(kind) {
          if (ended) return;
          ended = true;
          window.__quin_inCall = false;
          updateButtons();
          try {
            if (pollTimer) clearInterval(pollTimer);
          } catch (_) {}

          try {
            await client.unpublish([localTrack]);
          } catch (_) {}
          try {
            localTrack.stop();
            localTrack.close();
          } catch (_) {}
          try {
            await client.leave();
          } catch (_) {}

          callBtn.onclick = null;
          callBtn.disabled = true;

          if (kind === 'declined') {
            callBtn.textContent = 'Owner declined';
            setStatus('Owner declined the call.', 'error');
          } else if (kind === 'timeout') {
            callBtn.textContent = 'Call timed out';
            setStatus('Call timed out.', 'error');
          } else {
            callBtn.textContent = 'Call ended';
            setStatus('Call ended.', '');
          }
        }

        window.__quin_endCall = async (kind) => {
          await endLocal(kind);
        };

        await client.join(appId, channel, token, uid);
        await client.publish([localTrack]);

        setStatus('Connected. Waiting for the owner to accept…', 'success');

        callBtn.textContent = 'Call in progress';
        callBtn.disabled = true;
        endCallBtn.disabled = false;
        endCallBtn.onclick = async () => {
          try {
            endCallBtn.disabled = true;
            if (callSessionId) {
              await postJson('/api/call/end', { session_id: callSessionId });
            }
          } catch (_) {
          } finally {
            await endLocal('ended');
          }
        };
      }

      fetchVehicle();
      updateButtons();
    })();
  </script>
</body>
</html>`;
}

module.exports = {
  renderVisitorPage,
};


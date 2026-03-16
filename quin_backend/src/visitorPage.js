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
    button {
      flex: 1;
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
      <div style="margin-top:6px;">
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
      <div style="margin-top:8px;">
        <label for="message">Optional message</label>
        <textarea id="message" maxlength="2000" placeholder="Add details that help the owner understand the situation."></textarea>
        <p class="helper">Your reason is required before you can message or call the owner.</p>
      </div>
      <div class="actions">
        <button id="message-btn" class="btn-secondary" disabled>Send message</button>
        <button id="call-btn" class="btn-primary" disabled>Call owner</button>
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
      const messageInput = document.getElementById('message');
      const messageBtn = document.getElementById('message-btn');
      const callBtn = document.getElementById('call-btn');
      const statusEl = document.getElementById('status');

      function setStatus(text, kind) {
        statusEl.textContent = text || '';
        statusEl.className = 'status' + (kind ? ' ' + kind : '');
      }

      function updateButtons() {
        const hasReason = !!reasonSelect.value;
        messageBtn.disabled = !hasReason;
        callBtn.disabled = !hasReason;
      }

      reasonSelect.addEventListener('change', updateButtons);

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

          document.getElementById('vehicle-number').textContent =
            data.vehicle_number || 'Vehicle';

          const ownerNameEl = document.getElementById('owner-name');
          ownerNameEl.textContent = data.owner_name || 'Owner (identity hidden)';

          const metaRow = document.getElementById('vehicle-meta');
          metaRow.innerHTML = '';
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
        setStatus('Sending message…');
        messageBtn.disabled = true;
        try {
          await postJson('/api/contact/request', {
            qr_id: qrId,
            reason,
            message: messageInput.value || '',
            visitor_id: null
          });
          setStatus('Message sent to the vehicle owner.', 'success');
        } catch (err) {
          setStatus(err.message || 'Failed to send message.', 'error');
        } finally {
          updateButtons();
        }
      });

      callBtn.addEventListener('click', async () => {
        const reason = reasonSelect.value;
        if (!reason) {
          setStatus('Please choose a reason first.', 'error');
          return;
        }
        setStatus('Starting call session…');
        callBtn.disabled = true;
        try {
          const data = await postJson('/api/call/start', {
            qr_id: qrId,
            visitor_id: null
          });
          setStatus('Call session created. The Quin app will ring on the owner\\'s side so you can talk directly.', 'success');
          console.log('Call session', data);
        } catch (err) {
          setStatus(err.message || 'Failed to start call.', 'error');
        } finally {
          updateButtons();
        }
      });

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


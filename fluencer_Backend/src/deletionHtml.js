export function getDeletionPageContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fluencer - Account & Data Deletion Request</title>
  <link rel="icon" type="image/png" href="/logo_fluencer.png">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #0b0b10; color: #f3f4f6; min-height: 100vh; padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; }
    .container { max-width: 680px; width: 100%; background: #151520; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 2rem; }
    .logo { width: 64px; height: 64px; margin-bottom: 1rem; border-radius: 12px; }
    h1 { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
    p.subtitle { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; }
    .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; }
    h2 { font-size: 1.15rem; color: #a855f7; margin-bottom: 0.75rem; }
    ul { list-style-type: disc; margin-left: 1.25rem; color: #d1d5db; font-size: 0.9rem; line-height: 1.6; }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; font-size: 0.875rem; font-weight: 600; color: #e5e7eb; margin-bottom: 0.5rem; }
    input[type="text"], input[type="email"], select, textarea { width: 100%; padding: 0.75rem 1rem; background: #0b0b10; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff; font-size: 0.95rem; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #a855f7; box-shadow: 0 0 0 2px rgba(168,85,247,0.3); }
    .btn { display: block; width: 100%; padding: 0.875rem; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; font-weight: 600; font-size: 1rem; border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .message { display: none; padding: 1rem; border-radius: 8px; margin-top: 1rem; font-size: 0.95rem; text-align: center; }
    .message.success { display: block; background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
    .message.error { display: block; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
    .footer { text-align: center; margin-top: 2rem; color: #6b7280; font-size: 0.85rem; }
    .footer a { color: #a855f7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="/logo_fluencer.png" alt="Fluencer Logo" class="logo">
      <h1>Account & Data Deletion Request</h1>
      <p class="subtitle">Google Play & App Store Compliance — Fluencer Platform</p>
    </div>

    <div class="card">
      <h2>What Data is Deleted?</h2>
      <ul>
        <li>Your profile credentials, email, hashed password, and phone number.</li>
        <li>Creator / Brand profile records (bio, portfolio images, social media links).</li>
        <li>Active brand campaign applications and drafts.</li>
        <li>Direct messages, notifications, and device push tokens.</li>
      </ul>
    </div>

    <div class="card">
      <h2>Data Retention Policy</h2>
      <p style="color: #9ca3af; font-size: 0.875rem; line-height: 1.5;">
        In accordance with applicable statutory financial and tax regulations in India, completed Razorpay financial transactions and escrow accounting audit trails are retained for statutory retention periods, after which they are permanently purged. All personal identification is permanently unlinked.
      </p>
    </div>

    <form id="deletionForm">
      <div class="form-group">
        <label for="identifier">Registered Email Address or Mobile Number *</label>
        <input type="text" id="identifier" name="identifier" required placeholder="e.g. creator@example.com or 9876543210">
      </div>

      <div class="form-group">
        <label for="reason">Reason for Deletion (Optional)</label>
        <select id="reason" name="reason">
          <option value="No longer using the app">No longer using the app</option>
          <option value="Privacy concerns">Privacy concerns</option>
          <option value="Created alternative account">Created alternative account</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button type="submit" class="btn" id="submitBtn">Submit Deletion Request</button>
      <div id="statusMessage" class="message"></div>
    </form>

    <div class="footer">
      <p>Have questions? Contact our Data Protection Officer at <a href="mailto:support@fluencer.app">support@fluencer.app</a></p>
      <p style="margin-top: 0.5rem;"><a href="/privacy-policy">View Privacy Policy</a> | <a href="/">Return to Home</a></p>
    </div>
  </div>

  <script>
    const form = document.getElementById('deletionForm');
    const msg = document.getElementById('statusMessage');
    const btn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = document.getElementById('identifier').value.trim();
      const reason = document.getElementById('reason').value;

      btn.disabled = true;
      btn.textContent = 'Processing request...';
      msg.className = 'message';
      msg.textContent = '';

      try {
        const res = await fetch('/api/auth/request-data-deletion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier, phone: identifier, reason })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          msg.className = 'message success';
          msg.textContent = '✅ Your deletion request has been processed successfully. Your account and personal data have been removed.';
          form.reset();
        } else {
          msg.className = 'message error';
          msg.textContent = '⚠️ ' + (data.message || 'Failed to submit deletion request.');
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = '⚠️ Network error. Please try again or email support@fluencer.app directly.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Deletion Request';
      }
    });
  </script>
</body>
</html>`;
}

// api/subscribe.js
// Vercel serverless function — receives form POST, writes to Google Sheets, sends confirmation email via Resend

const { google } = require("googleapis");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  try {
    // ─── 1. Write to Google Sheets ──────────────────────────────────────────
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            email,
            new Date().toISOString(), // Timestamp
            req.headers["x-forwarded-for"] || "unknown", // IP (optional, for geo later)
          ],
        ],
      },
    });

    // ─── 2. Send Confirmation Email via Resend ───────────────────────────────
    await resend.emails.send({
      from: "Pacing <onboarding@resend.dev>", // ← swap in your verified domain
      to: email,
      subject: "You're on the list 🟢",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're on the Pacing waitlist</title>
        </head>
        <body style="margin:0;padding:0;background:#0d0d0e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0e;padding:48px 24px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

                  <!-- Logo -->
                  <tr>
                    <td style="padding-bottom:40px;">
                      <span style="font-size:1.4rem;font-weight:700;color:#f0ede8;letter-spacing:-0.02em;">
                        ● Pacing
                      </span>
                    </td>
                  </tr>

                  <!-- Hero -->
                  <tr>
                    <td style="background:#141416;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:48px 40px;">

                      <p style="margin:0 0 8px;font-family:'DM Mono',monospace,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#00e87a;">
                        WAITLIST CONFIRMED
                      </p>

                      <h1 style="margin:0 0 20px;font-size:2rem;font-weight:700;color:#f0ede8;line-height:1.1;letter-spacing:-0.02em;">
                        You're ahead of the curve.
                      </h1>

                      <p style="margin:0 0 32px;font-size:1rem;color:#7a7870;line-height:1.65;">
                        Thanks for joining the Pacing waitlist. We're putting the finishing touches on the app and you'll be among the first to get access when we launch.
                      </p>

                      <!-- Score preview -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background:linear-gradient(145deg,#0f2a1a,#0d1f15);border:1.5px solid rgba(0,232,122,0.2);border-radius:16px;padding:24px;margin-bottom:32px;">
                        <tr>
                          <td>
                            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(0,232,122,0.7);">
                              YOUR FUTURE PACE SCORE
                            </p>
                            <p style="margin:0;font-size:3rem;font-weight:700;color:#00e87a;line-height:1;letter-spacing:-0.02em;">
                              +62
                            </p>
                            <p style="margin:4px 0 0;font-size:12px;color:rgba(0,232,122,0.6);">ahead of pace</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;font-size:0.9rem;color:#7a7870;line-height:1.65;">
                        While you wait, here's what's coming:
                      </p>
                      <ul style="margin:0 0 32px;padding-left:20px;color:#7a7870;font-size:0.9rem;line-height:2;">
                        <li>🎯 &nbsp;One-tap spending log — under 3 seconds</li>
                        <li>📲 &nbsp;iOS home screen widget with your live Pace Score</li>
                        <li>💚 &nbsp;Green = on track. Red = slow down. That's it.</li>
                      </ul>

                      <p style="margin:0;font-size:0.875rem;color:#7a7870;">
                        Questions? Just reply to this email — it goes straight to the founder.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding-top:32px;">
                      <p style="margin:0;font-size:11px;color:#3a3a3a;letter-spacing:0.05em;">
                        © 2025 Pacing Inc. · You're receiving this because you signed up at pacing.app<br>
                        <a href="#" style="color:#3a3a3a;">Unsubscribe</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
}

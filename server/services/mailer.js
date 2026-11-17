import axios from "axios";
import { generateIcsCalendar } from "./calendarService.js";
import { ELECTION_CALENDAR_2027 } from "../data/electionCalendar2027.js";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Generate the responsive HTML email body for 2027 Nigeria Election Calendar.
 */
function buildCalendarEmailHtml({ siteUrl, calendarUrl, webcalUrl }) {
  const milestoneRows = ELECTION_CALENDAR_2027.map((m) => `
    <tr style="border-bottom: 1px solid #262626;">
      <td style="padding: 12px 10px; font-weight: 600; color: #10b981; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; white-space: nowrap; font-size: 13px;">
        ${m.date}
      </td>
      <td style="padding: 12px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="color: #ffffff; font-weight: 600; font-size: 14px; margin-bottom: 3px;">${m.title}</div>
        <div style="color: #a3a3a3; font-size: 12px; line-height: 1.4;">${m.description}</div>
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your 2027 Nigeria Election Calendar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #121212; border: 1px solid #262626; border-radius: 12px; overflow: hidden; text-align: left;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 24px; background: linear-gradient(135deg, #064e3b 0%, #0a0a0a 100%); border-bottom: 1px solid #262626;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #34d399; margin-bottom: 6px;">CIVICSENSE 🇳🇬</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">
                2027 Nigeria General Election Calendar
              </h1>
              <p style="margin: 8px 0 0 0; color: #d1d5db; font-size: 13px; line-height: 1.5;">
                Official statutory timetable, voter registration deadlines, and polling days synced directly to your devices.
              </p>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 24px; background-color: #171717; border-bottom: 1px solid #262626;">
              <div style="font-weight: 600; font-size: 14px; color: #ffffff; margin-bottom: 14px;">
                Add to your calendar in one tap:
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <a href="${webcalUrl}" style="display: block; text-align: center; background-color: #008751; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-size: 14px;">
                      🍏 Add to Apple Calendar
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <a href="https://calendar.google.com/calendar/render?cid=${encodeURIComponent(calendarUrl)}" style="display: block; text-align: center; background-color: #1e3a8a; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-size: 14px; border: 1px solid #2563eb;">
                      📅 Add to Google Calendar
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${calendarUrl}" style="display: block; text-align: center; background-color: #262626; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-size: 14px; border: 1px solid #404040;">
                      📥 Download .ics Calendar File
                    </a>
                  </td>
                </tr>
              </table>
              <div style="font-size: 11px; color: #737373; margin-top: 10px; line-height: 1.4;">
                💡 <em>Tip: You can also tap the <strong>nigeria-2027-elections.ics</strong> file attached to this email to add all 12 dates directly to your phone's Calendar!</em>
              </div>
            </td>
          </tr>

          <!-- Key Milestones -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #ffffff;">
                Key 2027 Election Milestones
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ${milestoneRows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; background-color: #0a0a0a; border-top: 1px solid #262626; text-align: center; font-size: 12px; color: #737373; line-height: 1.5;">
              <p style="margin: 0 0 6px 0;">
                Verified and compiled by <strong>CivicSense</strong> using provisions of the 1999 Constitution and Electoral Act 2022.
              </p>
              <p style="margin: 0;">
                <a href="${siteUrl}/calendar" style="color: #10b981; text-decoration: none;">View Live Calendar on Web</a> &bull;
                <a href="${siteUrl}/fact-check" style="color: #10b981; text-decoration: none;">Verify Political Claims</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Dispatch an election calendar email with .ics attachment via Resend API.
 */
export async function sendCalendarEmail(toEmail) {
  const cleanEmail = String(toEmail || "").trim().toLowerCase();
  if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    throw new Error("Invalid destination email address.");
  }

  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const siteUrl = (process.env.SITE_URL || "https://civicsense.fyi").replace(/\/+$/, "");
  const calendarDownloadUrl = `${siteUrl}/api/calendar/2027.ics`;
  const webcalUrl = calendarDownloadUrl.replace(/^https?:/, "webcal:");

  const icsContent = generateIcsCalendar(ELECTION_CALENDAR_2027);
  const icsBase64 = Buffer.from(icsContent, "utf-8").toString("base64");

  const html = buildCalendarEmailHtml({
    siteUrl,
    calendarUrl: calendarDownloadUrl,
    webcalUrl,
  });

  const fromEmail = (process.env.EMAIL_FROM || "CivicSense Calendar <calendar@civicsense.fyi>").trim();

  if (!apiKey) {
    console.warn(`[Mailer] RESEND_API_KEY is not set. Calendar email to ${cleanEmail} logged in simulated mode.`);
    return {
      success: true,
      simulated: true,
      message: "Calendar email generated successfully (waiting for RESEND_API_KEY on production).",
      recipient: cleanEmail,
    };
  }

  try {
    const payload = {
      from: fromEmail.includes("@resend.dev") ? fromEmail : (process.env.RESEND_FROM || "CivicSense <onboarding@resend.dev>"),
      to: [cleanEmail],
      subject: "🇳🇬 Your 2027 Nigeria Election Calendar (Apple, Google & .ics)",
      html,
      attachments: [
        {
          filename: "nigeria-2027-elections.ics",
          content: icsBase64,
          content_type: "text/calendar; method=PUBLISH",
        },
      ],
      headers: {
        "X-Entity-Ref-ID": `civicsense-calendar-${Date.now()}`,
      },
    };

    // If a verified custom domain sender is configured, use it
    if (process.env.RESEND_VERIFIED_FROM) {
      payload.from = process.env.RESEND_VERIFIED_FROM;
    }

    const response = await axios.post(RESEND_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    console.log(`[Mailer] Resend email dispatched to ${cleanEmail}: id=${response.data?.id}`);
    return {
      success: true,
      id: response.data?.id,
      recipient: cleanEmail,
    };
  } catch (err) {
    console.error(`[Mailer] Resend API error: ${err.response?.data?.message || err.message}`);
    throw new Error(`Email delivery failed: ${err.response?.data?.message || err.message}`);
  }
}

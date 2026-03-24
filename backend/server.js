require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── MySQL Pool ─────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.MYSQL_USER || "bytex-survey",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "bytex-survey",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ── Mailer helpers ─────────────────────────────────────────
function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

function createMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

function getSmtpFromHeader() {
  const name = (process.env.FROM_NAME || "").trim();
  const fromEmail = (process.env.FROM_EMAIL || "").trim();
  const smtpUser = (process.env.SMTP_USER || "").trim();
  const legacyFrom = (process.env.SMTP_FROM || "").trim();
  const email = fromEmail || (legacyFrom.includes("@") ? legacyFrom : "") || smtpUser;
  if (name && email) return `"${name.replace(/\\/g, "").replace(/"/g, "'")}" <${email}>`;
  if (email) return email;
  if (legacyFrom.includes("@")) return legacyFrom;
  return smtpUser;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSurveyEmailHtml(fields, submittedAt, submissionNumber) {
  return `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; line-height: 1.5; color: #111;">
  <h2>ByteX survey submission #${submissionNumber}</h2>
  <p><strong>Submitted at:</strong> ${submittedAt}</p>
  <ul>
    <li><strong>Life stages:</strong> ${escapeHtml(fields.life_stages || "")}</li>
    <li><strong>Emotions:</strong> ${escapeHtml(fields.emotions || "")}</li>
    <li><strong>Moments:</strong> ${escapeHtml(fields.moments || "")}</li>
    <li><strong>Awareness:</strong> ${escapeHtml(fields.awareness || "")}</li>
    <li><strong>Wishes:</strong> ${escapeHtml(fields.wishes || "")}</li>
    ${fields.email ? `<li><strong>Email:</strong> ${escapeHtml(fields.email)}</li>` : ""}
    ${fields.name ? `<li><strong>Name:</strong> ${escapeHtml(fields.name)}</li>` : ""}
    ${fields.org_size ? `<li><strong>Org size:</strong> ${escapeHtml(fields.org_size)}</li>` : ""}
  </ul>
</body>
</html>`;
}

// Awareness-label mapping (matches frontend data.ts)
const AWARENESS_LABELS = ["", "Not at all", "Barely", "A little", "Fairly well", "Very well"];

function normalizeAwareness(raw) {
  const t = (raw || "").trim();
  if (/^\d+$/.test(t)) {
    const n = parseInt(t, 10);
    if (n >= 1 && n <= 5) return AWARENESS_LABELS[n] || t;
  }
  return t;
}

// ── Health check ───────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.status(503).json({ ok: false, db: "disconnected", error: err.message });
  }
});

// ── Submit Survey ──────────────────────────────────────────
app.post("/api/submit-survey", async (req, res) => {
  const {
    life_stages = "",
    emotions = "",
    moments = "",
    awareness: rawAwareness = "",
    wishes = "",
    email = null,
    name = null,
    org_size = null,
  } = req.body || {};

  const awareness = normalizeAwareness(rawAwareness);
  const submittedAt = new Date();

  // ── Insert into MySQL ──
  let submissionNumber = 0;
  try {
    // Get current max submission_number
    const [rows] = await pool.query(
      "SELECT COALESCE(MAX(submission_number), 0) AS maxNum FROM survey_submissions"
    );
    submissionNumber = rows[0].maxNum + 1;

    await pool.query(
      `INSERT INTO survey_submissions
       (submission_number, life_stages, emotions, moments, awareness, wishes, email, name, org_size, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [submissionNumber, life_stages, emotions, moments, awareness, wishes, email || null, name || null, org_size || null, submittedAt]
    );
  } catch (err) {
    console.error("DB insert error:", err);
    return res.status(500).json({ ok: false, error: "Failed to save submission." });
  }

  // ── Send email (non-blocking for the response) ──
  if (isMailConfigured()) {
    const transporter = createMailer();
    if (transporter) {
      const to =
        (process.env.SURVEY_TO_EMAIL || "").trim() ||
        (process.env.FROM_EMAIL || "").trim() ||
        (process.env.SMTP_USER || "").trim() ||
        "samarth.z@bytex.global";
      const from = getSmtpFromHeader();

      const text = [
        `ByteX survey submission #${submissionNumber}`,
        `Submitted at: ${submittedAt.toISOString()}`,
        `Life stages: ${life_stages}`,
        `Emotions: ${emotions}`,
        `Moments: ${moments}`,
        `Awareness: ${awareness}`,
        `Wishes: ${wishes}`,
        email ? `Email: ${email}` : "",
        name ? `Name: ${name}` : "",
        org_size ? `Org size: ${org_size}` : "",
      ].filter(Boolean).join("\n");

      const html = buildSurveyEmailHtml(
        { life_stages, emotions, moments, awareness, wishes, email, name, org_size },
        submittedAt.toISOString(),
        submissionNumber
      );

      transporter
        .sendMail({
          from,
          to,
          subject: `[ByteX Survey] New response #${submissionNumber}`,
          text,
          html,
        })
        .catch((err) => console.error("sendMail error:", err));
    }
  }

  return res.json({ ok: true, submissionNumber });
});

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ByteX Survey backend running on port ${PORT}`);
});

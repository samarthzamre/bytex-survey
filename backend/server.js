require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 4000;
const ORG_SIZE_OPTIONS = [
  "1-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10000+",
];

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
  <h2>Survey submission #${submissionNumber}</h2>
  <p><strong>Submitted at:</strong> ${submittedAt}</p>
  <ul>
    <li><strong>Life stages:</strong> ${escapeHtml(fields.life_stages || "")}</li>
    <li><strong>Emotions:</strong> ${escapeHtml(fields.emotions || "")}</li>
    <li><strong>Moments:</strong> ${escapeHtml(fields.moments || "")}</li>
    <li><strong>Awareness:</strong> ${escapeHtml(fields.awareness || "")}</li>
    <li><strong>Wishes:</strong> ${escapeHtml(fields.wishes || "")}</li>
    ${fields.organization_name ? `<li><strong>Organization:</strong> ${escapeHtml(fields.organization_name)}</li>` : ""}
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

function normalizeOrgSize(raw) {
  const value = (raw || "").trim();
  return ORG_SIZE_OPTIONS.includes(value) ? value : null;
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
    organization_name = null,
    org_size = null,
  } = req.body || {};

  const awareness = normalizeAwareness(rawAwareness);
  const normalizedOrgSize = normalizeOrgSize(org_size);
  const submittedAt = new Date();

  if (!normalizedOrgSize) {
    return res.status(400).json({ ok: false, error: "Organization size is required." });
  }

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
       (submission_number, life_stages, emotions, moments, awareness, wishes, organization_name, org_size, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [submissionNumber, life_stages, emotions, moments, awareness, wishes, organization_name || null, normalizedOrgSize, submittedAt]
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
        `Survey submission #${submissionNumber}`,
        `Submitted at: ${submittedAt.toISOString()}`,
        `Life stages: ${life_stages}`,
        `Emotions: ${emotions}`,
        `Moments: ${moments}`,
        `Awareness: ${awareness}`,
        `Wishes: ${wishes}`,
        organization_name ? `Organization: ${organization_name}` : "",
        normalizedOrgSize ? `Org size: ${normalizedOrgSize}` : "",
      ].filter(Boolean).join("\n");

      const html = buildSurveyEmailHtml(
        { life_stages, emotions, moments, awareness, wishes, organization_name, org_size: normalizedOrgSize },
        submittedAt.toISOString(),
        submissionNumber
      );

      transporter
        .sendMail({
          from,
          to,
          subject: `[Survey] New response #${submissionNumber}`,
          text,
          html,
        })
        .catch((err) => console.error("sendMail error:", err));
    }
  }

  return res.json({ ok: true, submissionNumber });
});

// ── Admin: all submissions ─────────────────────────────────
app.get("/api/admin/submissions", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM survey_submissions ORDER BY submitted_at DESC"
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Admin submissions error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Admin: single submission ───────────────────────────────
app.get("/api/admin/submission/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM survey_submissions WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("Admin submission error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Admin: CSV export ──────────────────────────────────────
app.get("/api/admin/export", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT submission_number, organization_name, life_stages, emotions, moments, awareness, wishes, org_size, submitted_at FROM survey_submissions ORDER BY submitted_at DESC"
    );
    const headers = ["#", "Organization", "Life Stages", "Emotions", "Moments", "Awareness", "Wishes", "Org Size", "Submitted At"];
    function csvEscape(val) {
      if (val == null) return "";
      const s = String(val);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    }
    const csvLines = [headers.join(",")];
    for (const r of rows) {
      csvLines.push([
        r.submission_number, r.organization_name, r.life_stages, r.emotions,
        r.moments, r.awareness, r.wishes, r.org_size,
        r.submitted_at ? new Date(r.submitted_at).toISOString() : ""
      ].map(csvEscape).join(","));
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="survey-export-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(csvLines.join("\n"));
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Admin: aggregated stats ────────────────────────────────
app.get("/api/admin/stats", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM survey_submissions ORDER BY submitted_at DESC"
    );

    const total = rows.length;

    // Helper: split comma-separated field and count occurrences
    function countField(field) {
      const map = {};
      for (const row of rows) {
        const val = (row[field] || "").toString();
        val.split(",").forEach((v) => {
          const t = v.trim();
          if (t) map[t] = (map[t] || 0) + 1;
        });
      }
      return Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    }

    // Unique respondents (distinct non-null organization_names)
    const uniqueOrgs = new Set();
    for (const row of rows) {
      const e = (row.organization_name || "").trim();
      if (e) uniqueOrgs.add(e.toLowerCase());
    }

    // Daily submission counts
    const dailyMap = {};
    for (const row of rows) {
      const day = new Date(row.submitted_at).toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }
    const timeline = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Stage combinations (funnel-style)
    const combos = {};
    for (const row of rows) {
      const key = (row.life_stages || "").trim();
      if (key) combos[key] = (combos[key] || 0) + 1;
    }
    const stageCombinations = Object.entries(combos)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      ok: true,
      total,
      uniqueRespondents: uniqueOrgs.size,
      lifeStages: countField("life_stages"),
      emotions: countField("emotions"),
      moments: countField("moments"),
      awareness: countField("awareness"),
      wishes: countField("wishes"),
      orgSizes: countField("org_size"),
      timeline,
      stageCombinations,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Survey backend running on port ${PORT}`);
});

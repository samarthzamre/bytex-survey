# ByteX Survey (Next.js + Tailwind)

Production-ready multi-step survey. Submissions are emailed with **Nodemailer** from a **Next.js Route Handler** (`/api/submit-survey`).

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env.local
```

3. Configure **SMTP** in `.env.local` or `.env` (see `.env.example`):

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` — e.g. `mail.bytex.global`, `465`, `true`
- `SMTP_USER` / `SMTP_PASS` — SMTP login
- `FROM_NAME` + `FROM_EMAIL` — display name and From address (e.g. **Bytex Global Innovation Pvt. Ltd.** & **samarth.z@bytex.global**)
- `SURVEY_TO_EMAIL` — inbox for survey notifications (falls back to `FROM_EMAIL` then `SMTP_USER`)
- `SMTP_FROM` — optional legacy; only used as From if it contains `@` (hostname-only values are ignored in favor of `FROM_EMAIL`)

4. Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Browser persistence & one response per device

- Progress (current step and all answers) is saved in **`localStorage`** (`bytex_survey_state_v2`) so **refreshing the page does not reset** the form.
- After a **successful** email send, the survey is marked **completed** for that browser: the user only sees the **snapshot results** and **cannot submit again** or change answers.
- Clearing site data / `localStorage` / using another browser allows a new attempt (there is no account system).

## Per-user email + milestone digest (every 15 submissions)

1. **Each submission** triggers an email with that user’s full selections (life stages, emotions, moments, awareness, wishes).

2. **Server-side storage:** Every response is appended to `data/submissions.json` (gitignored) with `submissionNumber`, `submittedAt`, and all fields — so you have a **path/history** of answers on disk.

3. **On the 15th, 30th, 45th… submission**, a **second, specialized email** is sent that includes:
   - Confirmation that **15 responses** were received in **this reporting window** (e.g. submissions #1–#15, then #16–#30, …)
   - **Total** submissions recorded on this server so far
   - **Highlighted block** for the **latest user** in that window (the user who triggered the milestone — their full data)
   - **Tables** listing **all users in the batch** with their selections
   - **Aggregated insights** for that batch: awareness distribution, most common life-stage / emotion / wish tokens

**Serverless note:** `data/*.json` only persists on hosts with a writable, durable disk. On ephemeral serverless instances, use a database or object storage for logs and counts.

## Security

- Keep `.env.local` out of git (already ignored).
- Use an app password or SMTP API key, not your main email password where possible.

# Bragi MVP

Bragi is a browser-first MVP for editing short-form videos, saving edit drafts, and planning social posts. The app is useful as a local workflow prototype today, with backend integration points already shaped for Supabase, object storage, queueing, and social publishing.

## What It Does Now

- Redirects `/` to `/editor`.
- Protects `/editor` behind NextAuth session checks.
- Provides a `/sign-in` page with Sign in and Sign up tabs using email magic links.
- Sends auth emails through Nodemailer/SMTP when `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` are configured.
- Uses the Supabase NextAuth adapter when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present.
- Exposes `/api/auth/health` to catch missing SMTP/Supabase config before the sign-in form hits a hard NextAuth adapter error.
- Lets a user upload a video in the browser, preview it, choose vertical/square/landscape export presets, set trim start/end, add overlay text, and write a caption.
- Exports the edited clip in the browser with canvas composition and `MediaRecorder`, then offers a local download.
- Saves editor draft metadata to `localStorage` and posts the same payload to `/api/projects`.
- Provides `/schedule` with a post form, platform checkboxes, publish time, month calendar, and local publishing queue.
- Saves scheduled posts to `localStorage` and posts schedule payloads to `/api/schedule`.
- Includes API boundaries for project saving, scheduling, and publishing.
- Includes dark/light theme support and responsive app navigation.
- Includes tests for storage, scheduling, and API route behavior.

## What It Does Not Do Yet

- It does not store projects, uploaded media, or scheduled posts in Supabase yet. The API routes validate and acknowledge payloads, but persistence is still local/browser-first.
- It does not upload exported clips to R2/S3 yet. `createUploadTarget` currently returns a placeholder URL unless R2 env values are present, and even then it only builds the URL shape.
- It does not publish to YouTube, TikTok, Instagram, or Facebook. `/api/publish` calls a stub that returns `501` until OAuth tokens and platform adapters are implemented.
- It does not enqueue real delayed jobs. `/api/schedule` is ready for QStash or another queue, but no delayed worker is wired.
- It does not manage social account connections or refresh tokens.
- It does not provide server-side rendering/export workers. Video rendering happens in the user's browser.
- It does not have team/workspace roles, billing, asset libraries, analytics, or production moderation flows.

## Local Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

For a production-style check:

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Variables

Create `.env` or `.env.local` with:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional integration placeholders:

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=

QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
META_APP_ID=
META_APP_SECRET=
TOKEN_ENCRYPTION_KEY=
```

Auth requires two things to work end to end:

- A working SMTP account for Nodemailer. Gmail requires an app password, not your normal account password.
- A live Supabase project with the Auth.js/NextAuth adapter tables available to the API.

## Main Routes

- `/editor`: authenticated video editing workspace.
- `/schedule`: local scheduling calendar and publishing queue.
- `/sign-in`: email magic-link account flow with Sign in and Sign up tabs.
- `/sign-in/check-email`: verification prompt after requesting a link.
- `/api/auth/[...nextauth]`: NextAuth route.
- `/api/auth/health`: configuration preflight for auth.
- `/api/projects`: validates and accepts editor draft payloads.
- `/api/schedule`: validates and accepts scheduled post payloads.
- `/api/publish`: validates publish jobs, then returns a stubbed not-implemented response.

## Good Next Work

- Create Supabase schemas for users, projects, assets, scheduled posts, social accounts, and publish jobs.
- Wire `/api/projects` and `/api/schedule` to Supabase with authenticated user ownership.
- Add real asset upload: browser export to R2/S3, signed upload URLs, and persisted asset records.
- Add QStash delayed jobs that call `/api/publish` at scheduled times.
- Implement platform OAuth and publishing adapters for YouTube, TikTok, Instagram, and Facebook.
- Add a saved project list and a way to send an exported clip directly from the editor to the scheduler.
- Add publish status updates, retry handling, and failure details in the queue.
- Add stronger auth UX: expired links, resend flow, signed-in redirects, and clearer setup errors in development.
- Add browser compatibility checks for `MediaRecorder`, supported codecs, and large file limits.

## MVP Constraints

This version keeps compute cost low by doing editing and export work in the browser. That is good for early validation, but heavier exports, long videos, advanced captions, and production-grade rendering will eventually need a backend render worker.

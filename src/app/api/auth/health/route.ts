import { lookup } from "node:dns/promises";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const DNS_TIMEOUT_MS = 2500;

export async function GET() {
  const hasSupabase = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
  const hasMail = Boolean(
    (hasSmtpConfig() || env.emailServer || env.nodeEnv !== "production") &&
      (env.emailFrom || env.nodeEnv !== "production")
  );

  if (!hasMail) {
    return NextResponse.json(
      {
        ok: false,
        message: "Email sign-in is not configured. Fill EMAIL_FROM and either SMTP_HOST, SMTP_USER, and SMTP_PASS or EMAIL_SERVER."
      },
      { status: 503 }
    );
  }

  if (!hasSupabase) {
    return NextResponse.json(
      {
        ok: false,
        message: "Auth storage is not configured. Fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
      },
      { status: 503 }
    );
  }

  const hostname = getHostname(env.supabaseUrl);

  if (!hostname) {
    return NextResponse.json(
      {
        ok: false,
        message: "SUPABASE_URL is not a valid URL. It should look like https://your-project-ref.supabase.co."
      },
      { status: 503 }
    );
  }

  try {
    await withTimeout(lookup(hostname), DNS_TIMEOUT_MS);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Supabase could not be reached. Confirm the project is active and SUPABASE_URL matches the Project URL in Supabase settings."
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}

function getHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Timed out")), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function hasSmtpConfig() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}

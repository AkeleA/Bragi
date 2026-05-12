import { SupabaseAdapter } from "@auth/supabase-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import { env } from "./env";

const hasSupabaseAdapter = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey,
);
const hasEmailProvider = Boolean(env.emailServer && env.emailFrom);
const hasNodemailer = Boolean(
  env.smtpHost && env.smtpUser && env.smtpPass && env.emailFrom,
);
const canUseDevEmail = env.nodeEnv !== "production";

export const authOptions: NextAuthOptions = {
  adapter: hasSupabaseAdapter
    ? SupabaseAdapter({
        url: env.supabaseUrl,
        secret: env.supabaseServiceRoleKey,
      })
    : undefined,
  providers:
    hasNodemailer || hasEmailProvider || canUseDevEmail
      ? [
          hasNodemailer
            ? EmailProvider({
                server: "smtp://localhost:1025",
                from: env.emailFrom,
                async sendVerificationRequest({ identifier, url }) {
                  const transporter = nodemailer.createTransport({
                    host: env.smtpHost,
                    port: getSmtpPort(),
                    secure: getSmtpPort() === 465,
                    auth: {
                      user: env.smtpUser,
                      pass: env.smtpPass,
                    },
                  });

                  await transporter.sendMail({
                    from: env.emailFrom,
                    to: identifier,
                    subject: "Sign in to Bragi",
                    text: `Sign in to Bragi:\n\n${url}\n\n`,
                    html: `<p>Hello User! <br/>
                    Clock on this link to sign in to Bragi:<br/>
                    </p><p><a href="${url}">Open Bragi</a></p>`,
                  });
                },
              })
            : hasEmailProvider
              ? EmailProvider({
                  server: env.emailServer,
                  from: env.emailFrom,
                })
              : EmailProvider({
                  server: "smtp://localhost:1025",
                  from: "Bragi Dev <auth@localhost>",
                  async sendVerificationRequest({ identifier, url }) {
                    console.log("\nBragi development sign-in link");
                    console.log(`Email: ${identifier}`);
                    console.log(url);
                    console.log("");
                  },
                }),
        ]
      : [],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/check-email",
  },
  session: {
    strategy: hasSupabaseAdapter ? "database" : "jwt",
  },
  logger: {
    error(code, metadata) {
      if (isSupabaseSchemaError(metadata)) {
        console.error(
          `[next-auth][${code}] Supabase adapter schema is not exposed. Expose the next_auth schema in Supabase API settings or disable the adapter until the Auth.js tables are ready.`,
        );
        return;
      }

      if (isSupabaseNetworkError(metadata)) {
        console.error(
          `[next-auth][${code}] Supabase could not be reached. Confirm SUPABASE_URL points to an active Supabase project and restart the dev server after updating .env.`,
        );
        return;
      }

      console.error(`[next-auth][${code}]`, metadata);
    },
  },
  secret: env.nextAuthSecret,
};

function getSmtpPort() {
  return Number(env.smtpPort) || 587;
}

function isSupabaseSchemaError(metadata: unknown) {
  const error =
    metadata instanceof Error
      ? metadata
      : metadata && typeof metadata === "object" && "error" in metadata
        ? (metadata as { error?: unknown }).error
        : metadata;

  if (!error || typeof error !== "object") {
    return false;
  }

  const maybePostgrestError = error as { code?: unknown; message?: unknown };

  return (
    maybePostgrestError.code === "PGRST106" ||
    (typeof maybePostgrestError.message === "string" &&
      maybePostgrestError.message.includes("Invalid schema: next_auth"))
  );
}

function isSupabaseNetworkError(metadata: unknown) {
  const text = stringifyErrorMetadata(metadata);

  return (
    text.includes("fetch failed") ||
    text.includes("ENOTFOUND") ||
    text.includes("EAI_AGAIN") ||
    text.includes("ECONNREFUSED")
  );
}

function stringifyErrorMetadata(metadata: unknown): string {
  if (metadata instanceof Error) {
    return `${metadata.name} ${metadata.message} ${metadata.stack ?? ""}`;
  }

  if (!metadata || typeof metadata !== "object") {
    return String(metadata ?? "");
  }

  const error =
    "error" in metadata ? (metadata as { error?: unknown }).error : undefined;
  const details =
    "details" in metadata
      ? (metadata as { details?: unknown }).details
      : undefined;
  const message =
    "message" in metadata
      ? (metadata as { message?: unknown }).message
      : undefined;

  return [message, details, stringifyErrorMetadata(error)]
    .filter(Boolean)
    .join(" ");
}

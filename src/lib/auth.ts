import { SupabaseAdapter } from "@auth/supabase-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { env } from "./env";

const hasSupabaseAdapter = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
const hasEmailProvider = Boolean(env.emailServer && env.emailFrom);
const hasMailtrapApi = Boolean(env.mailtrapApiToken && env.emailFrom);
const canUseDevEmail = env.nodeEnv !== "production";

export const authOptions: NextAuthOptions = {
  adapter: hasSupabaseAdapter
    ? SupabaseAdapter({
        url: env.supabaseUrl,
        secret: env.supabaseServiceRoleKey
      })
    : undefined,
  providers:
    hasMailtrapApi || hasEmailProvider || canUseDevEmail
      ? [
          hasMailtrapApi
            ? EmailProvider({
                server: "smtp://localhost:1025",
                from: env.emailFrom,
                async sendVerificationRequest({ identifier, url }) {
                  const from = parseEmailFrom(env.emailFrom);
                  const response = await fetch("https://send.api.mailtrap.io/api/send", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${env.mailtrapApiToken}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      from,
                      to: [{ email: identifier }],
                      subject: "Sign in to Bragi",
                      text: `Sign in to Bragi:\n\n${url}\n\n`,
                      html: `<p>Sign in to Bragi:</p><p><a href="${url}">Open Bragi</a></p>`
                    })
                  });

                  if (!response.ok) {
                    const detail = await response.text();
                    throw new Error(`Mailtrap send failed: ${response.status} ${detail}`);
                  }
                }
              })
            : hasEmailProvider
            ? EmailProvider({
                server: env.emailServer,
                from: env.emailFrom
              })
            : EmailProvider({
                server: "smtp://localhost:1025",
                from: "Bragi Dev <auth@localhost>",
                async sendVerificationRequest({ identifier, url }) {
                  console.log("\nBragi development sign-in link");
                  console.log(`Email: ${identifier}`);
                  console.log(url);
                  console.log("");
                }
              })
        ]
      : [],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/check-email"
  },
  session: {
    strategy: hasSupabaseAdapter ? "database" : "jwt"
  },
  logger: {
    error(code, metadata) {
      if (isSupabaseSchemaError(metadata)) {
        console.error(
          `[next-auth][${code}] Supabase adapter schema is not exposed. Expose the next_auth schema in Supabase API settings or disable the adapter until the Auth.js tables are ready.`
        );
        return;
      }

      console.error(`[next-auth][${code}]`, metadata);
    }
  },
  secret: env.nextAuthSecret
};

function parseEmailFrom(value: string) {
  const match = value.match(/^(.*?)\s*<([^>]+)>$/);
  if (!match) {
    return { email: value };
  }

  return {
    email: match[2].trim(),
    name: match[1].trim().replace(/^"|"$/g, "")
  };
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

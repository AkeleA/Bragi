import { SupabaseAdapter } from "@auth/supabase-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { env } from "./env";

const hasSupabaseAdapter = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
const hasEmailProvider = Boolean(env.emailServer && env.emailFrom);

export const authOptions: NextAuthOptions = {
  adapter: hasSupabaseAdapter
    ? SupabaseAdapter({
        url: env.supabaseUrl,
        secret: env.supabaseServiceRoleKey
      })
    : undefined,
  providers: hasEmailProvider
    ? [
        EmailProvider({
          server: env.emailServer,
          from: env.emailFrom
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
  secret: env.nextAuthSecret
};

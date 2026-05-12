"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

type AuthMode = "signin" | "signup";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setMessage("");

    try {
      const authHealth = await fetch("/api/auth/health", { cache: "no-store" });

      if (!authHealth.ok) {
        const detail = (await authHealth.json().catch(() => null)) as {
          message?: string;
        } | null;

        setMessage(detail?.message ?? getAuthStorageErrorMessage());
        return;
      }

      const callbackUrl = getCallbackUrl();
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl
      });

      setMessage(
        result?.ok
          ? `Check your email to ${mode === "signup" ? "create your account" : "continue to Bragi"}.`
          : getSignInErrorMessage(result?.error)
      );
    } catch {
      setMessage(getAuthStorageErrorMessage());
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="auth-page" aria-labelledby="signin-title">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Account</p>
        <h1 id="signin-title">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <div className="auth-tabs" aria-label="Account action">
          <button
            aria-pressed={mode === "signin"}
            className={mode === "signin" ? "active" : ""}
            onClick={() => {
              setMode("signin");
              setMessage("");
            }}
            type="button"
          >
            Sign in
          </button>
          <button
            aria-pressed={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            type="button"
          >
            Sign up
          </button>
        </div>
        <p className="help-text">
          {mode === "signin"
            ? "Use your email to continue to the editor."
            : "Use your email to start a new Bragi workspace."}
        </p>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            autoComplete="email"
            id="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <button className="btn primary" disabled={isSending} type="submit">
          {isSending
            ? "Sending..."
            : mode === "signin"
            ? "Send sign-in link"
            : "Send sign-up link"}
        </button>
        {message ? (
          <p className="notice" role="status">
            {message}
          </p>
        ) : null}
      </form>
    </main>
  );
}

function getCallbackUrl() {
  const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");

  if (callbackUrl?.startsWith("/")) {
    return callbackUrl;
  }

  return "/editor";
}

function getSignInErrorMessage(error?: string | null) {
  if (
    error === "GetUserByEmailError" ||
    error === "CreateUserError" ||
    error === "CreateVerificationTokenError"
  ) {
    return getAuthStorageErrorMessage();
  }

  if (error === "EmailSignin") {
    return "We could not send that sign-in email. Check the address and try again.";
  }

  if (error === "Configuration") {
    return "Email sign-in is not configured yet. Fill the email and auth environment values first.";
  }

  return "Something went wrong while sending the sign-in link. Please try again.";
}

function getAuthStorageErrorMessage() {
  return "We could not send an auth link because auth storage is not ready. Confirm Supabase is active, SUPABASE_URL is correct, and the Auth.js tables exist.";
}

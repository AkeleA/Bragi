"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setMessage("");

    try {
      const callbackUrl = getCallbackUrl();
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl
      });

      setMessage(
        result?.ok
          ? "Check your email to continue to Bragi."
          : getSignInErrorMessage(result?.error)
      );
    } catch {
      setMessage(
        "We could not send a sign-in link because auth storage is not ready. Please try again after the auth tables are configured."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="auth-page" aria-labelledby="signin-title">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Account</p>
        <h1 id="signin-title">Sign in or create account</h1>
        <p className="help-text">
          Use your email to continue to the editor. New emails create a Bragi account.
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
          {isSending ? "Sending..." : "Continue with email"}
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
    return "We could not send a sign-in link because auth storage is not ready. Please try again after the auth tables are configured.";
  }

  if (error === "EmailSignin") {
    return "We could not send that sign-in email. Check the address and try again.";
  }

  if (error === "Configuration") {
    return "Email sign-in is not configured yet. Fill the email and auth environment values first.";
  }

  return "Something went wrong while sending the sign-in link. Please try again.";
}

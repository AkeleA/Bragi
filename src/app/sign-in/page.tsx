"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: "/editor"
    });

    setMessage(
      result?.ok
        ? "Check your email for the sign-in link."
        : "Email sign-in is not configured yet. Fill EMAIL_SERVER and EMAIL_FROM."
    );
  };

  return (
    <main className="auth-page" aria-labelledby="signin-title">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Account</p>
        <h1 id="signin-title">Sign in to Bragi</h1>
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
        <button className="btn primary" type="submit">
          Send sign-in link
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

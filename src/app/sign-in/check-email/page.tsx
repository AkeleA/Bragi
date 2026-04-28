import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="auth-page" aria-labelledby="check-email-title">
      <section className="auth-card">
        <p className="eyebrow">Account</p>
        <h1 id="check-email-title">Check your email</h1>
        <p className="help-text">Use the sign-in link to return to your Bragi workspace.</p>
        <Link className="btn secondary" href="/editor">
          Back to editor
        </Link>
      </section>
    </main>
  );
}

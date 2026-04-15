import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-black to-zinc-900 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-brand-gold/40 bg-zinc-950 p-8 text-center">
        <h1 className="text-3xl font-bold text-brand-gold">Verify Your Email</h1>
        <p className="mt-4 text-zinc-300">
          We sent you a verification link. Please check your email inbox (and spam folder) to activate
          your T33WAGER account.
        </p>
        <Link
          className="mt-8 inline-flex rounded-lg border border-brand-gold px-5 py-2 text-brand-gold transition hover:bg-brand-gold hover:text-brand-black"
          href="/auth/login"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}

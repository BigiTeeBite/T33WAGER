"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (loginError) {
        throw new Error(loginError.message);
      }

      const next = searchParams.get("next");
      router.push(next || "/lobby");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to log in.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-black to-zinc-900 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-brand-gold/40 bg-zinc-950 p-8">
        <h1 className="text-3xl font-bold text-brand-gold">Login</h1>
        <p className="mt-2 text-zinc-300">Welcome back to T33WAGER.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="email">
              Email
            </label>
            <input
              required
              type="email"
              id="email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white outline-none focus:border-brand-gold"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="password">
              Password
            </label>
            <div className="flex rounded-lg border border-zinc-700 bg-zinc-900 focus-within:border-brand-gold">
              <input
                required
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full bg-transparent px-4 py-2 text-white outline-none"
                onChange={(event) => setPassword(event.target.value)}
                value={password}
              />
              <button
                className="px-4 text-sm text-brand-gold"
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error ? <p className="rounded bg-red-500/15 p-3 text-sm text-red-300">{error}</p> : null}

          <button
            disabled={isLoading}
            className="w-full rounded-lg bg-brand-gold px-4 py-2 font-semibold text-brand-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-400">
          Need an account?{" "}
          <Link className="text-brand-gold hover:underline" href="/auth/register">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

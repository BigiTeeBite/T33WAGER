"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
  ffUsername: string;
  ffPlayerId: string;
  referralCode: string;
};

function randomReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    ffUsername: "",
    ffPlayerId: "",
    referralCode: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function generateUniqueReferralCode() {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const candidate = randomReferralCode();
      const { data, error: lookupError } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", candidate)
        .maybeSingle();

      if (lookupError) {
        return candidate;
      }

      if (!data) {
        return candidate;
      }
    }

    return `${randomReferralCode()}${Math.floor(Math.random() * 9)}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      let referredBy: string | null = null;

      const trimmedReferral = form.referralCode.trim().toUpperCase();
      if (trimmedReferral) {
        const { data: referralUser, error: referralLookupError } = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", trimmedReferral)
          .maybeSingle();

        if (referralLookupError) {
          throw new Error("Unable to validate referral code right now. Please try again.");
        }

        if (!referralUser) {
          throw new Error("Referral code is invalid.");
        }

        referredBy = referralUser.id;
      }

      const referralCode = await generateUniqueReferralCode();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!signUpData.user?.id) {
        throw new Error("Account creation failed. Please try again.");
      }

      const { error: profileError } = await supabase.from("users").insert({
        id: signUpData.user.id,
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        ff_username: form.ffUsername.trim(),
        ff_player_id: form.ffPlayerId.trim(),
        referral_code: referralCode,
        referred_by: referredBy
      });

      if (profileError) {
        throw new Error(profileError.message);
      }

      if (referredBy) {
        await supabase.from("referrals").insert({
          referrer_id: referredBy,
          referred_id: signUpData.user.id,
          earnings: 0
        });
      }

      setSuccess("Account created! Please verify your email before logging in.");
      router.push("/auth/verify");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Registration failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-black to-zinc-900 px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-brand-gold/40 bg-zinc-950 p-8">
        <h1 className="text-3xl font-bold text-brand-gold">Create Your Account</h1>
        <p className="mt-2 text-zinc-300">Join T33WAGER and start competing in Free Fire 1v1 wagers.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="username">
              Username
            </label>
            <input
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white outline-none focus:border-brand-gold"
              id="username"
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              value={form.username}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="email">
              Email
            </label>
            <input
              required
              type="email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white outline-none focus:border-brand-gold"
              id="email"
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              value={form.email}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="password">
              Password
            </label>
            <div className="flex rounded-lg border border-zinc-700 bg-zinc-900 focus-within:border-brand-gold">
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                className="w-full bg-transparent px-4 py-2 text-white outline-none"
                id="password"
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                value={form.password}
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

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="ff-username">
              Free Fire Username
            </label>
            <input
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white outline-none focus:border-brand-gold"
              id="ff-username"
              onChange={(event) => setForm((prev) => ({ ...prev, ffUsername: event.target.value }))}
              value={form.ffUsername}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="ff-player-id">
              Free Fire Player ID
            </label>
            <input
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white outline-none focus:border-brand-gold"
              id="ff-player-id"
              onChange={(event) => setForm((prev) => ({ ...prev, ffPlayerId: event.target.value }))}
              value={form.ffPlayerId}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="referral-code">
              Referral Code (Optional)
            </label>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 uppercase text-white outline-none focus:border-brand-gold"
              id="referral-code"
              onChange={(event) => setForm((prev) => ({ ...prev, referralCode: event.target.value }))}
              value={form.referralCode}
            />
          </div>

          {error ? <p className="rounded bg-red-500/15 p-3 text-sm text-red-300">{error}</p> : null}
          {success ? <p className="rounded bg-green-500/15 p-3 text-sm text-green-300">{success}</p> : null}

          <button
            disabled={isLoading}
            className="w-full rounded-lg bg-brand-gold px-4 py-2 font-semibold text-brand-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link className="text-brand-gold hover:underline" href="/auth/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

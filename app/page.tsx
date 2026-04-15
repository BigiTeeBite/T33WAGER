import Link from "next/link";
import { OnboardingModal } from "@/components/onboarding-modal";

const routes = [
  { href: "/auth/register", label: "Register" },
  { href: "/auth/login", label: "Login" },
  { href: "/lobby", label: "Lobby" },
  { href: "/challenge/create", label: "Create Challenge" },
  { href: "/waiting-room/sample-id", label: "Waiting Room" },
  { href: "/profile", label: "Profile" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/admin", label: "Admin" }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-black to-zinc-900 px-4 py-12">
      <OnboardingModal />

      <section className="mx-auto max-w-5xl rounded-2xl border border-brand-gold/40 bg-zinc-950 p-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand-gold">T33WAGER</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">
          Free Fire 1v1 wagering platform built for Nigerian and West African players.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              className="rounded-lg border border-brand-gold/50 px-4 py-3 text-center text-brand-gold transition hover:bg-brand-gold hover:text-brand-black"
              href={route.href}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

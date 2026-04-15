"use client";

import { useState } from "react";

const slides = [
  "Welcome to T33WAGER",
  "Create your account",
  "Set your Free Fire username and player ID",
  "Fund your wallet securely",
  "Create or join 1v1 challenges",
  "Enter waiting room and chat before match",
  "Verify match result and payouts",
  "Climb the leaderboard and earn referrals"
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-xl border border-brand-gold/40 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-gold">Onboarding ({currentSlide + 1}/8)</h2>
          <button
            className="rounded border border-brand-gold px-3 py-1 text-sm text-brand-gold hover:bg-brand-gold hover:text-brand-black"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            Skip
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-800 p-6">
          <p className="text-lg">{slides[currentSlide]}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="rounded border border-zinc-600 px-4 py-2 disabled:opacity-40"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            type="button"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <span
                key={slide}
                className={`h-2.5 w-2.5 rounded-full ${
                  index === currentSlide ? "bg-brand-gold" : "bg-zinc-600"
                }`}
              />
            ))}
          </div>

          <button
            className="rounded bg-brand-gold px-4 py-2 font-medium text-brand-black hover:bg-yellow-500"
            onClick={() => {
              if (currentSlide === slides.length - 1) {
                setIsOpen(false);
                return;
              }
              setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
            }}
            type="button"
          >
            {currentSlide === slides.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

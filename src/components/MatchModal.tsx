"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { PublicProfile } from "@/lib/types";
import { HeartIcon, LockIcon, XIcon } from "./icons";

interface MatchModalProps {
  profile: PublicProfile;
  onClose: () => void;
  onViewMatches: () => void;
}

export default function MatchModal({ profile, onClose, onViewMatches }: MatchModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      onClick={onClose}
      className="fixed inset-0 z-[70] flex animate-fade-in items-end justify-center bg-ink/55 p-4 backdrop-blur-md sm:items-center"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[382px] animate-pop-in overflow-hidden rounded-[34px] border border-white/50 bg-cream p-6 pt-8 text-center shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close match screen"
          className="press absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-ink/[0.05] text-ink/40 hover:bg-ink/10"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <HeartIcon
          filled
          className="pointer-events-none absolute -left-2 top-12 h-8 w-8 animate-float text-coral/15"
        />
        <HeartIcon
          filled
          className="pointer-events-none absolute right-4 top-8 h-5 w-5 animate-float text-coral/20 [animation-delay:1.1s]"
        />
        <HeartIcon
          filled
          className="pointer-events-none absolute bottom-24 left-6 h-4 w-4 animate-float text-coral/20 [animation-delay:0.5s]"
        />

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-coral">It&apos;s mutual</p>
        <h2
          id="match-title"
          className="mt-1.5 text-[38px] font-semibold leading-none tracking-[-0.03em]"
        >
          It&apos;s a match!
        </h2>

        <div className="relative mx-auto mt-6 h-28 w-28">
          <span className="absolute inset-0 rounded-full bg-coral/15 blur-xl" />
          <div className="relative h-full w-full overflow-hidden rounded-full shadow-xl ring-4 ring-white">
            <Image
              src={profile.photo}
              alt={`${profile.name}'s profile photo`}
              fill
              unoptimized
              sizes="112px"
              className="object-cover"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-cream bg-coral text-white shadow-lg">
            <HeartIcon filled className="h-4 w-4" />
          </span>
        </div>

        <h3 className="mt-4 text-[19px] font-semibold tracking-tight">
          {profile.name}, {profile.age}
        </h3>
        <p className="mt-1 text-[12px] text-ink/40">
          {profile.college} · {profile.city}
        </p>
        <p className="mx-auto mt-4 max-w-[270px] text-[13px] leading-relaxed text-ink/55">
          You and {profile.name} liked each other. Neither of you had to say it first.
        </p>
        <p className="mx-auto mt-2 flex max-w-[280px] items-center justify-center gap-1.5 text-[10.5px] text-ink/35">
          <LockIcon className="h-3 w-3 shrink-0" />
          This is the only time a like is ever revealed.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onViewMatches}
            className="press rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-cream"
          >
            See your matches
          </button>
          <button
            type="button"
            onClick={onClose}
            className="press rounded-full px-5 py-2.5 text-[13px] font-medium text-ink/50 hover:text-ink/80"
          >
            Keep swiping
          </button>
        </div>
      </div>
    </div>
  );
}

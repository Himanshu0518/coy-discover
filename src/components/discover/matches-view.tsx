"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Heart, Lock, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatMatchedAt } from "@/lib/format";
import type { MatchSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MatchesViewProps {
  matches: MatchSummary[];
  isLoading: boolean;
  isError: boolean;
  resetting: boolean;
  onRetry: () => void;
  onReset: () => void;
}

export default function MatchesView({
  matches,
  isLoading,
  isError,
  resetting,
  onRetry,
  onReset,
}: MatchesViewProps) {
  return (
    <div className="animate-rise">
      <header className="flex flex-col gap-5 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-coy">
            <span className="h-1.5 w-1.5 rounded-full bg-coy" />
            Mutual likes
          </p>
          <h1 className="mt-2 font-display text-[42px] font-medium leading-[0.94] tracking-[-0.05em] sm:text-[52px]">
            It&apos;s giving <span className="italic text-coy">mutual.</span>
          </h1>
          <p className="mt-2 max-w-[430px] text-[13px] leading-relaxed text-ink/55">
            Every person here liked you back. That&apos;s the only way in.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-[11px] font-semibold text-ink/60">
          <Heart className="h-3.5 w-3.5 text-coy" fill="currentColor" strokeWidth={0} />
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
      </header>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-[24px] border border-ink/[0.06] bg-white/60"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-6 rounded-[28px] border border-ink/10 bg-white/70 px-6 py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-coy-soft text-coy">
            <AlertCircle className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-[27px] font-medium tracking-tight">
            Couldn&apos;t load your matches.
          </h2>
          <p className="mx-auto mt-1.5 max-w-[300px] text-[12.5px] leading-relaxed text-ink/45">
            The request failed. Your matches are still saved on the server.
          </p>
          <Button variant="outline" onClick={onRetry} className="mt-5">
            Try again
          </Button>
        </div>
      ) : matches.length === 0 ? (
        <div className="relative mt-6 overflow-hidden rounded-[32px] border border-ink/10 bg-white/55 px-6 py-14 text-center">
          <div
            aria-hidden="true"
            className="dot-field absolute inset-x-0 top-0 h-40 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]"
          />
          <div className="relative">
            <div className="relative mx-auto h-[132px] w-[180px]" aria-hidden="true">
              <div className="animate-drift absolute left-2 top-4 h-[110px] w-[84px] -rotate-12 rounded-[20px] border-2 border-ink bg-sun shadow-[4px_4px_0_0_#17151D]" />
              <div className="absolute right-2 top-1 h-[118px] w-[88px] rotate-6 rounded-[20px] border-2 border-ink bg-coy-soft shadow-[4px_4px_0_0_#17151D]" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-white shadow-[3px_3px_0_0_#17151D]">
                  <Heart className="h-6 w-6 text-coy" fill="currentColor" strokeWidth={0} />
                </span>
              </span>
            </div>

            <h2 className="mt-4 font-display text-[32px] font-medium leading-tight tracking-[-0.03em]">
              No matches. <span className="italic text-coy">Yet.</span>
            </h2>
            <p className="mx-auto mt-2 max-w-[320px] text-[12.5px] leading-relaxed text-ink/50">
              The best ones usually start with a right swipe. If someone already
              likes you, you&apos;ll both find out the moment you do.
            </p>
            <Link
              href="/discover"
              className={cn(buttonVariants({ variant: "pink", size: "lg" }), "mt-6")}
            >
              Start discovering
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {matches.map(({ profile, matchedAt }, index) => (
            <motion.li
              key={profile.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.045, 0.3),
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <article className="group relative aspect-[4/5] overflow-hidden rounded-[24px] border border-ink/10 bg-sand shadow-[0_18px_40px_-30px_rgba(23,21,29,0.55)]">
                <Image
                  src={profile.photo}
                  alt={`${profile.name}'s profile photo`}
                  fill
                  sizes="(max-width: 640px) 45vw, 240px"
                  className="object-cover object-[center_28%] transition-transform duration-500 group-hover:scale-[1.035]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                  <span className="rounded-full border border-white/25 bg-white/90 px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-ink/60 shadow-sm backdrop-blur-sm">
                    {formatMatchedAt(matchedAt)}
                  </span>
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-coy text-white shadow-sm">
                    <Heart className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                  <div className="flex items-baseline gap-1">
                    <h2 className="font-display text-[22px] font-semibold leading-none tracking-[-0.03em]">
                      {profile.name}
                    </h2>
                    <span className="text-[16px] font-light text-white/70">{profile.age}</span>
                  </div>
                  <p className="mt-1 truncate text-[9.5px] font-medium text-white/65">
                    {profile.college} · {profile.city}
                  </p>
                </div>

              </article>
            </motion.li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-5 sm:flex-row">
        <p className="flex items-center gap-1.5 text-[10.5px] text-ink/35">
          <Lock className="h-3 w-3" />
          One-sided likes are never shown here.
        </p>
        <button
          type="button"
          onClick={onReset}
          disabled={resetting}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium text-ink/35 transition-colors hover:text-ink/65 disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {resetting ? "Resetting…" : "Reset demo data"}
        </button>
      </div>
    </div>
  );
}

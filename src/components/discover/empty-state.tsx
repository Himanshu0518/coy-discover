"use client";

import { Heart, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasMatches: boolean;
  resetting: boolean;
  onSeeMatches: () => void;
  onReset: () => void;
}

export default function EmptyState({
  hasMatches,
  resetting,
  onSeeMatches,
  onReset,
}: EmptyStateProps) {
  return (
    <div className="animate-pop-in relative overflow-hidden rounded-[32px] border border-ink/10 bg-white/60 px-6 py-12 text-center">
      <div
        aria-hidden="true"
        className="dot-field absolute inset-x-0 top-0 h-44 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <div className="relative">
        <div className="relative mx-auto h-[148px] w-[196px]" aria-hidden="true">
          <div className="animate-drift absolute left-2 top-5 h-[118px] w-[90px] -rotate-12 rounded-[22px] border-2 border-ink bg-sun shadow-[4px_4px_0_0_#17151D]" />
          <div className="absolute right-2 top-0 h-[128px] w-[94px] rotate-6 rounded-[22px] border-2 border-ink bg-coy-soft shadow-[4px_4px_0_0_#17151D]" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-white shadow-[3px_3px_0_0_#17151D]">
              <Heart className="h-7 w-7 text-coy" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
          <Sparkles className="absolute right-1 top-1 h-5 w-5 text-coy" />
          <Sparkles className="absolute bottom-4 left-0 h-4 w-4 text-ink/25" />
        </div>

        <h2 className="mt-5 font-display text-[32px] font-medium leading-[1.02] tracking-[-0.035em]">
          That&apos;s everyone.{" "}
          <span className="italic text-coy">For now.</span>
        </h2>
        <p className="mx-auto mt-2.5 max-w-[320px] text-[12.5px] leading-relaxed text-ink/50">
          New people drop into Discover all the time. Your swipes are saved, so
          nobody comes back twice.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          {hasMatches ? (
            <Button variant="pink" size="lg" onClick={onSeeMatches}>
              See your matches
            </Button>
          ) : null}
          <Button variant="outline" size="lg" onClick={onReset} disabled={resetting}>
            <RotateCcw className="h-4 w-4" />
            {resetting ? "Resetting…" : "Reset demo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

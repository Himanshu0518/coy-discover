"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="animate-rise rounded-[30px] border border-ink/10 bg-white/65 px-6 py-14 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-coy-soft text-coy">
        <AlertCircle className="h-5 w-5" />
      </span>
      <h2 className="mt-4 font-display text-[28px] font-medium tracking-[-0.03em]">
        The feed didn&apos;t load.
      </h2>
      <p className="mx-auto mt-1.5 max-w-[290px] text-[12.5px] leading-relaxed text-ink/45">
        The request failed, but your swipes and matches are safe. Try it once
        more.
      </p>
      <Button variant="pink" onClick={onRetry} className="mt-5">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

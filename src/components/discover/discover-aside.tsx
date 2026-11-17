import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, Lock, RotateCcw } from "lucide-react";
import { formatMatchedAt } from "@/lib/format";
import type { MatchSummary } from "@/lib/types";

interface DiscoverAsideProps {
  matches: MatchSummary[];
  resetting: boolean;
  onReset: () => void;
}

export default function DiscoverAside({
  matches,
  resetting,
  onReset,
}: DiscoverAsideProps) {
  return (
    <aside className="hidden w-full flex-col gap-4 lg:flex">
      <div className="relative rounded-[26px] border-2 border-ink bg-sun p-5 shadow-[5px_5px_0_0_#17151D]">
        <span className="absolute -right-2 -top-3 rotate-6 rounded-full border border-ink bg-white px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.14em] text-ink shadow-sm">
          The promise
        </span>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
          <Lock className="h-3.5 w-3.5" />
          Double-blind
        </div>
        <p className="mt-3 font-display text-[25px] font-medium leading-[1.02] tracking-[-0.035em]">
          Nobody sees who liked them.
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink/65">
          Not even you. A match only appears when you both say yes — that&apos;s
          the whole point.
        </p>

        <ul className="mt-4 space-y-2 border-t border-ink/15 pt-3">
          {["No lists of admirers", "No hints to buy", "Just mutual matches"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2 text-[11px] font-medium text-ink/70">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ink text-[8px] font-bold text-sun">
                  ✓
                </span>
                {item}
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="rounded-[26px] border border-ink/10 bg-white/80 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
            Recent matches
          </p>
          <Link
            href="/discover?view=matches"
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-coy hover:text-ink"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {matches.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {matches.slice(0, 2).map(({ profile, matchedAt }) => (
              <li key={profile.id} className="flex items-center gap-2.5">
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-sand">
                  <Image
                    src={profile.photo}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover object-[center_28%]"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-1 text-[12.5px] font-semibold leading-tight">
                    <span className="truncate">{profile.name}</span>
                    <span className="text-[11px] font-normal text-ink/35">{profile.age}</span>
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-ink/40">
                    Matched {formatMatchedAt(matchedAt)}
                  </p>
                </div>
                <Heart className="h-3.5 w-3.5 shrink-0 text-coy" fill="currentColor" strokeWidth={0} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-ink/15 px-3.5 py-4">
            <Heart className="h-4 w-4 text-coy" />
            <p className="mt-2 text-[11.5px] font-medium leading-snug text-ink/55">
              Your first mutual is closer than you think.
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between px-1 pt-1 text-[9.5px] text-ink/30">
        <span>Photos · Pexels</span>
        <button
          type="button"
          onClick={onReset}
          disabled={resetting}
          className="inline-flex items-center gap-1 rounded-full py-1 transition-colors hover:text-ink/60 disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" />
          {resetting ? "Resetting…" : "Reset demo"}
        </button>
      </div>
    </aside>
  );
}

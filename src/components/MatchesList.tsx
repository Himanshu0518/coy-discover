import Image from "next/image";
import { formatMatchedAt } from "@/lib/format";
import type { MatchSummary } from "@/lib/types";
import { HeartIcon, RefreshIcon } from "./icons";

interface MatchesListProps {
  matches: MatchSummary[];
  onStartSwiping: () => void;
  onReset: () => void;
}

export default function MatchesList({
  matches,
  onStartSwiping,
  onReset,
}: MatchesListProps) {
  return (
    <div className="animate-rise">
      <div className="flex items-start justify-between px-1">
        <div>
          <h2 className="text-[25px] font-semibold leading-tight tracking-tight">Your matches</h2>
          <p className="mt-1 max-w-[235px] text-[12.5px] leading-relaxed text-ink/45">
            You both liked each other. Neither of you had to ask first.
          </p>
        </div>
        <span className="mt-1 rounded-full bg-coral-soft px-2.5 py-1 text-[11px] font-semibold text-coral">
          {matches.length}
        </span>
      </div>

      {matches.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-ink/15 bg-white/45 px-6 py-12 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-coral shadow-sm">
            <HeartIcon className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold">No matches yet</p>
          <p className="mx-auto mt-1 max-w-[240px] text-[12.5px] leading-relaxed text-ink/45">
            Keep swiping. If someone you like has already liked you, you&apos;ll both find out the
            moment you swipe right.
          </p>
          <button
            type="button"
            onClick={onStartSwiping}
            className="press mt-5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-cream"
          >
            Start swiping
          </button>
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {matches.map(({ profile, matchedAt }) => (
            <li
              key={profile.id}
              className="flex items-center gap-3.5 rounded-[26px] border border-ink/[0.07] bg-white/70 p-3 shadow-[0_10px_30px_-22px_rgba(30,27,26,0.5)]"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[20px] bg-sand">
                <Image
                  src={profile.photo}
                  alt={`${profile.name}'s profile photo`}
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-1.5 text-[15px] font-semibold leading-tight">
                  <span className="truncate">{profile.name}</span>
                  <span className="text-[13px] font-normal text-ink/40">{profile.age}</span>
                </p>
                <p className="mt-0.5 truncate text-[11.5px] text-ink/45">
                  {profile.college} · {profile.city}
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-coral-soft px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-coral">
                  <HeartIcon filled className="h-2.5 w-2.5" />
                  Matched {formatMatchedAt(matchedAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onReset}
        className="press mx-auto mt-7 flex items-center gap-1.5 text-[11.5px] font-medium text-ink/35 hover:text-ink/60"
      >
        <RefreshIcon className="h-3.5 w-3.5" />
        Reset demo data
      </button>
    </div>
  );
}

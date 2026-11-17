import { HeartIcon, RefreshIcon } from "./icons";

interface EmptyDeckProps {
  hasMatches: boolean;
  onSeeMatches: () => void;
  onReset: () => void;
}

export default function EmptyDeck({ hasMatches, onSeeMatches, onReset }: EmptyDeckProps) {
  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-1 animate-rise flex-col items-center justify-center pb-6 text-center">
      <div className="relative mb-5 h-24 w-32" aria-hidden="true">
        <div className="absolute left-0 top-2 h-20 w-20 rotate-[-8deg] rounded-[24px] border-4 border-cream bg-sand shadow-md" />
        <div className="absolute right-0 top-0 h-20 w-20 rotate-[10deg] rounded-full border-4 border-cream bg-coral-soft shadow-md" />
        <span className="absolute inset-0 grid place-items-center">
          <HeartIcon filled className="h-9 w-9 text-coral" />
        </span>
      </div>

      <h2 className="text-[25px] font-semibold leading-tight tracking-tight">
        You&apos;ve seen everyone
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-ink/45">
        New people will show up here. Nobody learns who you liked — a match only appears when
        it&apos;s mutual.
      </p>

      <div className="mt-6 flex w-full flex-col gap-2">
        {hasMatches ? (
          <button
            type="button"
            onClick={onSeeMatches}
            className="press rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-cream"
          >
            See your matches
          </button>
        ) : null}
        <button
          type="button"
          onClick={onReset}
          className="press flex items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/70 px-5 py-3 text-[13px] font-medium text-ink/60 hover:text-ink"
        >
          <RefreshIcon className="h-4 w-4" />
          Reset demo
        </button>
      </div>
    </div>
  );
}

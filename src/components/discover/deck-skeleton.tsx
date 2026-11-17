export default function DeckSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading people near you">
      <div className="h-[clamp(520px,68vh,640px)] animate-pulse rounded-[30px] border border-ink/[0.06] bg-white/60" />
      <div className="mt-5 flex items-end justify-center gap-6">
        <div className="h-[62px] w-[62px] animate-pulse rounded-full bg-ink/[0.06]" />
        <div className="h-[74px] w-[74px] animate-pulse rounded-full bg-coy/20" />
      </div>
      <div className="mx-auto mt-4 h-2.5 w-32 animate-pulse rounded-full bg-ink/[0.05]" />
    </div>
  );
}

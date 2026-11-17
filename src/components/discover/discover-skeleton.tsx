export default function DiscoverSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,480px)_300px] lg:justify-center xl:grid-cols-[minmax(0,500px)_320px] xl:gap-14">
        <div className="mx-auto w-full max-w-[480px] animate-pulse xl:max-w-[500px]">
          <div className="h-2.5 w-24 rounded-full bg-ink/[0.08]" />
          <div className="mt-5 h-11 w-[78%] rounded-2xl bg-ink/[0.08]" />
          <div className="mt-2 h-11 w-[52%] rounded-2xl bg-ink/[0.08]" />
          <div className="mt-4 h-2.5 w-[80%] rounded-full bg-ink/[0.05]" />
          <div className="mt-2 h-2.5 w-[60%] rounded-full bg-ink/[0.05]" />
          <div className="mt-6 h-[clamp(520px,68vh,640px)] rounded-[30px] border border-ink/[0.06] bg-white/55" />
          <div className="mt-5 flex justify-center gap-6">
            <div className="h-[62px] w-[62px] rounded-full bg-ink/[0.06]" />
            <div className="h-[74px] w-[74px] rounded-full bg-coy/15" />
          </div>
        </div>

        <div className="hidden animate-pulse flex-col gap-4 lg:flex">
          <div className="h-[238px] rounded-[26px] border border-ink/[0.06] bg-sun/40" />
          <div className="h-[150px] rounded-[26px] border border-ink/[0.06] bg-white/60" />
        </div>
      </div>
    </div>
  );
}

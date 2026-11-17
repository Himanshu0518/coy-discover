import { HeartIcon } from "@/components/icons";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 pb-28 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/70 text-coral shadow-sm ring-1 ring-ink/[0.06]">
        <HeartIcon className="h-5 w-5" filled />
      </span>
      <div>
        <h1 className="text-[17px] font-semibold tracking-tight">Home</h1>
        <p className="mx-auto mt-1 max-w-[220px] text-[13px] leading-relaxed text-ink/40">
          This tab is intentionally blank. The assignment builds the experience in Discover.
        </p>
      </div>
    </main>
  );
}

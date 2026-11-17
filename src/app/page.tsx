import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 pb-32 pt-10 sm:px-6 lg:px-8">
      <div className="grid w-full items-center gap-12 md:grid-cols-[1fr_340px]">
        <div className="animate-rise">
          <p className="eyebrow text-coy">
            <span className="h-1.5 w-1.5 rounded-full bg-coy" />
            Home
          </p>
          <h1 className="mt-4 max-w-[520px] font-display text-[46px] font-medium leading-[0.96] tracking-[-0.05em] sm:text-[60px]">
            A quieter corner of{" "}
            <span className="italic text-coy">Coy.</span>
          </h1>
          <p className="mt-5 max-w-[390px] text-[14px] leading-7 text-ink/55">
            Home is intentionally a placeholder in this build. The whole experience —
            the people, the swipes, the matches — lives in Discover.
          </p>
          <Link
            href="/discover"
            className={cn(buttonVariants({ variant: "pink", size: "lg" }), "mt-7")}
          >
            Find someone new
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          aria-hidden="true"
          className="relative mx-auto h-[280px] w-[280px] max-w-full md:mx-0"
        >
          <div className="dot-field absolute inset-6 rounded-full opacity-50" />
          <div className="animate-drift absolute left-2 top-8 h-[210px] w-[172px] -rotate-6 rounded-[26px] border-2 border-ink bg-sun shadow-[6px_6px_0_0_#17151D]" />
          <div className="absolute right-1 top-4 h-[226px] w-[176px] rotate-6 rounded-[26px] border-2 border-ink bg-coy-soft shadow-[6px_6px_0_0_#17151D]">
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Heart className="h-12 w-12 text-coy" fill="currentColor" strokeWidth={0} />
              <p className="px-5 font-display text-[19px] font-medium leading-tight tracking-tight">
                Good people.
                <br />
                Zero guesswork.
              </p>
            </div>
          </div>
          <span className="absolute bottom-7 left-4 inline-flex -rotate-6 items-center gap-1.5 rounded-full border-2 border-ink bg-mint px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink shadow-[2px_2px_0_0_#17151D]">
            <Sparkles className="h-3 w-3" />
            It&apos;s giving mutual
          </span>
        </div>
      </div>
    </main>
  );
}

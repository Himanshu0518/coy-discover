"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Heart, Lock } from "lucide-react";
import { motion } from "motion/react";
import { Suspense } from "react";
import { useMatches } from "@/lib/queries";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/discover?view=matches", label: "Matches" },
] as const;

function HeaderNav({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const matches = useMatches();
  const matchCount = matches.data?.matches.length ?? 0;
  const onDiscover = pathname.startsWith("/discover");
  const onMatches = onDiscover && searchParams.get("view") === "matches";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/discover") return onDiscover && !onMatches;
    return onMatches;
  };

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-0.5 rounded-full border border-ink/[0.08] bg-white/75 p-1 shadow-[0_8px_24px_-20px_rgba(23,21,29,0.5)]"
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex h-9 items-center rounded-full px-4 text-[12.5px] font-semibold transition-colors",
              active ? "text-cream" : "text-ink/50 hover:text-ink",
            )}
          >
            {active ? (
              <motion.span
                layoutId="primary-nav-pill"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {label}
              {label === "Matches" && matchCount > 0 ? (
                <span
                  className={cn(
                    "grid min-w-[17px] place-items-center rounded-full px-1 py-0.5 text-[9px] font-bold leading-none",
                    active ? "bg-coy text-white" : "bg-coy/10 text-coy",
                  )}
                >
                  {matchCount > 9 ? "9+" : matchCount}
                </span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.07] bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 md:h-[72px] lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 -rotate-6 place-items-center rounded-[12px] border-2 border-ink bg-coy text-white shadow-[3px_3px_0_0_#17151D] transition-transform duration-200 group-hover:rotate-0">
            <Heart className="h-[17px] w-[17px]" fill="currentColor" strokeWidth={2.4} />
          </span>
          <span className="font-display text-[26px] font-semibold leading-none tracking-[-0.045em]">
            coy<span className="text-coy">.</span>
          </span>
        </Link>

        <div className="hidden md:block">
          <Suspense
            fallback={<div className="h-11 w-[286px] rounded-full bg-white/60" />}
          >
            <HeaderNav pathname={pathname} />
          </Suspense>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-ink/[0.08] bg-white/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40 xl:inline-flex">
            <Lock className="h-3 w-3" />
            Double-blind
          </span>

          <div
            aria-label="Signed in as Aarav"
            className="flex items-center gap-2.5 border-l border-ink/10 pl-3"
          >
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-semibold leading-tight">Himanshu</p>
              <p className="mt-0.5 text-[10px] leading-none text-ink/40">Your profile</p>
            </div>
            <span className="relative block h-9 w-9 overflow-hidden rounded-full border border-ink/10 ring-2 ring-white">
              <Image
                src="/portraits/me.jpg"
                alt=""
                fill
                sizes="36px"
                className="object-cover"
              />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

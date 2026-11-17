"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Compass, Heart, House } from "lucide-react";
import { useMatches } from "@/lib/queries";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/discover", label: "Discover", Icon: Compass },
  { href: "/discover?view=matches", label: "Matches", Icon: Heart },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
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
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/[0.08] bg-cream/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-3 px-3">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="group flex flex-col items-center gap-1 rounded-2xl py-1.5"
            >
              <span
                className={cn(
                  "relative grid h-8 w-14 place-items-center rounded-full transition-colors",
                  active ? "bg-coy/10 text-coy" : "text-ink/40 group-hover:text-ink/70",
                )}
              >
                <Icon
                  className="h-[20px] w-[20px]"
                  strokeWidth={active ? 2.4 : 1.8}
                  fill={active && label === "Matches" ? "currentColor" : "none"}
                />
                {label === "Matches" && matchCount > 0 ? (
                  <span className="absolute right-1 top-0 grid min-w-[16px] place-items-center rounded-full border border-cream bg-coy px-1 py-0.5 text-[8px] font-bold leading-none text-white">
                    {matchCount > 9 ? "9+" : matchCount}
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold leading-none",
                  active ? "text-ink" : "text-ink/40",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

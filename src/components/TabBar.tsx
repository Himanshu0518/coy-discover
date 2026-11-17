"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompassIcon, HomeIcon } from "./icons";

const tabs = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/discover", label: "Discover", Icon: CompassIcon },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[440px] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
    >
      <div className="flex items-center gap-1 rounded-[22px] border border-ink/10 bg-white/80 p-1.5 shadow-[0_20px_45px_-20px_rgba(30,27,26,0.45)] backdrop-blur-xl">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 items-center justify-center gap-2 rounded-[16px] px-3 py-2.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-ink text-cream shadow-sm"
                  : "text-ink/45 hover:bg-ink/[0.04] hover:text-ink/70"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

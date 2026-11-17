import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { Suspense } from "react";
import BottomNav from "@/components/bottom-nav";
import Providers from "@/components/providers";
import SiteHeader from "@/components/site-header";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Coy · Discover someone new", template: "%s · Coy" },
  description:
    "A double-blind campus discovery experience. Swipe, find your people, and only ever see a match when it's mutual.",
  applicationName: "Coy Discover",
};

export const viewport: Viewport = {
  themeColor: "#FFFDF9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh bg-cream font-sans text-ink antialiased">
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
            <Suspense fallback={<div className="h-[62px] md:hidden" />}>
              <BottomNav />
            </Suspense>
          </div>
        </Providers>
      </body>
    </html>
  );
}

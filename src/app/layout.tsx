import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TabBar from "@/components/TabBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Coy · Discover", template: "%s · Coy" },
  description:
    "A swipe-based Discover tab built as a standalone demo alongside Coy's double-blind crush experience.",
  applicationName: "Coy Discover",
};

export const viewport: Viewport = {
  themeColor: "#faf6f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-dvh bg-cream font-sans text-ink antialiased">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-ink/[0.06] bg-cream/60 sm:border-x">
          {children}
          <TabBar />
        </div>
      </body>
    </html>
  );
}

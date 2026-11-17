import type { Metadata } from "next";
import { Suspense } from "react";
import DiscoverClient from "@/components/discover/discover-client";
import DiscoverSkeleton from "@/components/discover/discover-skeleton";

export const metadata: Metadata = {
  title: "Discover",
};

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <DiscoverClient />
    </Suspense>
  );
}

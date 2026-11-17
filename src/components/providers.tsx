"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        offset={84}
        gap={10}
        toastOptions={{
          duration: 3200,
          classNames: {
            toast:
              "!rounded-2xl !border !border-ink/10 !bg-white !font-sans !text-ink !shadow-[0_18px_40px_-24px_rgba(23,21,29,0.55)]",
            title: "!text-[13px] !font-semibold",
            description: "!text-[12px] !text-ink/50",
          },
        }}
      />
    </QueryClientProvider>
  );
}

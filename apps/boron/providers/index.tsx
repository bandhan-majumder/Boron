/*
 * This is for all the providers in root layout.tsx file. SideBar is not a provider yet!
 */

"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { PromptStoreProvider } from "./prompt-store-provider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <PromptStoreProvider>{children}</PromptStoreProvider>
    </QueryClientProvider>
  );
}

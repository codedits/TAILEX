"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";
import { CartProvider } from "@/context/CartContext";
import { UserAuthProvider } from "@/context/UserAuthContext";
import { StoreConfigProvider } from "@/context/StoreConfigContext";
import { StoreConfig } from "@/services/config";

export function Providers({
  children,
  initialConfig
}: {
  children: React.ReactNode;
  initialConfig: StoreConfig;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StoreConfigProvider initialConfig={initialConfig}>
        <UserAuthProvider>
          <CartProvider>
            <TooltipProvider>
              {children}
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </CartProvider>
        </UserAuthProvider>
      </StoreConfigProvider>
    </QueryClientProvider>
  );
}


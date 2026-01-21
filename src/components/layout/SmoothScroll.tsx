"use client";

import { ReactLenis } from "lenis/react";

/**
 * SmoothScroll - Client Component
 * 
 * Provides "buttery" inertial scrolling using Lenis.
 * Essential for the premium "high-end store" feel.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{
        lerp: 0.1,
        duration: 1.5,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}

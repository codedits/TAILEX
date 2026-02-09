"use client";

import { ReactLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * SmoothScroll - Client Component
 * 
 * Provides "buttery" inertial scrolling using Lenis.
 * Essential for the premium "high-end store" feel.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("Lenis SmoothScroll wrapper mounted");
  }, []);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05, // More obvious smoothing for testing
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

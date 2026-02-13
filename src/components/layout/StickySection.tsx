"use client";

import { m, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

interface StickySectionProps {
    children: React.ReactNode;
    index: number;
    total: number;
    className?: string;
}

export default function StickySection({
    children,
    index,
    total,
    className = ""
}: StickySectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    // Scale effect: The card scales down slightly as it's being covered by the next one
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9 + (0.1 * (index / total))]);

    // Opacity effect: Fades slightly as it exits
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 1 - (index * 0.1)]);

    return (
        <div ref={ref} className={`h-screen sticky top-0 flex items-center justify-center overflow-hidden ${className}`}>
            <m.div
                style={{ scale, opacity }}
                className="relative w-full h-full transform-gpu origin-top"
            >
                {children}
            </m.div>
        </div>
    );
}

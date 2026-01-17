"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    once?: boolean;
    threshold?: number;
    rootMargin?: string;
}

/**
 * ScrollReveal - Client Component
 * 
 * Uses Intersection Observer to detect when elements enter the viewport.
 * Adds 'is-visible' class to the container when in view.
 */
export function ScrollReveal({
    children,
    className,
    once = true,
    threshold = 0.01,
    rootMargin = "0px"
}: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.unobserve(entry.target);
                    }
                } else {
                    if (!once) {
                        setIsVisible(false);
                    }
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [once, threshold, rootMargin]);

    return (
        <div
            ref={ref}
            className={cn(
                "scroll-reveal",
                isVisible ? "is-visible" : "is-hidden",
                className
            )}
        >
            {children}
        </div>
    );
}

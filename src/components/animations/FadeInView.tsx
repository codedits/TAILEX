"use client";

import { m } from "framer-motion";

export function FadeInView({
    children,
    className = "",
    delay = 0
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <m.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay }}
            className={className}
        >
            {children}
        </m.div>
    );
}

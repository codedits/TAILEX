"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number; // How much the button follows the mouse (default 0.4)
  range?: number;    // How far the "magnetic pull" extends (default 0.6)
}

export const MagneticButton = ({ 
  children, 
  className, 
  onClick,
  strength = 0.4,
  range = 0.6
}: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // 1. Performance: Use MotionValues to avoid React re-renders on every mouse move
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 2. Smoothness: Apply a spring to the movement
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // 3. Layering: Make the content (text/icon) move slightly less than the button
  // This creates a high-end "parallax" depth effect.
  const textX = useTransform(springX, (latest) => latest * 0.5);
  const textY = useTransform(springY, (latest) => latest * 0.5);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    
    // Calculate center distance
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Apply strength and range
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
      style={{
        x: springX,
        y: springY,
      }}
    >
      <motion.button
        className={className}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* The text/icon inside moves at a different speed */}
        <motion.div
          style={{
            x: textX,
            y: textY,
          }}
        >
          {children}
        </motion.div>
      </motion.button>

      {/* Optional: High-end hover glow effect */}
      <motion.div 
        className="absolute inset-0 bg-white/10 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ x: textX, y: textY }}
      />
    </motion.div>
  );
};
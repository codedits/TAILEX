"use client";

import { motion } from "framer-motion";

export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="bg-black text-white py-2.5 px-4 overflow-hidden relative border-b border-white/10">
      <motion.div 
        className="text-[10px] font-manrope font-black tracking-[0.4em] uppercase text-center whitespace-nowrap"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.div>
    </div>
  );
}

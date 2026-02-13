"use client";



export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="bg-black text-white py-2.5 px-4 overflow-hidden relative border-b border-white/10">
      <div
        className="text-[10px] font-manrope font-black tracking-[0.4em] uppercase text-center whitespace-nowrap animate-pulse-subtle"
      >
        {text}
      </div>
    </div>
  );
}

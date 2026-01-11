export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Simple Brand Pulse */}
        <div className="text-2xl font-black tracking-tighter uppercase animate-pulse">
          TAILEX
        </div>
      </div>
    </div>
  );
}

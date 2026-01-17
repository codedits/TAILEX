import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { CommandPalette } from "@/components/admin/CommandPalette"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark" data-theme="dark">
      <SidebarProvider>
        <AdminSidebar />
        <main className="w-full bg-black text-white min-h-screen font-sans">
          <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <SidebarTrigger className="hover:bg-white/10" />
            <div className="h-4 w-[1px] bg-white/20" />
            <h1 className="font-medium text-sm tracking-tight text-white/90 flex-1">Admin Dashboard</h1>
            <kbd className="hidden sm:inline-flex pointer-events-none h-6 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-2 font-mono text-[10px] font-medium text-white/40">
              <span className="text-xs">⌘</span>K to search
            </kbd>
          </div>
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
          <CommandPalette />
        </main>
      </SidebarProvider>
    </div>
  )
}

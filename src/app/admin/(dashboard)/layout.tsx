import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { CommandPalette } from "@/components/admin/CommandPalette"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark" data-theme="dark">
      <SidebarProvider>
        <AdminSidebar />
        <main className="w-full bg-black text-white min-h-screen font-sans">
          <div className="flex items-center gap-3 p-3 md:p-4 border-b border-white/10 bg-black/80 sticky top-0 z-50 backdrop-blur-md">
            <SidebarTrigger className="hover:bg-white/10" />
            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />
            <div className="flex-1 min-w-0">
              <AdminBreadcrumbs />
            </div>
            <div className="flex items-center gap-2">
              <kbd className="hidden lg:inline-flex pointer-events-none h-6 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-2 font-mono text-[10px] font-medium text-white/40">
                <span className="text-xs">⌘</span>K
              </kbd>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">View Store</span>
              </Link>
            </div>
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

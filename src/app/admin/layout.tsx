import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark">
      <SidebarProvider>
        <AdminSidebar />
        <main className="w-full bg-black text-white min-h-screen font-sans">
          <div className="p-4 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex items-center shadow-sm">
              <SidebarTrigger className="hover:bg-white/10" />
              <div className="h-4 w-[1px] bg-white/20 mx-4" />
              <h1 className="font-medium text-sm tracking-tight text-white/90">Admin Dashboard</h1>
          </div>
          <div className="p-8 max-w-7xl mx-auto">
              {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}

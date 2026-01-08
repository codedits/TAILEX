import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Palette, 
  FileText, 
  Navigation,
  Users
} from "lucide-react"
import Link from "next/link"

export function AdminSidebar() {
  return (
    <Sidebar className="border-r border-white/10 bg-black">
      <SidebarContent className="bg-black text-white/70">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium px-4 py-6">Store Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm">Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin/theme">
                    <Palette className="w-4 h-4" />
                    <span className="text-sm">Branding & Theme</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin/pages">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Pages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin/products">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-sm">Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin/collections">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm">Collections</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin/orders">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-sm">Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin/navigation">
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm">Navigation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin/customers">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors duration-200 py-6 rounded-lg">
                  <Link href="/admin/settings">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto px-2 pb-4">
             <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors py-6 rounded-lg">
                            <Link href="/" className="flex w-full items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Return to Store</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
             </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}

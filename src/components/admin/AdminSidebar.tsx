'use client'

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
  Users,
  Tag,
  FolderOpen,
  Receipt,
  LayoutGrid,
  Megaphone
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "Store",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/products", label: "Products", icon: ShoppingBag },
      { href: "/admin/collections", label: "Collections", icon: FolderOpen },
      { href: "/admin/orders", label: "Orders", icon: Receipt },
    ]
  },
  {
    label: "Design",
    items: [
      { href: "/admin/theme", label: "Branding & Theme", icon: Palette },
      { href: "/admin/design/homepage", label: "Homepage", icon: LayoutGrid },
      { href: "/admin/navigation", label: "Navigation", icon: Navigation },
      { href: "/admin/pages", label: "Pages", icon: FileText },
    ]
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/discount", label: "Discount Popup", icon: Megaphone },
    ]
  },
  {
    label: "System",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ]
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <Sidebar className="border-r border-white/5 bg-black">
      <SidebarContent className="bg-black text-white/70">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium px-4 py-3">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 space-y-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "py-2.5 rounded-lg transition-all duration-200",
                        isActive(item.href)
                          ? "bg-white/10 text-white"
                          : "hover:bg-white/5 hover:text-white text-white/60"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto px-2 pb-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-white/5 hover:text-white transition-colors py-2.5 rounded-lg text-white/40">
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

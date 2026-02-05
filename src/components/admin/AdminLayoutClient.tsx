"use client"

import * as React from "react"
import { CommandPalette } from "@/components/admin/CommandPalette"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [commandOpen, setCommandOpen] = React.useState(false)

    return (
        <>
            {/* Command Palette Trigger in Header */}
            <div className="p-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                    <h1 className="font-medium text-sm tracking-tight text-white/90">Admin Dashboard</h1>
                </div>

                {/* Search Button / Command Palette Trigger */}
                <Button
                    variant="outline"
                    onClick={() => setCommandOpen(true)}
                    className="bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60 h-9 px-3 gap-2 text-sm hidden sm:flex"
                >
                    <Search className="h-4 w-4" />
                    <span>Search...</span>
                    <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/40">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>

                {/* Mobile search button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCommandOpen(true)}
                    className="sm:hidden h-9 w-9 hover:bg-white/10 text-white/60"
                >
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            {/* Page Content */}
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {children}
            </div>

            {/* Command Palette */}
            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        </>
    )
}


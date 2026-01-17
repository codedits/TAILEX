"use client"

import * as React from "react"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ActionDrawerAction {
    label: string
    icon?: React.ReactNode
    onClick: () => void | Promise<void>
    variant?: "default" | "destructive"
    disabled?: boolean
}

interface ActionDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    actions: ActionDrawerAction[]
}

export function ActionDrawer({
    open,
    onOpenChange,
    title,
    description,
    actions,
}: ActionDrawerProps) {
    const [loading, setLoading] = React.useState<string | null>(null)

    const handleAction = async (action: ActionDrawerAction) => {
        setLoading(action.label)
        try {
            await action.onClick()
            onOpenChange(false)
        } catch (error) {
            console.error("Action failed:", error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-neutral-900 border-white/10">
                <DrawerHeader className="text-left">
                    <DrawerTitle className="text-white">{title}</DrawerTitle>
                    {description && (
                        <DrawerDescription className="text-white/50">
                            {description}
                        </DrawerDescription>
                    )}
                </DrawerHeader>
                <div className="p-4 pt-0 space-y-2">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            onClick={() => handleAction(action)}
                            disabled={action.disabled || loading === action.label}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start h-14 text-base font-medium rounded-xl",
                                action.variant === "destructive"
                                    ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    : "text-white hover:bg-white/10"
                            )}
                        >
                            {action.icon && (
                                <span className="mr-3 w-5 h-5 flex items-center justify-center">
                                    {action.icon}
                                </span>
                            )}
                            {loading === action.label ? "Loading..." : action.label}
                        </Button>
                    ))}
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button
                            variant="outline"
                            className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

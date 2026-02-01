"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { TrendingUp, Target, ShoppingBag } from "lucide-react"
import { useFormatCurrency } from "@/context/StoreConfigContext"

interface DashboardProgressProps {
    revenueCurrent: number
    ordersCurrent: number
}

// Mock goals for demonstration - in a real app these might come from settings
const REVENUE_GOAL = 50000
const ORDERS_GOAL = 500

export function DashboardProgress({ revenueCurrent, ordersCurrent }: DashboardProgressProps) {
    const formatCurrency = useFormatCurrency()

    const revenueProgress = Math.min((revenueCurrent / REVENUE_GOAL) * 100, 100)
    const ordersProgress = Math.min((ordersCurrent / ORDERS_GOAL) * 100, 100)

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-white font-light flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        Revenue Goal
                    </CardTitle>
                    <CardDescription className="text-white/40 text-xs font-mono">
                        {formatCurrency(revenueCurrent)} / {formatCurrency(REVENUE_GOAL)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${revenueProgress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-400 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/30 font-mono uppercase tracking-wider">
                            <span>0%</span>
                            <span className="text-emerald-400">{Math.round(revenueProgress)}% Achieved</span>
                            <span>100%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-white font-light flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-blue-400" />
                        Orders Goal
                    </CardTitle>
                    <CardDescription className="text-white/40 text-xs font-mono">
                        {ordersCurrent} / {ORDERS_GOAL} orders
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${ordersProgress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-blue-900 via-blue-500 to-blue-400 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/30 font-mono uppercase tracking-wider">
                            <span>0%</span>
                            <span className="text-blue-400">{Math.round(ordersProgress)}% Achieved</span>
                            <span>100%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

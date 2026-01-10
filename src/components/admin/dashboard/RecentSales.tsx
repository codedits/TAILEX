"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useFormatCurrency } from "@/context/StoreConfigContext"

type RecentSaleProps = {
    sales: {
        id: string;
        amount: number;
        customerName: string;
        customerEmail: string;
        avatarUrl?: string;
    }[]
}

export function RecentSales({ sales }: RecentSaleProps) {
    const formatCurrency = useFormatCurrency();
    return (
        <div className="space-y-8">
            {sales.length === 0 && <p className="text-sm text-neutral-500">No sales yet.</p>}

            {sales.map((sale) => (
                <div key={sale.id} className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <Avatar className="h-9 w-9 border border-white/10">
                        <AvatarImage src={sale.avatarUrl || "/avatars/01.png"} alt="Avatar" />
                        <AvatarFallback className="bg-white/5 text-white/60">{sale.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none text-white/80 group-hover:text-white transition-colors">{sale.customerName}</p>
                        <p className="text-xs text-white/40 font-mono">
                            {sale.customerEmail}
                        </p>
                    </div>
                    <div className="ml-auto font-mono text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                        +{formatCurrency(sale.amount)}
                    </div>
                </div>
            ))}
        </div>
    )
}

"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { updateOrderStatus } from "@/lib/api/orders"; // Ensure this matches export in api/orders.ts
import { Loader2 } from "lucide-react";
import { OrderStatus } from "@/lib/types";

interface Props {
    orderId: string;
    currentStatus: string;
}

export function OrderStatusSelector({ orderId, currentStatus }: Props) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);

    const handleStatusChange = async (value: string) => {
        setLoading(true);
        try {
            // Optimistic update
            setStatus(value);

            const result = await updateOrderStatus(orderId, { status: value as OrderStatus });

            if (result.error) {
                toast({ title: "Update failed", description: result.error, variant: "destructive" });
                setStatus(currentStatus); // Revert
            } else {
                toast({ title: "Status Updated", description: `Order marked as ${value}` });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
            setStatus(currentStatus);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-3 h-3 animate-spin text-white/40" />}
            <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
                <SelectTrigger className="w-[160px] h-9 text-xs uppercase tracking-widest bg-neutral-900 border-white/10 hover:bg-neutral-800">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    <SelectItem value="pending" className="text-xs uppercase tracking-wider focus:bg-white/10 focus:text-white">Pending</SelectItem>
                    <SelectItem value="processing" className="text-xs uppercase tracking-wider focus:bg-white/10 focus:text-white">Processing</SelectItem>
                    <SelectItem value="shipped" className="text-xs uppercase tracking-wider focus:bg-white/10 focus:text-white">Shipped</SelectItem>
                    <SelectItem value="delivered" className="text-xs uppercase tracking-wider focus:bg-white/10 focus:text-white">Delivered</SelectItem>
                    <SelectItem value="cancelled" className="text-xs uppercase tracking-wider focus:bg-white/10 focus:text-white text-red-500">Cancelled</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

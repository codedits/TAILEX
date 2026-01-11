"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { useFormatCurrency } from "@/context/StoreConfigContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

const CurrencyValue = ({ amount }: { amount: number }) => {
    const formatCurrency = useFormatCurrency();
    return <>{formatCurrency(amount)}</>;
};

export const columns: ColumnDef<Order>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => <div className="font-mono text-xs uppercase text-white/60">#{row.getValue<string>("id").slice(0, 8)}</div>,
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-white/5 text-white/60 hover:text-white"
                >
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-white/90">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue<string>("status")
            let color = "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
            if (status === 'delivered') color = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            if (status === 'shipped') color = "bg-blue-500/10 text-blue-400 border-blue-500/20";
            if (status === 'processing') color = "bg-amber-500/10 text-amber-400 border-amber-500/20";
            if (status === 'cancelled') color = "bg-red-500/10 text-red-400 border-red-500/20";

            return (
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} uppercase tracking-wide`}>
                    {status}
                </div>
            )
        },
    },
    {
        accessorKey: "total",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total"))
            return (
                <div className="text-right font-mono font-medium">
                    <CurrencyValue amount={amount} />
                </div>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: () => <div className="text-right">Date</div>,
        cell: ({ row }) => {
            return <div className="text-right text-xs text-white/40">{new Date(row.getValue("created_at")).toLocaleDateString()}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-white/60">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10">
                        <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)} className="text-white focus:bg-white/10">
                            Copy Order ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-white focus:bg-white/10" asChild>
                            <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                                    const { deleteOrderAction } = await import('@/app/admin/(dashboard)/orders/actions');
                                    const result = await deleteOrderAction(order.id);
                                    if (result.success) {
                                        window.location.reload();
                                    } else {
                                        alert(result.error || 'Failed to delete order');
                                    }
                                }
                            }}
                        >
                            Delete Order
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

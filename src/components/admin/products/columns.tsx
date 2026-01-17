"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown, Edit } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions"
import { useFormatCurrency } from "@/context/StoreConfigContext"

const PriceCell = ({ amount, saleAmount }: { amount: number, saleAmount?: number | null }) => {
    const formatCurrency = useFormatCurrency();
    return (
        <div className="flex flex-col">
            <span className="font-mono text-white/90">{formatCurrency(amount)}</span>
            {saleAmount && (
                <span className="text-emerald-400 text-[10px] font-mono">
                    {formatCurrency(saleAmount)}
                </span>
            )}
        </div>
    );
};

export const columns: ColumnDef<Product>[] = [
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
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-white/5 text-white/60 hover:text-white pl-0"
                >
                    Product
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex items-center gap-4">
                    {product.cover_image ? (
                        <img src={product.cover_image} alt={product.title} className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                    ) : (
                        <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                            <span className="text-white/20 text-[10px]">Img</span>
                        </div>
                    )}
                    <div>
                        <span className="font-medium text-white block truncate max-w-[200px]">{product.title}</span>
                        <span className="text-white/40 text-[10px] font-mono">{product.sku || 'NO SKU'}</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"))
            const salePrice = row.original.sale_price;

            return <PriceCell amount={price} saleAmount={salePrice} />
        },
    },
    {
        accessorKey: "stock",
        header: () => <div className="text-center">Stock</div>,
        cell: ({ row }) => {
            const stock = row.getValue<number>("stock") ?? 0;
            let color = "text-white/60";
            if (stock === 0) color = "text-red-400";
            else if (stock < 10) color = "text-amber-400";

            return <div className={`text-center font-mono ${color}`}>{stock}</div>
        }
    },
    {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
            const status = row.getValue<string>("status") || 'draft';
            let color = "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
            if (status === 'active') color = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            if (status === 'archived') color = "bg-red-500/10 text-red-400 border-red-500/20";
            if (status === 'draft') color = "bg-amber-500/10 text-amber-400 border-amber-500/20";

            return (
                <div className="flex justify-center">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${color} uppercase tracking-wider`}>
                        {status}
                    </div>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(product.id)}
                            className="text-white focus:bg-white/10"
                        >
                            Copy Product ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-white focus:bg-white/10" asChild>
                            <Link href={`/admin/products/${product.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Product
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                                    const result = await deleteProduct(product.id);
                                    if ('message' in result) {
                                        window.location.reload();
                                    } else {
                                        alert(result.error || 'Failed to delete product');
                                    }
                                }
                            }}
                        >
                            Delete Product
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

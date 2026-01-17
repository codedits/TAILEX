"use client"

import * as React from "react"
import Link from "next/link"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Eye, EyeOff } from "lucide-react"
import { deleteCollection } from "@/app/admin/(dashboard)/collections/actions"
import { useRouter } from "next/navigation"
import { useIsDesktop } from "@/hooks/use-media-query"
import { MobileCollectionCard } from "./MobileCollectionCard"
import { ActionDrawer, ActionDrawerAction } from "@/components/admin/ui/ActionDrawer"
import { Trash2, Copy } from "lucide-react"

interface Collection {
    id: string
    title: string
    slug: string
    image_url?: string | null
    is_visible: boolean
    sort_order?: number
}

interface CollectionTableClientProps {
    collections: Collection[]
    aspectRatio: number
}

export function CollectionTableClient({ collections, aspectRatio }: CollectionTableClientProps) {
    const router = useRouter()
    const isDesktop = useIsDesktop()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [selectedCollection, setSelectedCollection] = React.useState<Collection | null>(null)
    const [drawerOpen, setDrawerOpen] = React.useState(false)

    const columns: ColumnDef<Collection>[] = [
        {
            accessorKey: "title",
            header: "Collection",
            cell: ({ row }) => {
                const col = row.original
                return (
                    <div className="flex items-center gap-4">
                        {col.image_url ? (
                            <img
                                src={col.image_url}
                                alt={col.title}
                                className="object-cover rounded-xl border border-white/10"
                                style={{ width: 48, height: Math.round(48 / aspectRatio) }}
                            />
                        ) : (
                            <div
                                className="bg-white/5 rounded-xl border border-white/10"
                                style={{ width: 48, height: Math.round(48 / aspectRatio) }}
                            />
                        )}
                        <span className="text-white font-medium">{col.title}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "slug",
            header: "Slug",
            cell: ({ row }) => (
                <span className="text-white/50 text-sm font-mono">{row.original.slug}</span>
            ),
        },
        {
            accessorKey: "sort_order",
            header: () => <div className="text-center">Sort Order</div>,
            cell: ({ row }) => (
                <div className="text-center text-white/50 font-mono">{row.original.sort_order ?? 0}</div>
            ),
        },
        {
            accessorKey: "is_visible",
            header: "Visibility",
            cell: ({ row }) => {
                const col = row.original
                return col.is_visible ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Eye className="h-3 w-3 mr-1" /> Visible
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                        <EyeOff className="h-3 w-3 mr-1" /> Hidden
                    </span>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const col = row.original
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-white/60">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10">
                                <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="text-white focus:bg-white/10" asChild>
                                    <Link href={`/admin/collections/${col.id}?ratio=${aspectRatio}`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                    onClick={async () => {
                                        if (confirm('Delete this collection?')) {
                                            await deleteCollection(col.id)
                                            router.refresh()
                                        }
                                    }}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: collections,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    const handleActionClick = (collection: Collection) => {
        setSelectedCollection(collection)
        setDrawerOpen(true)
    }

    const actions: ActionDrawerAction[] = [
        {
            label: "Edit Collection",
            icon: <Edit className="h-5 w-5" />,
            onClick: () => {
                if (selectedCollection) {
                    router.push(`/admin/collections/${selectedCollection.id}?ratio=${aspectRatio}`)
                }
            },
        },
        {
            label: "Copy Collection ID",
            icon: <Copy className="h-5 w-5" />,
            onClick: () => {
                if (selectedCollection) {
                    navigator.clipboard.writeText(selectedCollection.id)
                }
            },
        },
        {
            label: "Delete Collection",
            icon: <Trash2 className="h-5 w-5" />,
            onClick: async () => {
                if (selectedCollection && confirm('Delete this collection?')) {
                    await deleteCollection(selectedCollection.id)
                    router.refresh()
                }
            },
            variant: "destructive",
        },
    ]

    return (
        <>
            <div className="space-y-4">
                {/* Filter */}
                <Input
                    placeholder="Filter collections..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
                    className="max-w-sm bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />

                {isDesktop ? (
                    <div className="border border-white/10 rounded-2xl bg-neutral-900/40 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/[0.02]">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-white/40 font-medium px-6 py-4">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-6 py-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-48 text-center text-white/30 text-sm">
                                            No collections created yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {collections.length > 0 ? (
                            collections.map((col) => (
                                <MobileCollectionCard
                                    key={col.id}
                                    collection={col}
                                    aspectRatio={aspectRatio}
                                    onActionClick={handleActionClick}
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-8 text-center text-white/30 text-sm">
                                No collections created yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ActionDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={selectedCollection?.title || "Collection Actions"}
                description={selectedCollection ? `/${selectedCollection.slug}` : undefined}
                actions={actions}
            />
        </>
    )
}

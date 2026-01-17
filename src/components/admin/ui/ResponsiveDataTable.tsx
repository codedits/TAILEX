"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table"
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useIsDesktop } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface ResponsiveDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterColumn?: string
    filterPlaceholder?: string
    // For mobile view, render a custom card component
    renderMobileCard?: (row: Row<TData>) => React.ReactNode
    // Optional loading state
    isLoading?: boolean
}

export function ResponsiveDataTable<TData, TValue>({
    columns,
    data,
    filterColumn = "title",
    filterPlaceholder = "Filter...",
    renderMobileCard,
}: ResponsiveDataTableProps<TData, TValue>) {
    const isDesktop = useIsDesktop()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full space-y-4">
            {/* Filter Bar - Same for both views */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center flex-1 gap-2">
                    <div className="relative max-w-sm w-full">
                        <Input
                            placeholder={filterPlaceholder}
                            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                            }
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20 focus:ring-0"
                        />
                    </div>
                </div>
                {isDesktop && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize text-white focus:bg-white/10"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Desktop: Table View */}
            {isDesktop ? (
                <div className="rounded-xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/5 sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                                        {headerGroup.headers.map((header, index) => {
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        "text-white/60 font-medium h-12",
                                                        // First column (after checkbox) is sticky
                                                        index === 1 && "sticky left-0 bg-neutral-900/95 backdrop-blur-sm z-[5]"
                                                    )}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="border-white/5 hover:bg-white/5 transition-colors group"
                                        >
                                            {row.getVisibleCells().map((cell, index) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        "text-white/80 py-3",
                                                        // First column (after checkbox) is sticky
                                                        index === 1 && "sticky left-0 bg-neutral-900/95 backdrop-blur-sm z-[5] group-hover:bg-neutral-800/95"
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center text-white/40"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                /* Mobile: Card View */
                <div className="space-y-3">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <div key={row.id}>
                                {renderMobileCard ? (
                                    renderMobileCard(row)
                                ) : (
                                    // Fallback if no custom card renderer provided
                                    <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-4">
                                        <p className="text-white/60 text-sm">
                                            No mobile card renderer provided
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-8 text-center text-white/40">
                            No results.
                        </div>
                    )}
                </div>
            )}

            {/* Pagination - Same for both views */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm text-white/40 order-2 md:order-1">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center gap-2 order-1 md:order-2 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-sm text-white/40 hidden md:block">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">Previous</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                        >
                            <span className="hidden md:inline">Next</span>
                            <ChevronRight className="h-4 w-4 md:ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

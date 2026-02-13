"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function SearchModal() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<{ products: any[]; collections: any[] }>({ products: [], collections: [] });
    const [loading, setLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const router = useRouter();
    const supabase = createClient();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Reset hasSearched when query changes to prevent stale empty state
    React.useEffect(() => {
        if (query.trim() === "") {
            setHasSearched(false);
        }
    }, [query]);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input when opening
    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults({ products: [], collections: [] });
                return;
            }

            setLoading(true);
            try {
                const [productsRes, collectionsRes] = await Promise.all([
                    supabase
                        .from('products')
                        .select('*')
                        .or(`title.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%,product_type.ilike.%${query.trim()}%`)
                        .eq('status', 'active')
                        .limit(5),
                    supabase
                        .from('collections')
                        .select('title, slug')
                        .ilike('title', `%${query.trim()}%`)
                        .eq('is_visible', true)
                        .limit(3)
                ]);

                setResults({
                    products: productsRes.data || [],
                    collections: collectionsRes.data || []
                });
                setHasSearched(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query, supabase]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <div ref={containerRef} className={cn("flex items-center", open ? "absolute inset-x-4 z-[100] md:relative md:inset-auto" : "relative z-10")}>
            <AnimatePresence mode="wait">
                {!open ? (
                    <motion.button
                        key="search-icon"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setOpen(true)}
                        className="hover:opacity-70 transition-opacity p-2"
                        aria-label="Open search"
                    >
                        <Search className="h-5 w-5" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="search-input"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex items-center w-full md:max-w-[300px] bg-white md:bg-neutral-50 rounded-full border border-neutral-200 overflow-visible shadow-lg md:shadow-none z-[110]"
                    >
                        <div className="flex items-center w-full px-3 h-10 relative">
                            <Search className="h-4 w-4 text-neutral-400 shrink-0 mr-2" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && query.trim()) {
                                        runCommand(() => router.push(`/shop?q=${encodeURIComponent(query)}`));
                                    }
                                }}
                                placeholder="Search..."
                                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-neutral-400 h-full w-full"
                            />
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-neutral-400 ml-2" />
                            ) : (
                                query && (
                                    <button onClick={() => setQuery('')} className="ml-2 hover:bg-neutral-200 rounded-full p-0.5">
                                        <X className="h-3 w-3 text-neutral-500" />
                                    </button>
                                )
                            )}
                            <button onClick={() => setOpen(false)} className="ml-2 bg-neutral-100 hover:bg-neutral-200 rounded-full p-1.5 md:hidden">
                                <X className="h-4 w-4 text-black" />
                            </button>
                        </div>

                        {/* Results Dropdown */}
                        <AnimatePresence>
                            {(query.trim().length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 md:w-[400px] mt-2 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-[120] p-2"
                                >
                                    <Command className="border-none" shouldFilter={false}>
                                        <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {loading ? (
                                                <div className="py-6 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Searching...</span>
                                                </div>
                                            ) : (hasSearched && results.products.length === 0 && results.collections.length === 0) ? (
                                                <div className="py-6 text-center text-sm text-neutral-500">
                                                    No results found.
                                                </div>
                                            ) : !hasSearched && query.trim() !== "" ? (
                                                <div className="py-6 text-center text-sm text-neutral-500">
                                                    Press enter to search...
                                                </div>
                                            ) : null}

                                            {results.collections.length > 0 && (
                                                <CommandGroup heading="Collections" className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2 py-1.5">
                                                    {results.collections.map((collection) => (
                                                        <CommandItem
                                                            key={collection.slug}
                                                            onSelect={() => runCommand(() => router.push(`/collection/${collection.slug}`))}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg aria-selected:bg-neutral-50 cursor-pointer"
                                                        >
                                                            <span className="text-sm font-medium text-black">{collection.title}</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            )}

                                            {results.products.length > 0 && (
                                                <CommandGroup heading="Products" className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2 py-1.5 mt-2">
                                                    {results.products.map((product) => (
                                                        <CommandItem
                                                            key={product.slug}
                                                            onSelect={() => runCommand(() => router.push(`/product/${product.slug}`))}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg aria-selected:bg-neutral-50 cursor-pointer group"
                                                        >
                                                            <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-neutral-100 border border-neutral-100 relative">
                                                                {product.cover_image ? (
                                                                    <img src={product.cover_image} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Search className="w-4 h-4 text-neutral-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-black group-hover:underline decoration-neutral-300 underline-offset-4">{product.title}</span>
                                                                <span className="text-[10px] uppercase tracking-wider text-neutral-500">{product.category || 'Product'}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            )}
                                        </CommandList>
                                    </Command>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Overlay Backdrop */}
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}
        </div>
    );
}

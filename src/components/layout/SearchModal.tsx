"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SearchModal() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{ products: any[]; collections: any[] }>({ products: [], collections: [] });
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
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
            .select('title, slug, cover_image')
            .ilike('title', `%${query}%`)
            .eq('status', 'active')
            .limit(5),
          supabase
            .from('collections')
            .select('title, slug')
            .ilike('title', `%${query}%`)
            .eq('is_visible', true)
            .limit(3)
        ]);

        setResults({
          products: productsRes.data || [],
          collections: collectionsRes.data || []
        });
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
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative group hover:opacity-70 transition-opacity"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Type to search products..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>

          {results.collections.length > 0 && (
            <CommandGroup heading="Collections">
              {results.collections.map((collection) => (
                <CommandItem
                  key={collection.slug}
                  onSelect={() => runCommand(() => router.push(`/collection/${collection.slug}`))}
                >
                  {collection.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.products.length > 0 && (
            <CommandGroup heading="Products">
              {results.products.map((product) => (
                <CommandItem
                  key={product.slug}
                  onSelect={() => runCommand(() => router.push(`/product/${product.slug}`))}
                >
                  <div className="flex items-center gap-2">
                    {product.cover_image && (
                      <div className="h-8 w-8 rounded overflow-hidden relative bg-muted">
                        {/* Using img for simplicity in cmdk, next/image can be tricky with focus trapping */}
                        <img src={product.cover_image} alt="" className="object-cover w-full h-full" />
                      </div>
                    )}
                    <span>{product.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {product.category || 'Product'}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

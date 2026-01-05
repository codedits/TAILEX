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

export function SearchModal() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

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

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  // Mock data - in a real app this would come from an API or context
  const products = [
    { name: "Relaxed Linen Jacket", category: "Jacket", href: "/product/relaxed-linen-jacket" },
    { name: "Classic Cotton Tee", category: "Tee", href: "/product/classic-cotton-tee" },
    { name: "Slim Fit Polo", category: "Polo", href: "/product/slim-fit-polo" },
    { name: "Oxford Shirt", category: "Shirts", href: "/product/oxford-shirt" },
  ];

  const collections = [
    { name: "New Arrivals", href: "/collection/new-arrivals" },
    { name: "Best Sellers", href: "/collection/best-sellers" },
    { name: "Accessories", href: "/collection/accessories" },
  ];

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
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Collections">
            {collections.map((collection) => (
              <CommandItem
                key={collection.href}
                onSelect={() => runCommand(() => router.push(collection.href))}
              >
                {collection.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Products">
            {products.map((product) => (
              <CommandItem
                key={product.href}
                onSelect={() => runCommand(() => router.push(product.href))}
              >
                {product.name}
                <span className="ml-2 text-xs text-muted-foreground">in {product.category}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

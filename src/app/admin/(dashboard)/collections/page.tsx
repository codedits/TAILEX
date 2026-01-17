import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TableSkeleton } from "@/components/admin/ui/TableSkeleton";
import { CollectionTableClient } from "@/components/admin/collections/CollectionTableClient";
import { StoreConfigService } from "@/services/config";

async function CollectionsTable({ aspectRatio }: { aspectRatio: number }) {
  const supabase = await createAdminClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <CollectionTableClient
      collections={collections || []}
      aspectRatio={aspectRatio}
    />
  );
}

export default async function CollectionsPage() {
  const config = await StoreConfigService.getStoreConfig();
  const aspectRatio = parseFloat(config.categoryGrid?.aspectRatio || "0.8");

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-1">
            Collections
          </h2>
          <p className="text-white/50 text-sm">
            Organize your products into logical groups.
          </p>
        </div>
        <Button
          asChild
          className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium"
        >
          <Link href={`/admin/collections/new?ratio=${aspectRatio}`}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create Collection</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <CollectionsTable aspectRatio={aspectRatio} />
      </Suspense>
    </div>
  );
}

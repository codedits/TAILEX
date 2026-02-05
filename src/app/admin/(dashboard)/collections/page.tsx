import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
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
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900 mb-1">
            Collections
          </h2>
          <p className="text-gray-500 text-sm">
            Manage your store's collections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/collections/new"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Homepage</span>
          </Link>
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
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <CollectionsTable aspectRatio={aspectRatio} />
      </Suspense>
    </div>
  );
}


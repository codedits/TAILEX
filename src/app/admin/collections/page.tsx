import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CollectionsPage() {
  const supabase = await createAdminClient();
  const { data: collections } = await supabase.from("collections").select("*").order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Collections</h2>
            <p className="text-white/50 text-sm">Organize your products into logical groups.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium">
          <Link href="/admin/collections/new">
            <Plus className="mr-2 h-4 w-4" /> Create Collection
          </Link>
        </Button>
      </div>

      <div className="border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40 font-medium px-6 py-4">Collection</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Slug</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Visibility</TableHead>
              <TableHead className="text-white/40 font-medium px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections && collections.length > 0 ? (
              collections.map((col) => (
                <TableRow key={col.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        {col.image_url ? (
                            <img src={col.image_url} alt={col.title} className="w-12 h-12 object-cover rounded-xl border border-white/10" />
                        ) : (
                            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10" />
                        )}
                        <span className="text-white font-medium">{col.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-white/50 text-sm font-mono">{col.slug}</TableCell>
                  <TableCell className="px-4">
                      {col.is_visible ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Visible</span>
                      ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">Hidden</span>
                      )}
                  </TableCell>
                  <TableCell className="px-6 text-right">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                          <Link href={`/admin/collections/${col.id}`}>
                            <Edit className="h-4 w-4 text-white/70" />
                          </Link>
                      </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-white/30 text-sm">
                  No collections created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

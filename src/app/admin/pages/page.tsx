import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, FileText, Globe } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createPage, deletePage } from "./actions";

export default async function PagesPage() {
  const supabase = await createAdminClient();
  const { data: pages } = await supabase.from("pages").select("*").order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Content Manager</h2>
            <p className="text-white/50 text-sm">Build and manage custom layouts for your storefront.</p>
        </div>
        <form action={createPage}>
            <Button type="submit" className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium">
            <Plus className="mr-2 h-4 w-4" /> Create New Page
            </Button>
        </form>
      </div>

      <div className="border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40 font-medium px-6 py-4 w-[400px]">Page Title</TableHead>
              <TableHead className="text-white/40 font-medium px-4">URL Slug</TableHead>
              <TableHead className="text-white/40 font-medium px-4 text-center">Status</TableHead>
              <TableHead className="text-white/40 font-medium px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages && pages.length > 0 ? (
              pages.map((page) => (
                <TableRow key={page.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/50">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-white">{page.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-white/70 font-mono text-sm">/{page.slug}</TableCell>
                  <TableCell className="px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${page.is_published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {page.is_published ? 'Live' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-white/5 hover:text-white rounded-lg">
                            <Link href={`/admin/pages/${page.id}`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        {page.is_published && (
                             <Button variant="ghost" size="icon" asChild className="hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg">
                                <Link href={`/${page.slug}`} target="_blank">
                                    <Globe className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                         <form action={async () => {
                             'use server';
                             await deletePage(page.id);
                         }}>
                            <Button variant="ghost" size="icon" className="text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                         </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-white/30 text-sm">
                  No custom pages created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

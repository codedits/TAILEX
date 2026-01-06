import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, Menu } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createMenu, deleteMenu } from "./actions";

export default async function NavigationPage() {
  const supabase = await createAdminClient();
  const { data: menus } = await supabase.from("navigation_menus").select("*").order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Navigation</h2>
            <p className="text-white/50 text-sm">Manage website menus and link structures.</p>
        </div>
        <form action={createMenu}>
            <Button type="submit" className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium">
                <Plus className="mr-2 h-4 w-4" /> Add Menu
            </Button>
        </form>
      </div>

      <div className="border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40 font-medium px-6 py-4 w-[400px]">Menu Title</TableHead>
              <TableHead className="text-white/40 font-medium px-4">Handle</TableHead>
              <TableHead className="text-white/40 font-medium px-4 text-center">Items</TableHead>
              <TableHead className="text-white/40 font-medium px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus && menus.length > 0 ? (
              menus.map((menu) => (
                <TableRow key={menu.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/50">
                            <Menu className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-white">{menu.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-white/70 font-mono text-sm">{menu.handle}</TableCell>
                  <TableCell className="px-4 text-center text-white/50">
                    {Array.isArray(menu.items) ? menu.items.length : 0} Links
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="hover:bg-white/5 hover:text-white rounded-lg">
                            <Link href={`/admin/navigation/${menu.id}`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                         <form action={async () => {
                             'use server';
                             await deleteMenu(menu.id);
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
                  No menus defined.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createAdminClient();
  
  // Fetch some basic stats
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  
  // Mock data for sales (in a real app, calculate from orders table)
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      icon: DollarSign,
      desc: "+20.1% from last month"
    },
    {
      title: "Products",
      value: productCount || 0,
      icon: Package,
      desc: "Active items in store"
    },
    {
      title: "Sales",
      value: "+12,234",
      icon: TrendingUp,
      desc: "+19% from last month"
    }
  ];

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Store Overview</h2>
            <p className="text-white/50 text-sm">Monitor your store's performance at a glance.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat, i) => (
                <Card key={i} className="bg-[#0A0A0A] border-white/10 rounded-xl overflow-hidden shadow-2xl hover:border-white/20 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-white/50">
                            {stat.title}
                        </CardTitle>
                        <div className="p-2 bg-white/5 rounded-full">
                            <stat.icon className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                        <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
                            {stat.desc}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}

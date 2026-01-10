import { StatsService } from "@/services/stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Overview } from "@/components/admin/dashboard/Overview";
import { RecentSales } from "@/components/admin/dashboard/RecentSales";
import { LowStockAlert } from "@/components/admin/dashboard/LowStockAlert";
import { Package, DollarSign, ShoppingBag, Activity } from "lucide-react";

export default async function AdminDashboard() {
  // Parallel Data Fetching
  const [stats, monthlyRevenue, recentSales, lowStockProducts] = await Promise.all([
    StatsService.getDashboardStats(),
    StatsService.getMonthlyRevenue(),
    StatsService.getRecentSales(),
    StatsService.getLowStockProducts()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white mb-1">
            Dashboard
          </h2>
          <p className="text-white/40 text-sm font-light tracking-wide">
            Overview of store performance
          </p>
        </div>
        {lowStockProducts.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Action Required</span>
          </div>
        )}
      </div>

      {/* Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Revenue",
            value: `PKR Rs.${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: stats.revenueChange,
            icon: DollarSign,
          },
          {
            title: "Orders",
            value: `+${stats.totalOrders}`,
            change: stats.ordersChange,
            icon: ShoppingBag,
          },
          {
            title: "Active Products",
            value: stats.activeProducts,
            sub: `out of ${stats.totalProducts}`,
            icon: Package,
          },
          {
            title: "Low Stock",
            value: stats.lowStockCount,
            sub: "Items need restocking",
            icon: Activity,
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl hover:bg-neutral-900/60 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-white/40 uppercase tracking-widest group-hover:text-white/70 transition-colors">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-light text-white tracking-tight">{stat.value}</div>
              {stat.change !== undefined ? (
                <p className="text-[10px] text-white/30 mt-1 font-mono">
                  <span className={stat.change > 0 ? "text-emerald-400/80" : "text-red-400/80"}>
                    {stat.change > 0 ? "+" : ""}{stat.change}%
                  </span>{" "}
                  from last month
                </p>
              ) : (
                <p className="text-[10px] text-white/30 mt-1 font-mono">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Overview Chart */}
        <Card className="lg:col-span-4 bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white font-light tracking-tight">Revenue Trend</CardTitle>
            <CardDescription className="text-white/20 font-mono text-xs">Monthly performance</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={monthlyRevenue} />
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="lg:col-span-3 bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white font-light tracking-tight">Recent Sales</CardTitle>
            <CardDescription className="text-white/20 font-mono text-xs">Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales sales={recentSales} />
          </CardContent>
        </Card>
      </div>

      <LowStockAlert products={lowStockProducts} />
    </div>
  );
}

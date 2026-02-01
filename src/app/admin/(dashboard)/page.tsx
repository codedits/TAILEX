import { StatsService } from "@/services/stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Overview } from "@/components/admin/dashboard/Overview";
import { RecentSales } from "@/components/admin/dashboard/RecentSales";
import { LowStockAlert } from "@/components/admin/dashboard/LowStockAlert";
import { DashboardProgress } from "@/components/admin/dashboard/DashboardProgress";
import { Package, DollarSign, ShoppingBag, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";

export default async function AdminDashboard() {
  // Parallel Data Fetching
  const [stats, monthlyRevenue, recentSales, lowStockProducts, storeConfig] = await Promise.all([
    StatsService.getDashboardStats(),
    StatsService.getMonthlyRevenue(),
    StatsService.getRecentSales(),
    StatsService.getLowStockProducts(),
    StoreConfigService.getStoreConfig()
  ]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-2">
            Dashboard
          </h2>
          <p className="text-white/40 text-sm font-light tracking-wide">
            Welcome back. Here's what's happening efficiently.
          </p>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full w-fit backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-red-400 uppercase tracking-widest">Action Required</span>
          </div>
        )}
      </div>

      {/* Primary Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue, storeConfig.currency),
            change: stats.revenueChange,
            icon: DollarSign,
            gradient: "from-purple-500/20 to-blue-500/20"
          },
          {
            title: "Orders",
            value: `+${stats.totalOrders}`,
            change: stats.ordersChange,
            icon: ShoppingBag,
            gradient: "from-emerald-500/20 to-teal-500/20"
          },
          {
            title: "Active Products",
            value: stats.activeProducts,
            sub: `out of ${stats.totalProducts}`,
            icon: Package,
            gradient: "from-orange-500/20 to-red-500/20"
          },
          {
            title: "Low Stock",
            value: stats.lowStockCount,
            sub: "Items need restocking",
            icon: Activity,
            gradient: "from-pink-500/20 to-rose-500/20"
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl overflow-hidden relative group hover:border-white/10 transition-colors">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs font-medium text-white/40 uppercase tracking-widest group-hover:text-white/70 transition-colors">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-white/20 group-hover:text-white/80 transition-colors" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-light text-white tracking-tight">{stat.value}</div>
              {stat.change !== undefined ? (
                <p className="text-[10px] text-white/30 mt-2 font-mono flex items-center gap-1">
                  <span className={`${stat.change > 0 ? "text-emerald-400" : "text-red-400"} flex items-center`}>
                    {stat.change > 0 ? "+" : ""}{stat.change}%
                  </span>
                  <span>from last month</span>
                </p>
              ) : (
                <p className="text-[10px] text-white/30 mt-2 font-mono">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">

        {/* Left Column (Charts) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue Overview */}
          <Card className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white font-light tracking-tight">Revenue Trend</CardTitle>
              <CardDescription className="text-white/20 font-mono text-xs">Monthly performance over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <Overview data={monthlyRevenue} />
            </CardContent>
          </Card>

          {/* New Progress Tracking */}
          <DashboardProgress
            revenueCurrent={stats.totalRevenue}
            ordersCurrent={stats.totalOrders}
          />
        </div>

        {/* Right Column (Lists) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl h-full">
            <CardHeader>
              <CardTitle className="text-white font-light tracking-tight">Recent Sales</CardTitle>
              <CardDescription className="text-white/20 font-mono text-xs">Latest transactions from your store</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales sales={recentSales} />
            </CardContent>
          </Card>
        </div>
      </div>

      <LowStockAlert products={lowStockProducts} />
    </div>
  );
}

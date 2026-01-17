import { createAdminClient } from '@/lib/supabase/admin';
import { unstable_cache } from 'next/cache';
import { Order, Product } from '@/lib/types';

export type DashboardStats = {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    activeProducts: number;
    lowStockCount: number;
    revenueChange: number; // Percentage change vs last month
    ordersChange: number;
};

export type MonthlyRevenue = {
    name: string; // "Jan", "Feb"
    total: number;
};

export type RecentSale = {
    id: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    avatarUrl?: string; // or fallback
    status: string;
};

export const StatsService = {
    getDashboardStats: unstable_cache(
        async (): Promise<DashboardStats> => {
            const supabase = await createAdminClient();

            // Parallel queries for speed
            const now = new Date();
            const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

            const [
                { data: orders },
                { data: products },
                { count: productCount }
            ] = await Promise.all([
                // Fetch only last two months for change calculation
                supabase.from('orders')
                    .select('total, created_at')
                    .neq('status', 'cancelled')
                    .gte('created_at', firstDayLastMonth),
                // Still need product status for counts, but maybe we can just count in DB?
                // For now, let's limit the product fetch if it's too huge, or select only needed fields.
                supabase.from('products').select('stock, status'),
                supabase.from('products').select('*', { count: 'exact', head: true })
            ]);


            const safeOrders = orders || [];
            const safeProducts = products || [];

            // Calculate Revenue & Order Counts
            const totalRevenue = safeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
            const totalOrders = safeOrders.length;
            const totalProducts = productCount || 0;
            const activeProducts = safeProducts.filter(p => p.status === 'active').length;
            const lowStockCount = safeProducts.filter(p => (p.stock || 0) < 10 && p.status === 'active').length;

            // Calculate "Change vs Last Month" using already fetched data
            const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const firstDayLastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const currentMonthOrders = safeOrders.filter(o => new Date(o.created_at) >= firstDayCurrentMonth);
            const lastMonthOrders = safeOrders.filter(o => {
                const orderDate = new Date(o.created_at);
                return orderDate >= firstDayLastMonthDate && orderDate < firstDayCurrentMonth;
            });


            const currentRevenue = currentMonthOrders.reduce((s, o) => s + (o.total || 0), 0);
            const lastRevenue = lastMonthOrders.reduce((s, o) => s + (o.total || 0), 0);

            const revenueChange = lastRevenue === 0
                ? (currentRevenue === 0 ? 0 : 100)
                : ((currentRevenue - lastRevenue) / lastRevenue) * 100;

            const ordersChange = lastMonthOrders.length === 0
                ? (currentMonthOrders.length === 0 ? 0 : 100)
                : ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;

            return {
                totalRevenue,
                totalOrders,
                totalProducts,
                activeProducts,
                lowStockCount,
                revenueChange: Math.round(revenueChange),
                ordersChange: Math.round(ordersChange)
            };
        },
        ['dashboard-stats'],
        { tags: ['orders', 'products'], revalidate: 3600 }
    ),

    getMonthlyRevenue: unstable_cache(
        async (): Promise<MonthlyRevenue[]> => {
            const supabase = await createAdminClient();
            const thisYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
            const { data: orders } = await supabase
                .from('orders')
                .select('total, created_at')
                .neq('status', 'cancelled')
                .gte('created_at', thisYear)
                .order('created_at', { ascending: true });


            if (!orders) return [];

            const revenueByMonth: Record<string, number> = {};

            orders.forEach(order => {
                const date = new Date(order.created_at);
                const month = date.toLocaleString('default', { month: 'short' }); // "Jan"
                revenueByMonth[month] = (revenueByMonth[month] || 0) + (order.total || 0);
            });

            // Ensure standard month order provided manually or map/sort
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            return months.map(m => ({
                name: m,
                total: revenueByMonth[m] || 0
            }));
        },
        ['monthly-revenue'],
        { tags: ['orders'], revalidate: 3600 }
    ),

    getRecentSales: async (limit: number = 5): Promise<RecentSale[]> => {
        const supabase = await createAdminClient();
        const { data: orders } = await supabase
            .from('orders')
            .select(`
            id, total, email, status, created_at,
            billing_address,
            customer:customer_id ( first_name, last_name, email )
        `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (!orders) return [];

        return orders.map(order => {
            // Fallback for customer name
            const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
            const firstName = (order.billing_address as any)?.first_name || customer?.first_name || 'Guest';
            const lastName = (order.billing_address as any)?.last_name || customer?.last_name || 'User';

            return {
                id: order.id,
                amount: order.total,
                customerName: `${firstName} ${lastName}`,
                customerEmail: order.email || customer?.email || '',
                status: order.status
            };
        });
    },

    getLowStockProducts: async (limit: number = 5): Promise<Product[]> => {
        const supabase = await createAdminClient();
        const { data } = await supabase
            .from('products')
            .select('*')
            .lt('stock', 10)
            .eq('status', 'active')
            .order('stock', { ascending: true })
            .limit(limit);

        return (data || []) as Product[];
    }
};

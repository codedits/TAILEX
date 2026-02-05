import { Suspense } from "react";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { TableSkeleton } from "@/components/admin/ui/TableSkeleton";

export default function AnalyticsPage() {
    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
            <div>
                <h2 className="text-3xl font-light tracking-tight text-gray-900">Analytics</h2>
                <p className="text-sm text-gray-500 mt-1">Overview of your store performance</p>
            </div>
            <Suspense fallback={<TableSkeleton rows={4} />}>
                <AnalyticsDashboard />
            </Suspense>
        </div>
    );
}


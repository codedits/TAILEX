import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navbar Skeleton */}
            <div className="h-20 border-b border-white/10 px-6 md:px-12 flex items-center justify-between">
                <Skeleton className="h-8 w-32 bg-neutral-800" />
                <div className="hidden md:flex gap-8">
                    <Skeleton className="h-4 w-20 bg-neutral-800" />
                    <Skeleton className="h-4 w-20 bg-neutral-800" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full bg-neutral-800" />
            </div>

            {/* Hero Skeleton (Sticky Stacking Effect placeholder) */}
            <div className="relative h-[60vh] w-full bg-neutral-900 overflow-hidden">
                <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                    <Skeleton className="h-16 w-3/4 max-w-xl mb-4 bg-neutral-800" />
                    <Skeleton className="h-6 w-1/2 max-w-md bg-neutral-800" />
                </div>
            </div>

            {/* Breadcrumb Skeleton */}
            <div className="px-6 md:px-12 pt-8">
                <Skeleton className="h-4 w-48 bg-neutral-800" />
            </div>

            <div className="px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar Skeleton */}
                <div className="hidden lg:block space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full bg-neutral-800" />
                        <Skeleton className="h-4 w-3/4 bg-neutral-800" />
                        <Skeleton className="h-4 w-5/6 bg-neutral-800" />
                    </div>
                    <div className="space-y-4 pt-8">
                        <Skeleton className="h-4 w-full bg-neutral-800" />
                        <Skeleton className="h-4 w-3/4 bg-neutral-800" />
                    </div>
                </div>

                {/* Product Grid Skeleton - Exact Dimensions of Cards */}
                <div className="lg:col-span-3">
                    <div className="flex justify-between mb-8">
                        <Skeleton className="h-10 w-32 bg-neutral-800" />
                        <Skeleton className="h-10 w-48 bg-neutral-800" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                {/* Aspect Ratio 3:4 for Product Card */}
                                <Skeleton className="w-full aspect-[3/4] rounded-sm bg-neutral-900" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4 bg-neutral-800" />
                                    <Skeleton className="h-4 w-1/4 bg-neutral-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

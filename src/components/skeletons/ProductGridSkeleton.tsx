import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for Product Grid section during Suspense streaming
 * Matches ProductGridSection layout without JS
 */
export function ProductGridSkeleton() {
    return (
        <section className="relative w-full bg-background overflow-hidden z-10 section-fade-in">
            <div
                className="flex flex-col items-center justify-center w-full"
                style={{ maxWidth: '1920px', margin: '0 auto' }}
            >
                <div className="w-full px-6 md:px-10 py-24 md:py-[150px] flex flex-col gap-16 md:gap-20">

                    {/* Section Header Skeleton */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 w-full border-b border-foreground/10 pb-12">
                        {/* Title Skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-64" />
                            <Skeleton className="h-16 w-48" />
                        </div>

                        {/* Description Skeleton */}
                        <div className="md:w-1/3 space-y-3">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-5/6" />
                            <Skeleton className="h-5 w-4/6" />
                            <Skeleton className="h-4 w-32 mt-6" />
                        </div>
                    </div>

                    {/* Product Grid Skeleton - 3 products */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-[3/4] w-full" />
                                <div className="flex flex-col items-center space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductGridSkeleton;

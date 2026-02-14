import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for Product Grid section during Suspense streaming
 * Matches ProductGridSection layout without JS
 */
export function ProductGridSkeleton() {
    return (
        <section className="relative w-full h-[70vh] bg-black/5 overflow-hidden z-10 animate-pulse">
            <div className="flex items-center justify-center h-full w-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-48 bg-neutral-200 rounded" />
                    <div className="h-4 w-32 bg-neutral-100 rounded" />
                </div>
            </div>
        </section>
    );
}

export default ProductGridSkeleton;

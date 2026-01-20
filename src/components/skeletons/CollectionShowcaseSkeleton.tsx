import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for Collection Showcase section during Suspense streaming
 * Matches the visual layout of CollectionShowcase without JS
 */
export function CollectionShowcaseSkeleton() {
    return (
        <section className="w-full flex flex-col relative z-10">
            {/* Hero Image Placeholder */}
            <div className="relative w-full h-[100dvh] min-h-[600px] overflow-hidden bg-neutral-100">
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />

                {/* Text Placeholder - Matches CollectionShowcase content layout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-6 p-12">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <Skeleton className="h-16 w-64 mx-auto" />
                        <Skeleton className="h-6 w-96 max-w-full mx-auto" />
                        <Skeleton className="h-4 w-32 mx-auto mt-8" />
                    </div>
                </div>
            </div>

            {/* Product Grid Carousel Placeholder */}
            <div className="relative w-full py-4 md:py-8 px-4 md:px-8 bg-background border-t border-neutral-100">
                <div className="mb-6 md:mb-8 flex justify-end items-center px-2">
                    <Skeleton className="h-4 w-32" />
                </div>

                <div className="flex gap-4 md:gap-6 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 basis-[80%] sm:basis-[50%] md:basis-[40%] lg:basis-[30%] xl:basis-[25%]"
                        >
                            <div className="space-y-4">
                                <Skeleton className="aspect-[3/4] w-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4 mx-auto" />
                                    <Skeleton className="h-4 w-1/4 mx-auto" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CollectionShowcaseSkeleton;

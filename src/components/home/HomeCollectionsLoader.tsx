import { Collection } from "@/lib/types";
import CollectionShowcase from "@/components/collection/CollectionShowcase";

interface HomeCollectionsLoaderProps {
    collectionsPromise: Promise<Collection[]>;
    startIndex?: number;
}

/**
 * Server Component that awaits collections and renders them.
 * This allows the parent to stream this content via Suspense.
 */
export async function HomeCollectionsLoader({ collectionsPromise, startIndex = 0 }: HomeCollectionsLoaderProps) {
    const collections = await collectionsPromise;

    // If we want to skip the first one (because it might be rendered differently or earlier), we can slice
    const displayCollections = startIndex > 0 ? collections.slice(startIndex) : collections;

    if (!displayCollections || displayCollections.length === 0) return null;

    return (
        <div className="relative flex flex-col items-center justify-center w-full overflow-hidden">
            {displayCollections.map((collection) => (
                <CollectionShowcase
                    key={collection.id}
                    title={collection.title}
                    description={collection.description || ""}
                    coverImage={collection.image_url || ""}
                    products={collection.products || []}
                    collectionHref={`/collection/${collection.slug}`}
                    className="mb-0"
                />
            ))}
        </div>
    );
}

/**
 * Loader for just the FIRST collection, useful for priority rendering
 */
export async function FirstCollectionLoader({ collectionsPromise }: { collectionsPromise: Promise<Collection[]> }) {
    const collections = await collectionsPromise;
    const firstCollection = collections[0];

    if (!firstCollection) return null;

    return (
        <CollectionShowcase
            title={firstCollection.title}
            description={firstCollection.description || ""}
            coverImage={firstCollection.image_url || ""}
            products={firstCollection.products || []}
            collectionHref={`/collection/${firstCollection.slug}`}
            className="mb-0"
        />
    );
}

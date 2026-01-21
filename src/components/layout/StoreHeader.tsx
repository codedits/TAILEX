import { StoreConfigService } from '@/services/config';
import Navbar from '@/components/layout/Navbar';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { TopCollectionStrip } from '@/components/sections/TopCollectionStrip';

interface StoreHeaderProps {
    firstCollection?: {
        title: string;
        slug: string;
    } | null;
}

export async function StoreHeader({ firstCollection }: StoreHeaderProps) {
    const config = await StoreConfigService.getStoreConfig();

    return (
        <div className="relative z-50">
            {firstCollection && (
                <TopCollectionStrip 
                    collectionName={firstCollection.title}
                    collectionSlug={firstCollection.slug}
                />
            )}
            
            {config.brand.showAnnouncement && config.brand.announcement && (
                <AnnouncementBar text={config.brand.announcement} />
            )}
            <Navbar
                brandName={config.brand.name}
                navItems={config.navigation.main}
            />
        </div>
    );
}

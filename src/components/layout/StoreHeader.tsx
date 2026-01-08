import { StoreConfigService } from '@/services/config';
import Navbar from '@/components/layout/Navbar';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';

export async function StoreHeader() {
    const config = await StoreConfigService.getStoreConfig();

    return (
        <>
            {config.brand.showAnnouncement && config.brand.announcement && (
                <AnnouncementBar text={config.brand.announcement} />
            )}
            <Navbar
                brandName={config.brand.name}
                navItems={config.navigation.main}
            />
        </>
    );
}

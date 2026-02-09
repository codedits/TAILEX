import { Suspense } from 'react';
import Footer from '@/components/layout/Footer';
import { StoreConfigService } from '@/services/config';
import { FooterSkeleton } from '@/components/skeletons/FooterSkeleton';
import { StoreProviders } from '@/components/layout/StoreProviders';
import { SmoothScroll } from '@/components/layout/SmoothScroll';

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const config = await StoreConfigService.getStoreConfig();
    const footerConfig = config.footer;
    const brand = config.brand;
    const socialConfig = config.social;

    return (
        <StoreProviders>
            <SmoothScroll>
                <div className="flex flex-col min-h-screen">
                    <div className="flex-grow">
                        {children}
                    </div>
                    <Suspense fallback={<FooterSkeleton />}>
                        <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
                    </Suspense>
                </div>
            </SmoothScroll>
        </StoreProviders>
    );
}

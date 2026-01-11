import { StoreHeader } from "@/components/layout/StoreHeader";
import Footer from "@/components/layout/Footer";
import { getBrandConfig, getFooterConfig, getSocialConfig } from "@/lib/theme";

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [brand, footerConfig, socialConfig] = await Promise.all([
        getBrandConfig(),
        getFooterConfig(),
        getSocialConfig(),
    ]);

    return (
        <>
            <StoreHeader />
            <main className="min-h-screen pt-[var(--header-height,80px)]">
                {children}
            </main>
            <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
        </>
    );
}

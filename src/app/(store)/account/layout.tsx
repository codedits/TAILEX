import { StoreHeader } from "@/components/layout/StoreHeader";

import { getBrandConfig, getFooterConfig, getSocialConfig } from "@/lib/theme";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Account | TAILEX",
    robots: {
        index: false,
        follow: false,
    }
}

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
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                    {/* Page Header - Optional, can be dynamic per page if needed, but keeping simple for now */}

                    <div className="flex flex-col lg:flex-row gap-12">
                        <AccountSidebar />
                        <div className="flex-1 min-w-0">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

        </>
    );
}

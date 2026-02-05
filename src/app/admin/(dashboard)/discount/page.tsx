import { StoreConfigService } from '@/services/config';
import { DiscountForm } from './discount-form';

export const metadata = {
    title: 'Global Discount | TAILEX Admin',
};

export default async function DiscountPage() {
    const config = await StoreConfigService.getStoreConfig();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-1">
                    Discounts
                </h2>
                <p className="text-gray-500 text-sm font-light tracking-wide">
                    Configure a popup discount offer for your visitors.
                </p>
            </div>

            <DiscountForm initialConfig={config.globalDiscount} />
        </div>
    );
}


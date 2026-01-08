import { StoreConfigService } from '@/services/config';
import { StoreConfigForm } from '@/components/admin/settings/StoreConfigForm';

export const metadata = {
    title: 'Store Settings | TAILEX Admin',
};

export default async function SettingsPage() {
    const config = await StoreConfigService.getStoreConfig();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>
            <StoreConfigForm initialConfig={config} />
        </div>
    );
}

import { StoreConfigService } from '@/services/config';
import { StoreConfigForm } from '@/components/admin/settings/StoreConfigForm';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const metadata = {
    title: 'Store Settings | TAILEX Admin',
};

export default async function SettingsPage() {
    const config = await StoreConfigService.getStoreConfig();

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-light tracking-tight text-gray-900">Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure your store appearance and behavior</p>
                </div>
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50 border border-border text-gray-700 rounded-lg transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Preview Changes
                </Link>
            </div>
            <StoreConfigForm initialConfig={config} />
        </div>
    );
}


'use client'

import { useState } from 'react';
import { updateStoreConfigAction } from '@/actions/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { StoreConfig } from '@/services/config';

interface StoreConfigFormProps {
    initialConfig: StoreConfig;
}

export function StoreConfigForm({ initialConfig }: StoreConfigFormProps) {
    const [config, setConfig] = useState(initialConfig);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (section: keyof StoreConfig) => {
        setIsSaving(true);
        const result = await updateStoreConfigAction(section, config[section]);
        setIsSaving(false);

        if (result.success) {
            toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`);
        } else {
            toast.error('Failed to save settings');
        }
    };

    return (
        <Tabs defaultValue="brand" className="space-y-4">
            <TabsList>
                <TabsTrigger value="brand">Brand & Identity</TabsTrigger>
                <TabsTrigger value="theme">Theme & Design</TabsTrigger>
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="currency">Currency</TabsTrigger>
                <TabsTrigger value="navigation">Navigation</TabsTrigger>
            </TabsList>

            <TabsContent value="brand">
                <Card>
                    <CardHeader>
                        <CardTitle>Brand Settings</CardTitle>
                        <CardDescription>Manage your store's identity and basic information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Store Name</Label>
                            <Input
                                value={config.brand.name}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input
                                value={config.brand.tagline}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, tagline: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Announcement Bar</Label>
                            <Input
                                value={config.brand.announcement}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, announcement: e.target.value } })}
                                placeholder="e.g. Free shipping over $100"
                            />
                        </div>
                        <Button onClick={() => handleSave('brand')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Brand Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="theme">
                <Card>
                    <CardHeader>
                        <CardTitle>Theme Settings</CardTitle>
                        <CardDescription>Customize the look and feel of your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Primary Color</Label>
                                <div className="flex gap-2">
                                    <div
                                        className="w-10 h-10 rounded border"
                                        style={{ backgroundColor: config.theme.primaryColor }}
                                    />
                                    <Input
                                        value={config.theme.primaryColor}
                                        onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primaryColor: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Font Family</Label>
                                <Input
                                    value={config.theme.font}
                                    onChange={(e) => setConfig({ ...config, theme: { ...config.theme, font: e.target.value } })}
                                />
                            </div>
                        </div>
                        <Button onClick={() => handleSave('theme')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Theme Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="currency">
                <Card>
                    <CardHeader>
                        <CardTitle>Currency Settings</CardTitle>
                        <CardDescription>Set the currency used for product pricing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Currency Code (ISO)</Label>
                                <Input
                                    value={config.currency?.code || 'USD'} // Safe access with fallback
                                    onChange={(e) => setConfig({ ...config, currency: { ...(config.currency || { symbol: '$' }), code: e.target.value } })}
                                    placeholder="USD"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency Symbol</Label>
                                <Input
                                    value={config.currency?.symbol || '$'} // Safe access with fallback
                                    onChange={(e) => setConfig({ ...config, currency: { ...(config.currency || { code: 'USD' }), symbol: e.target.value } })}
                                    placeholder="$"
                                />
                            </div>
                        </div>
                        <Button onClick={() => handleSave('currency')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Currency Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="hero">
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>Configure the main homepage banner.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Heading</Label>
                            <Input
                                value={config.hero?.heading || ''}
                                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })}
                                placeholder="e.g. Winter Collection"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subheading</Label>
                            <Input
                                value={config.hero?.subheading || ''}
                                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subheading: e.target.value } })}
                                placeholder="e.g. Discover the new trends"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hero Image URL</Label>
                            <Input
                                value={config.hero?.image || ''}
                                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, image: e.target.value } })}
                                placeholder="https://..."
                            />
                            {config.hero?.image && (
                                <img src={config.hero.image} alt="Hero Preview" className="w-full h-48 object-cover rounded-md border border-white/10 mt-2" />
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CTA Text</Label>
                                <Input
                                    value={config.hero?.ctaText || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaText: e.target.value } })}
                                    placeholder="Shop Now"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>CTA Link</Label>
                                <Input
                                    value={config.hero?.ctaLink || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaLink: e.target.value } })}
                                    placeholder="/collection/all"
                                />
                            </div>
                        </div>
                        <Button onClick={() => handleSave('hero')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Hero Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="benefits">
                <Card>
                    <CardHeader>
                        <CardTitle>Benefits Strip</CardTitle>
                        <CardDescription>Value propositions displayed on the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="benefits-enabled"
                                checked={config.benefits?.enabled ?? true}
                                onChange={(e) => setConfig({
                                    ...config,
                                    benefits: {
                                        items: config.benefits?.items || [],
                                        enabled: e.target.checked
                                    }
                                })}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="benefits-enabled">Enable Benefits Strip</Label>
                        </div>

                        {config.benefits?.items?.map((item, index) => (
                            <div key={index} className="grid grid-cols-[100px_1fr] gap-2 items-center border p-2 rounded-lg border-white/5">
                                <select
                                    className="bg-black border border-white/10 rounded px-2 py-1 text-sm h-9"
                                    value={item.icon}
                                    onChange={(e) => {
                                        const newItems = [...(config.benefits?.items || [])];
                                        // @ts-ignore
                                        newItems[index] = { ...item, icon: e.target.value };
                                        setConfig({ ...config, benefits: { ...config.benefits!, items: newItems } });
                                    }}
                                >
                                    <option value="truck">Truck</option>
                                    <option value="rotate">Return</option>
                                    <option value="shield">Shield</option>
                                    <option value="headphones">Support</option>
                                    <option value="star">Star</option>
                                    <option value="gift">Gift</option>
                                </select>
                                <Input
                                    value={item.text}
                                    onChange={(e) => {
                                        const currentItems = config.benefits?.items || [];
                                        const newItems: { icon: string; text: string }[] = [...currentItems];
                                        if (newItems[index]) {
                                            newItems[index] = { ...newItems[index], text: e.target.value };
                                            setConfig({
                                                ...config,
                                                benefits: {
                                                    enabled: config.benefits?.enabled ?? true,
                                                    items: newItems
                                                }
                                            });
                                        }
                                    }}
                                    placeholder="Benefit text"
                                />
                            </div>
                        ))}

                        <Button onClick={() => handleSave('benefits')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Benefits Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="navigation">
                <Card>
                    <CardHeader>
                        <CardTitle>Navigation</CardTitle>
                        <CardDescription>Configure main menu and footer links.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            You can manage the full navigation structures in the designated section.
                        </p>
                        <Button variant="outline" asChild>
                            <a href="/admin/navigation">Go to Navigation Manager</a>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

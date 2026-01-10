'use client'

import { useState } from 'react';
import { updateStoreConfigAction, uploadSiteAsset, deleteSiteAsset } from '@/actions/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Trash2, Crop as CropIcon } from 'lucide-react';
import { ImageCropper } from '@/components/ui/image-cropper';
import { StoreConfig } from '@/services/config';
import { convertFileToWebP } from '@/lib/image-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StoreConfigFormProps {
    initialConfig: StoreConfig;
}

export function StoreConfigForm({ initialConfig }: StoreConfigFormProps) {
    const [config, setConfig] = useState(initialConfig);
    const [isSaving, setIsSaving] = useState(false);

    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [tempCropImage, setTempCropImage] = useState<string | null>(null);

    const handleSave = async (section: keyof StoreConfig) => {
        setIsSaving(true);
        let currentConfig = { ...config };



        // ...

        // Handle File Upload for Hero
        if (section === 'hero' && heroFile) {
            const formData = new FormData();

            try {
                toast.loading('Optimizing image...');
                const webpFile = await convertFileToWebP(heroFile, 0.9); // High quality for hero
                formData.append('file', webpFile);
            } catch (error) {
                console.error('WebP conversion failed', error);
                formData.append('file', heroFile); // Fallback
            }

            toast.loading('Uploading image...');
            const uploadRes = await uploadSiteAsset(formData);

            if (uploadRes.success && uploadRes.url) {
                currentConfig = {
                    ...currentConfig,
                    hero: { ...currentConfig.hero, image: uploadRes.url }
                };
                setConfig(currentConfig); // Update local state with new URL
                setHeroFile(null); // Clear file input
            } else {
                toast.error(uploadRes.error || 'Failed to upload image');
                setIsSaving(false);
                return;
            }
        }

        const result = await updateStoreConfigAction(section, currentConfig[section]);
        setIsSaving(false);

        if (result.success) {
            toast.dismiss();
            toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`);
        } else {
            toast.dismiss();
            toast.error(result.error || 'Failed to save settings');
        }
    };

    return (
        <Tabs defaultValue="brand" className="space-y-4">
            <TabsList>
                <TabsTrigger value="brand">Brand & Identity</TabsTrigger>
                {/* Theme moved to /admin/theme */}
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="categoryGrid">Collections</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="currency">Currency</TabsTrigger>
                {/* Navigation moved to /admin/navigation */}
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
                                value={config.brand.name || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input
                                value={config.brand.tagline || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, tagline: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Announcement Bar</Label>
                            <Input
                                value={config.brand.announcement || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, announcement: e.target.value } })}
                                placeholder="e.g. Free shipping over Rs. 10,000"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="show-announcement"
                                checked={config.brand.showAnnouncement || false}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, showAnnouncement: e.target.checked } })}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="show-announcement">Show Announcement Bar</Label>
                        </div>
                        <Button onClick={() => handleSave('brand')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Brand Settings'}
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
                            <div className="col-span-2 space-y-2">
                                <Label>Preset Currencies</Label>
                                <Select onValueChange={(val) => {
                                    const presets: Record<string, { code: string, symbol: string }> = {
                                        'PKR': { code: 'PKR', symbol: 'Rs.' },
                                        'USD': { code: 'USD', symbol: '$' },
                                        'GBP': { code: 'GBP', symbol: '£' },
                                        'EUR': { code: 'EUR', symbol: '€' },
                                        'AED': { code: 'AED', symbol: 'د.إ' }
                                    };
                                    if (presets[val]) {
                                        setConfig({ ...config, currency: presets[val] });
                                    }
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a preset..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Currency Code (ISO)</Label>
                                <Input
                                    value={config.currency?.code ?? ''}
                                    onChange={(e) => setConfig({ ...config, currency: { ...(config.currency || { symbol: 'Rs.' }), code: e.target.value } })}
                                    placeholder="PKR"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency Symbol</Label>
                                <Input
                                    value={config.currency?.symbol ?? ''}
                                    onChange={(e) => setConfig({ ...config, currency: { ...(config.currency || { code: 'PKR' }), symbol: e.target.value } })}
                                    placeholder="Rs."
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
                        <div className="space-y-4">
                            <Label>Hero Image</Label>

                            {(config.hero?.image || heroFile) ? (
                                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 group">
                                    <img
                                        src={heroFile ? URL.createObjectURL(heroFile) : config.hero?.image}
                                        alt="Hero Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="rounded-full w-10 h-10"
                                            onClick={() => setTempCropImage(heroFile ? URL.createObjectURL(heroFile) : config.hero?.image || null)}
                                        >
                                            <CropIcon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="rounded-full w-10 h-10"
                                            onClick={async () => {
                                                if (heroFile) {
                                                    setHeroFile(null);
                                                } else if (config.hero?.image) {
                                                    if (confirm('Are you sure you want to delete this image?')) {
                                                        await deleteSiteAsset(config.hero!.image!);
                                                        setConfig({ ...config, hero: { ...config.hero, image: '' } });
                                                        toast.success('Image deleted');
                                                    }
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/30 transition-all bg-black/20 hover:bg-white/5">
                                    <Upload className="w-8 h-8 text-white/40 mb-2" />
                                    <span className="text-sm text-white/40 font-light">Drop image or click to upload</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files[0];
                                                setTempCropImage(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                            )}

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">OR</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            <Input
                                value={config.hero?.image || ''}
                                onChange={(e) => setConfig({ ...config, hero: { ...config.hero, image: e.target.value } })}
                                placeholder="Paste image URL directly..."
                                className="text-sm text-muted-foreground"
                            />
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
                                    value={item.icon || 'truck'}
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
                                    value={item.text || ''}
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
            <TabsContent value="categoryGrid">
                <Card>
                    <CardHeader>
                        <CardTitle>Collection Grid</CardTitle>
                        <CardDescription>Customize the appearance of collection cards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Card Aspect Ratio</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={config.categoryGrid?.aspectRatio || '0.8'}
                                onChange={(e) => setConfig({
                                    ...config,
                                    categoryGrid: { aspectRatio: e.target.value }
                                })}
                            >
                                <option value="0.8">Portrait (4:5) - Default</option>
                                <option value="1">Square (1:1)</option>
                                <option value="1.33">Landscape (4:3)</option>
                                <option value="0.66">Tall (2:3)</option>
                            </select>
                            <p className="text-[0.8rem] text-muted-foreground">
                                This controls the shape of collection cards on the homepage and cropping aspect ratio.
                            </p>
                        </div>
                        <Button onClick={() => handleSave('categoryGrid')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Collection Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            {tempCropImage && (
                <ImageCropper
                    image={tempCropImage}
                    aspect={16 / 9} // Hero is usually wide
                    onCropComplete={(blob) => {
                        const file = new File([blob], 'hero.webp', { type: 'image/webp' });
                        setHeroFile(file);
                        setTempCropImage(null);
                    }}
                    onCancel={() => setTempCropImage(null)}
                />
            )}
        </Tabs>
    );
}

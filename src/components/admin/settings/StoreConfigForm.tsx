'use client'

import { useState } from 'react';
import { updateStoreConfigAction, uploadSiteAsset, deleteSiteAsset } from '@/actions/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Trash2, Crop as CropIcon, Plus, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { ImageCropper } from '@/components/ui/image-cropper';
import { StoreConfig } from '@/services/config';
import { BenefitItem } from '@/lib/types';
import { convertFileToWebP } from '@/lib/image-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface StoreConfigFormProps {
    initialConfig: StoreConfig;
}

export function StoreConfigForm({ initialConfig }: StoreConfigFormProps) {
    const [config, setConfig] = useState(initialConfig);
    const [isSaving, setIsSaving] = useState(false);

    // Track images queued for deletion (deleted only after successful save)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [tempCropImage, setTempCropImage] = useState<string | null>(null);

    const [mobileHeroFile, setMobileHeroFile] = useState<File | null>(null);
    const [tempMobileCropImage, setTempMobileCropImage] = useState<string | null>(null);

    // Track pending file uploads for carousel slides { [slideId]: { desktop?: File, mobile?: File } }
    const [slideFiles, setSlideFiles] = useState<Record<string, { desktop?: File; mobile?: File }>>({});

    const handleSave = async (section: keyof StoreConfig) => {
        setIsSaving(true);
        let currentConfig = { ...config };
        let toastId = undefined; // Track toast ID for updates

        // Handle File Upload for Hero
        if (section === 'hero' && heroFile) {
            const formData = new FormData();
            toastId = toast.loading('Optimizing image...'); // Start loading toast

            try {
                const webpFile = await convertFileToWebP(heroFile, 0.9);
                formData.append('file', webpFile);
            } catch (error) {
                console.error('WebP conversion failed', error);
                formData.append('file', heroFile);
            }

            toast.loading('Uploading image...', { id: toastId }); // Update message
            const uploadRes = await uploadSiteAsset(formData);

            if (uploadRes.success && uploadRes.url) {
                currentConfig = {
                    ...currentConfig,
                    hero: { ...currentConfig.hero, image: uploadRes.url }
                };
                setConfig(currentConfig);
                setHeroFile(null);
            } else {
                toast.error(uploadRes.error || 'Failed to upload image', { id: toastId });
                setIsSaving(false);
                return;
            }
        }

        // Handle File Upload for Mobile Hero
        if (section === 'hero' && mobileHeroFile) {
            const formData = new FormData();
            // Start or update toast
            if (!toastId) toastId = toast.loading('Optimizing mobile image...');
            else toast.loading('Optimizing mobile image...', { id: toastId });

            try {
                const webpFile = await convertFileToWebP(mobileHeroFile, 0.85);
                formData.append('file', webpFile);
            } catch {
                formData.append('file', mobileHeroFile);
            }

            toast.loading('Uploading mobile image...', { id: toastId });
            const uploadRes = await uploadSiteAsset(formData);

            if (uploadRes.success && uploadRes.url) {
                currentConfig = {
                    ...currentConfig,
                    hero: { ...currentConfig.hero, mobileImage: uploadRes.url }
                };
                setConfig(currentConfig);
                setMobileHeroFile(null);
            } else {
                toast.error(uploadRes.error || 'Failed to upload mobile image', { id: toastId });
                setIsSaving(false);
                return;
            }
        }

        // Handle slide file uploads
        if (section === 'hero' && Object.keys(slideFiles).length > 0) {
            const slidesToUpload = Object.entries(slideFiles);
            let updatedSlides = [...(currentConfig.hero?.slides || [])];

            for (const [slideId, files] of slidesToUpload) {
                const slideIndex = updatedSlides.findIndex(s => s.id === slideId);
                if (slideIndex === -1) continue;

                // Upload desktop image
                if (files.desktop) {
                    if (!toastId) toastId = toast.loading(`Optimizing slide ${slideIndex + 1}...`);
                    else toast.loading(`Optimizing slide ${slideIndex + 1}...`, { id: toastId });

                    const formData = new FormData();
                    try {
                        const webpFile = await convertFileToWebP(files.desktop, 0.9);
                        formData.append('file', webpFile);
                    } catch {
                        formData.append('file', files.desktop);
                    }

                    toast.loading(`Uploading slide ${slideIndex + 1}...`, { id: toastId });
                    const uploadRes = await uploadSiteAsset(formData);

                    if (uploadRes.success && uploadRes.url) {
                        updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], image: uploadRes.url };
                    } else {
                        toast.error(`Failed to upload slide ${slideIndex + 1}`, { id: toastId });
                        setIsSaving(false);
                        return;
                    }
                }

                // Upload mobile image
                if (files.mobile) {
                    toast.loading(`Uploading mobile for slide ${slideIndex + 1}...`, { id: toastId });

                    const formData = new FormData();
                    try {
                        const webpFile = await convertFileToWebP(files.mobile, 0.85);
                        formData.append('file', webpFile);
                    } catch {
                        formData.append('file', files.mobile);
                    }

                    const uploadRes = await uploadSiteAsset(formData);

                    if (uploadRes.success && uploadRes.url) {
                        updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], mobileImage: uploadRes.url };
                    } else {
                        toast.error(`Failed to upload mobile for slide ${slideIndex + 1}`, { id: toastId });
                        setIsSaving(false);
                        return;
                    }
                }
            }

            // Update config with new URLs
            currentConfig = {
                ...currentConfig,
                hero: { ...currentConfig.hero, slides: updatedSlides }
            };
            setConfig(currentConfig);
            setSlideFiles({}); // Clear pending files
        }

        // If no file upload happened yet, start saving toast
        if (!toastId) toastId = toast.loading('Saving settings...');
        else toast.loading('Saving settings...', { id: toastId });

        const result = await updateStoreConfigAction(section, currentConfig[section]);
        setIsSaving(false);

        if (result.success) {
            toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`, { id: toastId });

            // SAFE DELETION
            if (section === 'hero' && imagesToDelete.length > 0) {
                for (const url of imagesToDelete) {
                    await deleteSiteAsset(url);
                }
                setImagesToDelete([]);
            }
        } else {
            toast.error(result.error || 'Failed to save settings', { id: toastId });
        }
    };

    // Queue image for deletion (doesn't actually delete until save)
    const queueImageForDeletion = (url: string | undefined) => {
        if (url) {
            setImagesToDelete(prev => [...prev, url]);
        }
    };

    return (
        <Tabs defaultValue="brand" className="space-y-4">
            <TabsList>
                <TabsTrigger value="brand">Brand & Identity</TabsTrigger>
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="categoryGrid">Collections</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="currency">Currency</TabsTrigger>
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
                                className="rounded border-input"
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
                        <CardTitle>Hero Carousel</CardTitle>
                        <CardDescription>Manage homepage banner slides. Add multiple images that auto-advance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Global Settings */}
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
                            <div className="space-y-2">
                                <Label>Default Heading</Label>
                                <Input
                                    value={config.hero?.heading || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })}
                                    placeholder="e.g. TAILEX"
                                />
                                <p className="text-xs text-muted-foreground">Shown if slide has no heading</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Default Subheading</Label>
                                <Input
                                    value={config.hero?.subheading || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subheading: e.target.value } })}
                                    placeholder="e.g. Spring/Summer '26"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Overlay Opacity</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round((config.hero?.overlayOpacity ?? 0.3) * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[config.hero?.overlayOpacity ?? 0.3]}
                                    min={0}
                                    max={0.9}
                                    step={0.05}
                                    onValueChange={(vals) => setConfig({ ...config, hero: { ...config.hero, overlayOpacity: vals[0] } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Auto-Play Interval</Label>
                                <Select
                                    value={String(config.hero?.autoPlayInterval || 5000)}
                                    onValueChange={(val) => setConfig({ ...config, hero: { ...config.hero, autoPlayInterval: Number(val) } })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3000">3 seconds</SelectItem>
                                        <SelectItem value="5000">5 seconds</SelectItem>
                                        <SelectItem value="7000">7 seconds</SelectItem>
                                        <SelectItem value="10000">10 seconds</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Slides Management */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Slides ({config.hero?.slides?.length || 0}/6)</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={(config.hero?.slides?.length || 0) >= 6}
                                    onClick={() => {
                                        const newSlide = {
                                            id: `slide-${Date.now()}`,
                                            image: '',
                                            heading: '',
                                            subheading: '',
                                            ctaText: 'Shop Now',
                                            ctaLink: '/shop'
                                        };
                                        setConfig({
                                            ...config,
                                            hero: {
                                                ...config.hero,
                                                slides: [...(config.hero?.slides || []), newSlide]
                                            }
                                        });
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Slide
                                </Button>
                            </div>

                            {(!config.hero?.slides || config.hero.slides.length === 0) && (
                                <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                                    <p className="text-muted-foreground mb-2">No slides yet</p>
                                    <p className="text-xs text-muted-foreground">Add slides to create a carousel, or leave empty to use legacy single image.</p>
                                </div>
                            )}

                            {config.hero?.slides?.map((slide, index) => (
                                <div key={slide.id} className="p-4 border border-white/10 rounded-xl space-y-4 bg-black/20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Slide {index + 1}</span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={index === 0}
                                                onClick={() => {
                                                    const slides = [...(config.hero?.slides || [])];
                                                    [slides[index - 1], slides[index]] = [slides[index], slides[index - 1]];
                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                }}
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={index === (config.hero?.slides?.length || 1) - 1}
                                                onClick={() => {
                                                    const slides = [...(config.hero?.slides || [])];
                                                    [slides[index], slides[index + 1]] = [slides[index + 1], slides[index]];
                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                }}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    if (slide.image) queueImageForDeletion(slide.image);
                                                    if (slide.mobileImage) queueImageForDeletion(slide.mobileImage);
                                                    const slides = config.hero?.slides?.filter((_, i) => i !== index) || [];
                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                    toast.info('Slide removed. Images will be deleted when you save.');
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Desktop Image */}
                                        <div className="space-y-2">
                                            <Label className="text-xs">Desktop Image</Label>
                                            {(slide.image || slideFiles[slide.id]?.desktop) ? (
                                                <div className="relative h-32 rounded-lg overflow-hidden border border-white/10 group">
                                                    <img
                                                        src={slideFiles[slide.id]?.desktop ? URL.createObjectURL(slideFiles[slide.id].desktop!) : slide.image}
                                                        alt={`Slide ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="rounded-full w-8 h-8"
                                                            onClick={() => {
                                                                if (slideFiles[slide.id]?.desktop) {
                                                                    const newFiles = { ...slideFiles };
                                                                    delete newFiles[slide.id]?.desktop;
                                                                    if (!newFiles[slide.id]?.mobile) delete newFiles[slide.id];
                                                                    setSlideFiles(newFiles);
                                                                } else if (slide.image) {
                                                                    queueImageForDeletion(slide.image);
                                                                    const slides = [...(config.hero?.slides || [])];
                                                                    slides[index] = { ...slides[index], image: '' };
                                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-all bg-black/20">
                                                    <Upload className="w-6 h-6 text-white/40 mb-1" />
                                                    <span className="text-xs text-white/40">Upload</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                setSlideFiles({
                                                                    ...slideFiles,
                                                                    [slide.id]: { ...slideFiles[slide.id], desktop: e.target.files[0] }
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {/* Mobile Image */}
                                        <div className="space-y-2">
                                            <Label className="text-xs">Mobile Image (optional)</Label>
                                            {(slide.mobileImage || slideFiles[slide.id]?.mobile) ? (
                                                <div className="relative h-32 rounded-lg overflow-hidden border border-white/10 group">
                                                    <img
                                                        src={slideFiles[slide.id]?.mobile ? URL.createObjectURL(slideFiles[slide.id].mobile!) : slide.mobileImage}
                                                        alt={`Slide ${index + 1} mobile`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="rounded-full w-8 h-8"
                                                            onClick={() => {
                                                                if (slideFiles[slide.id]?.mobile) {
                                                                    const newFiles = { ...slideFiles };
                                                                    delete newFiles[slide.id]?.mobile;
                                                                    if (!newFiles[slide.id]?.desktop) delete newFiles[slide.id];
                                                                    setSlideFiles(newFiles);
                                                                } else if (slide.mobileImage) {
                                                                    queueImageForDeletion(slide.mobileImage);
                                                                    const slides = [...(config.hero?.slides || [])];
                                                                    slides[index] = { ...slides[index], mobileImage: '' };
                                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-all bg-black/20">
                                                    <Upload className="w-6 h-6 text-white/40 mb-1" />
                                                    <span className="text-xs text-white/40">Upload</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                setSlideFiles({
                                                                    ...slideFiles,
                                                                    [slide.id]: { ...slideFiles[slide.id], mobile: e.target.files[0] }
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Heading (optional)</Label>
                                            <Input
                                                value={slide.heading || ''}
                                                onChange={(e) => {
                                                    const slides = [...(config.hero?.slides || [])];
                                                    slides[index] = { ...slides[index], heading: e.target.value };
                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                }}
                                                placeholder="Override default heading"
                                                className="text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Subheading (optional)</Label>
                                            <Input
                                                value={slide.subheading || ''}
                                                onChange={(e) => {
                                                    const slides = [...(config.hero?.slides || [])];
                                                    slides[index] = { ...slides[index], subheading: e.target.value };
                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                }}
                                                placeholder="Override default subheading"
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Tagline (bottom link)</Label>
                                            <Input
                                                value={slide.ctaText || ''}
                                                onChange={(e) => {
                                                    const slides = [...(config.hero?.slides || [])];
                                                    slides[index] = { ...slides[index], ctaText: e.target.value };
                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                }}
                                                placeholder="e.g. New Arrivals"
                                                className="text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Link URL</Label>
                                            <Input
                                                value={slide.ctaLink || ''}
                                                onChange={(e) => {
                                                    const slides = [...(config.hero?.slides || [])];
                                                    slides[index] = { ...slides[index], ctaLink: e.target.value };
                                                    setConfig({ ...config, hero: { ...config.hero, slides } });
                                                }}
                                                placeholder="/collection/new-arrivals"
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legacy Single Image Fallback */}
                        {(!config.hero?.slides || config.hero.slides.length === 0) && (
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <Label className="text-sm font-medium">Legacy Single Image (used if no slides)</Label>
                                <Input
                                    value={config.hero?.image || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, image: e.target.value } })}
                                    placeholder="Paste image URL..."
                                    className="text-sm"
                                />
                            </div>
                        )}

                        {imagesToDelete.length > 0 && (
                            <p className="text-xs text-amber-500">
                                ⚠️ {imagesToDelete.length} image(s) will be deleted when you save.
                            </p>
                        )}

                        <Button onClick={() => handleSave('hero')} disabled={isSaving} className="w-full">
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
                                className="rounded border-input"
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
                                        newItems[index] = { ...item, icon: e.target.value as BenefitItem['icon'] };
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
                                        const newItems: BenefitItem[] = [...currentItems];
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
                    aspect={16 / 9}
                    onCropComplete={(blob) => {
                        const file = new File([blob], 'hero.webp', { type: 'image/webp' });
                        setHeroFile(file);
                        setTempCropImage(null);
                    }}
                    onCancel={() => setTempCropImage(null)}
                />
            )}
            {tempMobileCropImage && (
                <ImageCropper
                    image={tempMobileCropImage}
                    aspect={9 / 16}
                    onCropComplete={(blob) => {
                        const file = new File([blob], 'hero-mobile.webp', { type: 'image/webp' });
                        setMobileHeroFile(file);
                        setTempMobileCropImage(null);
                    }}
                    onCancel={() => setTempMobileCropImage(null)}
                />
            )}
        </Tabs>
    );
}


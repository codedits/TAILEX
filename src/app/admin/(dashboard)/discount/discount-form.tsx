'use client';

import { useState, useTransition } from 'react';
import { updateGlobalDiscount, deleteDiscountImage } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Upload, Trash2, Percent, Clock, Eye } from 'lucide-react';
import Image from 'next/image';
import { GlobalDiscountConfig } from '@/lib/types';

interface DiscountFormProps {
    initialConfig: GlobalDiscountConfig;
}

export function DiscountForm({ initialConfig }: DiscountFormProps) {
    const [isPending, startTransition] = useTransition();
    const [config, setConfig] = useState<GlobalDiscountConfig>(initialConfig);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(initialConfig.imageUrl || '');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteImage = async () => {
        if (confirm('Are you sure you want to delete this image?')) {
            startTransition(async () => {
                const result = await deleteDiscountImage();
                if (result.success) {
                    setImagePreview('');
                    setImageFile(null);
                    setConfig({ ...config, imageUrl: '' });
                    toast.success('Image deleted');
                } else {
                    toast.error(result.error || 'Failed to delete image');
                }
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        startTransition(async () => {
            const formData = new FormData();
            formData.append('enabled', String(config.enabled));
            formData.append('title', config.title);
            formData.append('percentage', String(config.percentage));
            formData.append('delaySeconds', String(config.delaySeconds));
            formData.append('showOncePerSession', String(config.showOncePerSession));
            formData.append('existingImageUrl', config.imageUrl);

            if (imageFile) {
                formData.append('imageFile', imageFile);
            }

            const result = await updateGlobalDiscount(formData);

            if (result.success) {
                toast.success('Discount settings saved successfully');
                setImageFile(null);
            } else {
                toast.error(result.error || 'Failed to save settings');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enable/Disable Toggle */}
            <Card className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl">
                <CardHeader>
                    <CardTitle className="text-white font-light tracking-tight flex items-center gap-3">
                        <Eye className="w-5 h-5 text-white/60" />
                        Popup Status
                    </CardTitle>
                    <CardDescription className="text-white/40">
                        Enable or disable the discount popup for visitors.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                        />
                        <Label className="text-white/70">
                            {config.enabled ? 'Popup is Active' : 'Popup is Disabled'}
                        </Label>
                    </div>
                </CardContent>
            </Card>

            {/* Discount Details */}
            <Card className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl">
                <CardHeader>
                    <CardTitle className="text-white font-light tracking-tight flex items-center gap-3">
                        <Percent className="w-5 h-5 text-white/60" />
                        Discount Details
                    </CardTitle>
                    <CardDescription className="text-white/40">
                        Configure the discount title and percentage to display.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-white/60 text-xs font-medium uppercase tracking-widest">
                            Discount Title
                        </Label>
                        <Input
                            value={config.title}
                            onChange={(e) => setConfig({ ...config, title: e.target.value })}
                            placeholder="e.g. New Year Sale"
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-[10px] text-white/30">
                            This will be displayed as the main heading in the popup.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/60 text-xs font-medium uppercase tracking-widest">
                            Discount Percentage
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={config.percentage}
                                onChange={(e) => setConfig({ ...config, percentage: parseInt(e.target.value) || 0 })}
                                className="bg-black/50 border-white/10 text-white w-32"
                            />
                            <span className="text-white/60 text-lg font-bold">%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Popup Image */}
            <Card className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl">
                <CardHeader>
                    <CardTitle className="text-white font-light tracking-tight flex items-center gap-3">
                        <Upload className="w-5 h-5 text-white/60" />
                        Popup Image
                    </CardTitle>
                    <CardDescription className="text-white/40">
                        Upload an attractive image to display in the popup.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {imagePreview ? (
                        <div className="relative w-full max-w-md h-48 rounded-xl overflow-hidden border border-white/10 group">
                            <Image
                                src={imagePreview}
                                alt="Discount Preview"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={handleDeleteImage}
                                    disabled={isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors bg-black/30 hover:bg-white/5">
                            <Upload className="w-8 h-8 text-white/40 mb-2" />
                            <span className="text-sm text-white/40">Drop image or click to upload</span>
                            <span className="text-[10px] text-white/20 mt-1">
                                PNG, JPG, WebP • Recommended: 400x400
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    )}
                </CardContent>
            </Card>

            {/* Timing Settings */}
            <Card className="bg-neutral-900/40 backdrop-blur-xl border-white/5 rounded-xl">
                <CardHeader>
                    <CardTitle className="text-white font-light tracking-tight flex items-center gap-3">
                        <Clock className="w-5 h-5 text-white/60" />
                        Display Settings
                    </CardTitle>
                    <CardDescription className="text-white/40">
                        Control when and how the popup appears.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-white/60 text-xs font-medium uppercase tracking-widest">
                            Delay (seconds)
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="1"
                                max="60"
                                value={config.delaySeconds}
                                onChange={(e) => setConfig({ ...config, delaySeconds: parseInt(e.target.value) || 5 })}
                                className="bg-black/50 border-white/10 text-white w-32"
                            />
                            <span className="text-white/40 text-sm">seconds after page load</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Switch
                            checked={config.showOncePerSession}
                            onCheckedChange={(checked) => setConfig({ ...config, showOncePerSession: checked })}
                        />
                        <div>
                            <Label className="text-white/70">Show once per session</Label>
                            <p className="text-[10px] text-white/30">
                                If enabled, the popup won't appear again after user closes it (until they return in a new session).
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 font-semibold transition-all shadow-xl disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Save Discount Settings'}
                </Button>
            </div>
        </form>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSiteConfig } from "./actions";
import { useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";

type SettingsFormProps = {
  hero: Record<string, any>;
  theme: Record<string, any>;
  brand: Record<string, any>;
};

export function SettingsForm({ hero, theme, brand }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  // ─── Image Upload System ──────────────────────────────────────────────
  const initialImages = hero.image ? [{ url: hero.image, blurDataUrl: hero.blurDataURL }] : [];

  const upload = useImageUpload({
    maxImages: 1,
    maxFileSize: 10 * 1024 * 1024,
    maxConcurrent: 1,
    initialImages,
    autoUpload: false, // Wait for save
  });

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Clear existing first to ensure single image
      if (upload.images.length > 0) {
        const currentId = upload.images[0].id;
        upload.removeImage(currentId);
      }
      upload.addFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  const clearHeroImage = () => {
    if (upload.images.length > 0) {
      upload.removeImage(upload.images[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toastId = toast.loading('Saving settings...');

    // 1. Trigger Uploads
    // Check if there are pending images
    const pendingImages = upload.images.filter(img => img.status === 'pending');
    if (pendingImages.length > 0) {
      try {
        toast.loading('Uploading hero image...', { id: toastId });
        await upload.startUpload();
      } catch (err) {
        toast.error('Image upload failed', { id: toastId });
        return;
      }
    }

    if (upload.isUploading) {
      toast.error('Please wait for uploads to finish', { id: toastId });
      return;
    }

    // 2. Get the URL
    const currentImage = upload.images[0];
    let heroImageUrl = '';
    let heroBlurUrl = '';

    if (currentImage && currentImage.status === 'success') {
      // For existing images, remoteUrl might be set, or it might be just previewUrl (which is the remote url for existing)
      // The hook sets remoteUrl = img.url for initialImages.
      heroImageUrl = currentImage.remoteUrl || currentImage.previewUrl;
      heroBlurUrl = currentImage.blurDataUrl || '';
    } else if (currentImage && currentImage.isExisting) {
      heroImageUrl = currentImage.previewUrl;
      heroBlurUrl = currentImage.blurDataUrl || '';
    }

    formData.set('heroImage', heroImageUrl);
    formData.set('heroBlurDataURL', heroBlurUrl);

    // Remove the file input if it exists in formData
    formData.delete('heroImageFile');


    startTransition(async () => {
      try {
        await updateSiteConfig(formData);
        toast.success('Settings saved', {
          id: toastId,
          description: 'Your store preferences have been updated.',
        });
      } catch (error) {
        toast.error('Error saving settings', {
          id: toastId,
          description: 'Failed to update store configuration. Please try again.',
        });
      }
    });
  };

  // Helper to get preview
  const heroPreview = upload.images.length > 0 ? upload.images[0].previewUrl : null;
  const isUploading = upload.isUploading;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-10">
        <Card className="bg-white border-border rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
            <CardTitle className="text-lg text-gray-900">Brand Identity</CardTitle>
            <CardDescription className="text-gray-500">Basic info that appears across your storefront.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Store Name</Label>
              <Input id="brandName" name="brandName" defaultValue={brand.name}
                className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Announcement Bar Text</Label>
              <Input id="announcement" name="announcement" defaultValue={brand.announcement}
                className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
            <CardTitle className="text-lg text-gray-900">Hero Section</CardTitle>
            <CardDescription className="text-gray-500">Customize the initial impact of your homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="heroHeading" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Primary Heading</Label>
                <Input id="heroHeading" name="heroHeading" defaultValue={hero.heading}
                  className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSub" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Supportive Tagline</Label>
                <Input id="heroSub" name="heroSub" defaultValue={hero.subheading}
                  className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="heroCtaText" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">CTA Button Text</Label>
                <Input id="heroCtaText" name="heroCtaText" defaultValue={hero.ctaText || 'Shop Now'}
                  className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroCtaLink" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">CTA Button Link</Label>
                <Input id="heroCtaLink" name="heroCtaLink" defaultValue={hero.ctaLink || '/collection'}
                  className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Hero Background Image</Label>

              {heroPreview && (
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border mb-4 group">
                  <Image src={heroPreview} alt="Hero preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={clearHeroImage}
                    className="absolute top-3 right-3 bg-white/80 text-gray-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
                    </div>
                  )}
                </div>
              )}

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Drop image or click to upload</span>
                <span className="text-sm text-gray-500">Drop image or click to upload</span>
                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WebP up to 10MB • Recommended: 1920x1080</span>
                <input
                  type="file"
                  name="heroImageFile"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
            <CardTitle className="text-lg text-gray-900">Brand Palette</CardTitle>
            <CardDescription className="text-gray-500">Global color configuration for your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <Label htmlFor="themeColor" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Primary Accent</Label>
              <div className="flex gap-4">
                <Input type="color" id="themeColor" name="themeColor" className="w-16 h-12 p-1 bg-white border-border rounded-xl cursor-pointer" defaultValue={theme.primaryColor || '#000000'} />
                <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 text-gray-500 text-sm">
                  Current: {theme.primaryColor || '#000000'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isPending || isUploading}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-6 font-semibold transition-all shadow-xl disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSiteConfig } from "./actions";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, X } from "lucide-react";

type SettingsFormProps = {
  hero: Record<string, any>;
  theme: Record<string, any>;
  brand: Record<string, any>;
};

export function SettingsForm({ hero, theme, brand }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [heroPreview, setHeroPreview] = useState<string | null>(hero.image || null);
  const [heroFile, setHeroFile] = useState<File | null>(null);

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroFile(file);
      setHeroPreview(URL.createObjectURL(file));
    }
  };

  const clearHeroImage = () => {
    setHeroFile(null);
    setHeroPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Remove the file input and add the actual file if exists
    formData.delete('heroImageFile');
    if (heroFile) {
      formData.append('heroImageFile', heroFile);
    }

    // Add existing image if no new file
    formData.set('existingHeroImage', hero.image || '');

    startTransition(async () => {
      try {
        await updateSiteConfig(formData);
        toast.success("Settings saved", {
          description: "Your store preferences have been updated successfully.",
        });
      } catch (error) {
        toast.error("Error saving settings", {
          description: "Failed to update store configuration. Please try again.",
        });
      }
    });
  };

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
                </div>
              )}

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
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
            disabled={isPending}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-6 font-semibold transition-all shadow-xl disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </form>
  );
}


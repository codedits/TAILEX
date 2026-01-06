"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProduct, createProduct } from "./actions";
import { useTransition, useState } from "react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import type { Product, Collection } from "@/lib/types";

type ProductFormProps = {
  initialData?: Partial<Product>
  collections?: Collection[]
}

export function ProductForm({ initialData, collections = [] }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  
  // Image handling
  const initialImages = initialData?.images?.length 
    ? initialData.images 
    : (initialData?.cover_image ? [initialData.cover_image] : []);
  const [previews, setPreviews] = useState<string[]>(initialImages);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  
  // Form state for controlled selects
  const [status, setStatus] = useState<string>(initialData?.status || 'draft');
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).slice(0, 10 - previews.length);
      const newPreviews = fileArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      setNewFiles(prev => [...prev, ...fileArray]);
    }
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    const initialCount = initialImages.length;
    if (index >= initialCount) {
      setNewFiles(prev => prev.filter((_, i) => i !== index - initialCount));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Remove the empty file input and add actual files
    formData.delete('imageFiles');
    newFiles.forEach(file => {
      formData.append('imageFiles', file);
    });
    
    // Add existing images (ones that weren't removed)
    const existingImages = previews.slice(0, initialImages.length).filter(p => initialImages.includes(p));
    formData.set('existing_images', JSON.stringify(existingImages));
    
    // Add status and category
    formData.set('status', status);
    if (categoryId) {
      formData.set('category_id', categoryId);
    }
    
    startTransition(async () => {
      try {
        let res;
        if (initialData?.id) {
          formData.append('id', initialData.id);
          res = await updateProduct(formData);
        } else {
          res = await createProduct(formData);
        }

        if (res?.error) {
          toast({
            title: "Error saving product",
            description: res.error,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Form submission error:', error);
        toast({
          title: "Unexpected error",
          description: "Please try again",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Product Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white/60 text-xs font-medium uppercase tracking-widest">Title</Label>
              <Input 
                id="title" 
                name="title" 
                required 
                placeholder="Premium Linen Shirt" 
                defaultValue={initialData?.title}
                className="bg-black border-white/10 rounded-xl focus:border-white/40 h-12 text-white" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white/60 text-xs font-medium uppercase tracking-widest">URL Handle</Label>
              <Input 
                id="slug" 
                name="slug" 
                required 
                placeholder="premium-linen-shirt" 
                defaultValue={initialData?.slug}
                className="bg-black border-white/10 rounded-xl focus:border-white/40 h-12 text-white font-mono" 
              />
              <p className="text-[10px] text-white/30">Lowercase letters, numbers, and hyphens only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white/60 text-xs font-medium uppercase tracking-widest">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                className="min-h-[160px] bg-black border-white/10 rounded-xl focus:border-white/40 resize-none text-white" 
                placeholder="Describe your product in detail..."
                defaultValue={initialData?.description || ''} 
              />
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Media</h3>
            
            {/* Image Preview Grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black group">
                    <Image src={src} alt={`Preview ${idx}`} fill className="object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
                        Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors bg-black/50">
              <Upload className="w-8 h-8 text-white/40 mb-2" />
              <span className="text-sm text-white/40">Drop images or click to upload</span>
              <span className="text-[10px] text-white/20 mt-1">PNG, JPG, WebP up to 6MB each (max 10)</span>
              <input 
                type="file" 
                name="imageFiles"
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="hidden" 
              />
            </label>
          </div>

          {/* Pricing Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pricing</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white/60 text-xs font-medium uppercase tracking-widest">Price ($)</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required 
                  placeholder="99.00" 
                  defaultValue={initialData?.price}
                  className="bg-black border-white/10 rounded-xl focus:border-white/40 h-12 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price" className="text-white/60 text-xs font-medium uppercase tracking-widest">Sale Price ($)</Label>
                <Input 
                  id="sale_price" 
                  name="sale_price" 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="79.00" 
                  defaultValue={initialData?.sale_price || ''}
                  className="bg-black border-white/10 rounded-xl focus:border-white/40 h-12 text-white font-mono" 
                />
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Inventory</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-white/60 text-xs font-medium uppercase tracking-widest">SKU</Label>
                <Input 
                  id="sku" 
                  name="sku" 
                  placeholder="LS-001-BLK" 
                  defaultValue={initialData?.sku || ''}
                  className="bg-black border-white/10 rounded-xl focus:border-white/40 h-12 text-white font-mono" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-white/60 text-xs font-medium uppercase tracking-widest">Stock Quantity</Label>
                <Input 
                  id="stock" 
                  name="stock" 
                  type="number" 
                  min="0"
                  placeholder="100" 
                  defaultValue={initialData?.stock || 0}
                  className="bg-black border-white/10 rounded-xl focus:border-white/40 h-12 text-white font-mono" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Organization */}
        <div className="space-y-8">
          {/* Status Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Status</h3>
            
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger className="bg-black border-white/10 text-white h-12">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active (Published)</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_featured" 
                  defaultChecked={initialData?.is_featured}
                  className="w-5 h-5 rounded bg-black border-white/20 text-white focus:ring-0 cursor-pointer" 
                />
                <span className="text-white/70 text-sm">Feature on homepage</span>
              </label>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Organization</h3>
            
            <div className="space-y-2">
              <Label className="text-white/60 text-xs font-medium uppercase tracking-widest">Collection</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-black border-white/10 text-white h-12">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No collection</SelectItem>
                  {collections.map(col => (
                    <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-white/60 text-xs font-medium uppercase tracking-widest">Tags</Label>
              <Input 
                id="tags" 
                name="tags" 
                placeholder="summer, linen, casual" 
                defaultValue={initialData?.tags?.join(', ') || ''}
                className="bg-black border-white/10 rounded-xl focus:border-white/40 h-12 text-white" 
              />
              <p className="text-[10px] text-white/30">Separate with commas</p>
            </div>
          </div>

          {/* SEO Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">SEO</h3>
            
            <div className="space-y-2">
              <Label htmlFor="seo_title" className="text-white/60 text-xs font-medium uppercase tracking-widest">SEO Title</Label>
              <Input 
                id="seo_title" 
                name="seo_title" 
                placeholder="Custom page title" 
                defaultValue={initialData?.seo_title || ''}
                className="bg-black border-white/10 rounded-xl focus:border-white/40 h-12 text-white" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_description" className="text-white/60 text-xs font-medium uppercase tracking-widest">SEO Description</Label>
              <Textarea 
                id="seo_description" 
                name="seo_description" 
                className="min-h-[80px] bg-black border-white/10 rounded-xl focus:border-white/40 resize-none text-white text-sm" 
                placeholder="Meta description for search engines..."
                defaultValue={initialData?.seo_description || ''} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-white/5">
        <Button 
          type="submit" 
          disabled={isPending} 
          className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-6 font-semibold transition-all shadow-xl disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            initialData?.id ? "Update Product" : "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
}

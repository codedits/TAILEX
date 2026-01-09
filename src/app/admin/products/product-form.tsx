"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProduct, createProduct } from "./actions";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { X, Upload, Loader2, Save } from "lucide-react";
import type { Product, Collection } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

type ProductFormProps = {
  initialData?: Partial<Product>
  collections?: Collection[]
}

export function ProductForm({ initialData, collections = [] }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Image handling
  const [previews, setPreviews] = useState<string[]>(
    initialData?.images?.length
      ? initialData.images
      : (initialData?.cover_image ? [initialData.cover_image] : [])
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      sale_price: initialData?.sale_price ?? undefined,
      stock: initialData?.stock || 0,
      sku: initialData?.sku || "",
      status: (initialData?.status as any) || "draft",
      category_id: initialData?.category_id || "",
      product_type: initialData?.product_type || "",
      tags: initialData?.tags?.join(", ") || "",
      is_featured: initialData?.is_featured || false,
      seo_title: initialData?.seo_title || "",
      seo_description: initialData?.seo_description || "",
      track_inventory: initialData?.track_inventory ?? true,
    },
  });

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
    const initialCount = (initialData?.images?.length || (initialData?.cover_image ? 1 : 0));
    if (index >= initialCount) {
      setNewFiles(prev => prev.filter((_, i) => i !== index - initialCount));
    }
  };

  async function onSubmit(data: ProductFormValues) {
    const formData = new FormData();
    // Append validated data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'is_featured') {
          // Checkbox handling for FormData
          if (value) formData.append(key, 'on');
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Handle files
    newFiles.forEach(file => {
      formData.append('imageFiles', file);
    });

    // Existing images
    const initialImagesList = initialData?.images || (initialData?.cover_image ? [initialData.cover_image] : []);
    const existingImages = previews.slice(0, initialImagesList.length).filter(p => initialImagesList.includes(p));
    formData.set('existing_images', JSON.stringify(existingImages));

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
          toast.error("Error saving product", { description: res.error });
        } else {
          toast.success(initialData?.id ? "Product updated" : "Product created");
          
          // Small delay before redirecting so they see the success toast
          setTimeout(() => {
            router.push("/admin/products");
            router.refresh();
          }, 1500);
        }
      } catch (error) {
        console.error("Submit Error", error);
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 space-y-6">
              <h3 className="text-lg font-light tracking-tight text-white mb-4 border-b border-white/5 pb-4">Product Details</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Premium Linen Shirt" {...field} className="bg-black border-white/10 text-white rounded-xl h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">URL Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="premium-linen-shirt" {...field} className="bg-black border-white/10 text-white rounded-xl h-12 font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description..."
                        {...field}
                        className="bg-black border-white/10 text-white rounded-xl min-h-[160px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Media */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 space-y-6">
              <h3 className="text-lg font-light tracking-tight text-white mb-4 border-b border-white/5 pb-4">Media</h3>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black group">
                      <Image src={src} alt="Preview" fill className="object-cover" />
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

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/30 transition-all bg-black/20 hover:bg-white/5">
                <Upload className="w-8 h-8 text-white/40 mb-2" />
                <span className="text-sm text-white/40 font-light">Drop images or click to upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* Pricing */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 space-y-6">
              <h3 className="text-lg font-light tracking-tight text-white mb-4 border-b border-white/5 pb-4">Pricing</h3>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} className="bg-black border-white/10 text-white rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">Sale Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value || ''} className="bg-black border-white/10 text-white rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 space-y-6">
              <h3 className="text-lg font-light tracking-tight text-white mb-4 border-b border-white/5 pb-4">Inventory</h3>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">SKU</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black border-white/10 text-white rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-black border-white/10 text-white rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-6 sticky top-24">
              <h3 className="text-lg font-light tracking-tight text-white border-b border-white/5 pb-4">Status & Organization</h3>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-white/10 text-white h-12">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 p-4 bg-white/[0.02]">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-white">Feature Product</FormLabel>
                      <p className="text-[10px] text-white/50">Show on homepage</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-widest">Collection</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-black border-white/10 text-white h-12">
                          <SelectValue placeholder="Select collection" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No collection</SelectItem>
                        {collections.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-white/5">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-white text-black hover:bg-white/90 rounded-xl h-12 font-semibold transition-all shadow-xl disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {initialData?.id ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </form>
    </Form>
  );
}

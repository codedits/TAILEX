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
import { X, Upload, Loader2, Save, Crop as CropIcon, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import type { Product, Collection } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { convertFileToWebP } from '@/lib/image-utils';
import { ImageCropper } from "@/components/ui/image-cropper";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { VariantConfigSection } from "@/components/admin/products/VariantConfigSection";
import type { ProductVariant } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ProductFormProps = {
  initialData?: Partial<Product>
  collections?: Collection[]
}

type ImageItem = {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
};

function SortableImage({
  item,
  index,
  onRemove,
  onCrop
}: {
  item: ImageItem;
  index: number;
  onRemove: (idx: number) => void;
  onCrop: (idx: number, url: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-xl overflow-hidden border border-border bg-gray-50 group transition-all"
    >
      <Image src={item.url} alt="Preview" fill className="object-cover" />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-white/90 text-gray-900 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20 shadow-sm hover:bg-white"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          type="button"
          onClick={() => onCrop(index, item.url)}
          className="bg-white/90 text-gray-900 p-1.5 rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <CropIcon className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="bg-white/90 text-gray-900 p-1.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function ProductForm({ initialData, collections = [] }: ProductFormProps) {
  const router = useRouter();
  const { currency } = useStoreConfig();
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<ImageItem[]>(() => {
    const existing = initialData?.images?.length
      ? initialData.images
      : (initialData?.cover_image ? [initialData.cover_image] : []);
    return existing.map(url => ({
      id: Math.random().toString(36).substr(2, 9),
      url,
      isExisting: true
    }));
  });
  const [cropData, setCropData] = useState<{ index: number, image: string } | null>(null);

  // Variant configuration state
  const [enableColorVariants, setEnableColorVariants] = useState(initialData?.enable_color_variants ?? false);
  const [enableSizeVariants, setEnableSizeVariants] = useState(initialData?.enable_size_variants ?? false);
  const [availableColors, setAvailableColors] = useState<string[]>(initialData?.available_colors ?? []);
  const [availableSizes, setAvailableSizes] = useState<string[]>(initialData?.available_sizes ?? []);
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants ?? []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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
      const remainingSlots = 10 - images.length;
      const fileArray = Array.from(files).slice(0, remainingSlots);

      const newItems: ImageItem[] = fileArray.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        isExisting: false
      }));

      setImages(prev => [...prev, ...newItems]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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



    // ... (inside onSubmit)

    // Handle files with WebP conversion
    // We do this before startTransition to avoid blocking the UI update too much, 
    // although for large files it might take a moment.
    try {
      const newFilesItems = images.filter(img => !img.isExisting && img.file);
      if (newFilesItems.length > 0) {
        toast.loading("Optimizing images...");
        const convertedFiles = await Promise.all(
          newFilesItems.map(item => convertFileToWebP(item.file!, 0.85))
        );
        convertedFiles.forEach(file => {
          formData.append('imageFiles', file);
        });
        toast.dismiss();
      }
    } catch (error) {
      console.error("Image conversion failed", error);
      toast.error("Image optimization failed, using originals");
      // Fallback
      images.filter(img => !img.isExisting && img.file).forEach(item => {
        formData.append('imageFiles', item.file!);
      });
    }

    // Existing images (now preserved in order)
    const existingImages = images.filter(img => img.isExisting).map(img => img.url);
    formData.set('existing_images', JSON.stringify(existingImages));

    // Append variant configuration
    formData.set('enable_color_variants', String(enableColorVariants));
    formData.set('enable_size_variants', String(enableSizeVariants));
    formData.set('available_colors', JSON.stringify(availableColors));
    formData.set('available_sizes', JSON.stringify(availableSizes));
    formData.set('variants', JSON.stringify(variants));

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
            <div className="bg-white border border-border rounded-2xl p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 mb-4 border-b border-gray-100 pb-4">Product Details</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Premium Linen Shirt" {...field} className="bg-white border-border text-gray-900 rounded-xl h-12" />
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
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">URL Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="premium-linen-shirt" {...field} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
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
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description..."
                        {...field}
                        className="bg-white border-border text-gray-900 rounded-xl min-h-[160px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Media */}
            <div className="bg-white border border-border rounded-2xl p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 mb-4 border-b border-gray-100 pb-4">Media</h3>

              {images.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={images.map(img => img.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {images.map((item, idx) => (
                        <SortableImage
                          key={item.id}
                          item={item}
                          index={idx}
                          onRemove={removeImage}
                          onCrop={(i, url) => setCropData({ index: i, image: url })}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gray-400 transition-all bg-gray-50 hover:bg-gray-100">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 font-light">Drop images or click to upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* Pricing */}
            <div className="bg-white border border-border rounded-2xl p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 mb-4 border-b border-gray-100 pb-4">Pricing</h3>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                        Price ({currency?.code || 'PKR'} {currency?.symbol || 'Rs.'})
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
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
                      <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                        Sale Price ({currency?.code || 'PKR'} {currency?.symbol || 'Rs.'})
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value || ''} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white border border-border rounded-2xl p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 mb-4 border-b border-gray-100 pb-4">Inventory</h3>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">SKU</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
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
                      <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="track_inventory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-white shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-gray-900">Track Inventory</FormLabel>
                      <p className="text-[10px] text-gray-500">Enable stock management for this product</p>
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
            </div>

            {/* Variant Configuration */}
            <VariantConfigSection
              enableColor={enableColorVariants}
              enableSize={enableSizeVariants}
              availableColors={availableColors}
              availableSizes={availableSizes}
              variants={variants}
              basePrice={form.watch('price') || 0}
              baseSku={form.watch('sku') || 'PROD'}
              currencySymbol={currency?.symbol || 'Rs.'}
              onEnableColorChange={setEnableColorVariants}
              onEnableSizeChange={setEnableSizeVariants}
              onColorsChange={setAvailableColors}
              onSizesChange={setAvailableSizes}
              onVariantsChange={setVariants}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white border border-border rounded-2xl p-6 space-y-6 sticky top-24 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 border-b border-gray-100 pb-4">Status & Organization</h3>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-border text-gray-900 h-12">
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-white shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-gray-900">Feature Product</FormLabel>
                      <p className="text-[10px] text-gray-500">Show on homepage</p>
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
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Collection</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-border text-gray-900 h-12">
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

              <div className="pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-xl h-12 font-semibold transition-all shadow-xl disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {initialData?.id ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </form>

      {cropData && (
        <ImageCropper
          image={cropData.image}
          aspect={3 / 4} // Products use 3:4 aspect
          onCropComplete={(blob) => {
            const file = new File([blob], `product-${Date.now()}.webp`, { type: "image/webp" });
            const objectUrl = URL.createObjectURL(file);

            setImages(prev => {
              const next = [...prev];
              next[cropData.index] = {
                ...next[cropData.index],
                url: objectUrl,
                file: file,
                isExisting: false // Even after crop it's a new file
              };
              return next;
            });

            setCropData(null);
          }}
          onCancel={() => setCropData(null)}
        />
      )}
    </Form>
  );
}


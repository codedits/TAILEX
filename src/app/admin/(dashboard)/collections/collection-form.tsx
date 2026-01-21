"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createCollection, updateCollection } from "./actions";
import { useTransition, useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { ImageCropper } from "@/components/ui/image-cropper";
import { useSearchParams, useRouter } from "next/navigation";
import { convertFileToWebP } from '@/lib/image-utils';

export function CollectionForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const aspectRatio = parseFloat(searchParams.get('ratio') || '0.8');

    const [preview, setPreview] = useState<string | null>(initialData?.image_url || null);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTempImage(url);
        }
    }

    const onCropComplete = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setPreview(url);
        setCroppedBlob(blob);
        setTempImage(null);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // We need to handle the async conversion before we can submit
        // Since we cannot make the form handler async nicely without preventing default immediately (which we did),
        // we will wrap the logic in an async function.

        const form = e.currentTarget;

        const submitLogic = async () => {
            const formData = new FormData(form);

            // Use the cropped blob if available
            if (croppedBlob) {
                try {
                    toast.loading('Optimizing collection image...');
                    // Convert blob to File first
                    const fileFromBlob = new File([croppedBlob], "collection-image.jpg", { type: "image/jpeg" });
                    const webpFile = await convertFileToWebP(fileFromBlob, 0.9);
                    formData.set('imageFile', webpFile);
                    toast.dismiss();
                } catch (error) {
                    console.error("WebP conversion failed", error);
                    formData.set('imageFile', croppedBlob, 'collection-image.jpg');
                }
            }

            // Trust native form behavior for Switch (Radix UI puts a hidden input)
            // If it's not in formData, it's off.
            if (!formData.has('is_visible')) {
                formData.set('is_visible', 'off');
            }

            startTransition(async () => {
                try {
                    let res;
                    if (initialData?.id) {
                        formData.append('id', initialData.id);
                        res = await updateCollection(formData);
                    } else {
                        res = await createCollection(formData);
                    }

                    if (res?.error) {
                        toast.error("Error saving collection", {
                            description: res.error
                        });
                    } else {
                        toast.success(initialData?.id ? "Collection updated" : "Collection created", {
                            description: `${formData.get('title')} has been saved.`
                        });

                        // Redirect after a short delay
                        setTimeout(() => {
                            router.push('/admin/collections');
                            router.refresh();
                        }, 1000);
                    }
                } catch (err) {
                    console.error("Submission error:", err);
                    toast.error("Unexpected error", {
                        description: "Please try again later"
                    });
                }
            });
        };

        submitLogic();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Title</Label>
                        <Input name="title" required defaultValue={initialData?.title} className="bg-black border-white/10 rounded-xl py-6 h-12" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Slug</Label>
                        <Input name="slug" required defaultValue={initialData?.slug} className="bg-black border-white/10 rounded-xl py-6 h-12" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Cover Image (Display)</Label>
                        {preview && (
                            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-white/10 mb-2 bg-black">
                                <Image src={preview} alt="Display Preview" fill className="object-cover" />
                            </div>
                        )}
                        <Input name="imageFile" type="file" accept="image/*" onChange={(e) => handleImageChange(e)} ref={fileInputRef}
                            className="bg-black border-white/10 rounded-xl py-3 px-4 h-14 cursor-pointer file:text-white file:bg-white/10 file:rounded-full file:border-0 file:mr-4 file:px-4 file:text-xs hover:file:bg-white/20" />
                        <input type="hidden" name="existing_image" value={initialData?.image_url || ''} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Description</Label>
                        <Textarea name="description" className="min-h-[150px] bg-black border-white/10 rounded-xl resize-none p-4" defaultValue={initialData?.description} />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <h3 className="text-white/80 text-sm font-semibold">SEO Metadata</h3>
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">SEO Title</Label>
                            <Input name="seo_title" defaultValue={initialData?.seo_title} className="bg-black border-white/10 rounded-xl py-6 h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">SEO Description</Label>
                            <Textarea name="seo_description" defaultValue={initialData?.seo_description} className="bg-black border-white/10 rounded-xl h-24 p-4" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="is_visible" name="is_visible" defaultChecked={initialData?.is_visible !== false} />
                            <Label htmlFor="is_visible" className="text-white">Visible on site</Label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-white/5">
                <Button type="submit" disabled={isPending} className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-6 font-semibold shadow-xl">
                    {isPending ? "Validating..." : "Save Collection"}
                </Button>
            </div>

            {tempImage && (
                <ImageCropper
                    image={tempImage}
                    aspect={aspectRatio}
                    onCropComplete={onCropComplete}
                    onCancel={() => setTempImage(null)}
                />
            )}
        </form>
    );
}

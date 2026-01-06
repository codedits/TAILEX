"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createCollection, updateCollection } from "./actions";
import { useTransition, useState } from "react";
import { toast } from "@/hooks/use-toast"; // Corrected import path
import Image from "next/image";

export function CollectionForm({ initialData }: { initialData?: any }) {
    const [isPending, startTransition] = useTransition();
    const [preview, setPreview] = useState<string | null>(initialData?.image_url || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        // Handle Switch manually because it doesn't always submit like a native checkbox
        // Or ensure name="is_visible" is on a hidden input or the switch uses native form control
        // For simplicity, we rely on the native input of the Switch or use a hidden input
        // Shadcn Switch usually wraps a button. We might need a hidden input.
        
        startTransition(async () => {
            let res;
            if (initialData?.id) {
                formData.append('id', initialData.id);
                res = await updateCollection(formData);
            } else {
                res = await createCollection(formData);
            }

            if (res?.error) {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            } else {
                toast({ title: "Success", description: "Collection saved" });
            }
        });
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
                         <Label className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Cover Image</Label>
                         {preview && (
                             <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 mb-2 bg-black">
                                 <Image src={preview} alt="Preview" fill className="object-cover" />
                             </div>
                         )}
                         <Input name="imageFile" type="file" accept="image/*" onChange={handleImageChange}
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
        </form>
    );
}

"use client";

import { useState } from "react";
import { HomepageSection } from "@/lib/types";
import { Reorder, useDragControls } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateHomepageLayout } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HomepageBuilderClientProps {
    initialSections: HomepageSection[];
}

export function HomepageBuilderClient({ initialSections }: HomepageBuilderClientProps) {
    const [sections, setSections] = useState(initialSections);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Update order index before saving
        const orderedSections = sections.map((s, i) => ({ ...s, order: i }));
        const result = await updateHomepageLayout(orderedSections);
        setIsSaving(false);

        if (result.success) {
            toast.success("Homepage layout saved");
        } else {
            toast.error("Failed to save layout");
        }
    };

    const toggleSection = (id: string, enabled: boolean) => {
        setSections(sections.map(s => s.id === id ? { ...s, enabled } : s));
    };

    return (
        <div className="max-w-3xl space-y-6">
            <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-3">
                {sections.map((section) => (
                    <Reorder.Item key={section.id} value={section}>
                        <div className={cn(
                            "flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/10 rounded-xl select-none",
                            !section.enabled && "opacity-50"
                        )}>
                            <div className="flex items-center gap-4">
                                <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded">
                                    <GripVertical className="bg-transparent text-white/30" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white capitalize">{section.id.replace('-', ' ')}</h3>
                                    <p className="text-xs text-white/40 font-mono mt-0.5 uppercase tracking-wider">{section.type}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/50">{section.enabled ? "Visible" : "Hidden"}</span>
                                    <Switch
                                        checked={section.enabled}
                                        onCheckedChange={(checked) => toggleSection(section.id, checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <div className="flex justify-end pt-4 border-t border-white/10">
                <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black hover:bg-white/90 rounded-full px-8">
                    {isSaving ? "Saving..." : "Save Layout"}
                </Button>
            </div>
        </div>
    );
}

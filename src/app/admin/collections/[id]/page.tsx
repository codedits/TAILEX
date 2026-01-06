import { createAdminClient } from "@/lib/supabase/admin";
import { CollectionForm } from "../collection-form";
import { notFound } from "next/navigation";

export default async function EditCollectionPage({ params }: { params: { id: string } }) {
    // Need to await params in Next.js 15+, but let's check version. 
    // Assuming Next.js 15+ convention where params is a Promise, but in 14 it's just an object depending on configuration.
    // Safest is to await it if it's a promise, but TS might complain if it isn't.
    // In strict Next.js 15, `params` is a promise.
    const { id } = await params;
    
    const supabase = await createAdminClient();
    const { data: collection } = await supabase.from('collections').select('*').eq('id', id).single();

    if (!collection) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Edit Collection</h2>
                <p className="text-white/50 text-sm">Update collection details and visibility.</p>
            </div>
             <div className="bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl border border-white/10">
                <CollectionForm initialData={collection} />
            </div>
        </div>
    );
}

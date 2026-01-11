import { CollectionForm } from "../collection-form";

export default function NewCollectionPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Create Collection</h2>
                <p className="text-white/50 text-sm">Add a new category to organize your catalog.</p>
            </div>
            <div className="bg-[#0A0A0A] p-8 rounded-2xl shadow-2xl border border-white/10">
                <CollectionForm />
            </div>
        </div>
    );
}

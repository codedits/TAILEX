import { CollectionForm } from "../collection-form";

export default function NewCollectionPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">Create Collection</h2>
                <p className="text-gray-500 text-sm">Add a new category to organize your catalog.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
                <CollectionForm />
            </div>
        </div>
    );
}


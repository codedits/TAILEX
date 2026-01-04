import { ProductSkeleton } from "@/components/ProductSkeleton";
import Navbar from "@/components/Navbar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

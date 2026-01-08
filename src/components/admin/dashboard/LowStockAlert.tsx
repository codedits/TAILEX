import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Product } from "@/lib/types"

export function LowStockAlert({ products }: { products: Product[] }) {
    if (!products || products.length === 0) return null;

    return (
        <Alert variant="default" className="bg-red-500/5 border-red-500/10 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400 font-medium tracking-wide text-xs uppercase mb-2">Inventory Alert</AlertTitle>
            <AlertDescription className="text-red-400/60 text-sm font-light">
                <p className="mb-3">{products.length} products are running low on inventory.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {products.slice(0, 3).map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-red-500/5 p-2 rounded border border-red-500/10">
                            <span className="truncate text-xs text-red-300/80 mr-2">{p.title}</span>
                            <span className="font-mono text-xs font-bold text-red-400">{p.stock}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <Link href="/admin/products?sort=stock_asc" className="text-xs font-medium text-red-400 flex items-center gap-1 hover:text-red-300 transition-colors">
                        View all items <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </AlertDescription>
        </Alert>
    )
}

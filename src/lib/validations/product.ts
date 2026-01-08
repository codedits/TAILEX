import { z } from "zod";

export const productSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required").max(100),
    slug: z.string().min(1, "URL Handle is required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
    sale_price: z.coerce.number().min(0, "Sale price must be positive").optional().or(z.literal("")),
    cost_price: z.coerce.number().min(0).optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    stock: z.coerce.number().int().min(0),
    track_quantity: z.boolean().default(true),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    category_id: z.string().optional().nullable(),
    product_type: z.string().optional(),
    vendor: z.string().optional(),
    tags: z.string().optional(), // We'll handle CSV parsing in the form/action
    is_featured: z.boolean().default(false),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    // Images handled separately via FormData usually, but useful to validate existence if needed
});

export type ProductFormValues = z.infer<typeof productSchema>;

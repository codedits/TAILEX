"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useToast } from "@/hooks/use-toast";
import productJacket1 from "@/assets/product-jacket-1.jpg";
import productJacket2 from "@/assets/product-jacket-2.jpg";

const product = {
  name: "Relaxed Linen Jacket",
  price: 69.00,
  description: "A versatile, lightweight jacket crafted from premium linen. Perfect for layering during transitional seasons or cool summer evenings.",
  images: [productJacket1, productJacket2],
  sizes: ["S", "M", "L", "XL"],
  details: [
    {
      title: "Material & Care",
      content: "100% Organic Linen. Machine wash cold, tumble dry low. Iron on low heat if needed."
    },
    {
      title: "Shipping & Returns",
      content: "Free standard shipping on all orders over $75. 14-day hassle-free returns."
    }
  ]
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [selectedSize, setSelectedSize] = useState("");
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Added to cart",
      description: `${product.name} - Size ${selectedSize} has been added to your cart.`,
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-6">
             {/* Primary Image with Layout Transition */}
            <motion.div
              layoutId={`product-image-${slug}`}
              className="aspect-[3/4] relative overflow-hidden bg-secondary/30"
            >
              <Image
                src={product.images[0]}
                alt={`${product.name} view 1`}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
            
            {/* Secondary Images */}
            {product.images.slice(1).map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="aspect-[3/4] relative overflow-hidden bg-secondary/30"
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-32 h-fit">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-xl font-body text-foreground mb-6">
                ${product.price.toFixed(2)}
              </p>
              
              <p className="text-muted-foreground font-body leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-display uppercase tracking-wider mb-4">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center border transition-all ${
                        selectedSize === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground text-muted-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <MagneticButton className="w-full" onClick={handleAddToCart}>
                    <div className="w-full py-6 bg-primary text-primary-foreground text-base font-medium rounded-md flex items-center justify-center">
                        Add to Cart
                    </div>
                </MagneticButton>
              </div>

              {/* Details Accordion */}
              <Accordion type="single" collapsible className="w-full">
                {product.details.map((detail, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-sm font-display uppercase tracking-wider">
                      {detail.title}
                    </AccordionTrigger>
                    <AccordionContent className="font-body text-muted-foreground leading-relaxed">
                      {detail.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

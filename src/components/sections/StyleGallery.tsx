"use client";

import { motion } from "framer-motion";
import Image from "next/image";
const style1 = "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1400&auto=format&fit=crop";
const style2 = "https://images.unsplash.com/photo-1503342452485-86f7d39cc8b8?q=80&w=1400&auto=format&fit=crop";
const style3 = "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?q=80&w=1400&auto=format&fit=crop";
const style4 = "https://images.unsplash.com/photo-1520975912990-4e4f1d8a0c82?q=80&w=1400&auto=format&fit=crop";

const images = [style1, style2, style3, style4];

const MotionImage = motion(Image);

const StyleGallery = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-secondary/30">
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={itemVariants}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="section-title text-foreground mb-4">
          Curated Styles
        </h2>
        <p className="font-body text-muted-foreground max-w-2xl mx-auto">
          Discover how our community wears TAILEX. Tag us @tailex to be featured.
        </p>
      </motion.div>

      {/* Gallery Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="aspect-[3/4] overflow-hidden relative"
          >
            <MotionImage
              src={image}
              alt={`Style inspiration ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              quality={80}
              sizes="(max-width: 768px) 150vw, 25vw"
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default StyleGallery;

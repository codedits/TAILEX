"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import style1 from "@/assets/style-1.jpg";
import style2 from "@/assets/style-2.jpg";
import style3 from "@/assets/style-3.jpg";
import style4 from "@/assets/style-4.jpg";

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
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default StyleGallery;

"use client";

import { motion } from "framer-motion";
import { Truck, RotateCcw, Shield, HeadphonesIcon, Star, Heart, Gift, Clock, LucideIcon } from "lucide-react";
import { BenefitItem } from "@/lib/types";

// Icon mapping for admin-controlled icons
const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  rotate: RotateCcw,
  shield: Shield,
  headphones: HeadphonesIcon,
  star: Star,
  heart: Heart,
  gift: Gift,
  clock: Clock,
};

// Default benefits if none provided
const defaultBenefits: BenefitItem[] = [
  { icon: 'truck', text: 'Free shipping on orders over $75' },
  { icon: 'rotate', text: '14-day hassle-free returns' },
  { icon: 'shield', text: '30-day product warranty' },
  { icon: 'headphones', text: 'Customer support 24/7' },
];

interface BenefitsStripProps {
  items?: BenefitItem[];
}

const BenefitsStrip = ({ items = defaultBenefits }: BenefitsStripProps) => {
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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-12 md:py-16 px-6 md:px-12 bg-background border-y border-border/30">
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        {items.map((benefit, index) => {
          const IconComponent = iconMap[benefit.icon] || Truck;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center"
            >
              <IconComponent className="w-6 h-6 text-foreground mb-3" strokeWidth={1.5} />
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {benefit.text}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default BenefitsStrip;

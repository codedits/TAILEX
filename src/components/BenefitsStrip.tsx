"use client";

import { motion } from "framer-motion";
import { Truck, RotateCcw, Shield, HeadphonesIcon } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    text: "Free shipping on orders over $75",
  },
  {
    icon: RotateCcw,
    text: "14-day hassle-free returns",
  },
  {
    icon: Shield,
    text: "30-day product warranty",
  },
  {
    icon: HeadphonesIcon,
    text: "Customer support 24/7",
  },
];

const BenefitsStrip = () => {
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
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex flex-col items-center text-center"
          >
            <benefit.icon className="w-6 h-6 text-foreground mb-3" strokeWidth={1.5} />
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {benefit.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default BenefitsStrip;

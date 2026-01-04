"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import style1 from "@/assets/style-1.jpg";
import style2 from "@/assets/style-2.jpg";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <h1 className="section-title text-foreground mb-6">About TAILEX</h1>
          <p className="text-muted-foreground font-body text-lg md:text-xl leading-relaxed">
            Founded with a vision to create timeless menswear that transcends seasons and trends, 
            TAILEX represents the intersection of quality craftsmanship and modern design.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="px-6 md:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
              Our Story
            </h2>
            <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
              <p>
                What began as a small atelier focused on perfecting the essential wardrobe 
                has grown into a global brand trusted by discerning customers worldwide.
              </p>
              <p>
                Every piece in our collection is designed with intention — to be worn, 
                loved, and passed down. We believe in buying less but buying better.
              </p>
              <p>
                Our commitment to quality means sourcing the finest materials from ethical 
                suppliers and working with skilled artisans who share our passion for detail.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-[4/5] overflow-hidden relative"
          >
            <Image
              src={style1}
              alt="TAILEX craftsmanship"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-[4/5] overflow-hidden md:order-1 relative"
          >
            <Image
              src={style2}
              alt="TAILEX lifestyle"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:order-2"
          >
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
              Our Philosophy
            </h2>
            <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
              <p>
                We design for the modern man who values substance over spectacle. 
                Our pieces are meant to be the foundation of your wardrobe — versatile, 
                enduring, and effortlessly refined.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

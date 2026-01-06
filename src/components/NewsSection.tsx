"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
const newsSpring = "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1400&auto=format&fit=crop";
const newsPopup = "https://images.unsplash.com/photo-1495121605193-b116b5b09a3f?q=80&w=1400&auto=format&fit=crop";
const newsFabric = "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1400&auto=format&fit=crop";

const articles = [
  {
    title: "Spring 2025 Essentials",
    description: "Polos and relaxed tailoring for the new season.",
    image: newsSpring,
    href: "/news/spring-2025-essentials",
  },
  {
    title: "TAILEX Pop-up Experience",
    description: "A temporary space dedicated to craftsmanship.",
    image: newsPopup,
    href: "/news/pop-up-experience",
  },
  {
    title: "Responsible Fabric & Design",
    description: "Our sourcing process, from field to form.",
    image: newsFabric,
    href: "/news/responsible-fabric",
  },
];

const NewsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-background">
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={itemVariants}
        className="max-w-3xl mb-12 md:mb-16"
      >
        <h2 className="section-title text-foreground mb-6">Latest News</h2>
        <p className="text-muted-foreground font-body text-base md:text-lg leading-relaxed">
          From new product drops to style tips — read our latest features, 
          editorials, and brand announcements.
        </p>
      </motion.div>

      {/* Articles Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {articles.map((article) => (
          <motion.article
            key={article.title}
            variants={itemVariants}
          >
            <Link href={article.href} className="group block">
              <div className="aspect-[3/2] overflow-hidden mb-4 relative">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
              <h3 className="font-display text-lg md:text-xl text-foreground mb-2 group-hover:opacity-70 transition-opacity">
                {article.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {article.description}
              </p>
            </Link>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};

export default NewsSection;

"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import newsSpring from "@/assets/news-spring.jpg";
import newsPopup from "@/assets/news-popup.jpg";
import newsFabric from "@/assets/news-fabric.jpg";

const articles = [
  {
    title: "Spring 2025 Essentials",
    description: "Polos and relaxed tailoring for the new season. Discover our curated selection of lightweight fabrics and versatile silhouettes designed for warmer days.",
    image: newsSpring,
    date: "January 2, 2026",
    href: "/news/spring-2025-essentials",
  },
  {
    title: "TAILEX Pop-up Experience",
    description: "A temporary space dedicated to craftsmanship. Visit our immersive retail experience featuring exclusive pieces and behind-the-scenes insights.",
    image: newsPopup,
    date: "December 15, 2025",
    href: "/news/pop-up-experience",
  },
  {
    title: "Responsible Fabric & Design",
    description: "Our sourcing process, from field to form. Learn about our commitment to sustainable practices and ethical manufacturing.",
    image: newsFabric,
    date: "November 28, 2025",
    href: "/news/responsible-fabric",
  },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="section-title text-foreground mb-4">News & Stories</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            From new product drops to style tips — read our latest features, editorials, and brand announcements.
          </p>
        </motion.div>
      </section>

      {/* Articles */}
      <section className="px-6 md:px-12 pb-20">
        <div className="space-y-16">
          {articles.map((article, index) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              <Link href={article.href} className="group block aspect-[4/3] overflow-hidden relative">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  {article.date}
                </p>
                <Link href={article.href}>
                  <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4 hover:opacity-70 transition-opacity">
                    {article.title}
                  </h2>
                </Link>
                <p className="font-body text-muted-foreground leading-relaxed mb-6">
                  {article.description}
                </p>
                <Link
                  href={article.href}
                  className="font-body text-sm text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
                >
                  Read More
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

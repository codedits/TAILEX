"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Fallback images if none in DB
const fallbackImages = [
  "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495121605193-b116b5b09a3f?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1400&auto=format&fit=crop",
];

// Type for blog posts from DB
type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published_at?: string | null;
  author_name?: string | null;
};

// Default articles if no DB posts
const defaultArticles: BlogPost[] = [
  {
    id: '1',
    title: "Spring 2025 Essentials",
    slug: "spring-2025-essentials",
    excerpt: "Polos and relaxed tailoring for the new season.",
    featured_image: fallbackImages[0],
  },
  {
    id: '2',
    title: "Pop-up Experience",
    slug: "pop-up-experience",
    excerpt: "A temporary space dedicated to craftsmanship.",
    featured_image: fallbackImages[1],
  },
  {
    id: '3',
    title: "Responsible Fabric & Design",
    slug: "responsible-fabric",
    excerpt: "Our sourcing process, from field to form.",
    featured_image: fallbackImages[2],
  },
];

interface NewsSectionProps {
  posts?: BlogPost[];
}

const NewsSection = ({ posts }: NewsSectionProps) => {
  // Use DB posts if available, otherwise default
  const articles = (posts && posts.length > 0) ? posts : defaultArticles;

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
        {articles.map((article, index) => {
          const imageUrl = article.featured_image || fallbackImages[index % fallbackImages.length];
          return (
            <motion.article
              key={article.id}
              variants={itemVariants}
            >
              <Link href={`/news/${article.slug}`} className="group block">
                <div className="aspect-[3/2] overflow-hidden mb-4 relative">
                  <Image
                    src={imageUrl}
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
                  {article.excerpt || 'Read more...'}
                </p>
              </Link>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
};

export default NewsSection;

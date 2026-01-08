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
    <section className="w-full px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto py-24 md:py-32">
      {/* Split Section Header */}
      <div className="mb-16 md:mb-24 flex flex-col md:flex-row items-start justify-between gap-10">
        <h2 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9] max-w-xl">
          Style It
        </h2>
        <div className="max-w-md md:pt-4">
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            From new product drops to style tips — read our latest features, editorials, and brand announcements.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
        {articles.map((article, index) => {
          const imageUrl = article.featured_image || fallbackImages[index % fallbackImages.length];
          return (
            <article key={article.id} className="w-full">
              <Link href={`/news/${article.slug}`} className="group block space-y-6">
                <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden relative bg-neutral-100 dark:bg-neutral-900">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    {article.author_name || "Calder 2026 Essentials"}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight group-hover:opacity-70 transition-opacity uppercase tracking-tight">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-2">
                    {article.excerpt || 'Read more...'}
                  </p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default NewsSection;

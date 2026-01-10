"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/types";
import { motion } from "framer-motion";
import { TextReveal } from "@/components/ui/text-reveal";

interface NewsSectionProps {
  posts: BlogPost[];
  brandName?: string;
  sectionTitle?: string;
  sectionDescription?: string;
}

// Default fallback images
const fallbackImages = [
  "https://framerusercontent.com/images/V5a1RpyqOHHGnONdw8R7GjDBIg.jpg",
  "https://framerusercontent.com/images/wJLxIgMhbPrLpCiQ4Y7R8f7jc.jpg",
  "https://framerusercontent.com/images/HYNd0sD2Y8M8nJqVKEsJLsX8pA.jpg"
];

const NewsSection = ({
  posts,
  brandName = "Calder Co.",
  sectionTitle,
  sectionDescription = "Stay in the loop — discover the latest drops, exclusive deals, and behind-the-scenes looks at Calder Co., all in one place."
}: NewsSectionProps) => {
  // Use first 3 posts
  const displayPosts = posts.slice(0, 3);

  // Build title with brand name
  const title = sectionTitle || `What's New at\n${brandName}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative w-full bg-background overflow-hidden z-10">
      <div
        className="flex flex-col items-center justify-center w-full"
        style={{ maxWidth: '1920px', margin: '0 auto' }}
      >
        {/* Container with padding matching template */}
        <div className="w-full px-6 md:px-10 py-24 md:py-[150px] flex flex-col gap-16 md:gap-20">

          {/* Section Header - Split layout */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full mb-16">
            {/* Title - Left */}
            <TextReveal
              variant="stagger"
              className="text-foreground whitespace-pre-line"
              style={{
                fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: '110%'
              }}
            >
              {title}
            </TextReveal>

            {/* Description - Right */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:w-1/4"
            >
              <p
                className="text-muted-foreground"
                style={{
                  fontFamily: '"Geist", "Geist Placeholder", sans-serif',
                  fontSize: 'clamp(15px, 1.5vw, 18px)',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  lineHeight: '140%'
                }}
              >
                {sectionDescription?.replace("Calder Co.", brandName)}
              </p>
            </motion.div>
          </div>

          {/* Grid - 3 columns */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {displayPosts.map((post, index) => {
              const imageUrl = post.featured_image || fallbackImages[index % fallbackImages.length];

              return (
                <motion.div key={post.id} variants={itemVariants}>
                  <Link
                    href={`/news/${post.slug}`}
                    className="group block w-full cursor-pointer"
                  >
                    {/* Image Container */}
                    <div
                      className="relative w-full overflow-hidden"
                      style={{ aspectRatio: '0.7986577181208053 / 1' }}
                    >
                      <motion.div
                        className="absolute inset-0 w-[101%] h-[101%]"
                        style={{
                          left: 'calc(50.140056022408984% - 101.1204481792717% / 2)',
                          top: 'calc(49.8881431767338% - 101.34228187919463% / 2)'
                        }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image
                          src={imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                          quality={80}
                          sizes="(max-width: 768px) 150vw, 33vw"
                        />
                      </motion.div>
                    </div>

                    {/* Post Info */}
                    <div className="flex flex-col items-center gap-2 pt-4 overflow-hidden w-full">
                      {/* Post Title */}
                      <h3
                        className="text-foreground text-center"
                        style={{
                          fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
                          fontSize: 'clamp(16px, 1.5vw, 20px)',
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                          lineHeight: '120%'
                        }}
                      >
                        {post.title}
                      </h3>

                      {/* Post Description */}
                      {post.excerpt && (
                        <p
                          className="text-muted-foreground text-center line-clamp-2"
                          style={{
                            fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
                            fontSize: 'clamp(12px, 1.2vw, 14px)',
                            fontWeight: 400,
                            letterSpacing: '0.02em',
                            lineHeight: '140%'
                          }}
                        >
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;

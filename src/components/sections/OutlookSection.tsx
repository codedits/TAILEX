"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TextReveal } from "@/components/ui/text-reveal";

type OutlookSectionProps = {
  title?: string;
  images?: string[];
};

// Default compelling images from template
const defaultImages = [
  "https://framerusercontent.com/images/8UKWfFbqEQVxg9NMSIq0LpKOsE.jpg",
  "https://framerusercontent.com/images/IW6pOO3jYGCJxGmq36q85cg.jpg",
  "https://framerusercontent.com/images/Mj3LoxldhF4f0wdKHBH9zSgv5v0.jpg",
  "https://framerusercontent.com/images/FqEWCZFYHnRYmpNuBEWdRoD8Bo.jpg"
];

const OutlookSection = ({
  title = "Defined by\nDetail",
  images = defaultImages
}: OutlookSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Images scale from 0.6 to 1 as user scrolls through
  const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 1]);

  const displayImages = images.length >= 4 ? images : defaultImages;

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-background overflow-visible"
    >
      {/* Inner sticky wrapper - framer-wk3tyu */}
      <div
        className="flex flex-col items-center justify-center w-full"
        style={{
          maxWidth: '1920px',
          margin: '0 auto',
          padding: '0 40px 150px'
        }}
      >
        {/* Sticky text container - framer-139hfgi */}
        <div
          className="flex items-center justify-center w-full"
          style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}
        >
          <TextReveal
            variant="stagger"
            className="text-center text-foreground whitespace-pre-line"
            style={{
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: 'clamp(50px, 7vw, 80px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: '110%'
            }}
          >
            {title}
          </TextReveal>
        </div>

        {/* Scattered images container - framer-1nn26df */}
        <div
          className="flex flex-col gap-20 w-full relative"
          style={{ zIndex: 2 }}
        >
          {/* First row - Image centered - framer-1iotphk */}
          <div className="flex justify-center w-full">
            <motion.div
              className="w-[30%]"
              style={{
                scale: scaleValue,
                aspectRatio: '0.8 / 1'
              }}
            >
              <div className="relative w-full h-full overflow-visible">
                <Image
                  src={displayImages[0]}
                  alt="Outlook image 1"
                  fill
                  className="object-cover"
                  quality={90}
                  sizes="(max-width: 768px) 50vw, 30vw"
                  priority
                />
              </div>
            </motion.div>
          </div>

          {/* Second row - Images 2 and 3 - framer-1qs8t5x */}
          <div className="flex justify-between items-start w-full">
            {/* Left column - Image 2 - framer-j9n9jk */}
            <div className="flex flex-col items-end w-[30%]" style={{ paddingTop: '150px' }}>
              <motion.div
                className="w-full"
                style={{
                  scale: scaleValue,
                  aspectRatio: '0.8 / 1'
                }}
              >
                <div className="relative w-full h-full overflow-visible">
                  <Image
                    src={displayImages[1]}
                    alt="Outlook image 2"
                    fill
                    className="object-cover"
                    quality={90}
                    sizes="(max-width: 768px) 50vw, 30vw"
                  />
                </div>
              </motion.div>
            </div>

            {/* Right column - Image 3 - framer-1cljlq4 */}
            <motion.div
              className="w-[25%]"
              style={{
                scale: scaleValue,
                aspectRatio: '0.8 / 1'
              }}
            >
              <div className="relative w-full h-full overflow-visible">
                <Image
                  src={displayImages[2]}
                  alt="Outlook image 3"
                  fill
                  className="object-cover"
                  quality={90}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom row - Large center image - framer-1hkby04 */}
          <div className="flex justify-center w-full items-center" style={{ height: '100vh' }}>
            <motion.div
              className="w-[35%]"
              style={{
                scale: scaleValue,
                aspectRatio: '0.8 / 1'
              }}
            >
              <div className="relative w-full h-full overflow-visible">
                <Image
                  src={displayImages[3]}
                  alt="Outlook image 4"
                  fill
                  className="object-cover"
                  quality={90}
                  sizes="(max-width: 768px) 50vw, 35vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OutlookSection;

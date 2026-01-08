"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-display text-8xl md:text-9xl text-foreground mb-4">404</h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground mb-8">
            The page you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="btn-outline inline-block"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}

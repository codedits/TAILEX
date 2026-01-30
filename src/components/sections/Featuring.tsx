"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

const container: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const child: Variants = {
    hidden: { y: "110%", opacity: 0 },
    visible: {
        y: "0%",
        opacity: 1,
        transition: {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

export default function Featuring() {
    return (
        <section className="w-full min-h-screen flex flex-col lg:flex-row font-sans bg-black overflow-hidden">

            {/* LEFT COLUMN: HERO */}
            <div className="lg:w-1/2 relative min-h-[90dvh] lg:h-screen flex flex-col justify-between p-8 md:p-10 lg:p-14 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/images/featured/Highfashion_studio_portrait_2k_202601310016.jpeg"
                        alt="Tailex Model"
                        fill
                        className="object-cover object-center opacity-100"
                        priority
                    />
                </div>

                <div className="relative flex flex-col justify-between h-full">
                    <div className="flex flex-col items-start gap-4 pt-4 pointer-events-auto">
                        <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-neutral-800">
                            <span>DROP</span>
                            <span className="text-neutral-400">//</span>
                            <span>S/S 2026</span>
                        </div>
                        <div className="bg-black text-white px-3 py-1 text-[11px] font-black tracking-wider uppercase inline-block">
                            Tailex — Standard
                        </div>
                    </div>

                    <div className="mt-auto mb-12 lg:mb-24 relative">
                        <motion.h1
                            className="text-[clamp(3rem,11vw,7.5rem)] font-black text-white leading-[0.8] tracking-tighter uppercase"
                            variants={container}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                        >
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"

                                >
                                    Fabric
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"

                                >
                                    Is The
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"

                                >
                                    Narrative
                                </motion.span>
                            </span>
                        </motion.h1>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:w-1/2 flex flex-col h-auto lg:h-screen">

                {/* TOP HALF: LIGHT */}
                <div className="min-h-[50dvh] lg:h-[50%] relative overflow-hidden p-8 lg:p-12 flex flex-col justify-between">
                    <div className="absolute inset-0">
                        <Image
                            src="/images/featured/Highfashion_studio_portrait_2k_202601310026.jpeg"
                            alt="Urban Context"
                            fill
                            className="object-cover object-center opacity-100"
                        />
                    </div>
                    <div className="relative">
                        <motion.h2
                            className="text-[clamp(2.5rem,5vw,5rem)] font-black uppercase leading-[0.85] tracking-tight text-white"
                            style={{ mixBlendMode: 'difference' }}
                            variants={container}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                        >
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Modern
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Urban
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Armor
                                </motion.span>
                            </span>
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 relative">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b-[3px] border-black pb-1">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-800">GSM — 450</span>
                                <div className="flex gap-[2px]">
                                    <div className="w-[2px] h-3 bg-black" />
                                    <div className="w-[2px] h-3 bg-black" />
                                    <div className="w-[2px] h-3 bg-black" />
                                </div>
                            </div>
                            <p className="text-[10px] font-mono text-neutral-600 leading-tight uppercase text-justify">
                                Heavyweight French Terry engineered for the concrete jungle. Pre-shrunk structure that holds its silhouette.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b-[3px] border-black pb-1">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-800">FIT — OVR</span>
                                <div className="flex gap-[2px]">
                                    <div className="w-[2px] h-3 bg-black" />
                                    <div className="w-[2px] h-3 bg-black" />
                                    <div className="w-[2px] h-3 bg-black" />
                                </div>
                            </div>
                            <p className="text-[10px] font-mono text-neutral-600 leading-tight uppercase text-justify">
                                Dropped shoulders and cropped hems. A cut designed to allow movement while commanding space.
                            </p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM HALF: DARK */}
                <div className="min-h-[50dvh] lg:h-[50%] relative flex items-center justify-center overflow-hidden p-8 text-center">
                    <Image
                        src="/images/featured/Dramatic_cinematic_studio_2k_202601211907.jpeg"
                        alt="Texture"
                        fill
                        className="object-cover opacity-80"
                    />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-10%" }}
                        variants={container}
                        className="relative max-w-xl mx-auto"
                    >
                        <h3
                            className="text-[clamp(1.75rem,5vw,3rem)] font-black text-white uppercase leading-[0.95] tracking-tight"
                            style={{ mixBlendMode: 'difference' }}
                        >
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Clothing is the interface
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    between you and the world.
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden">
                                <motion.span
                                    variants={child}
                                    className="block"
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Upgrade your skin.
                                </motion.span>
                            </span>
                        </h3>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

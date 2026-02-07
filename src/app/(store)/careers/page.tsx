import { getBrandConfig, getNavigation, getFooterConfig, getSocialConfig } from "@/lib/theme";
import Navbar from "@/components/layout/Navbar";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
    title: "Careers",
    description: "Join our team and help us build the future of streetwear.",
}

export default async function CareersPage() {
    const [brand, navItems, footerConfig, socialConfig] = await Promise.all([
        getBrandConfig(),
        getNavigation('main-menu'),
        getFooterConfig(),
        getSocialConfig(),
    ]);

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
            <Navbar brandName={brand.name} navItems={navItems} />

            <div className="pt-24 pb-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto space-y-16">

                    <header className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs uppercase tracking-widest font-medium text-white/80">Hiring</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter">Join the Movement</h1>
                        <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl">
                            We are always looking for passionate individuals who value craftsmanship, detail, and quality. If you share our vision, we want to hear from you.
                        </p>
                    </header>

                    <div className="space-y-8">
                        <h2 className="font-display text-2xl font-semibold uppercase tracking-widest text-muted-foreground/50 border-b border-white/10 pb-4">Open Positions</h2>

                        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 hover:border-white/20">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-display text-2xl font-semibold">Senior Fashion Designer</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span>Design</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20 self-center"></span>
                                        <span>Full-time</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20 self-center"></span>
                                        <span>Remote / Lahore</span>
                                    </div>
                                </div>
                                <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
                                    Apply Now <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 hover:border-white/20">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-display text-2xl font-semibold">Marketing Specialist</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span>Marketing</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20 self-center"></span>
                                        <span>Full-time</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20 self-center"></span>
                                        <span>Remote</span>
                                    </div>
                                </div>
                                <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors">
                                    Apply Now <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center space-y-4">
                            <h3 className="font-display text-xl font-semibold text-muted-foreground">Don't see your role?</h3>
                            <p className="text-muted-foreground/70">
                                We're always interested in meeting talented people. Send your portfolio and resume to <a href="mailto:careers@tailex.studio" className="text-white hover:underline">careers@tailex.studio</a>.
                            </p>
                        </div>

                    </div>

                </div>
            </div>


        </main>
    );
}

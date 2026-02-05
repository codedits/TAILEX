"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/api/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) return;

        setStatus("loading");
        setMessage("");

        try {
            const result = await subscribeToNewsletter(email);

            if (result.error) {
                setStatus("error");
                setMessage(result.error);
            } else {
                setStatus("success");
                setMessage(result.message || "Successfully subscribed!");
                setEmail("");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Newsletter</p>

            {status === "success" ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <Check className="w-4 h-4" />
                    <span>{message}</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === "loading"}
                            className={cn(
                                "bg-transparent border-b border-white/20 text-white placeholder:text-white/20 py-2 text-sm w-full focus:outline-none focus:border-white transition-colors",
                                status === "loading" && "opacity-50"
                            )}
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || !email.trim()}
                            className="text-white hover:text-white/70 transition-colors disabled:opacity-50"
                            aria-label="Subscribe to newsletter"
                        >
                            {status === "loading" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ArrowRight className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {status === "error" && message && (
                        <p className="text-red-400 text-xs mt-2">{message}</p>
                    )}
                </form>
            )}
        </div>
    );
}

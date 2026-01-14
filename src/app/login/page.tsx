"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/UserAuthContext";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { sendOTP, verifyOTP, isAuthenticated, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/account');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const result = await sendOTP(email);
    setLoading(false);

    if (result.success) {
      setStep("otp");
      toast({ title: "Code sent", description: "Check your email." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    const result = await verifyOTP(email, otp);
    setLoading(false);

    if (result.success) {
      router.push('/account');
    } else {
      toast({ title: "Invalid code", description: "Please try again.", variant: "destructive" });
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Column - Editorial Image (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-neutral-100 relative overflow-hidden">
        {/* Placeholder Image - Replace with local asset in production */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/og.jpg")' }}
        >
          <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay */}
        </div>
        <div className="relative z-10 m-12 mt-auto text-white">
          <blockquote className="text-3xl font-light font-serif leading-tight mb-4">
            "Style is a way to say who you are without having to speak."
          </blockquote>
          <p className="text-sm uppercase tracking-widest opacity-80">— Rachel Zoe</p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 md:px-8 lg:px-24 py-12">
        <div className="w-full max-w-md space-y-8 md:space-y-12">

          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
              <span className="text-3xl font-black tracking-tighter text-black uppercase">
                TAILEX
              </span>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mt-4 font-medium">
              A New Era of Wardrobe Essence
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold text-black mb-2">Welcome Back</h1>
                  <p className="text-neutral-500 text-sm">Sign in to access your curated collection.</p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-black">Email Address</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-neutral-50 border-neutral-200 text-black placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black transition-all rounded-lg"
                      required
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-12 bg-black text-white hover:bg-neutral-800 font-medium rounded-lg text-sm uppercase tracking-wide transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Continue with Email <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <button
                    onClick={() => setStep("email")}
                    className="text-sm text-neutral-400 hover:text-black flex items-center gap-2 mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Email
                  </button>
                  <h1 className="text-2xl font-semibold text-black mb-2">Check your Inbox</h1>
                  <p className="text-neutral-500 text-sm">
                    We've sent a 6-digit code to <span className="text-black font-medium">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup className="gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="w-12 h-14 border border-neutral-200 bg-white text-lg font-medium text-black focus:border-black focus:ring-1 focus:ring-black rounded-lg shadow-sm"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-12 bg-black text-white hover:bg-neutral-800 font-medium rounded-lg text-sm uppercase tracking-wide transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                  </Button>
                </form>

                <p className="text-center text-xs text-neutral-400 mt-6">
                  Didn't receive the code? <button type="button" onClick={handleSendOTP} className="text-black underline underline-offset-2 hover:opacity-70">Resend</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-8 border-t border-neutral-100 text-center">
            <p className="text-neutral-400 text-xs">
              By signing in, you agree to our <Link href="/terms" className="text-black underline">Terms</Link> and <Link href="/privacy" className="text-black underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

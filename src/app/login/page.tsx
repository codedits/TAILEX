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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-inter">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark Overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://grainient.b-cdn.net/%40Grainient-Freebies/8358807-uhd_4096_2160_25fps.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Glass Card */}
      <div className="relative z-20 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
              <span className="text-3xl font-black tracking-tighter text-white uppercase">
                TAILEX
              </span>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-4 font-medium">
              Access Your Profile
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
                <div className="mb-8 text-center">
                  <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                  <p className="text-white/60 text-sm">Enter your email to sign in.</p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-white/80">Email Address</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all rounded-lg"
                      required
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-lg text-sm uppercase tracking-wide transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Get Login Code <ArrowRight className="w-4 h-4" />
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
                <div className="mb-8 text-center">
                  <button
                    onClick={() => setStep("email")}
                    className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white flex items-center justify-center gap-2 mb-6 transition-colors mx-auto"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change Email
                  </button>
                  <h1 className="text-2xl font-bold text-white mb-2">Check Your Inbox</h1>
                  <p className="text-white/60 text-sm">
                    We've sent a code to <span className="text-white font-bold">{email}</span>
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
                            className="w-10 h-14 md:w-12 md:h-16 border border-white/10 bg-white/5 text-xl font-medium text-white focus:border-white/40 focus:ring-1 focus:ring-white/40 rounded-lg shadow-sm"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-lg text-sm uppercase tracking-wide transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Sign In"}
                  </Button>
                </form>

                <p className="text-center text-xs text-white/40 mt-6">
                  No code? <button type="button" onClick={handleSendOTP} className="text-white underline underline-offset-2 hover:opacity-80 font-bold">Resend</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-white/30 text-[10px] uppercase tracking-wider">
            Protected by Tailex Security
          </p>
        </div>
      </div>
    </div>
  );
}

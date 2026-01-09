"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendOTP, verifyOTP } from "./actions";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      const result = await sendOTP(formData);

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        setEmail(data.email);
        setStep("otp");
        toast({ title: "Code sent!", description: "Check your email for the verification code." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong sending the code.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", data.code);
      const result = await verifyOTP(formData);

      if (result?.error) {
        toast({ title: "Invalid Code", description: result.error, variant: "destructive" });
        otpForm.setValue("code", "");
      } else if (result?.url) {
        toast({ title: "Success", description: "Verifying session..." });
        window.location.href = result.url;
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to verify code.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex lg:grid lg:grid-cols-2 overflow-hidden">
      {/* Editorial Side - Hidden on mobile */}
      <div className="hidden lg:block relative bg-neutral-900 border-r border-white/5">
        <Image
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop"
          alt="Editorial"
          fill
          className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="text-2xl font-display uppercase tracking-[0.3em] font-black text-white hover:opacity-70 transition-opacity">
            TAILEX
          </Link>
          <div className="space-y-4">
            <h2 className="text-5xl font-display uppercase tracking-widest font-bold text-white leading-tight">
              A New Era of<br/>Wardrobe Essence
            </h2>
            <p className="text-white/40 max-w-sm tracking-wide leading-relaxed uppercase text-xs">
              Born from the intersection of minimalist art and modern utility. Join the vision.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-[380px] space-y-12">
          <div className="space-y-4">
            <div className="lg:hidden">
              <Link href="/" className="text-xl font-display uppercase tracking-widest font-black text-white mb-12 block text-center">
                TAILEX
              </Link>
            </div>
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-display uppercase tracking-[0.2em] font-light text-white italic">
                {step === "email" ? "Identification" : "Verification"}
              </h1>
              <p className="text-sm text-white/40 tracking-wider">
                {step === "email"
                  ? "Access your personal curated experience."
                  : `Please enter the 6-digit code sent to ${email}`}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-8">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold ml-1">Account Mail</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
                              <Input 
                                placeholder="name@domain.com" 
                                {...field} 
                                className="bg-transparent border-white/10 rounded-none h-14 pl-12 focus:border-white focus:ring-0 transition-all text-white placeholder:text-white/20"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase tracking-widest" />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-14 rounded-none bg-white text-black hover:bg-neutral-200 uppercase tracking-[0.3em] font-black text-xs transition-all duration-300 group" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Continue <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-10">
                    <div className="space-y-4">
                      <FormLabel className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold ml-1 block text-center lg:text-left">Security Code</FormLabel>
                      <div className="flex justify-center lg:justify-start">
                        <FormField
                          control={otpForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <InputOTP maxLength={6} {...field} className="w-full flex justify-between gap-2">
                                  <InputOTPGroup className="gap-2 sm:gap-4 w-full justify-between">
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                      <InputOTPSlot 
                                        key={i} 
                                        index={i} 
                                        className="w-10 sm:w-12 h-14 sm:h-16 rounded-none border-white/10 bg-transparent text-white focus:border-white focus:ring-1 focus:ring-white transition-all text-lg font-light"
                                      />
                                    ))}
                                  </InputOTPGroup>
                                </InputOTP>
                              </FormControl>
                              <FormMessage className="text-[10px] uppercase tracking-widest text-center" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Button 
                        type="submit" 
                        className="w-full h-14 rounded-none bg-white text-black hover:bg-neutral-200 uppercase tracking-[0.3em] font-black text-xs transition-all" 
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize"}
                      </Button>
                      <Button
                        variant="link"
                        className="w-full text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2 group"
                        onClick={() => setStep("email")}
                        type="button"
                      >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to identity
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Branding */}
          <div className="pt-24 text-center lg:text-left">
             <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <ShieldCheck className="w-3 h-3 text-white/20" />
                <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-bold">End-to-End Secure Identity</span>
             </div>
             <p className="text-[10px] text-white/10 tracking-widest">© 2026 TAILEX VISIONARY LABS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


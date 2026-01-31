"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { createOrderAction } from "@/actions/order";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/UserAuthContext";
import { formatCurrency as utilsFormatCurrency, cn } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import type { AuthUser } from "@/lib/auth";

interface CheckoutWizardProps {
    user: AuthUser | null;
    customer?: any;
    savedAddress?: any;
}

type CheckoutStep = 'email' | 'otp' | 'details' | 'success';

export default function CheckoutWizard({ user: initialUser, customer, savedAddress }: CheckoutWizardProps) {
    const formatCurrency = useFormatCurrency();
    const { items, cartTotal, clearCart } = useCart();
    const { sendOTP, verifyOTP, user: authUser } = useAuth(); // ADDED
    const [step, setStep] = useState<CheckoutStep>(initialUser ? 'details' : 'email');
    const [email, setEmail] = useState(initialUser?.email || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [otp, setOtp] = useState("");

    // Merge initial user (server) with auth context user (client)
    const activeUser = authUser || (initialUser as any);

    const router = useRouter();

    // If user logs in externally or prop changes
    useEffect(() => {
        if (activeUser) {
            setStep('details');
            setEmail(activeUser.email || '');
        }
    }, [activeUser]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const result = await sendOTP(email);
        setIsProcessing(false);

        if (result.success) {
            setStep('otp');
            toast({ title: "Code sent", description: "Please checks your email inbox." });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        const result = await verifyOTP(email, otp);

        if (result.success) {
            // Context handles the state update and toast
            setStep('details');
            setIsProcessing(false);
        } else {
            setIsProcessing(false);
            toast({ title: "Invalid Code", description: "Please try again.", variant: "destructive" });
        }
    };

    const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);

        const formData = new FormData(e.currentTarget);

        // Construct order items
        const orderItems = items.map(item => ({
            product_id: item.productId || item.id,
            variant_id: item.variantId,
            quantity: item.quantity,
            price: item.price
        }));

        try {
            // Ideally use the API route here too, but for speed keeping the server action if it works with the DB
            // However, the action likely uses `products` table which is fine.
            // But we created a NEW API route for orders `/api/orders`. We should use it!

            const payload = {
                email: email, // Validated in step 1 or from auth
                items: orderItems,
                phone: formData.get("phone") as string,
                shipping_address: {
                    first_name: formData.get("firstName") as string,
                    last_name: formData.get("lastName") as string,
                    address1: formData.get("address") as string,
                    city: formData.get("city") as string,
                    postal_code: formData.get("postalCode") as string, // Note: payload expects zip or postal_code? API Route uses schema "shipping_address"
                    zip: formData.get("postalCode") as string,
                    country: "Pakistan",
                    country_code: "PK"
                },
                payment_method: "card", // Default for now
                user_name: `${formData.get("firstName")} ${formData.get("lastName")}`,
                address: formData.get("address") as string
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                clearCart();
                toast({
                    title: "Order Placed!",
                    description: "Your shipping address has been saved for next time."
                });
                router.push(`/account/orders/${result.orderId}`);
            } else {
                toast({
                    title: "Order failed",
                    description: result.error,
                    variant: "destructive"
                });
            }
        } catch (err) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    // ... rest of render logic
    if (items.length === 0) {
        return (
            <div className="pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-3xl font-display mb-4">Your cart is empty</h1>
                <Button asChild variant="outline">
                    <Link href="/shop">Continue Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                {/* LEFT COLUMN: WIZARD */}
                <div>
                    <h1 className="text-4xl font-display mb-8">Checkout</h1>

                    <AnimatePresence mode="wait">
                        {/* STEP 1: EMAIL */}
                        {step === 'email' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-8 border border-black/10 bg-white shadow-sm">
                                    <h2 className="text-sm font-semibold tracking-[0.2em] uppercase mb-8 border-b border-black/5 pb-4">Contact Information</h2>
                                    <form onSubmit={handleSendOTP} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="YOU@EXAMPLE.COM"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="rounded-none border-black/20 focus:border-black h-12 uppercase text-xs tracking-widest"
                                            />
                                        </div>
                                        <Button type="submit" variant="cta" size="xl" className="w-full text-xs" disabled={isProcessing}>
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "PROCEED TO VERIFICATION"}
                                        </Button>
                                    </form>
                                </div>
                                <p className="text-[10px] text-neutral-400 text-center tracking-widest uppercase">
                                    A specialized code will be sent to verify your identity.
                                </p>
                            </motion.div>
                        )}

                        {/* STEP 2: OTP */}
                        {step === 'otp' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-8 border border-black/10 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
                                        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase">Verify it's you</h2>
                                        <button onClick={() => setStep('email')} className="text-[10px] tracking-widest uppercase text-neutral-400 hover:text-black underline">Edit Email</button>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-8 tracking-wide">
                                        Security code sent to <span className="text-black font-semibold">{email.toUpperCase()}</span>
                                    </p>
                                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="otp" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">Security Code</Label>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="••••••"
                                                required
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="text-center tracking-[0.8em] text-xl font-mono h-14 rounded-none border-black/20 focus:border-black"
                                                maxLength={6}
                                            />
                                        </div>
                                        <Button type="submit" variant="cta" size="xl" className="w-full text-xs" disabled={isProcessing}>
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "CONTINUE TO CHECKOUT"}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: DETAILS FORM */}
                        {step === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-neutral-600 bg-neutral-100 p-4 border border-black/5">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Authenticated : {activeUser?.email}</span>
                                </div>

                                <form onSubmit={handleCheckout} className="space-y-12">
                                    {/* Shipping Address */}
                                    <div className="space-y-8">
                                        <h2 className="text-sm font-semibold tracking-[0.3em] uppercase border-b border-black/5 pb-4">Shipping Details</h2>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2 col-span-2 md:col-span-1">
                                                <Label htmlFor="firstName" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">First name</Label>
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    required
                                                    defaultValue={savedAddress?.first_name || customer?.first_name || ''}
                                                    className="rounded-none border-black/20 focus:border-black h-12 uppercase text-xs"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2 md:col-span-1">
                                                <Label htmlFor="lastName" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">Last name</Label>
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    required
                                                    defaultValue={savedAddress?.last_name || customer?.last_name || ''}
                                                    className="rounded-none border-black/20 focus:border-black h-12 uppercase text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">Shipping Address</Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                placeholder="HOUSE NO, STREET, AREA"
                                                required
                                                minLength={5}
                                                defaultValue={savedAddress?.address1 || ''}
                                                className="rounded-none border-black/20 focus:border-black h-12 uppercase text-xs"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="city" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">City</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    required
                                                    minLength={2}
                                                    defaultValue={savedAddress?.city || ''}
                                                    className="rounded-none border-black/20 focus:border-black h-12 uppercase text-xs"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">Postal code</Label>
                                                <Input
                                                    id="postalCode"
                                                    name="postalCode"
                                                    required
                                                    defaultValue={savedAddress?.postal_code || ''}
                                                    className="rounded-none border-black/20 focus:border-black h-12 uppercase text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">Phone (For courier contact)</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="+92 300 0000000"
                                                defaultValue={customer?.phone || savedAddress?.phone || ''}
                                                className="rounded-none border-black/20 focus:border-black h-12 text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-6">
                                        <h2 className="text-sm font-semibold tracking-[0.3em] uppercase border-b border-black/5 pb-4">Payment Method</h2>
                                        <div className="border border-black/10 p-6 bg-neutral-50 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <span className="text-[10px] tracking-[0.2em] font-semibold uppercase text-neutral-900 leading-none">Cash on Delivery</span>
                                                <p className="text-[9px] tracking-widest text-neutral-500 uppercase">Pay when you receive your order</p>
                                            </div>
                                            <div className="w-2 h-2 bg-black rounded-full shadow-[0_0_0_4px_white,0_0_0_5px_black]"></div>
                                        </div>
                                    </div>

                                    <Button type="submit" variant="cta" size="xl" className="w-full" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : `PLACE ORDER • ${formatCurrency(cartTotal + (step === 'details' ? 250 : 0))}`}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* RIGHT COLUMN: SUMMARY */}
                {/* Order Summary (Reuse existing design) */}
                <div className="bg-secondary/20 p-8 rounded-lg h-fit">
                    <h2 className="text-xl font-manrope font-black uppercase tracking-widest mb-6 border-b border-foreground/10 pb-4">Order Summary</h2>
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4">
                                <div className="relative w-16 h-20 bg-secondary/30 flex-shrink-0 overflow-hidden rounded-none border border-foreground/5">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-200" />
                                    )}
                                    <span className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-manrope font-black w-5 h-5 flex items-center justify-center">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-manrope font-black text-[11px] uppercase tracking-widest">{item.name}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Size: {item.size}</p>
                                </div>
                                <p className="font-manrope font-black text-sm">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-6 opacity-30" />

                    <div className="space-y-3">
                        <div className="flex justify-between text-[11px] uppercase tracking-widest font-manrope font-black">
                            <span className="text-muted-foreground/60">Subtotal</span>
                            <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] uppercase tracking-widest font-manrope font-black">
                            <span className="text-muted-foreground/60">Shipping</span>
                            {step === 'details' ? <span>{formatCurrency(250)}</span> : <span className="text-neutral-400 font-medium italic">Calculated next step</span>}
                        </div>
                    </div>

                    <Separator className="my-6 opacity-30" />

                    <div className="flex justify-between items-center">
                        <span className="font-manrope font-black uppercase tracking-widest text-xs">Total</span>
                        <span className="font-manrope font-black text-3xl">{formatCurrency(cartTotal + (step === 'details' ? 250 : 0))}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

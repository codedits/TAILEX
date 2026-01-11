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
                    country: "US"
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
                                <div className="bg-neutral-900/50 p-6 rounded-lg border border-white/5">
                                    <h2 className="text-lg font-medium mb-4">Contact Information</h2>
                                    <form onSubmit={handleSendOTP} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isProcessing}>
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue to Shipping"}
                                        </Button>
                                    </form>
                                </div>
                                <p className="text-sm text-neutral-500 text-center">
                                    We'll send you a specialized code to verify your identity.
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
                                <div className="bg-neutral-900/50 p-6 rounded-lg border border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-medium">Verify it's you</h2>
                                        <button onClick={() => setStep('email')} className="text-xs text-neutral-400 hover:text-white underline">Change email</button>
                                    </div>
                                    <p className="text-sm text-neutral-400 mb-6">
                                        We sent a secure code to <span className="text-white">{email}</span>
                                    </p>
                                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="otp">Security Code</Label>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="123456"
                                                required
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="text-center tracking-[0.5em] text-lg font-mono"
                                                maxLength={6}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isProcessing}>
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
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
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-3 text-sm text-green-500 bg-green-500/10 p-3 rounded border border-green-500/20">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Signed in as {activeUser?.email}</span>
                                </div>

                                {/* RETURNING USER "1-CLICK" SUMMARY */}
                                {savedAddress && (
                                    <div className="bg-neutral-900 border border-white/10 rounded-lg p-6 mb-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-white font-medium">Shipping To</h3>
                                                <p className="text-white/60 text-sm mt-1">{savedAddress.first_name} {savedAddress.last_name}</p>
                                                <p className="text-white/60 text-sm">{savedAddress.address1}</p>
                                                <p className="text-white/60 text-sm">{savedAddress.city}, {savedAddress.postal_code}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={() => {
                                                // A real app might toggle a generic 'isEditing' state. 
                                                // For now we just rely on the form below to 'Edit'.
                                                // Actually, let's just make the inputs below show this data.
                                            }}>
                                                Verify Details Below
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleCheckout} className="space-y-8">
                                    {/* Shipping Address */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-medium uppercase tracking-wide">Shipping Address</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2 md:col-span-1">
                                                <Label htmlFor="firstName">First name</Label>
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    required
                                                    defaultValue={savedAddress?.first_name || customer?.first_name || ''}
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2 md:col-span-1">
                                                <Label htmlFor="lastName">Last name</Label>
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    required
                                                    defaultValue={savedAddress?.last_name || customer?.last_name || ''}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                placeholder="123 Main St"
                                                required
                                                defaultValue={savedAddress?.address1 || ''}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                defaultValue={customer?.phone || savedAddress?.phone || ''}
                                            />
                                            <p className="text-[10px] text-neutral-500">For shipping updates only.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    required
                                                    defaultValue={savedAddress?.city || ''}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode">Postal code</Label>
                                                <Input
                                                    id="postalCode"
                                                    name="postalCode"
                                                    required
                                                    defaultValue={savedAddress?.postal_code || ''}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Payment */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-medium uppercase tracking-wide">Payment</h2>
                                        <div className="border border-white/10 rounded-lg p-4 bg-neutral-900/50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-5 bg-white rounded-sm"></div>
                                                <span className="text-sm">•••• 4242</span>
                                            </div>
                                            <Link href="#" className="text-xs text-neutral-400 underline">Change</Link>
                                        </div>
                                    </div>

                                    <Button type="submit" variant="cta" size="xl" className="w-full" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : `PAY : ${formatCurrency(cartTotal + (step === 'details' ? 250 : 0))}`}
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

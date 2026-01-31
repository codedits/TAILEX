"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Truck, Zap } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";

interface ShippingMethodStepProps {
    selectedMethod: string;
    onSelect: (method: string) => void;
}

export function ShippingMethodStep({ selectedMethod, onSelect }: ShippingMethodStepProps) {
    const formatCurrency = useFormatCurrency();

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase mb-8 border-b border-black/5 pb-4">
                Shipping Method
            </h2>

            <RadioGroup value={selectedMethod} onValueChange={onSelect} className="space-y-4">

                {/* STANDARD SHIPPING */}
                <div className={cn(
                    "relative border p-6 flex cursor-pointer transition-all hover:bg-neutral-50",
                    selectedMethod === "standard"
                        ? "border-black bg-neutral-50 ring-1 ring-black/5"
                        : "border-neutral-200"
                )}>
                    <RadioGroupItem value="standard" id="shipping-standard" className="mt-1" />
                    <Label htmlFor="shipping-standard" className="flex-1 ml-4 cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm uppercase tracking-wide">Standard Delivery</span>
                            <span className="font-bold text-sm">{formatCurrency(250)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                            <Truck className="w-3 h-3" />
                            <span>3-5 Working Days</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wide">
                            Reliable delivery via TCS or Leopards.
                        </p>
                    </Label>
                </div>

                {/* EXPRESS SHIPPING */}
                <div className={cn(
                    "relative border p-6 flex cursor-pointer transition-all hover:bg-neutral-50",
                    selectedMethod === "express"
                        ? "border-black bg-neutral-50 ring-1 ring-black/5"
                        : "border-neutral-200"
                )}>
                    <RadioGroupItem value="express" id="shipping-express" className="mt-1" />
                    <Label htmlFor="shipping-express" className="flex-1 ml-4 cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm uppercase tracking-wide">Express Delivery</span>
                            <span className="font-bold text-sm">{formatCurrency(450)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>1-2 Working Days</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wide">
                            Priority processing and overnight shipping.
                        </p>
                    </Label>
                </div>

            </RadioGroup>
        </div>
    );
}

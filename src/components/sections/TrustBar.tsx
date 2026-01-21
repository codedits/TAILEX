import { ShieldCheck, Truck, RotateCcw, CreditCard, Headphones } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    title: "Worldwide Shipping",
    description: "Fast delivery to your doorstep"
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description: "Hassle-free exchange policy"
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    description: "Crafted with the finest materials"
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "100% encrypted transactions"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help anytime"
  }
];

export function TrustBar() {
  return (
    <div className="w-full bg-background border-y border-border py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12">
          {trustItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-3">
              <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <div className="space-y-1">
                <h3 className="text-sm font-medium tracking-tight uppercase">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

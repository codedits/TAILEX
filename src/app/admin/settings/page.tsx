import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSiteConfig } from "./actions";

export default async function SettingsPage() {
   const supabase = await createAdminClient();
   const { data: heroConfig } = await supabase.from('site_config').select('value').eq('key', 'hero').single();
   const { data: themeConfig } = await supabase.from('site_config').select('value').eq('key', 'theme').single();
   const { data: brandConfig } = await supabase.from('site_config').select('value').eq('key', 'brand').single();
   
   const hero = heroConfig?.value || {};
   const theme = themeConfig?.value || {};
   const brand = brandConfig?.value || { name: 'TAILEX', announcement: 'Welcome to our store', showAnnouncement: true };

   return (
    <div className="space-y-10 max-w-4xl">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Store Preferences</h2>
            <p className="text-white/50 text-sm">Configure your storefront's aesthetic and core identity.</p>
        </div>
        
        <form action={updateSiteConfig}>
            <div className="grid gap-10">
                <Card className="bg-[#0A0A0A] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                        <CardTitle className="text-lg text-white">Brand Identity</CardTitle>
                        <CardDescription className="text-white/40">Basic info that appears across your storefront.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8">
                        <div className="space-y-2">
                            <Label htmlFor="brandName" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Store Name</Label>
                            <Input id="brandName" name="brandName" defaultValue={brand.name} 
                                   className="bg-black border-white/10 rounded-xl focus:border-white/40 focus:ring-0 transition-all py-6 h-12 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="announcement" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Announcement Bar Text</Label>
                            <Input id="announcement" name="announcement" defaultValue={brand.announcement}
                                   className="bg-black border-white/10 rounded-xl focus:border-white/40 focus:ring-0 transition-all py-6 h-12 text-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0A0A0A] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                        <CardTitle className="text-lg text-white">Hero Section</CardTitle>
                        <CardDescription className="text-white/40">Customize the initial impact of your homepage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8">
                        <div className="space-y-2">
                            <Label htmlFor="heroHeading" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Primary Heading</Label>
                            <Input id="heroHeading" name="heroHeading" defaultValue={hero.heading} 
                                   className="bg-black border-white/10 rounded-xl focus:border-white/40 focus:ring-0 transition-all py-6 h-12 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heroSub" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Supportive Tagline</Label>
                            <Input id="heroSub" name="heroSub" defaultValue={hero.subheading}
                                   className="bg-black border-white/10 rounded-xl focus:border-white/40 focus:ring-0 transition-all py-6 h-12 text-white" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="heroImage" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">High-Resolution Background (URL)</Label>
                            <Input id="heroImage" name="heroImage" defaultValue={hero.image}
                                   className="bg-black border-white/10 rounded-xl focus:border-white/40 focus:ring-0 transition-all py-6 h-12 text-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0A0A0A] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                         <CardTitle className="text-lg text-white">Brand Palette</CardTitle>
                         <CardDescription className="text-white/40">Global color configuration for your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                         <div className="space-y-2">
                            <Label htmlFor="themeColor" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Primary Accent</Label>
                            <div className="flex gap-4">
                                <Input type="color" id="themeColor" name="themeColor" className="w-16 h-12 p-1 bg-black border-white/10 rounded-xl cursor-copy" defaultValue={theme.primaryColor || '#000000'} />
                                <div className="flex-1 flex items-center bg-black border border-white/10 rounded-xl px-4 text-white/50 text-sm italic">
                                    Current ID: {theme.primaryColor || '#000000'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-6 font-semibold transition-all shadow-xl">
                        Sync Preferences
                    </Button>
                </div>
            </div>
        </form>
    </div>
   );
}

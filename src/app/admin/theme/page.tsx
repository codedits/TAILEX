import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateThemeConfig } from "./actions";

const defaultTheme = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  backgroundColor: '#ffffff',
  foregroundColor: '#000000', 
  font: 'manrope',
  borderRadius: '0.5rem'
};

export default async function ThemePage() {
   const supabase = await createAdminClient();
   const { data: themeConfig } = await supabase.from('site_config').select('value').eq('key', 'theme').single();
   
   const theme = { ...defaultTheme, ...(themeConfig?.value || {}) };

   return (
    <div className="space-y-10 max-w-4xl">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Theme & Branding</h2>
            <p className="text-white/50 text-sm">Customize the visual identity of your storefront.</p>
        </div>
        
        <form action={updateThemeConfig}>
            <div className="grid gap-10">
                <Card className="bg-[#0A0A0A] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                         <CardTitle className="text-lg text-white">Typography</CardTitle>
                         <CardDescription className="text-white/40">Choose the primary font family for your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                         <div className="space-y-2">
                            <Label htmlFor="font" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Primary Font</Label>
                            <Select name="font" defaultValue={theme.font}>
                              <SelectTrigger className="bg-black border-white/10 text-white h-12">
                                <SelectValue placeholder="Select a font" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Manrope">Manrope</SelectItem>
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="borderRadius" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Border Radius</Label>
                            <Input id="borderRadius" name="borderRadius" defaultValue={theme.borderRadius} 
                                   className="bg-black border-white/10 rounded-xl focus:border-white/40 focus:ring-0 transition-all py-6 h-12 text-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0A0A0A] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
                         <CardTitle className="text-lg text-white">Color Palette</CardTitle>
                         <CardDescription className="text-white/40">Global color configuration for your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8 p-8">
                         <div className="space-y-2">
                            <Label htmlFor="primaryColor" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Primary Color</Label>
                            <div className="flex gap-4">
                                <Input type="color" id="primaryColor" name="primaryColor" className="w-16 h-12 p-1 bg-black border-white/10 rounded-xl cursor-pointer" defaultValue={theme.primaryColor} />
                                <Input type="text" value={theme.primaryColor} readOnly className="flex-1 bg-black border-white/10 rounded-xl text-white/50 text-sm italic h-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secondaryColor" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Secondary Color</Label>
                            <div className="flex gap-4">
                                <Input type="color" id="secondaryColor" name="secondaryColor" className="w-16 h-12 p-1 bg-black border-white/10 rounded-xl cursor-pointer" defaultValue={theme.secondaryColor} />
                                <Input type="text" value={theme.secondaryColor} readOnly className="flex-1 bg-black border-white/10 rounded-xl text-white/50 text-sm italic h-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="backgroundColor" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Background Color</Label>
                            <div className="flex gap-4">
                                <Input type="color" id="backgroundColor" name="backgroundColor" className="w-16 h-12 p-1 bg-black border-white/10 rounded-xl cursor-pointer" defaultValue={theme.backgroundColor} />
                                <Input type="text" value={theme.backgroundColor} readOnly className="flex-1 bg-black border-white/10 rounded-xl text-white/50 text-sm italic h-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="foregroundColor" className="text-white/60 text-xs font-medium uppercase tracking-widest pl-1">Foreground (Text) Color</Label>
                            <div className="flex gap-4">
                                <Input type="color" id="foregroundColor" name="foregroundColor" className="w-16 h-12 p-1 bg-black border-white/10 rounded-xl cursor-pointer" defaultValue={theme.foregroundColor} />
                                <Input type="text" value={theme.foregroundColor} readOnly className="flex-1 bg-black border-white/10 rounded-xl text-white/50 text-sm italic h-12" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-6 font-semibold transition-all shadow-xl">
                        Save Theme
                    </Button>
                </div>
            </div>
        </form>
    </div>
   );
}

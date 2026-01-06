import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
   const supabase = await createAdminClient();
   const { data: heroConfig } = await supabase.from('site_config').select('value').eq('key', 'hero').maybeSingle();
   const { data: themeConfig } = await supabase.from('site_config').select('value').eq('key', 'theme').maybeSingle();
   const { data: brandConfig } = await supabase.from('site_config').select('value').eq('key', 'brand').maybeSingle();
   
   const hero = heroConfig?.value || {};
   const theme = themeConfig?.value || {};
   const brand = brandConfig?.value || { name: 'TAILEX', announcement: 'Welcome to our store', showAnnouncement: true };

   return (
    <div className="space-y-10 max-w-4xl">
        <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Store Preferences</h2>
            <p className="text-white/50 text-sm">Configure your storefront's aesthetic and core identity.</p>
        </div>
        
        <SettingsForm hero={hero} theme={theme} brand={brand} />
    </div>
   );
}

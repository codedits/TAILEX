import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CheckoutWizard from "@/components/checkout/CheckoutWizard";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let customerProfile = null;
  let defaultAddress = null;

  if (user) {
    // Fetch Customer Profile
    const { data: customer } = await supabase
      .from('customers')
      .select('*, addresses:customer_addresses(*)')
      .eq('user_id', user.id)
      .single();

    if (customer) {
      customerProfile = customer;
      // Find default address or take the first one
      if (customer.addresses && customer.addresses.length > 0) {
        defaultAddress = customer.addresses.find((a: any) => a.is_default) || customer.addresses[0];
      }
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CheckoutWizard user={user} customer={customerProfile} savedAddress={defaultAddress} />
      <Footer />
    </main>
  );
}

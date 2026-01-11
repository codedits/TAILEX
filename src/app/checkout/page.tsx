import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CheckoutWizard from "@/components/checkout/CheckoutWizard";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let customerProfile = null;
  let defaultAddress = null;
  let customerData = null; // Initialize customerData here

  if (user) {
    // Fetch Customer Profile
    const { data: fetchedCustomerData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchedCustomerData) {
      customerData = fetchedCustomerData; // Assign to customerData
      customerProfile = fetchedCustomerData;
      // Find default address or take the first one
      // Assuming customerData.addresses exists and is an array
      if (customerData.addresses && customerData.addresses.length > 0) {
        defaultAddress = customerData.addresses.find((a: any) => a.is_default) || customerData.addresses[0];
      }
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CheckoutWizard
        user={user}
        customer={customerProfile}
        savedAddress={customerData ? {
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          address1: customerData.address1,
          city: customerData.city,
          postal_code: customerData.zip,
          country: customerData.country,
          phone: customerData.phone
        } : null}
      />
      <Footer />
    </main>
  );
}

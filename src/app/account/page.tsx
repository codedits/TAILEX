import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { updateProfile, addAddress, deleteAddress } from './actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user.id)
        .single();
    
    const { data: addresses } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false });

    return (
        <div className="space-y-12">
            {/* Profile Section */}
            <section>
                <h2 className="text-2xl font-light text-white mb-6">Profile Settings</h2>
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 lg:p-8">
                    <form action={updateProfile} className="grid gap-6 max-w-xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First name</Label>
                                <Input id="first_name" name="first_name" defaultValue={customer?.first_name || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last name</Label>
                                <Input id="last_name" name="last_name" defaultValue={customer?.last_name || ''} />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="phone">Phone</Label>
                             <Input id="phone" name="phone" type="tel" defaultValue={customer?.phone || ''} />
                        </div>
                         <div className="space-y-2">
                             <Label>Email</Label>
                             <Input disabled value={user.email} className="bg-white/5" />
                        </div>
                        <Button type="submit" className="w-fit">Save Changes</Button>
                    </form>
                </div>
            </section>

            {/* Addresses Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-light text-white">Addresses</h2>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Add Address
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Address</DialogTitle>
                                <DialogDescription>
                                    Add a new shipping address to your account.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={addAddress} className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="first_name" placeholder="First Name" required />
                                    <Input name="last_name" placeholder="Last Name" required />
                                </div>
                                <Input name="address1" placeholder="Address Line 1" required />
                                <Input name="address2" placeholder="Address Line 2 (Optional)" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="city" placeholder="City" required />
                                    <Input name="zip" placeholder="ZIP / Postal Code" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="province" placeholder="State / Province" />
                                    <Input name="country" placeholder="Country" defaultValue="US" />
                                </div>
                                <Input name="phone" placeholder="Phone" type="tel" />
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" name="is_default" id="is_default" className="rounded border-white/10 bg-white/5" />
                                    <Label htmlFor="is_default">Set as default</Label>
                                </div>
                                <Button type="submit">Save Address</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses?.map((addr) => (
                        <div key={addr.id} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 relative group">
                            {addr.is_default && (
                                <span className="absolute top-4 right-4 text-xs bg-white/10 text-white px-2 py-1 rounded-full">Default</span>
                            )}
                            <div className="flex items-start gap-4">
                                <MapPin className="w-5 h-5 text-neutral-500 mt-1" />
                                <div className="space-y-1 text-sm text-neutral-300">
                                    <p className="font-medium text-white">{addr.first_name} {addr.last_name}</p>
                                    <p>{addr.address1}</p>
                                    {addr.address2 && <p>{addr.address2}</p>}
                                    <p>{addr.city}, {addr.province} {addr.zip}</p>
                                    <p>{addr.country}</p>
                                    {addr.phone && <p className="pt-2 text-neutral-500">{addr.phone}</p>}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <form action={deleteAddress}>
                                    <input type="hidden" name="id" value={addr.id} />
                                    <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                                    </Button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {!addresses?.length && (
                        <div className="col-span-full py-12 text-center text-neutral-500 bg-white/5 rounded-2xl border-dashed border border-white/10">
                            No addresses saved yet.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

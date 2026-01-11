'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/account/actions';
import { useRouter } from 'next/navigation';
import { User, MapPin, Check, Save } from 'lucide-react';

type Props = {
    user: any;
    profile: any;
};

export default function AccountSettings({ user, profile }: Props) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    async function handleUpdate(formData: FormData) {
        setLoading(true);
        const res = await updateProfile(formData);
        setLoading(false);
        if (res.error) setMessage(res.error);
        else {
            setMessage('Profile updated successfully');
            router.refresh();
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        }
    }

    return (
        <div className="space-y-8">
            <section className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-100">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black tracking-tight">Profile & Shipping</h3>
                        <p className="text-neutral-500 text-sm">Manage your personal details and shipping address.</p>
                    </div>
                </div>

                <form action={handleUpdate} className="space-y-8 max-w-4xl">
                    {/* Personal Info Group */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">First Name</label>
                                <input
                                    name="first_name"
                                    defaultValue={profile?.first_name || ''}
                                    placeholder="Enter your first name"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">Last Name</label>
                                <input
                                    name="last_name"
                                    defaultValue={profile?.last_name || ''}
                                    placeholder="Enter your last name"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Email Address (Read Only)</label>
                                <input
                                    disabled
                                    value={user.email}
                                    className="w-full bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-500 font-medium cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">Phone Number</label>
                                <input
                                    name="phone"
                                    defaultValue={profile?.phone || ''}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-neutral-100 my-8"></div>

                    {/* Address Group */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Shipping Address
                        </h4>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">Address Line 1</label>
                            <input
                                name="address1"
                                defaultValue={profile?.address1 || ''}
                                placeholder="Street address, P.O. box, etc."
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">Address Line 2 (Optional)</label>
                            <input
                                name="address2"
                                defaultValue={profile?.address2 || ''}
                                placeholder="Apartment, suite, unit, etc."
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">City</label>
                                <input
                                    name="city"
                                    defaultValue={profile?.city || ''}
                                    placeholder="City"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">State / Province</label>
                                <input
                                    name="province"
                                    defaultValue={profile?.province || ''}
                                    placeholder="State or Province"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">ZIP / Postal Code</label>
                                <input
                                    name="zip"
                                    defaultValue={profile?.zip || ''}
                                    placeholder="ZIP or Postal Code"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">Country</label>
                                <input
                                    name="country"
                                    defaultValue={profile?.country || 'US'}
                                    placeholder="Country"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-100 flex justify-end">
                        <button
                            disabled={loading}
                            className="bg-black text-white px-10 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Save className="w-4 h-4" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>

            {message && (
                <div className="fixed bottom-8 right-8 bg-black text-white px-6 py-4 rounded-xl shadow-2xl text-sm font-bold animate-fade-in z-50 flex items-center gap-3 border border-neutral-800">
                    <div className="bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-black" />
                    </div>
                    {message}
                </div>
            )}
        </div>
    );
}

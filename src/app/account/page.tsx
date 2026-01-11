import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { FadeInView } from '@/components/animations/FadeInView';
import AccountSettings from '@/components/account/AccountSettings';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
    const user = await requireAuth();
    const supabase = await createAdminClient();

    // Fetch Full Profile
    const { data: profile } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();



    return (
        <div className="max-w-7xl mx-auto px-6 py-24 min-h-[80vh]">
            <FadeInView>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-neutral-100 pb-12">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-3">Welcome Back</p>
                        <h1 className="text-5xl font-bold text-black tracking-tighter mb-4">
                            My Account.
                        </h1>
                        <p className="text-neutral-600 font-medium text-sm max-w-md">
                            Manage your personal information, address book, and view your purchase history.
                        </p>
                    </div>
                    <div className="mt-8 md:mt-0">
                        <form action="/api/auth/signout" method="post">
                            <button className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors border-b-2 border-transparent hover:border-black pb-1">
                                Log Out
                            </button>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Quick Links Sidebar */}
                    <aside className="lg:col-span-3 lg:border-r lg:border-neutral-100 lg:pr-8 h-fit">
                        <nav className="flex flex-col gap-6 sticky top-24">
                            <Link href="/account" className="text-sm font-bold text-black flex items-center gap-3 bg-neutral-50 p-3 rounded-lg">
                                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                Overview
                            </Link>
                            <Link href="/account/orders" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors flex items-center gap-3 group px-3 py-2">
                                <span className="w-1.5 h-1.5 bg-neutral-200 rounded-full group-hover:bg-black transition-colors"></span>
                                Orders & Returns
                            </Link>
                            <Link href="/shop" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors flex items-center gap-3 group px-3 py-2">
                                <span className="w-1.5 h-1.5 bg-neutral-200 rounded-full group-hover:bg-black transition-colors"></span>
                                Continue Shopping
                            </Link>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        <AccountSettings
                            user={user}
                            profile={profile}
                        />
                    </main>
                </div>
            </FadeInView>
        </div>
    );
}

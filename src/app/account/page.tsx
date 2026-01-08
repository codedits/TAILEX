import { redirect } from 'next/navigation';

export default function AccountPage() {
    // For now, redirect to orders as the main view
    redirect('/account/orders');
}

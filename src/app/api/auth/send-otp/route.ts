import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailService } from '@/services/email';

// Generate 6-digit code
function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // 1. Validate Email
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const supabase = await createAdminClient();

        // 2. Rate Limiting: Max 5 OTPs per email per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count } = await supabase
            .from('otp_codes')
            .select('*', { count: 'exact', head: true })
            .eq('email', email)
            .gte('created_at', oneHourAgo);

        if (count && count >= 5) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // 3. Invalidate Previous Unused OTPs (Optional but good practice)
        // We simply generate a new one; the verify endpoint checks for the latest valid one.

        // 4. Generate and Insert New OTP
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        const { error: insertError } = await supabase.from('otp_codes').insert({
            email,
            code, // Using 'code' as per existing schema
            expires_at: expiresAt,
        });

        if (insertError) {
            console.error('OTP Insert Error:', insertError);
            return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
        }

        // 5. Send Email via Nodemailer
        await EmailService.sendOTP(email, code);

        return NextResponse.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import transporter from '@/lib/nodemailer';
import { Order } from '@/lib/types';

export const EmailService = {
  async sendOTP(email: string, otp: string) {
    try {
      if (!process.env.SMTP_USER) {
        console.warn('SMTP_USER not set. Logging OTP:', otp);
        return; // Dev mode fallback
      }

      await transporter.sendMail({
        from: `"Tailex Store" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Login Verification Code',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Sign in to Tailex</h1>
            <p>Your verification code is:</p>
            <div style="background: #f4f4f4; padding: 20px; font-size: 24px; letter-spacing: 5px; text-align: center; border-radius: 8px;">
              <strong>${otp}</strong>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw error;
    }
  },

  async sendOrderConfirmation(email: string, order: Order) {
    try {
      if (!process.env.SMTP_USER) return;

      const itemsList = order.items?.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title} ${item.variant_title ? `(${item.variant_title})` : ''}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.unit_price.toFixed(2)}</td>
        </tr>
      `).join('');

      await transporter.sendMail({
        from: `"Tailex Store" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Confirmation #${order.id.slice(0, 8)}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Thank you for your order!</h1>
            <p>Order #${order.id.slice(0, 8)} has been placed successfully.</p>
            <p>Status: <strong>${order.status}</strong></p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="text-align: left; background: #f9f9f9;">
                  <th style="padding: 10px;">Item</th>
                  <th style="padding: 10px;">Qty</th>
                  <th style="padding: 10px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
              <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
              <p>Shipping: $${order.shipping_total.toFixed(2)}</p>
              <h3>Total: $${order.total.toFixed(2)}</h3>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      // Don't throw, just log. Email failure shouldn't crash the order flow if possible.
    }
  },

  async sendOrderStatusUpdate(email: string, order: Order, adminMessage?: string) {
    try {
       if (!process.env.SMTP_USER) return;

       await transporter.sendMail({
        from: `"Tailex Store" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Update #${order.id.slice(0, 8)}: ${order.status}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Order Update</h1>
            <p>Your order #${order.id.slice(0, 8)} status has been updated to:</p>
            <h2 style="color: #000; text-transform: uppercase;">${order.status}</h2>
            
            ${adminMessage ? `
              <div style="background: #eef2ff; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0;">
                <strong style="color: #4f46e5;">Note from Store:</strong>
                <p style="margin: 5px 0;">${adminMessage}</p>
              </div>
            ` : ''}
            
            <p>Track your order status in your account dashboard.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }
  }
};

import transporter from '@/lib/nodemailer';
import { Order } from '@/lib/types';

export const EmailService = {
  async sendOTP(email: string, otp: string) {
    try {
      if (!process.env.SMTP_USER) {
        console.warn('SMTP_USER not set. Logging OTP:', otp);
        return; // Dev mode fallback
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border: 1px solid #eaeaea;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #000;">TAILEX</h1>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.6;">Welcome back.</p>
              <p style="font-size: 14px; color: #666; margin-bottom: 30px; line-height: 1.6;">
                Use the code below to complete your secure sign-in. This code allows you to access your personal dashboard and order history.
              </p>

              <div style="background-color: #000; color: #fff; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-family: monospace; margin-bottom: 30px;">
                ${otp}
              </div>

              <p style="font-size: 12px; color: #999; text-align: center; margin-top: 40px;">
                This code expires in 10 minutes. If you did not request this, please ignore this email.
              </p>
            </div>
          </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Tailex Concierge" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Secure Sign-in Code',
        html,
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
        <div style="border-bottom: 1px solid #eaeaea; padding: 15px 0; display: flex; justify-content: space-between;">
           <div style="flex: 1;">
              <span style="display: block; font-size: 14px; color: #000; font-weight: 500;">${item.title}</span>
              <span style="display: block; font-size: 12px; color: #999; margin-top: 4px;">${item.variant_title || 'Standard'} x${item.quantity}</span>
           </div>
           <div style="text-align: right;">
              <span style="font-size: 14px; color: #000;">$${item.unit_price.toFixed(2)}</span>
           </div>
        </div>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 60px; border: 1px solid #eaeaea;">
              <div style="text-align: center; margin-bottom: 60px;">
                 <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #000;">TAILEX</h1>
              </div>

              <div style="margin-bottom: 40px; text-align: center;">
                <h2 style="font-size: 18px; font-weight: 400; color: #000; margin-bottom: 10px;">Order Confirmed</h2>
                <p style="font-size: 14px; color: #666; margin: 0;">Order #${order.id.slice(0, 8)}</p>
              </div>

              <div style="margin-bottom: 40px;">
                ${itemsList}
              </div>

              <div style="border-top: 2px solid #000; paddingTop: 20px; font-size: 14px; color: #000;">
                 <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Subtotal</span>
                    <span>$${order.subtotal.toFixed(2)}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Shipping</span>
                    <span>$${order.shipping_total.toFixed(2)}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; margin-top: 20px;">
                    <span>Total</span>
                    <span>$${order.total.toFixed(2)}</span>
                 </div>
              </div>

              <div style="margin-top: 60px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${order.id}" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">View Order Status</a>
              </div>
            </div>
          </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Tailex Concierge" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Confirmation #${order.id.slice(0, 8)}`,
        html,
      });
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
    }
  },

  async sendOrderStatusUpdate(email: string, order: Order, adminMessage?: string) {
    try {
      if (!process.env.SMTP_USER) return;

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 50px; border: 1px solid #eaeaea;">
               <div style="text-align: center; margin-bottom: 40px;">
                 <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #000;">TAILEX</h1>
               </div>

               <div style="text-align: center; margin-bottom: 30px;">
                  <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Status Update</p>
                  <h2 style="font-size: 24px; color: #000; margin: 0; text-transform: uppercase;">${order.status}</h2>
               </div>

                <p style="font-size: 14px; color: #666; text-align: center; line-height: 1.6; margin-bottom: 40px;">
                  Your order #${order.id.slice(0, 8)} has been updated.
                </p>

                ${adminMessage ? `
                  <div style="background-color: #f5f5f5; padding: 20px; font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 40px; text-align: center;">
                    "${adminMessage}"
                  </div>
                ` : ''}

                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${order.id}" style="text-decoration: underline; color: #000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Track Shipment</a>
                </div>
            </div>
          </body>
        </html>
       `;

      await transporter.sendMail({
        from: `"Tailex Concierge" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Status Update #${order.id.slice(0, 8)}`,
        html,
      });
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }
  }
};

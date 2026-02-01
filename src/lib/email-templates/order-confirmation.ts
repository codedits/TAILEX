import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function getOrderConfirmationHtml(order: Order, currency: string, siteUrl: string): string {
  const itemsList = order.items?.map(item => `
    <div style="border-bottom: 1px solid #eaeaea; padding: 15px 0; display: flex; justify-content: space-between;">
       <div style="flex: 1;">
          <span style="display: block; font-size: 14px; color: #000; font-weight: 500;">${item.title}</span>
          <span style="display: block; font-size: 12px; color: #999; margin-top: 4px;">${item.variant_title || 'Standard'} x${item.quantity}</span>
       </div>
       <div style="text-align: right;">
          <span style="font-size: 14px; color: #000;">${formatCurrency(item.unit_price, { code: currency, symbol: currency === 'PKR' ? 'Rs.' : '$', format: 'symbol amount' })}</span>
       </div>
    </div>
  `).join('') || '';

  // Note: We duplicate simple currency formatting logic or reuse the one from utils. 
  // Ideally, formatCurrency should take just the Order's currency code if simple, or the config object.
  // The 'currency' param passed here is likely just the code or symbol. 
  // Let's assume for this template we use the passed currency string to format or strict Utils call.
  // Only issue: formatCurrency in utils needs a config object. 
  // We'll construct a temp config object here to keep template pure-ish.

  const currencyConfig = { code: currency, symbol: currency === 'PKR' ? 'Rs.' : '$', format: 'symbol amount' as const };
  const fmt = (amount: number) => formatCurrency(amount, currencyConfig);

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 60px; border: 1px solid #eaeaea;">
          <div style="text-align: center; margin-bottom: 60px;">
             <h1 style="font-size: 24px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #000;">TAILEX</h1>
          </div>

          <div style="margin-bottom: 40px; text-align: center;">
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">Thank you for your order</p>
            <h2 style="font-size: 20px; font-weight: 400; color: #000; margin: 0;">Order #${order.order_number || order.id.slice(0, 8)}</h2>
          </div>

          <div style="margin-bottom: 40px;">
            ${itemsList}
          </div>

          <div style="border-top: 2px solid #000; padding-top: 20px; font-size: 14px; color: #000;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal</span>
                <span>${fmt(order.subtotal)}</span>
             </div>
             <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Shipping</span>
                <span>${fmt(order.shipping_total)}</span>
             </div>
             <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; margin-top: 20px;">
                <span>Total</span>
                <span>${fmt(order.total)}</span>
             </div>
          </div>

          <div style="margin-top: 60px; text-align: center;">
            <a href="${siteUrl}/account/orders/${order.id}" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">View Order Status</a>
          </div>
        </div>
      </body>
    </html>
  `;
}

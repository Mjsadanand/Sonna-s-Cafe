import twilio from 'twilio';
import { AppError } from '@/lib/utils';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Lazy initialization of Twilio client
let client: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!client) {
    if (!accountSid || !authToken) {
      throw new AppError('Twilio credentials not configured', 500);
    }
    client = twilio(accountSid, authToken);
  }
  return client;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
}

export interface EmailNotification {
  to: string;
  subject: string;
  message: string;
  template?: string;
  data?: Record<string, unknown>;
}

export interface SMSMessage {
  to: string;
  message: string;
}

export class NotificationService {
  // Send SMS notification to admin about new order
  static async sendOrderNotificationToAdmin(orderData: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    items: Array<{ name: string; quantity: number; price: string }>;
    total: string;
    deliveryAddress: string;
    estimatedDeliveryTime: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!accountSid || !authToken) {
        throw new AppError('Twilio configuration is missing', 500);
      }

      const message = this.formatOrderNotificationMessage(orderData);
      
      // Send SMS to admin (avoid WhatsApp same number conflict)
      const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER || '+919019994562';
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      
      if (!twilioPhoneNumber) {
        throw new AppError('Twilio phone number is not configured', 500);
      }
      
      const twilioMessage = await getTwilioClient().messages.create({
        from: twilioPhoneNumber,
        to: adminPhoneNumber,
        body: message,
      });

      return {
        success: true,
        messageId: twilioMessage.sid,
      };
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      };
    }
  }

  // Send order status update to customer
  static async sendOrderStatusUpdate(data: {
    customerPhone: string;
    orderNumber: string;
    status: string;
    estimatedDeliveryTime?: string;
    message?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!accountSid || !authToken || !twilioWhatsAppNumber) {
        throw new AppError('Twilio configuration is missing', 500);
      }

      const message = this.formatStatusUpdateMessage(data);
      
      const twilioMessage = await getTwilioClient().messages.create({
        from: twilioWhatsAppNumber,
        to: `whatsapp:${data.customerPhone}`,
        body: message,
      });

      return {
        success: true,
        messageId: twilioMessage.sid,
      };
    } catch (error) {
      console.error('Failed to send status update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send status update',
      };
    }
  }

  // Send SMS notification
  static async sendSMS(data: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!accountSid || !authToken) {
        throw new AppError('Twilio configuration is missing', 500);
      }

      const twilioSMSNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!twilioSMSNumber) {
        throw new AppError('Twilio SMS number is not configured', 500);
      }

      const message = await getTwilioClient().messages.create({
        from: twilioSMSNumber,
        to: data.to,
        body: data.message,
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
      };
    }
  }

  // Send email notification (placeholder for email service integration)
  static async sendEmail(data: EmailNotification): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)

      
      // For now, just log the email data
      return { success: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  // Send welcome message to new user
  static async sendWelcomeMessage(data: {
    phone: string;
    name: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message = `🎉 Welcome to Sonna's Cafe, ${data.name}!\n\nThank you for joining us. Get ready to enjoy delicious Korean cuisine delivered fresh to your door.\n\n✨ First-time customers get FREE delivery on orders above ₹500!\n\nStart exploring our menu and place your first order today!`;

      return await this.sendSMS({
        to: data.phone,
        message,
      });
    } catch (error) {
      console.error('Failed to send welcome message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send welcome message',
      };
    }
  }

  // Send daily sales report to admin
  static async sendDailySalesReport(data: {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    topItems: Array<{ name: string; quantity: number }>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message = this.formatDailySalesReport(data);
      
      const adminWhatsAppNumber = process.env.ADMIN_WHATSAPP_NUMBER || 'whatsapp:+919876543210';
      
      if (!twilioWhatsAppNumber) {
        throw new AppError('Twilio WhatsApp number is not configured', 500);
      }

      const twilioMessage = await getTwilioClient().messages.create({
        from: twilioWhatsAppNumber,
        to: adminWhatsAppNumber,
        body: message,
      });

      return {
        success: true,
        messageId: twilioMessage.sid,
      };
    } catch (error) {
      console.error('Failed to send daily sales report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send sales report',
      };
    }
  }

  // Private helper methods for formatting messages
  private static formatOrderNotificationMessage(orderData: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    items: Array<{ name: string; quantity: number; price: string }>;
    total: string;
    deliveryAddress: string;
    estimatedDeliveryTime: string;
  }): string {
    const itemsText = orderData.items
      .map(item => `• ${item.quantity}x ${item.name} - ₹${item.price}`)
      .join('\n');

    return `🔔 *NEW ORDER RECEIVED*

📋 Order: ${orderData.orderNumber}
👤 Customer: ${orderData.customerName}
📞 Phone: ${orderData.customerPhone}

🍽️ *Items:*
${itemsText}

💰 *Total: ₹${orderData.total}*

📍 *Delivery Address:*
${orderData.deliveryAddress}

⏰ *Estimated Delivery:* ${orderData.estimatedDeliveryTime}

Please confirm the order and start preparation! 👨‍🍳`;
  }

  private static formatStatusUpdateMessage(data: {
    orderNumber: string;
    status: string;
    estimatedDeliveryTime?: string;
    message?: string;
  }): string {
    const statusEmojis: Record<string, string> = {
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '🎯',
      out_for_delivery: '🚚',
      delivered: '✨',
      cancelled: '❌',
    };

    const statusMessages: Record<string, string> = {
      confirmed: 'Your order has been confirmed and we are preparing it!',
      preparing: 'Your delicious meal is being prepared by our kitchen team!',
      ready: 'Your order is ready and will be out for delivery soon!',
      out_for_delivery: 'Your order is on the way to you!',
      delivered: 'Your order has been delivered. Enjoy your meal!',
      cancelled: 'Your order has been cancelled.',
    };

    const emoji = statusEmojis[data.status] || '📦';
    const statusMessage = data.message || statusMessages[data.status] || `Your order status has been updated to ${data.status}`;
    
    let message = `${emoji} *Order Update - ${data.orderNumber}*\n\n${statusMessage}`;
    
    if (data.estimatedDeliveryTime && data.status !== 'delivered' && data.status !== 'cancelled') {
      message += `\n\n⏰ Estimated delivery: ${data.estimatedDeliveryTime}`;
    }

    message += '\n\nThank you for choosing Sonna\'s Cafe! 🍜';

    return message;
  }

  private static formatDailySalesReport(data: {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    topItems: Array<{ name: string; quantity: number }>;
  }): string {
    const topItemsText = data.topItems
      .slice(0, 5) // Top 5 items
      .map((item, index) => `${index + 1}. ${item.name} (${item.quantity} orders)`)
      .join('\n');

    return `📊 *Daily Sales Report - ${data.date}*

📈 *Summary:*
• Total Orders: ${data.totalOrders}
• Total Revenue: ₹${data.totalRevenue.toFixed(2)}
• Average Order Value: ₹${data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(2) : '0.00'}

🏆 *Top Selling Items:*
${topItemsText || 'No orders today'}

Keep up the great work! 🎉`;
  }
}

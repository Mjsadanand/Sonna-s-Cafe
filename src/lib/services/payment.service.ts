import Stripe from 'stripe';
import { AppError } from '@/lib/utils';
import { OrderService } from './order.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export interface CreatePaymentIntentData {
  orderId: string;
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export class PaymentService {
  // Create Stripe payment intent
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntentResult> {
    try {
      const { orderId, amount, currency = 'inr', customerId, metadata } = data;

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit (paise for INR)
        currency,
        customer: customerId,
        metadata: {
          orderId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        capture_method: 'automatic',
        confirmation_method: 'manual',
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount / 100, // Convert back to main currency unit
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new AppError('Failed to create payment intent', 500);
    }
  }

  // Confirm payment intent
  static async confirmPaymentIntent(paymentIntentId: string): Promise<{
    success: boolean;
    status: string;
    error?: string;
  }> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment confirmation failed',
      };
    }
  }

  // Get payment intent status
  static async getPaymentIntentStatus(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
  }> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error('Failed to retrieve payment intent:', error);
      throw new AppError('Failed to get payment status', 500);
    }
  }

  // Handle Stripe webhook events
  static async handleWebhookEvent(
    body: string | Buffer,
    signature: string
  ): Promise<{ processed: boolean; event?: Stripe.Event }> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      
      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.requires_action':
          await this.handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
          break;
        
        default:
          // Unhandled event type
      }

      return { processed: true, event };
    } catch (error) {
      console.error('Webhook processing failed:', error);
      return { processed: false };
    }
  }

  // Create Stripe customer
  static async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<{
    customerId: string;
    email: string;
    name?: string;
  }> {
    try {
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        metadata: data.metadata,
      });

      return {
        customerId: customer.id,
        email: customer.email!,
        name: customer.name || undefined,
      };
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw new AppError('Failed to create customer', 500);
    }
  }

  // Create refund
  static async createRefund(data: {
    paymentIntentId: string;
    amount?: number;
    reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent';
    metadata?: Record<string, string>;
  }): Promise<{
    refundId: string;
    amount: number;
    currency: string;
    status: string;
  }> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: data.paymentIntentId,
        amount: data.amount ? Math.round(data.amount * 100) : undefined,
        reason: data.reason,
        metadata: data.metadata,
      });

      return {
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency!,
        status: refund.status!,
      };
    } catch (error) {
      console.error('Failed to create refund:', error);
      throw new AppError('Failed to process refund', 500);
    }
  }

  // Private helper methods for webhook handling
  private static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      
      if (!orderId) {
        console.error('Order ID not found in payment intent metadata');
        return;
      }

      // Update order status to confirmed
      await OrderService.updateOrderStatus(orderId, 'confirmed');
      
      // TODO: Send confirmation email/SMS
      // TODO: Trigger WhatsApp notification to admin
      // TODO: Update inventory if needed
    } catch (error) {
      console.error('Failed to handle payment success:', error);
    }
  }

  private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      
      if (!orderId) {
        console.error('Order ID not found in payment intent metadata');
        return;
      }

      // Update order status to cancelled or keep as pending based on business logic
      await OrderService.updateOrderStatus(orderId, 'cancelled', 'Payment failed');
      
      // TODO: Send payment failure notification
    } catch (error) {
      console.error('Failed to handle payment failure:', error);
    }
  }

  private static async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      
      if (!orderId) {
        console.error('Order ID not found in payment intent metadata');
        return;
      }

      // Update order status to cancelled
      await OrderService.updateOrderStatus(orderId, 'cancelled', 'Payment cancelled');
      
      // TODO: Send cancellation notification
    } catch (error) {
      console.error('Failed to handle payment cancellation:', error);
    }
  }

  private static async handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      
      if (!orderId) {
        console.error('Order ID not found in payment intent metadata');
        return;
      }

      // TODO: Send notification about required action
    } catch (error) {
      console.error('Failed to handle payment action requirement:', error);
    }
  }

  // Get payment methods for customer
  static async getPaymentMethods(customerId: string): Promise<{
    id: string;
    type: string;
    card?: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    };
  }[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        } : undefined,
      }));
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      throw new AppError('Failed to get payment methods', 500);
    }
  }
}

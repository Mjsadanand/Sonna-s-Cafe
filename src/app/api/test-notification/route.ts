import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification.service';

// Test endpoint to send WhatsApp notification to admin
export async function POST() {
  try {
    const testOrderData = {
      orderNumber: "TEST-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: "Test Customer",
      customerPhone: "+919876543210",
      items: [
        {
          name: "Margherita Pizza",
          quantity: 2,
          price: "299.00"
        },
        {
          name: "Butter Chicken",
          quantity: 1,
          price: "325.00"
        }
      ],
      total: "923.00",
      deliveryAddress: "123 Test Street, Test City, Test State 123456",
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    };

    console.log('🧪 Testing WhatsApp notification with data:', testOrderData);
    
    const result = await NotificationService.sendOrderNotificationToAdmin(testOrderData);
    
    console.log('📱 Notification result:', result);

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      result,
      testData: testOrderData,
    });
  } catch (error) {
    console.error('❌ Test notification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}

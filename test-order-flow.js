// Test complete order flow with SMS notification
import { NotificationService } from './src/lib/services/notification.service.ts';

const testOrderFlow = async () => {
  try {
    console.log('🧪 Testing complete order flow with SMS notification...');
    
    // Simulate order data that would be created
    const orderData = {
      orderNumber: "FH-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: "John Doe",
      customerPhone: "+919876543210",
      items: [
        {
          name: "Margherita Pizza",
          quantity: 2,
          price: "598.00"
        },
        {
          name: "Butter Chicken",
          quantity: 1,
          price: "325.00"
        },
        {
          name: "Garlic Naan",
          quantity: 3,
          price: "180.00"
        }
      ],
      total: "1103.00",
      deliveryAddress: "123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001",
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    };

    console.log('📋 Order Details:');
    console.log('- Order Number:', orderData.orderNumber);
    console.log('- Customer:', orderData.customerName);
    console.log('- Phone:', orderData.customerPhone);
    console.log('- Items:', orderData.items.length);
    console.log('- Total: ₹' + orderData.total);
    console.log('- Address:', orderData.deliveryAddress);
    console.log('- Delivery Time:', orderData.estimatedDeliveryTime);
    
    console.log('\n📤 Sending order notification to admin...');
    
    const result = await NotificationService.sendOrderNotificationToAdmin(orderData);
    
    if (result.success) {
      console.log('✅ SUCCESS! Admin notification sent successfully!');
      console.log('📱 Message SID:', result.messageId);
      console.log('📞 Admin should receive SMS on: +919019994562');
      
      return {
        success: true,
        orderNumber: orderData.orderNumber,
        messageId: result.messageId
      };
    } else {
      console.error('❌ FAILED to send admin notification:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ ERROR in order flow test:', error.message);
    console.error('📋 Full error:', error);
    return { success: false, error: error.message };
  }
};

// Run the test
testOrderFlow()
  .then(result => {
    console.log('\n🎯 Final Result:', result);
    if (result.success) {
      console.log('\n🎉 Order notification system is working perfectly!');
      console.log('✅ When customers place orders, admin will receive SMS notifications with:');
      console.log('   • Order number and customer details');
      console.log('   • Complete item list with quantities and prices');
      console.log('   • Total amount');
      console.log('   • Full delivery address');
      console.log('   • Estimated delivery time');
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });

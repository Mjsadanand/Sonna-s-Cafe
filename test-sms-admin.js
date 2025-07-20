// Simple test script to verify SMS notification to admin
import twilio from 'twilio';

const testNotification = async () => {
  try {
    console.log('🧪 Testing SMS notification to admin...');
    
    // Test Twilio configuration first
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER;
    
    console.log('📋 Configuration check:');
    console.log('- Account SID:', accountSid ? '✅ Set' : '❌ Missing');
    console.log('- Auth Token:', authToken ? '✅ Set' : '❌ Missing');
    console.log('- Twilio Phone:', twilioPhoneNumber || '❌ Missing');
    console.log('- Admin Phone:', adminPhoneNumber || '❌ Missing');
    
    if (!accountSid || !authToken || !twilioPhoneNumber || !adminPhoneNumber) {
      throw new Error('❌ Twilio configuration is incomplete');
    }
    
    const client = twilio(accountSid, authToken);
    
    const orderNumber = "TEST-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const currentTime = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'short',
      timeStyle: 'short',
    });
    const deliveryTime = new Date(Date.now() + 45 * 60 * 1000).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'short',
      timeStyle: 'short',
    });

    const testMessage = `🔔 *NEW ORDER RECEIVED*

📋 Order: ${orderNumber}
👤 Customer: Test Customer
📞 Phone: +919876543210

🍽️ *Items:*
• 2x Margherita Pizza - ₹598.00
• 1x Butter Chicken - ₹325.00
• 3x Garlic Naan - ₹180.00

💰 *Total: ₹1103.00*

📍 *Delivery Address:*
123 Main Street, Apartment 4B
Mumbai, Maharashtra 400001

⏰ *Estimated Delivery:* ${deliveryTime}

Please confirm the order and start preparation! 👨‍🍳

--- TEST NOTIFICATION (${currentTime}) ---`;

    console.log('📤 Sending SMS notification...');
    console.log('From:', twilioPhoneNumber);
    console.log('To:', adminPhoneNumber);
    console.log('Order:', orderNumber);
    
    const message = await client.messages.create({
      from: twilioPhoneNumber,
      to: adminPhoneNumber,
      body: testMessage,
    });

    console.log('✅ SUCCESS! SMS sent to admin!');
    console.log('📱 Message SID:', message.sid);
    console.log('📞 Admin should receive SMS on:', adminPhoneNumber);
    console.log('⏰ Sent at:', currentTime);
    
    return { success: true, messageId: message.sid, orderNumber };
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('📋 Full error:', error);
    return { success: false, error: error.message };
  }
};

console.log('🚀 Starting SMS notification test...');
testNotification()
  .then(result => {
    console.log('\n🎯 Final Result:', result);
    if (result.success) {
      console.log('\n🎉 SMS notification sent successfully!');
      console.log('📱 Check your phone (+919019994562) for the SMS!');
    } else {
      console.log('\n❌ SMS notification failed:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });

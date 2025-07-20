// Simple test script to verify WhatsApp notification
import twilio from 'twilio';

const testNotification = async () => {
  try {
    console.log('🧪 Testing WhatsApp notification...');
    
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
    
    const testMessage = `🧪 *TEST NOTIFICATION*

📋 Order: TEST-${Math.random().toString(36).substr(2, 6).toUpperCase()}
👤 Customer: Test Customer  
📞 Phone: +919876543210

🍽️ *Items:*
• 1x Margherita Pizza - ₹299.00
• 2x Garlic Bread - ₹150.00

💰 *Total: ₹449.00*

📍 *Delivery Address:*
123 Test Street, Test City, Test State 123456

⏰ *Estimated Delivery:* ${new Date(Date.now() + 45 * 60 * 1000).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'short',
      timeStyle: 'short',
    })}

This is a test notification! 🧪`;

    console.log('📤 Sending test SMS...');
    console.log('From:', twilioPhoneNumber);
    console.log('To:', adminPhoneNumber);
    
    const message = await client.messages.create({
      from: twilioPhoneNumber,
      to: adminPhoneNumber,
      body: testMessage,
    });

    console.log('✅ SUCCESS! SMS sent with SID:', message.sid);
    console.log('📱 Check your phone for the SMS notification!');
    
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('📋 Full error:', error);
    return { success: false, error: error.message };
  }
};

testNotification();

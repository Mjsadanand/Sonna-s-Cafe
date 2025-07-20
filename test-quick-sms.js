import twilio from 'twilio';

// Quick SMS test with shorter message
const testQuickSMS = async () => {
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const shortMessage = `🔔 TEST SMS from Sonna's Cafe!

Order: TEST-${Math.random().toString(36).substr(2, 4).toUpperCase()}
Time: ${new Date().toLocaleTimeString()}

If you receive this, SMS notifications are working! ✅`;

    console.log('📤 Sending quick test SMS...');
    
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ADMIN_PHONE_NUMBER,
      body: shortMessage,
    });

    console.log('✅ Quick SMS sent! SID:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('❌ Quick SMS failed:', error.message);
    return { success: false, error: error.message };
  }
};

testQuickSMS();

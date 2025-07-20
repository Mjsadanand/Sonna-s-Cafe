// WhatsApp notification test with order details
const testWhatsAppNotification = async () => {
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const orderNumber = "FH-" + Math.random().toString(36).substr(2, 6).toUpperCase();
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

    const whatsappMessage = `🔔 *NEW ORDER RECEIVED*

📋 Order: ${orderNumber}
👤 Customer: Rajesh Kumar
📞 Phone: +919876543210

🍽️ *Items:*
• 2x Margherita Pizza - ₹598.00
• 1x Butter Chicken - ₹325.00
• 3x Garlic Naan - ₹180.00
• 1x Mango Lassi - ₹120.00

💰 *Total: ₹1223.00*

📍 *Delivery Address:*
Plot No. 45, Sector 18
Noida, Uttar Pradesh 201301
Near Metro Station

⏰ *Estimated Delivery:* ${deliveryTime}

Please confirm the order and start preparation! 👨‍🍳

*Sonna's Cafe* - Test Order (${currentTime})`;

    console.log('📤 Sending WhatsApp notification...');
    console.log('From:', process.env.TWILIO_WHATSAPP_NUMBER);
    console.log('To: whatsapp:+919019994562');
    console.log('Order:', orderNumber);
    
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: 'whatsapp:+919019994562',
      body: whatsappMessage,
    });

    console.log('✅ SUCCESS! WhatsApp sent to admin!');
    console.log('📱 Message SID:', message.sid);
    console.log('📞 Admin should receive WhatsApp on: +919019994562');
    console.log('⏰ Sent at:', currentTime);
    console.log('💬 Check WhatsApp for the detailed order notification!');
    
    return { success: true, messageId: message.sid, orderNumber };
  } catch (error) {
    console.error('❌ WhatsApp ERROR:', error.message);
    console.error('📋 Full error:', error);
    return { success: false, error: error.message };
  }
};

console.log('🚀 Starting WhatsApp notification test...');
testWhatsAppNotification()
  .then(result => {
    console.log('\n🎯 Final Result:', result);
    if (result.success) {
      console.log('\n🎉 WhatsApp notification sent successfully!');
      console.log('📱 Check your WhatsApp (+919019994562) for the order details!');
      console.log('💡 WhatsApp messages have better formatting and are more detailed than SMS');
    } else {
      console.log('\n❌ WhatsApp notification failed:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });

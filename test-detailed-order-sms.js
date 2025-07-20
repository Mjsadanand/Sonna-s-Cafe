// Detailed SMS notification test with full order information
const testDetailedSMSOrder = async () => {
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

    // Detailed SMS with complete order information
    const orderDetailsSMS = `🔔 NEW ORDER RECEIVED

📋 Order: ${orderNumber}
👤 Customer: Rajesh Kumar
📞 Phone: +919876543210

🍽️ ITEMS:
• 2x Margherita Pizza - ₹598.00
• 1x Butter Chicken - ₹325.00
• 3x Garlic Naan - ₹180.00
• 1x Mango Lassi - ₹120.00

💰 TOTAL: ₹1223.00

📍 DELIVERY ADDRESS:
Plot No. 45, Sector 18
Noida, Uttar Pradesh 201301
Near Metro Station

⏰ EST. DELIVERY: ${deliveryTime}

Please confirm the order and start preparation!

SONNA'S CAFE - ${currentTime}`;

    console.log('📤 Sending detailed SMS order notification...');
    console.log('From:', process.env.TWILIO_PHONE_NUMBER);
    console.log('To:', process.env.ADMIN_PHONE_NUMBER);
    console.log('Order:', orderNumber);
    
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ADMIN_PHONE_NUMBER,
      body: orderDetailsSMS,
    });

    console.log('✅ SUCCESS! Detailed SMS order notification sent!');
    console.log('📱 Message SID:', message.sid);
    console.log('📞 Admin should receive SMS on: +919019994562');
    console.log('⏰ Sent at:', currentTime);
    console.log('📋 This SMS contains all order details like a real order!');
    
    return { success: true, messageId: message.sid, orderNumber };
  } catch (error) {
    console.error('❌ SMS ERROR:', error.message);
    console.error('📋 Full error:', error);
    return { success: false, error: error.message };
  }
};

console.log('🚀 Starting detailed SMS order notification test...');
testDetailedSMSOrder()
  .then(result => {
    console.log('\n🎯 Final Result:', result);
    if (result.success) {
      console.log('\n🎉 Detailed SMS order notification sent successfully!');
      console.log('📱 Check your SMS (+919019994562) for the complete order details!');
      console.log('💡 This is exactly how you\'ll receive order notifications when customers place orders!');
    } else {
      console.log('\n❌ SMS notification failed:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });

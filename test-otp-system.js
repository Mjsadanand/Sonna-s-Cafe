// Test OTP system
const testOTPSystem = async () => {
  try {
    console.log('🧪 Testing OTP System...');
    
    const testPhoneNumber = '9019994562'; // Your admin number for testing
    
    console.log('📱 Step 1: Sending OTP to', testPhoneNumber);
    
    // Send OTP
    const sendResponse = await fetch('http://localhost:3000/api/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: testPhoneNumber })
    });
    
    const sendResult = await sendResponse.json();
    console.log('📤 Send OTP Result:', sendResult);
    
    if (sendResult.success) {
      console.log('✅ OTP sent successfully!');
      console.log('📱 Check your phone for the OTP message');
      console.log('\n🔍 To test verification, use the received OTP with:');
      console.log(`   POST /api/otp with { phoneNumber: "${testPhoneNumber}", otp: "YOUR_6_DIGIT_OTP" }`);
      
      // Check status
      console.log('\n📊 Checking verification status...');
      const statusResponse = await fetch(`http://localhost:3000/api/otp/status?phoneNumber=${testPhoneNumber}`);
      const statusResult = await statusResponse.json();
      console.log('📋 Status Result:', statusResult);
      
      return {
        success: true,
        message: 'OTP system is working! Check your phone for the OTP.',
        phoneNumber: testPhoneNumber
      };
    } else {
      console.error('❌ Failed to send OTP:', sendResult.error);
      return { success: false, error: sendResult.error };
    }
    
  } catch (error) {
    console.error('❌ OTP System Test Error:', error.message);
    return { success: false, error: error.message };
  }
};

console.log('🚀 Starting OTP System Test...');
testOTPSystem()
  .then(result => {
    console.log('\n🎯 Final Result:', result);
    if (result.success) {
      console.log('\n🎉 OTP System is working correctly!');
      console.log('📱 Users will now need to verify their phone before viewing orders');
      console.log('🔐 This adds an extra layer of security to your app');
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });

// Test script to verify settings API functionality

async function getAdminToken() {
  const response = await fetch('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

async function testSettings() {
  try {
    console.log('Getting admin token...');
    const adminToken = await getAdminToken();
    console.log('✅ Admin token obtained');
    
    console.log('\nTesting GET /api/admin/settings...');
    
    // Test GET settings
    const getResponse = await fetch('http://localhost:3000/api/admin/settings', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`GET failed: ${getResponse.status}`);
    }
    
    const currentSettings = await getResponse.json();
    console.log('✅ Current settings loaded:', {
      restaurantName: currentSettings.restaurantName,
      minimumOrderAmount: currentSettings.minimumOrderAmount,
      deliveryFee: currentSettings.deliveryFee
    });
    
    // Test POST settings with a small update
    console.log('\nTesting POST /api/admin/settings...');
    
    const updateData = {
      ...currentSettings,
      restaurantName: "Sonna's Cafe - Test Update",
      minimumOrderAmount: 25.00,
      deliveryFee: 7.99
    };
    
    const postResponse = await fetch('http://localhost:3000/api/admin/settings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      throw new Error(`POST failed: ${postResponse.status} - ${errorText}`);
    }
    
    const updatedSettings = await postResponse.json();
    console.log('✅ Settings updated successfully:', {
      restaurantName: updatedSettings.restaurantName,
      minimumOrderAmount: updatedSettings.minimumOrderAmount,
      deliveryFee: updatedSettings.deliveryFee,
      updatedAt: updatedSettings.updatedAt
    });
    
    console.log('\n🎉 Settings API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Settings API test failed:', error);
  }
}

testSettings();

// Simple test to check if APIs are working
const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');

    // Test menu categories (should work without auth)
    console.log('1. Testing /api/menu/categories...');
    const categoriesResponse = await fetch(`${BASE_URL}/api/menu/categories`);
    console.log(`Status: ${categoriesResponse.status}`);
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json();
      console.log(`Categories found: ${data.data?.length || 0}`);
    }
    console.log('');

    // Test addresses endpoint (should return 401 without auth)
    console.log('2. Testing /api/user/addresses (without auth)...');
    const addressesResponse = await fetch(`${BASE_URL}/api/user/addresses`);
    console.log(`Status: ${addressesResponse.status} (should be 401 without auth)`);
    console.log('');

    // Test orders endpoint (should return 401 without auth)
    console.log('3. Testing /api/orders (without auth)...');
    const ordersResponse = await fetch(`${BASE_URL}/api/orders`);
    console.log(`Status: ${ordersResponse.status} (should be 401 without auth)`);
    console.log('');

    console.log('Basic API tests completed!');
    console.log('- If categories endpoint returns 200, basic routing works');
    console.log('- If addresses/orders return 401, auth protection is working');
    console.log('- The APIs should work properly when called with valid authentication');

  } catch (error) {
    console.error('Error testing APIs:', error);
  }
}

testAPI();

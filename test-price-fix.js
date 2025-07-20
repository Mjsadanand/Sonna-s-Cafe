// Test script to verify price handling

// Simulate the parsePrice and formatCurrency functions
function parsePrice(price) {
  return typeof price === 'string' ? parseFloat(price) : price;
}

function formatCurrency(amount) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toFixed(2)}`;
}

// Test cases
const testCases = [
  { input: "25.50", expected: 25.50 },
  { input: 30, expected: 30 },
  { input: "15", expected: 15 },
  { input: 12.99, expected: 12.99 }
];

console.log('Testing parsePrice function:');
testCases.forEach(test => {
  const result = parsePrice(test.input);
  console.log(`Input: ${test.input} (${typeof test.input}) => Output: ${result} (${typeof result}) - ${result === test.expected ? 'PASS' : 'FAIL'}`);
});

console.log('\nTesting formatCurrency function:');
testCases.forEach(test => {
  const result = formatCurrency(test.input);
  console.log(`Input: ${test.input} => Output: ${result}`);
});

// Test menu item with string price (simulating database response)
const testMenuItem = {
  id: 'test',
  name: 'Test Item',
  price: "25.50", // String from database
  quantity: 2
};

const price = parsePrice(testMenuItem.price);
const total = price * testMenuItem.quantity;
console.log(`\nMenu Item Test:`);
console.log(`Price: ${testMenuItem.price} (${typeof testMenuItem.price})`);
console.log(`Parsed: ${price} (${typeof price})`);
console.log(`Total: ${formatCurrency(total)}`);

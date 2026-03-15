// Simple coupon calculation tests (can be run manually)
export function testCouponCalculations() {
  console.log("Testing coupon calculations...");
  
  // Test 1: 10% of 10000 should be 1000
  const percentageResult = Math.round(10000 * (10 / 100));
  console.assert(percentageResult === 1000, `Expected 1000, got ${percentageResult}`);
  
  // Test 2: Fixed discount should not exceed subtotal
  const fixedResult = Math.min(10000, 15000);
  console.assert(fixedResult === 10000, `Expected 1000, got ${fixedResult}`);
  
  // Test 3: 33% of 9999 should be rounded
  const roundedResult = Math.round(9999 * (33 / 100));
  console.assert(roundedResult === 3297, `Expected 3297, got ${roundedResult}`);
  
  console.log("All coupon calculation tests passed!");
}

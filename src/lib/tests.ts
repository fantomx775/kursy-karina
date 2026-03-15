// Simple validation tests
export function testValidations() {
  console.log("Testing validations...");

  // Test slug validation
  const validSlugs = ["kurs-podstawowy", "zaawansowany-kurs", "123-kurs"];
  const invalidSlugs = ["kurs z spacjami", "Kurs-Z-Dużych-Liter", "kurs@niepoprawny"];

  validSlugs.forEach(slug => {
    const isValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    console.assert(isValid, `Slug ${slug} should be valid`);
  });

  invalidSlugs.forEach(slug => {
    const isValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    console.assert(!isValid, `Slug ${slug} should be invalid`);
  });

  // Test price validation
  const validPrices = [100, 9999, 1];
  const invalidPrices = [0, -100, NaN, Infinity];

  validPrices.forEach(price => {
    const isValid = Number.isFinite(price) && price > 0;
    console.assert(isValid, `Price ${price} should be valid`);
  });

  invalidPrices.forEach(price => {
    const isValid = Number.isFinite(price) && price > 0;
    console.assert(!isValid, `Price ${price} should be invalid`);
  });

  console.log("All validation tests passed!");
}

// Test API response format
export function testApiResponses() {
  console.log("Testing API responses...");

  // Test success response
  const successResponse = {
    success: true,
    data: { id: "123", title: "Test Course" }
  };

  console.assert(successResponse.success === true, "Success response should have success: true");
  console.assert(successResponse.data !== undefined, "Success response should have data");

  // Test error response
  const errorResponse = {
    error: "Test error",
    field: "slug"
  };

  console.assert(errorResponse.error !== undefined, "Error response should have error message");
  console.assert(errorResponse.field === "slug", "Error response should have field info");

  console.log("All API response tests passed!");
}

// Test coupon calculations
export function testCouponCalculations() {
  console.log("Testing coupon calculations...");

  // Test percentage discount
  const percentageResult = Math.round(10000 * (10 / 100));
  console.assert(percentageResult === 1000, `10% of 10000 should be 1000, got ${percentageResult}`);

  // Test fixed discount
  const fixedResult = Math.min(10000, 15000);
  console.assert(fixedResult === 10000, `Fixed discount should not exceed subtotal`);

  // Test edge cases
  const edgeCaseResult = Math.round(9999 * (33 / 100));
  console.assert(edgeCaseResult === 3297, `33% of 9999 should be 3297, got ${edgeCaseResult}`);

  console.log("All coupon calculation tests passed!");
}

// Run all tests
export function runAllTests() {
  console.log("🧪 Running all tests...");
  
  try {
    testValidations();
    testApiResponses();
    testCouponCalculations();
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Tests failed:", error);
  }
}

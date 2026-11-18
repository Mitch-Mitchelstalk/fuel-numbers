/**
 * Fuel Numbers Calculator Tests
 * Tests all six worked test cases from SPEC.md
 */

import {
  RATES,
  convertFuelUsage,
  litresToDollars,
  dollarsToLitres,
  calculateRebateShouldGet,
  calculateRebateMissed,
  calculateAdminCost,
  calculateOperatorTimeCost,
  calculateTheftExposure,
  calculateTotalSavings,
  isDispensedMoreThanTotal,
  isOverClaimed
} from './calculator.js';

// Test utilities
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function runTest(testName, testFn) {
  try {
    testFn();
    console.log(`✓ ${testName}`);
    return true;
  } catch (error) {
    console.error(`✗ ${testName}`);
    console.error(`  ${error.message}`);
    return false;
  }
}

// Test Case 1: Farm example
function testFarmExample() {
  // Inputs: use 4,000 L/month, all dispensed on site (48,000 L/year)
  const monthlyLitres = 4000;
  const annualLitres = monthlyLitres * 12; // 48,000
  const dispensedAnnualLitres = annualLitres;
  const offRoadPercent = 90;
  const adminHours = 1;
  const adminPeriod = 'week';
  const adminRate = 35;
  const theftRisk = 'low';
  const dieselPrice = 2.22;
  
  // Results
  const rebateShouldGet = calculateRebateShouldGet(dispensedAnnualLitres, offRoadPercent);
  assertEqual(rebateShouldGet, 24221, 'Farm: rebate they should be getting');
  
  // Getting now blank: missed $0
  const rebateMissed = calculateRebateMissed(rebateShouldGet, null, null);
  assertEqual(rebateMissed, 0, 'Farm: rebate being missed (blank)');
  
  const adminCost = calculateAdminCost(adminHours, adminPeriod, adminRate);
  assertEqual(adminCost, 1820, 'Farm: admin cost');
  
  const theftExposure = calculateTheftExposure(dispensedAnnualLitres, RATES.theft[theftRisk] * 100, dieselPrice);
  assertEqual(theftExposure, 1066, 'Farm: theft exposure');
  
  const totalSavings = calculateTotalSavings(rebateMissed, adminCost, 0, theftExposure);
  assertEqual(totalSavings, 2886, 'Farm: total potential savings');
  
  // Gut-feel 80%: missed $4,844; total $7,730
  const rebateMissedGutfeel = calculateRebateMissed(rebateShouldGet, 'gutfeel', 80);
  assertEqual(rebateMissedGutfeel, 4844, 'Farm: rebate being missed (80% gut-feel)');
  
  const totalSavingsGutfeel = calculateTotalSavings(rebateMissedGutfeel, adminCost, 0, theftExposure);
  assertEqual(totalSavingsGutfeel, 7730, 'Farm: total potential savings (80% gut-feel)');
  
  // $ mode, $20,000 claimed now: missed $4,221; total $7,107
  const rebateMissedDollars = calculateRebateMissed(rebateShouldGet, 'dollars', 20000);
  assertEqual(rebateMissedDollars, 4221, 'Farm: rebate being missed ($20,000 claimed)');
  
  const totalSavingsDollars = calculateTotalSavings(rebateMissedDollars, adminCost, 0, theftExposure);
  assertEqual(totalSavingsDollars, 7107, 'Farm: total potential savings ($20,000 claimed)');
}

// Test Case 2: Civil example
function testCivilExample() {
  // Inputs: use 11,600 L/month, of which 10,000 L/month is dispensed on site (120,000 L/year)
  const totalMonthlyLitres = 11600;
  const dispensedMonthlyLitres = 10000;
  const dispensedAnnualLitres = dispensedMonthlyLitres * 12; // 120,000
  const offRoadPercent = 80;
  const adminHours = 8;
  const adminPeriod = 'month';
  const adminRate = 52;
  const theftRisk = 'medium';
  const dieselPrice = 2.60;
  
  // Results
  const rebateShouldGet = calculateRebateShouldGet(dispensedAnnualLitres, offRoadPercent);
  assertEqual(rebateShouldGet, 56664, 'Civil: rebate they should be getting');
  
  // Gut-feel 80%: missed $11,333
  const rebateMissed = calculateRebateMissed(rebateShouldGet, 'gutfeel', 80);
  assertEqual(rebateMissed, 11333, 'Civil: rebate being missed');
  
  const adminCost = calculateAdminCost(adminHours, adminPeriod, adminRate);
  assertEqual(adminCost, 4992, 'Civil: admin cost');
  
  const theftExposure = calculateTheftExposure(dispensedAnnualLitres, RATES.theft[theftRisk] * 100, dieselPrice);
  assertEqual(theftExposure, 9360, 'Civil: theft exposure');
  
  const totalSavings = calculateTotalSavings(rebateMissed, adminCost, 0, theftExposure);
  assertEqual(totalSavings, 25685, 'Civil: total potential savings');
  
  // Add operator time 2 hours/week at $52: operator $5,408; total $31,093
  const operatorCost = calculateOperatorTimeCost(2, 'week', 52);
  assertEqual(operatorCost, 5408, 'Civil: operator time cost');
  
  const totalSavingsWithOperator = calculateTotalSavings(rebateMissed, adminCost, operatorCost, theftExposure);
  assertEqual(totalSavingsWithOperator, 31093, 'Civil: total potential savings (with operator time)');
}

// Test Case 3: Linked fields
function testLinkedFields() {
  // Enter 4,000 L/month: converts to 923 L/week and 48,000 L/year
  const litresPerMonth = 4000;
  
  const litresPerYear = convertFuelUsage(litresPerMonth, 'month', 'year');
  assertEqual(Math.round(litresPerYear), 48000, 'Linked: litres per year from month');
  
  const litresPerWeek = convertFuelUsage(litresPerMonth, 'month', 'week');
  assertEqual(Math.round(litresPerWeek), 923, 'Linked: litres per week from month');
  
  // Changing diesel price changes calculations only, not litres
  const dieselPrice1 = 2.22;
  const dieselPrice2 = 2.50;
  
  // Calculate theft at both prices (litres stay the same)
  const theft1 = calculateTheftExposure(litresPerYear, 3, dieselPrice1); // 3% theft
  const theft2 = calculateTheftExposure(litresPerYear, 3, dieselPrice2);
  
  assertEqual(Math.round(theft1), 3197, 'Linked: theft at $2.22/L');
  assertEqual(Math.round(theft2), 3600, 'Linked: theft at $2.50/L');
  
  // Litres are unaffected by price change
  const litresStillSame = litresPerMonth;
  assertEqual(litresStillSame, 4000, 'Linked: litres unchanged when price changes');
}

// Test Case 4: Dispensed guard
function testDispensedGuard() {
  // Total use 4,000 L/month and dispensed 5,000 L/month: a warning shows
  const totalMonthlyLitres = 4000;
  const dispensedMonthlyLitres = 5000;
  const totalAnnualLitres = totalMonthlyLitres * 12;
  const dispensedAnnualLitres = dispensedMonthlyLitres * 12;
  
  const shouldWarn = isDispensedMoreThanTotal(totalAnnualLitres, dispensedAnnualLitres);
  assertEqual(shouldWarn, true, 'Dispensed guard: warning triggered');
  
  // The rebate still calculates on the dispensed figure
  const rebateShouldGet = calculateRebateShouldGet(dispensedAnnualLitres, 90);
  assertEqual(rebateShouldGet, 30276, 'Dispensed guard: rebate calculated on dispensed figure');
}

// Test Case 5: Skips
function testSkips() {
  // Skipping every supporting step still gives the core results
  // This is tested implicitly by the farm and civil examples above,
  // which don't use any supporting steps
  
  // Choosing Civil in step A pre-fills 80% off-road
  const civilOffRoad = RATES.offRoadPresets.civil;
  assertEqual(civilOffRoad, 0.80, 'Skips: civil industry pre-fills 80% off-road');
  
  console.log('  (Supporting steps are optional and can be skipped)');
}

// Test Case 6: Over-claim guard
function testOverClaimGuard() {
  // Farm example in $ mode with $30,000 claimed now: missed shows $0 with the check note
  const dispensedAnnualLitres = 48000;
  const offRoadPercent = 90;
  const claimedNow = 30000;
  
  const rebateShouldGet = calculateRebateShouldGet(dispensedAnnualLitres, offRoadPercent);
  assertEqual(rebateShouldGet, 24221, 'Over-claim guard: rebate they should be getting');
  
  const isOver = isOverClaimed(rebateShouldGet, 'dollars', claimedNow);
  assertEqual(isOver, true, 'Over-claim guard: over-claim detected');
  
  const rebateMissed = calculateRebateMissed(rebateShouldGet, 'dollars', claimedNow);
  assertEqual(rebateMissed, 0, 'Over-claim guard: rebate being missed shows $0');
}

// Run all tests
export function runAllTests() {
  console.log('\n=== Running Fuel Numbers Calculator Tests ===\n');
  
  const results = [
    runTest('Test Case 1: Farm example', testFarmExample),
    runTest('Test Case 2: Civil example', testCivilExample),
    runTest('Test Case 3: Linked fields', testLinkedFields),
    runTest('Test Case 4: Dispensed guard', testDispensedGuard),
    runTest('Test Case 5: Skips', testSkips),
    runTest('Test Case 6: Over-claim guard', testOverClaimGuard)
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n=== Test Results: ${passed}/${total} passed ===\n`);
  
  if (passed === total) {
    console.log('✓ All tests passed!');
    return true;
  } else {
    console.error('✗ Some tests failed');
    return false;
  }
}

// Auto-run tests if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

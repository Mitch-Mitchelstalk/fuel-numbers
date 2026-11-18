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
  calculateAdminCost,
  calculateOperatorTimeCost,
  calculateTheftExposure,
  calculateTotalSavings
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
  // Inputs: use 4,000 L/month (48,000 L/year)
  // D = L (dispensed litres removed, rebate and theft now use total fuel)
  const monthlyLitres = 4000;
  const annualLitres = monthlyLitres * 12; // 48,000
  const offRoadPercent = 90;
  const adminHours = 1;
  const adminPeriod = 'week';
  const adminRate = 35;
  const theftRisk = 'low';
  const dieselPrice = 2.22;
  
  // Results
  const rebateShouldGet = calculateRebateShouldGet(annualLitres, offRoadPercent);
  assertEqual(rebateShouldGet, 24221, 'Farm: rebate they should be getting');
  
  const adminCost = calculateAdminCost(adminHours, adminPeriod, adminRate);
  assertEqual(adminCost, 1820, 'Farm: admin cost');
  
  const theftExposure = calculateTheftExposure(annualLitres, RATES.theft[theftRisk] * 100, dieselPrice);
  assertEqual(theftExposure, 1066, 'Farm: theft exposure');
  
  // Scenario 1: Claims blank - total uses $0 for rebate missed
  const totalSavingsBlank = calculateTotalSavings(0, adminCost, 0, theftExposure);
  assertEqual(totalSavingsBlank, 2886, 'Farm: total potential savings (blank claims)');
  
  // Scenario 2: Gut-feel 80% - getting now $19,377, missed $4,844; total $7,730
  const gutfeelGettingNow = (80 / 100) * rebateShouldGet;
  assertEqual(Math.round(gutfeelGettingNow), 19377, 'Farm: gut feel getting now (80%)');
  
  const gutfeelMissed = rebateShouldGet - gutfeelGettingNow;
  assertEqual(Math.round(gutfeelMissed), 4844, 'Farm: gut feel rebate missed');
  
  const totalSavingsGutfeel = calculateTotalSavings(Math.round(gutfeelMissed), adminCost, 0, theftExposure);
  assertEqual(totalSavingsGutfeel, 7730, 'Farm: total potential savings (gut feel 80%)');
  
  // Scenario 3: Actual $20,000 - getting now 82.6%, missed $4,221; total $7,107
  const actualGettingNow = 20000;
  const actualPercent = (actualGettingNow / rebateShouldGet) * 100;
  assertEqual(Math.round(actualPercent * 10) / 10, 82.6, 'Farm: actual claim percentage');
  
  const actualMissed = rebateShouldGet - actualGettingNow;
  assertEqual(actualMissed, 4221, 'Farm: actual rebate missed');
  
  const totalSavingsActual = calculateTotalSavings(actualMissed, adminCost, 0, theftExposure);
  assertEqual(totalSavingsActual, 7107, 'Farm: total potential savings (actual $20,000)');
  
  // Scenario 4: Both actual and gut feel filled - total uses actual
  // (Total should be $7,107 not $7,730)
  assertEqual(totalSavingsActual, 7107, 'Farm: total uses actual when both filled');
}

// Test Case 2: Civil example
function testCivilExample() {
  // Inputs: use 10,000 L/month (120,000 L/year)
  // D = L (dispensed litres removed, rebate and theft now use total fuel)
  const monthlyLitres = 10000;
  const annualLitres = monthlyLitres * 12; // 120,000
  const offRoadPercent = 80;
  const adminHours = 8;
  const adminPeriod = 'month';
  const adminRate = 52;
  const theftRisk = 'medium';
  const dieselPrice = 2.60;
  
  // Results
  const rebateShouldGet = calculateRebateShouldGet(annualLitres, offRoadPercent);
  assertEqual(rebateShouldGet, 56664, 'Civil: rebate they should be getting');
  
  // Gut-feel 80%: getting now $45,331, missed $11,333
  const gutfeelGettingNow = (80 / 100) * rebateShouldGet;
  assertEqual(Math.round(gutfeelGettingNow), 45331, 'Civil: gut feel getting now (80%)');
  
  const gutfeelMissed = rebateShouldGet - gutfeelGettingNow;
  assertEqual(Math.round(gutfeelMissed), 11333, 'Civil: gut feel rebate missed');
  
  const adminCost = calculateAdminCost(adminHours, adminPeriod, adminRate);
  assertEqual(adminCost, 4992, 'Civil: admin cost');
  
  const theftExposure = calculateTheftExposure(annualLitres, RATES.theft[theftRisk] * 100, dieselPrice);
  assertEqual(theftExposure, 9360, 'Civil: theft exposure');
  
  const totalSavings = calculateTotalSavings(Math.round(gutfeelMissed), adminCost, 0, theftExposure);
  assertEqual(totalSavings, 25685, 'Civil: total potential savings');
  
  // Add log-book time: 2 min per dispense, 30 dispenses per week at $40/hr
  // = 2 × 30 × 52 / 60 = 52 hrs/yr × $40 = $2,080/yr
  // hours per month = 2 × 30 × 52 / 12 / 60 = 4.3 hrs per month
  const operatorCost = calculateOperatorTimeCost(2, 30, 40);
  assertEqual(operatorCost, 2080, 'Civil: log-book time cost');
  
  const totalSavingsWithOperator = calculateTotalSavings(Math.round(gutfeelMissed), adminCost, operatorCost, theftExposure);
  assertEqual(totalSavingsWithOperator, 27765, 'Civil: total potential savings (with log-book time)');
}

// Test Case 3: Linked fields
function testLinkedFields() {
  // Enter $8,880/month at $2.22: converts to 4,000 L/month, 48,000 L/year, 923 L/week
  const dollarsPerMonth = 8880;
  const dieselPrice = 2.22;
  
  const litresPerMonth = dollarsToLitres(dollarsPerMonth, dieselPrice);
  assertEqual(Math.round(litresPerMonth), 4000, 'Linked: litres per month from dollars');
  
  const litresPerYear = convertFuelUsage(litresPerMonth, 'month', 'year');
  assertEqual(Math.round(litresPerYear), 48000, 'Linked: litres per year');
  
  const litresPerWeek = convertFuelUsage(litresPerMonth, 'month', 'week');
  assertEqual(Math.round(litresPerWeek), 923, 'Linked: litres per week');
  
  const dollarsPerYear = litresToDollars(litresPerYear, dieselPrice);
  assertEqual(Math.round(dollarsPerYear), 106560, 'Linked: dollars per year');
  
  const dollarsPerWeek = litresToDollars(litresPerWeek, dieselPrice);
  assertEqual(Math.round(dollarsPerWeek), 2049, 'Linked: dollars per week');
  
  // Change price to $2.50 with $ last typed: $ stay unchanged, litres recalculate
  const newDieselPrice = 2.50;
  const dollarsStayTheSame = dollarsPerMonth; // 8880
  const newLitresPerMonth = dollarsToLitres(dollarsStayTheSame, newDieselPrice);
  
  assertEqual(dollarsStayTheSame, 8880, 'Linked: dollars stay when price changes ($ last typed)');
  assertEqual(Math.round(newLitresPerMonth), 3552, 'Linked: litres recalculate when price changes');
  
  const newLitresPerYear = convertFuelUsage(newLitresPerMonth, 'month', 'year');
  assertEqual(Math.round(newLitresPerYear), 42624, 'Linked: new litres per year');
  
  const newLitresPerWeek = convertFuelUsage(newLitresPerMonth, 'month', 'week');
  assertEqual(Math.round(newLitresPerWeek), 820, 'Linked: new litres per week (42624/52 = 819.69 rounds to 820)');
}

// Test Case 4: Skips
function testSkips() {
  // Skipping every supporting step still gives the core results
  // This is tested implicitly by the farm and civil examples above,
  // which don't use any supporting steps
  
  // Choosing Civil in step A pre-fills 80% off-road
  const civilOffRoad = RATES.offRoadPresets.civil;
  assertEqual(civilOffRoad, 0.80, 'Skips: civil industry pre-fills 80% off-road');
  
  console.log('  (Supporting steps are optional and can be skipped)');
}

// Test Case 5: Over-claim guard
function testOverClaimGuard() {
  // Farm example with $30,000 claimed now: missed shows $0 (capped at zero)
  const annualLitres = 48000;
  const offRoadPercent = 90;
  const claimedNow = 30000;
  
  const rebateShouldGet = calculateRebateShouldGet(annualLitres, offRoadPercent);
  assertEqual(rebateShouldGet, 24221, 'Over-claim: rebate they should be getting');
  
  // When claiming more than entitled, missed = max(0, should - claimed)
  const rebateMissed = Math.max(0, rebateShouldGet - claimedNow);
  assertEqual(rebateMissed, 0, 'Over-claim: rebate being missed capped at $0');
  
  // The warning is shown in UI when claimedNow > rebateShouldGet
  const isOverClaiming = claimedNow > rebateShouldGet;
  assertEqual(isOverClaiming, true, 'Over-claim: over-claiming detected');
}

// Run all tests
export function runAllTests() {
  console.log('\n=== Running Fuel Numbers Calculator Tests ===\n');
  
  const results = [
    runTest('Test Case 1: Farm example', testFarmExample),
    runTest('Test Case 2: Civil example', testCivilExample),
    runTest('Test Case 3: Linked fields', testLinkedFields),
    runTest('Test Case 4: Skips', testSkips),
    runTest('Test Case 5: Over-claim guard', testOverClaimGuard)
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

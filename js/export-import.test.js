/**
 * Export / Import tests for Fuel Numbers
 */

import {
  exportToJSON,
  importFromJSON,
  buildYearlySnapshot,
  hasWeeklyOrMonthlyKeys,
  SCHEMA_VERSION,
  APP_VERSION
} from './export-import.js';

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
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

/**
 * Current worked example that must export total = 8051
 * missed 4221 + admin 2704 + log-book 406 + theft 720
 */
function exampleState() {
  return {
    fuelLitresYear: 48000,
    offRoadPercent: 90,
    dieselPrice: 2.50,
    actualDollars: 20000,
    actualPercent: null,
    gutfeelDollars: null,
    gutfeelPercent: null,
    adminHoursYear: 52, // 1 hour/week
    adminRate: 52,
    operatorMinutesPerDispense: 1,
    operatorDispensesPerWeek: 9,
    operatorRate: 52,
    theftPercent: 0.6
  };
}

function testExportTotal8051() {
  const data = exportToJSON(exampleState(), { exportedAt: '2026-11-18T00:00:00.000Z' });
  assertEqual(data.rebateClaim.missedPerYear, 4221, 'Missed rebate');
  assertEqual(data.admin.costPerYear, 2704, 'Admin cost');
  assertEqual(data.logBook.costPerYear, 406, 'Log-book cost');
  assertEqual(data.theft.exposurePerYear, 720, 'Theft exposure');
  assertEqual(data.total.potentialSavingsPerYear, 8051, 'Total potential savings');
}

function testExportYearlyOnlyKeys() {
  const data = exportToJSON(exampleState(), { exportedAt: '2026-11-18T00:00:00.000Z' });
  assert(!hasWeeklyOrMonthlyKeys(data), 'Export must not contain weekly or monthly keys');

  // Spot-check expected yearly keys exist
  assertEqual(typeof data.fuelUse.litresPerYear, 'number', 'fuelUse.litresPerYear present');
  assertEqual(typeof data.admin.hoursPerYear, 'number', 'admin.hoursPerYear present');
  assertEqual(typeof data.admin.costPerYear, 'number', 'admin.costPerYear present');
  assertEqual(typeof data.logBook.dispensesPerYear, 'number', 'logBook.dispensesPerYear present');
  assertEqual(typeof data.logBook.costPerYear, 'number', 'logBook.costPerYear present');
  assertEqual(typeof data.theft.litresPerYear, 'number', 'theft.litresPerYear present');
  assertEqual(typeof data.theft.exposurePerYear, 'number', 'theft.exposurePerYear present');
  assertEqual(typeof data.total.potentialSavingsPerYear, 'number', 'total.potentialSavingsPerYear present');

  assertEqual(data.schemaVersion, SCHEMA_VERSION, 'schemaVersion');
  assertEqual(data.appVersion, APP_VERSION, 'appVersion');
  assert(typeof data.exportedAt === 'string' && data.exportedAt.includes('T'), 'exportedAt ISO');
}

function testExportImportRoundTrip() {
  const original = exampleState();
  const exported = exportToJSON(original, { exportedAt: '2026-11-18T12:00:00.000Z' });

  const result = importFromJSON(exported);
  assert(result.success, `Import should succeed: ${result.error || ''}`);

  // Re-export from imported state — yearly figures and total must match
  const reexported = exportToJSON(result.state, { exportedAt: '2026-11-18T12:00:00.000Z' });

  assertEqual(
    reexported.fuelUse.litresPerYear,
    exported.fuelUse.litresPerYear,
    'Round-trip litresPerYear'
  );
  assertEqual(
    reexported.fuelUse.offRoadPercent,
    exported.fuelUse.offRoadPercent,
    'Round-trip offRoadPercent'
  );
  assertEqual(
    reexported.fuelUse.rebateShouldGetPerYear,
    exported.fuelUse.rebateShouldGetPerYear,
    'Round-trip rebateShouldGetPerYear'
  );
  assertEqual(reexported.rebateClaim.mode, exported.rebateClaim.mode, 'Round-trip claim mode');
  assertEqual(
    reexported.rebateClaim.claimedPerYear,
    exported.rebateClaim.claimedPerYear,
    'Round-trip claimedPerYear'
  );
  assertEqual(
    reexported.rebateClaim.missedPerYear,
    exported.rebateClaim.missedPerYear,
    'Round-trip missedPerYear'
  );
  assertEqual(reexported.admin.costPerYear, exported.admin.costPerYear, 'Round-trip admin cost');
  assertEqual(
    reexported.logBook.costPerYear,
    exported.logBook.costPerYear,
    'Round-trip log-book cost'
  );
  assertEqual(
    reexported.theft.exposurePerYear,
    exported.theft.exposurePerYear,
    'Round-trip theft exposure'
  );
  assertEqual(
    reexported.total.potentialSavingsPerYear,
    exported.total.potentialSavingsPerYear,
    'Round-trip total'
  );
  assertEqual(reexported.total.potentialSavingsPerYear, 8051, 'Round-trip total is 8051');

  // Weekly/monthly DOM derivatives exist for restore
  assert(result.derived.litresPerWeek != null, 'Derived litresPerWeek');
  assert(result.derived.litresPerMonth != null, 'Derived litresPerMonth');
  assert(result.derived.adminHoursWeek != null, 'Derived adminHoursWeek');
}

function testImportRejectsBadSchema() {
  const bad = exportToJSON(exampleState());
  bad.schemaVersion = '99.0';
  const result = importFromJSON(bad);
  assert(!result.success, 'Bad schemaVersion should fail');
  assert(result.error.toLowerCase().includes('schema'), 'Error mentions schema');
}

function testImportRejectsBadNumbers() {
  const bad = exportToJSON(exampleState());
  bad.theft.theftPercent = 'lots';
  const result = importFromJSON(bad);
  assert(!result.success, 'Non-numeric theftPercent should fail');
}

function testSnapshotMatchesExportTotal() {
  const snap = buildYearlySnapshot(exampleState());
  assertEqual(snap.missedPerYear, 4221, 'Snapshot missed');
  assertEqual(snap.adminCostPerYear, 2704, 'Snapshot admin');
  assertEqual(snap.logBookCostPerYear, 406, 'Snapshot log-book');
  assertEqual(snap.theftExposurePerYear, 720, 'Snapshot theft');
  assertEqual(snap.totalSavingsPerYear, 8051, 'Snapshot total');
}

export function runAllTests() {
  console.log('\n=== Running Export / Import Tests ===\n');

  const results = [
    runTest('Export total = 8051 for current example', testExportTotal8051),
    runTest('Export contains no weekly/monthly keys', testExportYearlyOnlyKeys),
    runTest('Export / import round-trip preserves yearly figures', testExportImportRoundTrip),
    runTest('Import rejects unsupported schemaVersion', testImportRejectsBadSchema),
    runTest('Import rejects invalid numbers', testImportRejectsBadNumbers),
    runTest('Yearly snapshot matches export totals', testSnapshotMatchesExportTotal)
  ];

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n=== Export/Import Results: ${passed}/${total} passed ===\n`);

  if (passed === total) {
    console.log('✓ All export/import tests passed!');
    return true;
  }

  console.log('✗ Some export/import tests failed');
  return false;
}

// Run if executed directly
const isMain = process.argv[1] && process.argv[1].endsWith('export-import.test.js');
if (isMain) {
  const ok = runAllTests();
  process.exit(ok ? 0 : 1);
}

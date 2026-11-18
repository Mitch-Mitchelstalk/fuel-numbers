/**
 * Export / Import JSON and PDF generation for Fuel Numbers
 * Browser-only: no network calls. YEARLY figures only in export schema.
 */

import {
  RATES,
  calculateRebateShouldGet,
  calculateRebateMissed,
  calculateOperatorTimeCost,
  calculateTheftExposure,
  calculateTheftLitres,
  calculateTotalSavings,
  formatNumber,
  formatCurrency
} from './calculator.js';

export const SCHEMA_VERSION = '1.0';
export const APP_VERSION = '1.7.0';

/**
 * Get current date in YYYY-MM-DD format
 */
export function getDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Recursively collect all object keys (dot paths for nested)
 */
export function collectKeys(obj, prefix = '') {
  const keys = [];
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return keys;
  }
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    keys.push(path);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v, path));
    }
  }
  return keys;
}

/**
 * True if any key looks weekly/monthly (forbidden in export)
 */
export function hasWeeklyOrMonthlyKeys(data) {
  const keys = collectKeys(data);
  const forbidden = /week|month|weekly|monthly/i;
  return keys.some(k => forbidden.test(k));
}

/**
 * Derive claim mode and yearly claim figures from app state
 */
function deriveClaim(state, rebateShouldGetPerYear) {
  let claimMode = 'none';
  let claimedPerYear = 0;
  let claimedPercent = null;

  if (state.actualDollars !== null && state.actualDollars !== undefined) {
    claimMode = 'actual';
    claimedPerYear = state.actualDollars;
    if (rebateShouldGetPerYear > 0) {
      claimedPercent = Math.round((state.actualDollars / rebateShouldGetPerYear) * 1000) / 10;
    }
  } else if (state.gutfeelPercent !== null && state.gutfeelPercent !== undefined) {
    claimMode = 'gutfeel';
    claimedPercent = state.gutfeelPercent;
    claimedPerYear = Math.round(rebateShouldGetPerYear * (state.gutfeelPercent / 100));
  } else if (state.gutfeelDollars !== null && state.gutfeelDollars !== undefined) {
    claimMode = 'gutfeel';
    claimedPerYear = state.gutfeelDollars;
    if (rebateShouldGetPerYear > 0) {
      claimedPercent = Math.round((state.gutfeelDollars / rebateShouldGetPerYear) * 1000) / 10;
    }
  }

  let missedPerYear = 0;
  if (claimMode === 'actual') {
    missedPerYear = calculateRebateMissed(rebateShouldGetPerYear, 'dollars', claimedPerYear);
  } else if (claimMode === 'gutfeel' && claimedPercent !== null) {
    missedPerYear = calculateRebateMissed(rebateShouldGetPerYear, 'gutfeel', claimedPercent);
  }

  return { claimMode, claimedPerYear, claimedPercent, missedPerYear };
}

/**
 * Build yearly snapshot used by export and PDF
 */
export function buildYearlySnapshot(state) {
  const fuelLitresYear = state.fuelLitresYear || 0;
  const offRoadPercent = state.offRoadPercent ?? null;

  const rebateShouldGetPerYear = (fuelLitresYear && offRoadPercent !== null) ?
    calculateRebateShouldGet(fuelLitresYear, offRoadPercent) : 0;

  const { claimMode, claimedPerYear, claimedPercent, missedPerYear } =
    deriveClaim(state, rebateShouldGetPerYear);

  // Admin: state stores hours/year; cost = hours/year × rate
  const adminHoursYear = state.adminHoursYear || 0;
  const adminRate = state.adminRate ?? RATES.defaultHourlyRate;
  const adminCostPerYear = adminHoursYear > 0 ?
    Math.round(adminHoursYear * adminRate) : 0;

  // Log-book: calculator expects dispenses per week
  const operatorMinutes = state.operatorMinutesPerDispense ?? 0;
  const operatorDispensesPerWeek = state.operatorDispensesPerWeek || 0;
  const operatorDispensesYear = operatorDispensesPerWeek > 0 ?
    Math.round(operatorDispensesPerWeek * 52) : 0;
  const operatorRate = state.operatorRate ?? RATES.defaultHourlyRate;
  const logBookCostPerYear = (operatorMinutes > 0 && operatorDispensesPerWeek > 0) ?
    calculateOperatorTimeCost(operatorMinutes, operatorDispensesPerWeek, operatorRate) : 0;

  // Theft
  const theftPercent = state.theftPercent ?? 0;
  const dieselPrice = state.dieselPrice ?? RATES.defaultDiesel;
  const theftLitresYear = fuelLitresYear > 0 ?
    Math.round(calculateTheftLitres(fuelLitresYear, theftPercent)) : 0;
  const theftExposurePerYear = fuelLitresYear > 0 ?
    calculateTheftExposure(fuelLitresYear, theftPercent, dieselPrice) : 0;

  const totalSavingsPerYear = calculateTotalSavings(
    missedPerYear,
    adminCostPerYear,
    logBookCostPerYear,
    theftExposurePerYear
  );

  return {
    fuelLitresYear,
    offRoadPercent,
    rebateShouldGetPerYear: Math.round(rebateShouldGetPerYear),
    claimMode,
    claimedPerYear: Math.round(claimedPerYear),
    claimedPercent,
    missedPerYear: Math.round(missedPerYear),
    adminHoursYear,
    adminRate,
    adminCostPerYear,
    operatorMinutes,
    operatorDispensesYear,
    operatorRate,
    logBookCostPerYear,
    theftPercent,
    theftLitresYear,
    dieselPrice,
    theftExposurePerYear,
    totalSavingsPerYear
  };
}

/**
 * Export current state as JSON (yearly figures only)
 */
export function exportToJSON(state, options = {}) {
  const snap = buildYearlySnapshot(state);
  const exportedAt = options.exportedAt || new Date().toISOString();

  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt,
    fuelUse: {
      litresPerYear: snap.fuelLitresYear,
      offRoadPercent: snap.offRoadPercent,
      rebateShouldGetPerYear: snap.rebateShouldGetPerYear
    },
    rebateClaim: {
      mode: snap.claimMode,
      claimedPerYear: snap.claimedPerYear,
      claimedPercent: snap.claimedPercent,
      missedPerYear: snap.missedPerYear
    },
    admin: {
      hoursPerYear: snap.adminHoursYear,
      hourlyRate: snap.adminRate,
      costPerYear: snap.adminCostPerYear
    },
    logBook: {
      minutesPerDispense: snap.operatorMinutes,
      dispensesPerYear: snap.operatorDispensesYear,
      hourlyRate: snap.operatorRate,
      costPerYear: snap.logBookCostPerYear
    },
    theft: {
      theftPercent: snap.theftPercent,
      litresPerYear: snap.theftLitresYear,
      dieselPricePerLitre: snap.dieselPrice,
      exposurePerYear: snap.theftExposurePerYear
    },
    total: {
      potentialSavingsPerYear: snap.totalSavingsPerYear
    }
  };
}

/**
 * Validate that a value is a finite number (or null if allowed)
 */
function isValidNumber(value, { allowNull = false, min = null, max = null } = {}) {
  if (value === null || value === undefined) {
    return allowNull;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

/**
 * Import JSON and produce a state patch + derived DOM values
 * Returns { success: true, state, derived } or { success: false, error }
 */
export function importFromJSON(jsonData) {
  try {
    if (!jsonData || typeof jsonData !== 'object' || Array.isArray(jsonData)) {
      return { success: false, error: 'Invalid file: expected a JSON object' };
    }

    if (!jsonData.schemaVersion) {
      return { success: false, error: 'Invalid file: missing schemaVersion' };
    }

    if (jsonData.schemaVersion !== SCHEMA_VERSION) {
      return {
        success: false,
        error: `Unsupported schema version: ${jsonData.schemaVersion}`
      };
    }

    const fuelUse = jsonData.fuelUse;
    const rebateClaim = jsonData.rebateClaim;
    const admin = jsonData.admin;
    const logBook = jsonData.logBook;
    const theft = jsonData.theft;
    const total = jsonData.total;

    if (!fuelUse || !rebateClaim || !admin || !logBook || !theft || !total) {
      return { success: false, error: 'Invalid file: missing required sections' };
    }

    // Validate numbers
    if (!isValidNumber(fuelUse.litresPerYear, { allowNull: true, min: 0 })) {
      return { success: false, error: 'Invalid fuelUse.litresPerYear' };
    }
    if (!isValidNumber(fuelUse.offRoadPercent, { allowNull: true, min: 0, max: 100 })) {
      return { success: false, error: 'Invalid fuelUse.offRoadPercent' };
    }
    if (!isValidNumber(admin.hoursPerYear, { allowNull: true, min: 0 })) {
      return { success: false, error: 'Invalid admin.hoursPerYear' };
    }
    if (!isValidNumber(admin.hourlyRate, { allowNull: true, min: 0 })) {
      return { success: false, error: 'Invalid admin.hourlyRate' };
    }
    if (!isValidNumber(logBook.minutesPerDispense, { allowNull: true, min: 0 })) {
      return { success: false, error: 'Invalid logBook.minutesPerDispense' };
    }
    if (!isValidNumber(logBook.dispensesPerYear, { allowNull: true, min: 0 })) {
      return { success: false, error: 'Invalid logBook.dispensesPerYear' };
    }
    if (!isValidNumber(logBook.hourlyRate, { allowNull: true, min: 0 })) {
      return { success: false, error: 'Invalid logBook.hourlyRate' };
    }
    if (!isValidNumber(theft.theftPercent, { allowNull: true, min: 0, max: 100 })) {
      return { success: false, error: 'Invalid theft.theftPercent' };
    }
    if (!isValidNumber(theft.dieselPricePerLitre, { allowNull: true, min: 0 })) {
      return { success: false, error: 'Invalid theft.dieselPricePerLitre' };
    }
    if (rebateClaim.mode && !['none', 'actual', 'gutfeel'].includes(rebateClaim.mode)) {
      return { success: false, error: 'Invalid rebateClaim.mode' };
    }
    if (!isValidNumber(rebateClaim.claimedPerYear, { allowNull: true, min: 0 })) {
      return { success: false, error: 'Invalid rebateClaim.claimedPerYear' };
    }
    if (!isValidNumber(rebateClaim.claimedPercent, { allowNull: true, min: 0, max: 100 })) {
      return { success: false, error: 'Invalid rebateClaim.claimedPercent' };
    }

    const litresPerYear = fuelUse.litresPerYear ?? null;
    const adminHoursYear = admin.hoursPerYear ?? null;
    const dispensesPerYear = logBook.dispensesPerYear ?? 0;
    const dispensesPerWeek = dispensesPerYear > 0 ?
      Math.round((dispensesPerYear / 52) * 10) / 10 : null;

    const theftPercent = theft.theftPercent ?? 0.6;
    let riskLevel = null;
    if (Math.abs(theftPercent - RATES.theft.low * 100) < 0.01) riskLevel = 'low';
    else if (Math.abs(theftPercent - RATES.theft.medium * 100) < 0.01) riskLevel = 'medium';
    else if (Math.abs(theftPercent - RATES.theft.high * 100) < 0.01) riskLevel = 'high';

    const newState = {
      fuelLitresYear: litresPerYear,
      lastEnteredType: 'litres',
      dieselPrice: theft.dieselPricePerLitre ?? RATES.defaultDiesel,
      dieselPriceModified: theft.dieselPricePerLitre != null &&
        theft.dieselPricePerLitre !== RATES.defaultDiesel,

      offRoadPercent: fuelUse.offRoadPercent ?? null,

      actualDollars: null,
      actualPercent: null,
      actualLastTyped: null,
      gutfeelDollars: null,
      gutfeelPercent: null,
      gutfeelLastTyped: null,

      adminHoursYear,
      adminRate: admin.hourlyRate ?? RATES.defaultHourlyRate,
      adminRateModified: admin.hourlyRate != null &&
        admin.hourlyRate !== RATES.defaultHourlyRate,
      adminDollarsLastSource: 'hours',

      operatorMinutesPerDispense: logBook.minutesPerDispense ?? 1,
      operatorDispensesPerWeek: dispensesPerWeek,
      operatorDispensesModified: true,
      operatorRate: logBook.hourlyRate ?? RATES.defaultHourlyRate,
      operatorRateModified: logBook.hourlyRate != null &&
        logBook.hourlyRate !== RATES.defaultHourlyRate,

      riskLevel: riskLevel || 'low',
      theftPercent,
      theftModified: true
    };

    if (rebateClaim.mode === 'actual') {
      newState.actualDollars = rebateClaim.claimedPerYear ?? null;
      newState.actualPercent = rebateClaim.claimedPercent ?? null;
      newState.actualLastTyped = 'dollars';
    } else if (rebateClaim.mode === 'gutfeel') {
      if (rebateClaim.claimedPercent != null) {
        newState.gutfeelPercent = rebateClaim.claimedPercent;
        newState.gutfeelLastTyped = 'percent';
      } else if (rebateClaim.claimedPerYear != null) {
        newState.gutfeelDollars = rebateClaim.claimedPerYear;
        newState.gutfeelLastTyped = 'dollars';
      }
    }

    // Derived weekly/monthly values for DOM restore
    const derived = {
      litresPerWeek: litresPerYear != null ? Math.round(litresPerYear / 52) : null,
      litresPerMonth: litresPerYear != null ? Math.round(litresPerYear / 12) : null,
      litresPerYear,
      dollarsPerWeek: null,
      dollarsPerMonth: null,
      dollarsPerYear: null,
      adminHoursWeek: adminHoursYear != null ?
        Math.round((adminHoursYear / 52) * 10) / 10 : null,
      adminHoursMonth: adminHoursYear != null ?
        Math.round((adminHoursYear / 12) * 10) / 10 : null,
      adminDollarsWeek: null,
      adminDollarsMonth: null,
      adminDollarsYear: null
    };

    if (litresPerYear != null && newState.dieselPrice) {
      derived.dollarsPerYear = Math.round(litresPerYear * newState.dieselPrice);
      derived.dollarsPerMonth = Math.round(derived.dollarsPerYear / 12);
      derived.dollarsPerWeek = Math.round(derived.dollarsPerYear / 52);
    }

    if (adminHoursYear != null && newState.adminRate) {
      derived.adminDollarsYear = Math.round(adminHoursYear * newState.adminRate);
      derived.adminDollarsMonth = Math.round(derived.adminDollarsYear / 12);
      derived.adminDollarsWeek = Math.round(derived.adminDollarsYear / 52);
    }

    return { success: true, state: newState, derived };
  } catch (error) {
    return { success: false, error: `Failed to parse JSON: ${error.message}` };
  }
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `fuel-numbers-${getDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Resolve jsPDF constructor from window (UMD) or global
 */
function getJsPDF() {
  if (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) {
    return window.jspdf.jsPDF;
  }
  if (typeof globalThis !== 'undefined' && globalThis.jspdf && globalThis.jspdf.jsPDF) {
    return globalThis.jspdf.jsPDF;
  }
  throw new Error('jsPDF library not loaded');
}

/**
 * Generate PDF document (does not save). Useful for testing/rendering.
 */
export function createPDFDocument(state) {
  const JsPDF = getJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const snap = buildYearlySnapshot(state);
  const dateStr = getDateString();

  let y = 18;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 64, 175);
  doc.text('Fuel Numbers', 105, y, { align: 'center' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(dateStr, 105, y, { align: 'center' });

  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  y += 10;

  function sectionTitle(title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(title, 20, y);
    y += 7;
  }

  function row(label, value) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 24, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), 190, y, { align: 'right' });
    y += 6;
  }

  // Fuel Use
  if (snap.fuelLitresYear > 0) {
    sectionTitle('1. Fuel Use');
    row('Litres per year', `${formatNumber(snap.fuelLitresYear)} L`);
    if (snap.offRoadPercent !== null) {
      row('Off-road / on-road', `${snap.offRoadPercent}% / ${100 - snap.offRoadPercent}%`);
    }
    row('Rebate should get per year', formatCurrency(snap.rebateShouldGetPerYear));
    y += 3;
  }

  // Rebate Claim
  if (snap.claimMode !== 'none') {
    sectionTitle('2. Rebate Claim');
    const modeLabel = snap.claimMode === 'actual' ? 'Actual claim' : 'Gut feel';
    row('Claim mode', modeLabel);
    row('Claimed per year', formatCurrency(snap.claimedPerYear));
    if (snap.claimedPercent !== null) {
      row('Claimed %', `${snap.claimedPercent}%`);
    }
    row('Missed per year', formatCurrency(snap.missedPerYear));
    y += 3;
  }

  // Admin
  if (snap.adminCostPerYear > 0) {
    sectionTitle('3. Admin Time');
    row('Hours per year', `${formatNumber(Math.round(snap.adminHoursYear * 10) / 10)}`);
    row('Hourly rate', formatCurrency(snap.adminRate));
    row('Admin cost per year', formatCurrency(snap.adminCostPerYear));
    y += 3;
  }

  // Log-book (same section group as admin in the app)
  if (snap.logBookCostPerYear > 0) {
    sectionTitle('3. Log-book Time');
    row('Minutes per dispense', `${snap.operatorMinutes}`);
    row('Dispenses per year', `${formatNumber(snap.operatorDispensesYear)}`);
    row('Hourly rate', formatCurrency(snap.operatorRate));
    row('Log-book cost per year', formatCurrency(snap.logBookCostPerYear));
    y += 3;
  }

  // Theft
  if (snap.theftExposurePerYear > 0 || snap.theftPercent > 0) {
    const dieselLabel = `$${Number(snap.dieselPrice).toFixed(2)}/L`;
    sectionTitle('4. Theft Risk');
    row('Theft % (estimate)', `${snap.theftPercent}%`);
    row('Litres lost per year', `${formatNumber(snap.theftLitresYear)} L`);
    row('Diesel price (estimate)', dieselLabel);
    row('Theft exposure per year', formatCurrency(snap.theftExposurePerYear));
    y += 3;
  }

  // Total box
  y += 4;
  doc.setFillColor(30, 64, 175);
  doc.roundedRect(20, y, 170, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total potential savings per year', 26, y + 10);
  doc.setFontSize(14);
  doc.text(formatCurrency(snap.totalSavingsPerYear), 184, y + 10, { align: 'right' });

  y += 24;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Estimates marked where defaults are used (theft % and diesel price). ATO rates for fuel acquired from 3 Aug 2026.',
    105,
    y,
    { align: 'center', maxWidth: 170 }
  );

  return doc;
}

/**
 * Generate and download PDF
 */
export function generatePDF(state) {
  const doc = createPDFDocument(state);
  const filename = `fuel-numbers-${getDateString()}.pdf`;
  doc.save(filename);
  return filename;
}

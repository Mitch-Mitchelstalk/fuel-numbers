/**
 * Fuel Numbers Calculator - Pure calculation module
 * All formulas and rates from SPEC.md
 */

// Rates and defaults (ATO rates for fuel acquired from 3 Aug 2026)
export const RATES = {
  offRoad: 0.537,        // 53.7¢/L
  onRoad: 0.213,         // 21.3¢/L
  defaultDiesel: 2.50,   // $/L
  defaultHourlyRate: 52, // $/hour
  hourlyRatePresets: [35, 52, 75],
  theft: {
    low: 0.006,   // 0.6%
    medium: 0.03, // 3%
    high: 0.06    // 6%
  },
  offRoadPresets: {
    civil: 0.80,        // 80%
    agriculture: 0.90,  // 90%
    transport: 0.05,    // 5%
    asphalt: 0.75       // 75%
  }
};

export const RATE_SOURCE = 'ATO rates for fuel acquired from 3 Aug 2026';

/**
 * Convert between fuel usage time periods
 * 1 year = 52 weeks = 12 months
 */
export function convertFuelUsage(value, fromPeriod, toPeriod) {
  if (fromPeriod === toPeriod) return value;
  
  // Convert to annual first
  let annual = value;
  if (fromPeriod === 'week') annual = value * 52;
  if (fromPeriod === 'month') annual = value * 12;
  
  // Convert from annual to target
  if (toPeriod === 'week') return annual / 52;
  if (toPeriod === 'month') return annual / 12;
  return annual;
}

/**
 * Convert litres to dollars
 */
export function litresToDollars(litres, pricePerLitre) {
  return litres * pricePerLitre;
}

/**
 * Convert dollars to litres
 */
export function dollarsToLitres(dollars, pricePerLitre) {
  return dollars / pricePerLitre;
}

/**
 * Calculate rebate they should be getting (annual)
 * R = D × (off% × off-road rate + (100 − off%)% × on-road rate)
 */
export function calculateRebateShouldGet(dispensedAnnualLitres, offRoadPercent) {
  const offRoadFraction = offRoadPercent / 100;
  const onRoadFraction = 1 - offRoadFraction;
  
  const rebate = dispensedAnnualLitres * (
    offRoadFraction * RATES.offRoad +
    onRoadFraction * RATES.onRoad
  );
  
  return Math.round(rebate);
}

/**
 * Calculate rebate being missed (annual)
 * - $ mode: R − $ claimed now
 * - Gut-feel mode: R × (100 − gut%)%
 * Never below $0
 */
export function calculateRebateMissed(rebateShouldGet, claimMode, claimValue) {
  if (!claimMode || claimValue === null || claimValue === undefined) {
    return 0;
  }
  
  let missed = 0;
  if (claimMode === 'dollars') {
    missed = rebateShouldGet - claimValue;
  } else if (claimMode === 'gutfeel') {
    const gutFeelFraction = claimValue / 100;
    missed = rebateShouldGet * (1 - gutFeelFraction);
  }
  
  return Math.max(0, Math.round(missed));
}

/**
 * Check if claiming more than entitled
 */
export function isOverClaimed(rebateShouldGet, claimMode, claimValue) {
  if (claimMode === 'dollars' && claimValue > rebateShouldGet) {
    return true;
  }
  return false;
}

/**
 * Calculate admin cost (annual)
 * Cost = hours × (52 if per week, 12 if per month) × $/hour
 */
export function calculateAdminCost(hours, period, hourlyRate) {
  if (!hours || hours <= 0) return 0;
  
  const multiplier = period === 'week' ? 52 : 12;
  return Math.round(hours * multiplier * hourlyRate);
}

/**
 * Calculate operator time cost (annual)
 * Cost = hours × (52 if per week, 12 if per month) × $/hour
 */
export function calculateOperatorTimeCost(minutesPerDispense, dispensesPerWeek, hourlyRate) {
  if (!minutesPerDispense || !dispensesPerWeek || minutesPerDispense <= 0 || dispensesPerWeek <= 0) return 0;
  
  // Formula: minutes per dispense × dispenses per week × 52 / 60 × rate
  const hoursPerYear = minutesPerDispense * dispensesPerWeek * 52 / 60;
  return Math.round(hoursPerYear * hourlyRate);
}

/**
 * Calculate theft exposure (annual)
 * Theft = D × theft % × diesel $/L
 * Uses dispensed on-site litres
 */
export function calculateTheftExposure(dispensedAnnualLitres, theftPercent, dieselPrice) {
  const theftFraction = theftPercent / 100;
  return Math.round(dispensedAnnualLitres * theftFraction * dieselPrice);
}

/**
 * Calculate total potential savings (annual)
 * Total = rebate being missed + admin + operator time + theft
 * Round each line to whole dollars before adding
 */
export function calculateTotalSavings(rebateMissed, adminCost, operatorCost, theftExposure) {
  return Math.round(rebateMissed) + Math.round(adminCost) + Math.round(operatorCost) + Math.round(theftExposure);
}

/**
 * Check if dispensed is more than total use
 */
export function isDispensedMoreThanTotal(totalAnnualLitres, dispensedAnnualLitres) {
  return dispensedAnnualLitres > totalAnnualLitres;
}

/**
 * Parse number string, stripping commas
 */
export function parseNumberInput(str) {
  if (!str || str === '') return null;
  const cleaned = str.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Format number input with commas (for integer fields)
 */
export function formatNumberInput(num) {
  if (num === null || num === undefined || num === '') return '';
  const rounded = Math.round(num);
  return rounded.toLocaleString('en-US');
}

/**
 * Format number with commas (for display)
 */
export function formatNumber(num) {
  return Math.round(num).toLocaleString('en-US');
}

/**
 * Format currency
 */
export function formatCurrency(num) {
  return '$' + formatNumber(num);
}

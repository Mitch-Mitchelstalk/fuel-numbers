/**
 * Fuel Numbers App - Single-page live calculator
 */

import {
  RATES,
  RATE_SOURCE,
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
  isOverClaimed,
  parseNumberInput,
  formatNumberInput,
  formatNumber,
  formatCurrency
} from './calculator.js';

// App state
const state = {
  // Fuel use
  fuelLitresYear: null,
  lastEnteredType: 'litres', // Track whether 'litres' or 'dollars' was last entered
  dieselPrice: RATES.defaultDiesel,
  dieselPriceModified: false,
  
  // Rebate
  offRoadPercent: null,
  actualDollars: null,
  actualPercent: null,
  gutfeelDollars: null,
  gutfeelPercent: null,
  
  // Admin
  adminHoursYear: null,
  adminRate: RATES.defaultHourlyRate,
  adminRateModified: false,
  
  // Operator (log-book time)
  operatorMinutesPerDispense: null,
  operatorDispensesPerWeek: null,
  operatorDispensesModified: false, // Track if user has typed their own value
  operatorRate: RATES.defaultHourlyRate,
  operatorRateModified: false,
  
  // Admin dollars (linked to hours x rate)
  adminDollarsLastSource: 'hours', // Track whether hours or dollars was last edited
  
  // Theft
  riskLevel: 'medium',
  theftPercent: RATES.theft.medium * 100
};

/**
 * Format an integer input field value (add commas if not focused)
 * @param {HTMLInputElement} input - The input element
 * @param {number} value - The numeric value to set
 */
function setFormattedValue(input, value) {
  if (value === null || value === undefined || value === '') {
    input.value = '';
    return;
  }
  // If the field is currently focused, don't format (user is typing)
  if (document.activeElement === input) {
    input.value = Math.round(value);
  } else {
    input.value = formatNumberInput(value);
  }
}

/**
 * Add thousands separator formatting to an input field
 * @param {HTMLInputElement} input - The input element
 * @param {boolean} isInteger - Whether to format as integer (default true)
 */
function addThousandsSeparator(input, isInteger = true) {
  input.addEventListener('blur', () => {
    if (!input.value) return;
    const num = parseNumberInput(input.value);
    if (num !== null && isInteger) {
      input.value = formatNumberInput(num);
    }
  });
  
  input.addEventListener('focus', () => {
    if (!input.value) return;
    // Strip commas on focus for easier editing
    const num = parseNumberInput(input.value);
    if (num !== null) {
      input.value = isInteger ? Math.round(num) : num;
    }
  });
}

// Initialize app
function init() {
  setupFuelFields();
  setupRebateFields();
  setupAdminFields();
  setupOperatorFields();
  setupTheftFields();
  setupThousandsSeparators();
  
  // Initial calculation
  updateAllCalculations();
}

// Fuel use fields - six linked fields
function setupFuelFields() {
  const litresWeek = document.getElementById('fuel-litres-week');
  const litresMonth = document.getElementById('fuel-litres-month');
  const litresYear = document.getElementById('fuel-litres-year');
  const dollarsWeek = document.getElementById('fuel-dollars-week');
  const dollarsMonth = document.getElementById('fuel-dollars-month');
  const dollarsYear = document.getElementById('fuel-dollars-year');
  const dieselPrice = document.getElementById('diesel-price');
  
  // Litres inputs
  litresWeek.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.lastEnteredType = 'litres';
      state.fuelLitresYear = convertFuelUsage(value, 'week', 'year');
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  litresMonth.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.lastEnteredType = 'litres';
      state.fuelLitresYear = convertFuelUsage(value, 'month', 'year');
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  litresYear.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.lastEnteredType = 'litres';
      state.fuelLitresYear = value;
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  // Dollars inputs
  dollarsWeek.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.lastEnteredType = 'dollars';
      const litres = dollarsToLitres(value, state.dieselPrice);
      state.fuelLitresYear = convertFuelUsage(litres, 'week', 'year');
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  dollarsMonth.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.lastEnteredType = 'dollars';
      const litres = dollarsToLitres(value, state.dieselPrice);
      state.fuelLitresYear = convertFuelUsage(litres, 'month', 'year');
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  dollarsYear.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.lastEnteredType = 'dollars';
      const litres = dollarsToLitres(value, state.dieselPrice);
      state.fuelLitresYear = litres;
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  // Diesel price - smart behavior
  dieselPrice.addEventListener('input', (e) => {
    const newPrice = parseNumberInput(e.target.value) || RATES.defaultDiesel;
    state.dieselPrice = newPrice;
    state.dieselPriceModified = true;
    document.getElementById('diesel-price-badge').style.display = 'none';
    
    // Keep last-entered type fixed, recalculate the other
    if (state.lastEnteredType === 'litres' && state.fuelLitresYear) {
      // Litres stay fixed, update dollars
      updateFuelFieldsFromAnnual();
    } else if (state.lastEnteredType === 'dollars') {
      // Dollars stay fixed, recalculate litres
      const dollarsYearInput = document.getElementById('fuel-dollars-year');
      if (dollarsYearInput.value) {
        const litres = dollarsToLitres(parseNumberInput(dollarsYearInput.value), state.dieselPrice);
        state.fuelLitresYear = litres;
        updateFuelFieldsFromAnnual();
      }
    }
    
    updateAllCalculations();
  });
}

function updateFuelFieldsFromAnnual() {
  if (!state.fuelLitresYear) return;
  
  const litresWeek = convertFuelUsage(state.fuelLitresYear, 'year', 'week');
  const litresMonth = convertFuelUsage(state.fuelLitresYear, 'year', 'month');
  
  setFormattedValue(document.getElementById('fuel-litres-week'), Math.round(litresWeek));
  setFormattedValue(document.getElementById('fuel-litres-month'), Math.round(litresMonth));
  setFormattedValue(document.getElementById('fuel-litres-year'), Math.round(state.fuelLitresYear));
  
  const dollarsWeek = litresToDollars(litresWeek, state.dieselPrice);
  const dollarsMonth = litresToDollars(litresMonth, state.dieselPrice);
  const dollarsYear = litresToDollars(state.fuelLitresYear, state.dieselPrice);
  
  setFormattedValue(document.getElementById('fuel-dollars-week'), Math.round(dollarsWeek));
  setFormattedValue(document.getElementById('fuel-dollars-month'), Math.round(dollarsMonth));
  setFormattedValue(document.getElementById('fuel-dollars-year'), Math.round(dollarsYear));
  
  // Update dispenses default if not modified by user
  if (!state.operatorDispensesModified && state.fuelLitresYear) {
    const litresPerWeek = state.fuelLitresYear / 52;
    const dispensesPerWeek = Math.round(litresPerWeek / 100); // Assumes 100 L per dispense
    state.operatorDispensesPerWeek = dispensesPerWeek;
    document.getElementById('operator-dispenses-per-week').value = dispensesPerWeek;
  }
}

// Rebate fields (off-road %, actual claim, gut feel)
function setupRebateFields() {
  const offRoadPercent = document.getElementById('offroad-percent');
  const actualDollars = document.getElementById('actual-dollars');
  const actualPercent = document.getElementById('actual-percent');
  const gutfeelDollars = document.getElementById('gutfeel-dollars');
  const gutfeelPercent = document.getElementById('gutfeel-percent');
  
  // Off-road % input field
  offRoadPercent.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    state.offRoadPercent = value;
    updateOffRoadButtonStates();
    updateAllCalculations();
  });
  
  // Off-road % buttons (0-100 in 10% increments)
  document.querySelectorAll('.btn-percent').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseNumberInput(e.target.dataset.value);
      state.offRoadPercent = value;
      offRoadPercent.value = value;
      updateOffRoadButtonStates();
      updateAllCalculations();
    });
  });
  
  // Industry preset buttons
  document.querySelectorAll('.btn-industry').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseNumberInput(e.target.dataset.value);
      state.offRoadPercent = value;
      offRoadPercent.value = value;
      updateOffRoadButtonStates();
      updateAllCalculations();
    });
  });
  
  // Actual claim pair ($ <-> %)
  actualDollars.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    state.actualDollars = value || null;
    
    // Update % from $
    if (value && state.fuelLitresYear && state.offRoadPercent !== null) {
      const rebateShouldGet = calculateRebateShouldGet(state.fuelLitresYear, state.offRoadPercent);
      if (rebateShouldGet > 0) {
        state.actualPercent = (value / rebateShouldGet) * 100;
        actualPercent.value = state.actualPercent.toFixed(1);
      }
    }
    
    updateAllCalculations();
  });
  
  actualPercent.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    state.actualPercent = value || null;
    
    // Update $ from %
    if (value && state.fuelLitresYear && state.offRoadPercent !== null) {
      const rebateShouldGet = calculateRebateShouldGet(state.fuelLitresYear, state.offRoadPercent);
      state.actualDollars = (value / 100) * rebateShouldGet;
      setFormattedValue(actualDollars, Math.round(state.actualDollars));
    }
    
    updateAllCalculations();
  });
  
  // Gut feel pair ($ <-> %)
  gutfeelDollars.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    state.gutfeelDollars = value || null;
    
    // Update % from $
    if (value && state.fuelLitresYear && state.offRoadPercent !== null) {
      const rebateShouldGet = calculateRebateShouldGet(state.fuelLitresYear, state.offRoadPercent);
      if (rebateShouldGet > 0) {
        state.gutfeelPercent = (value / rebateShouldGet) * 100;
        gutfeelPercent.value = state.gutfeelPercent.toFixed(1);
      }
    }
    
    updateAllCalculations();
  });
  
  gutfeelPercent.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    state.gutfeelPercent = value || null;
    
    // Update $ from %
    if (value && state.fuelLitresYear && state.offRoadPercent !== null) {
      const rebateShouldGet = calculateRebateShouldGet(state.fuelLitresYear, state.offRoadPercent);
      state.gutfeelDollars = (value / 100) * rebateShouldGet;
      setFormattedValue(gutfeelDollars, Math.round(state.gutfeelDollars));
    }
    
    updateAllCalculations();
  });
}

function updateOffRoadButtonStates() {
  document.querySelectorAll('.btn-percent').forEach(btn => {
    if (parseNumberInput(btn.dataset.value) === state.offRoadPercent) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Admin fields
function setupAdminFields() {
  const adminWeek = document.getElementById('admin-hours-week');
  const adminMonth = document.getElementById('admin-hours-month');
  const adminRate = document.getElementById('admin-rate');
  const adminDollarsWeek = document.getElementById('admin-dollars-week');
  const adminDollarsMonth = document.getElementById('admin-dollars-month');
  const adminDollarsYear = document.getElementById('admin-dollars-year');
  
  // Hours per week
  adminWeek.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.adminHoursYear = value * 52;
      state.adminDollarsLastSource = 'hours';
      
      // Update hours per month (month = week × 52 / 12)
      const hoursMonth = value * 52 / 12;
      const rounded = Math.round(hoursMonth * 10) / 10;
      const formatted = rounded % 1 === 0 ? Math.round(rounded) : rounded;
      adminMonth.value = formatted;
    } else {
      state.adminHoursYear = null;
      adminMonth.value = '';
    }
    updateAdminDollarsFromHours();
    updateAllCalculations();
  });
  
  // Hours per month
  adminMonth.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.adminHoursYear = value * 12;
      state.adminDollarsLastSource = 'hours';
      
      // Update hours per week (week = month × 12 / 52)
      const hoursWeek = value * 12 / 52;
      const rounded = Math.round(hoursWeek * 10) / 10;
      const formatted = rounded % 1 === 0 ? Math.round(rounded) : rounded;
      adminWeek.value = formatted;
    } else {
      state.adminHoursYear = null;
      adminWeek.value = '';
    }
    updateAdminDollarsFromHours();
    updateAllCalculations();
  });
  
  // Hourly rate
  adminRate.addEventListener('input', (e) => {
    state.adminRate = parseNumberInput(e.target.value) || RATES.defaultHourlyRate;
    state.adminRateModified = true;
    document.getElementById('admin-rate-badge').style.display = 'none';
    if (state.adminDollarsLastSource === 'hours') {
      updateAdminDollarsFromHours();
    }
    updateAllCalculations();
  });
  
  // Quick picks
  document.querySelectorAll('.btn-quick-admin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseNumberInput(e.target.dataset.value);
      state.adminRate = value;
      adminRate.value = value;
      state.adminRateModified = true;
      document.getElementById('admin-rate-badge').style.display = 'none';
      if (state.adminDollarsLastSource === 'hours') {
        updateAdminDollarsFromHours();
      }
      updateAllCalculations();
    });
  });
  
  // $ per week
  adminDollarsWeek.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.adminDollarsLastSource = 'dollars';
      const dollarsYear = value * 52;
      
      // Update other $ fields
      setFormattedValue(adminDollarsMonth, Math.round(dollarsYear / 12));
      setFormattedValue(adminDollarsYear, Math.round(dollarsYear));
      
      // Back-calculate hours from rate
      if (state.adminRate > 0) {
        state.adminHoursYear = dollarsYear / state.adminRate;
        const hoursWeek = state.adminHoursYear / 52;
        const hoursMonth = state.adminHoursYear / 12;
        const roundedWeek = Math.round(hoursWeek * 10) / 10;
        const roundedMonth = Math.round(hoursMonth * 10) / 10;
        adminWeek.value = roundedWeek % 1 === 0 ? Math.round(roundedWeek) : roundedWeek;
        adminMonth.value = roundedMonth % 1 === 0 ? Math.round(roundedMonth) : roundedMonth;
      }
      
      updateAllCalculations();
    }
  });
  
  // $ per month
  adminDollarsMonth.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.adminDollarsLastSource = 'dollars';
      const dollarsYear = value * 12;
      
      // Update other $ fields
      setFormattedValue(adminDollarsWeek, Math.round(dollarsYear / 52));
      setFormattedValue(adminDollarsYear, Math.round(dollarsYear));
      
      // Back-calculate hours from rate
      if (state.adminRate > 0) {
        state.adminHoursYear = dollarsYear / state.adminRate;
        const hoursWeek = state.adminHoursYear / 52;
        const hoursMonth = state.adminHoursYear / 12;
        const roundedWeek = Math.round(hoursWeek * 10) / 10;
        const roundedMonth = Math.round(hoursMonth * 10) / 10;
        adminWeek.value = roundedWeek % 1 === 0 ? Math.round(roundedWeek) : roundedWeek;
        adminMonth.value = roundedMonth % 1 === 0 ? Math.round(roundedMonth) : roundedMonth;
      }
      
      updateAllCalculations();
    }
  });
  
  // $ per year
  adminDollarsYear.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    if (value) {
      state.adminDollarsLastSource = 'dollars';
      const dollarsYear = value;
      
      // Update other $ fields
      setFormattedValue(adminDollarsWeek, Math.round(dollarsYear / 52));
      setFormattedValue(adminDollarsMonth, Math.round(dollarsYear / 12));
      
      // Back-calculate hours from rate
      if (state.adminRate > 0) {
        state.adminHoursYear = dollarsYear / state.adminRate;
        const hoursWeek = state.adminHoursYear / 52;
        const hoursMonth = state.adminHoursYear / 12;
        const roundedWeek = Math.round(hoursWeek * 10) / 10;
        const roundedMonth = Math.round(hoursMonth * 10) / 10;
        adminWeek.value = roundedWeek % 1 === 0 ? Math.round(roundedWeek) : roundedWeek;
        adminMonth.value = roundedMonth % 1 === 0 ? Math.round(roundedMonth) : roundedMonth;
      }
      
      updateAllCalculations();
    }
  });
}

// Update admin $ fields from hours × rate
function updateAdminDollarsFromHours() {
  if (!state.adminHoursYear || state.adminRate <= 0) return;
  
  const dollarsYear = state.adminHoursYear * state.adminRate;
  const dollarsWeek = dollarsYear / 52;
  const dollarsMonth = dollarsYear / 12;
  
  setFormattedValue(document.getElementById('admin-dollars-week'), Math.round(dollarsWeek));
  setFormattedValue(document.getElementById('admin-dollars-month'), Math.round(dollarsMonth));
  setFormattedValue(document.getElementById('admin-dollars-year'), Math.round(dollarsYear));
}

// Operator fields
function setupOperatorFields() {
  const operatorMinutes = document.getElementById('operator-minutes-per-dispense');
  const operatorDispenses = document.getElementById('operator-dispenses-per-week');
  const operatorRate = document.getElementById('operator-rate');
  
  operatorMinutes.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    state.operatorMinutesPerDispense = value || null;
    updateAllCalculations();
  });
  
  operatorDispenses.addEventListener('input', (e) => {
    const value = parseNumberInput(e.target.value);
    state.operatorDispensesPerWeek = value || null;
    state.operatorDispensesModified = true; // User has typed their own value
    document.getElementById('dispenses-badge').style.display = 'none';
    updateAllCalculations();
  });
  
  operatorRate.addEventListener('input', (e) => {
    state.operatorRate = parseNumberInput(e.target.value) || RATES.defaultHourlyRate;
    state.operatorRateModified = true;
    document.getElementById('operator-rate-badge').style.display = 'none';
    updateAllCalculations();
  });
  
  // Quick picks
  document.querySelectorAll('.btn-quick-operator').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseNumberInput(e.target.dataset.value);
      state.operatorRate = value;
      operatorRate.value = value;
      state.operatorRateModified = true;
      document.getElementById('operator-rate-badge').style.display = 'none';
      updateAllCalculations();
    });
  });
}

// Theft fields
function setupTheftFields() {
  const riskRadios = document.querySelectorAll('input[name="risk"]');
  const theftPercent = document.getElementById('theft-percent');
  
  riskRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.riskLevel = e.target.value;
      state.theftPercent = RATES.theft[e.target.value] * 100;
      theftPercent.value = state.theftPercent;
      updateAllCalculations();
    });
  });
  
  theftPercent.addEventListener('input', (e) => {
    state.theftPercent = parseNumberInput(e.target.value) || 0;
    updateAllCalculations();
  });
}

// Update all calculations
function updateAllCalculations() {
  // Section results
  updateSectionResults();
  
  // Total results panel
  updateTotalResults();
}

function updateSectionResults() {
  // Section 2: Rebate
  const rebateShouldEl = document.getElementById('result-rebate-should');
  const rebateMissedLine = document.getElementById('rebate-missed-line');
  const rebateMissedValue = document.getElementById('rebate-missed-value');
  const rebateMissedSource = document.getElementById('rebate-missed-source');
  
  if (state.fuelLitresYear && state.offRoadPercent !== null) {
    const rebate = calculateRebateShouldGet(state.fuelLitresYear, state.offRoadPercent);
    rebateShouldEl.textContent = formatCurrency(rebate);
    
    // Calculate and show rebate missed
    let rebateMissed = 0;
    let missedSource = '';
    
    if (state.actualDollars) {
      rebateMissed = calculateRebateMissed(rebate, 'dollars', state.actualDollars);
      missedSource = '(from actual claim)';
    } else if (state.gutfeelDollars) {
      rebateMissed = calculateRebateMissed(rebate, 'dollars', state.gutfeelDollars);
      missedSource = '(from gut feel)';
    }
    
    if (rebateMissed > 0 && (state.actualDollars || state.gutfeelDollars)) {
      rebateMissedLine.style.display = 'flex';
      rebateMissedValue.textContent = formatCurrency(rebateMissed);
      rebateMissedSource.textContent = missedSource;
    } else {
      rebateMissedLine.style.display = 'none';
    }
  } else {
    rebateShouldEl.textContent = '—';
    rebateMissedLine.style.display = 'none';
  }
  
  // Section 3: Admin
  const adminEl = document.getElementById('result-admin');
  const adminHoursNote = document.getElementById('admin-hours-note');
  const adminCostReference = document.getElementById('admin-cost-reference');
  
  if (state.adminHoursYear) {
    const cost = Math.round(state.adminHoursYear * state.adminRate);
    adminEl.textContent = formatCurrency(cost);
    
    // Calculate hours per month and format (drop .0)
    const hoursPerMonth = state.adminHoursYear / 12;
    const rounded = Math.round(hoursPerMonth * 10) / 10;
    const formatted = rounded % 1 === 0 ? Math.round(rounded) : rounded;
    adminHoursNote.textContent = `· ${formatted} hrs per month`;
    
    // Update reference line in Section 3
    const costPerMonth = Math.round(cost / 12);
    adminCostReference.textContent = `${formatCurrency(costPerMonth)} per month`;
  } else {
    adminEl.textContent = '—';
    adminHoursNote.textContent = '';
    adminCostReference.textContent = '—';
  }
  
  const operatorLine = document.getElementById('result-operator-line');
  const operatorEl = document.getElementById('result-operator');
  const operatorHoursNote = document.getElementById('operator-hours-note');
  if (state.operatorMinutesPerDispense && state.operatorDispensesPerWeek) {
    // Formula: minutes per dispense × dispenses per week × 52 / 60 × rate
    const hoursPerYear = state.operatorMinutesPerDispense * state.operatorDispensesPerWeek * 52 / 60;
    const cost = Math.round(hoursPerYear * state.operatorRate);
    operatorEl.textContent = formatCurrency(cost);
    operatorLine.style.display = 'flex';
    
    // Hours per month: minutes × dispenses per week × 52 / 12 / 60
    const hoursPerMonth = state.operatorMinutesPerDispense * state.operatorDispensesPerWeek * 52 / 12 / 60;
    const rounded = Math.round(hoursPerMonth * 10) / 10;
    const formatted = rounded % 1 === 0 ? Math.round(rounded) : rounded;
    operatorHoursNote.textContent = `· ${formatted} hrs per month`;
  } else {
    operatorLine.style.display = 'none';
    operatorHoursNote.textContent = '';
  }
  
  // Section 4: Theft
  const theftEl = document.getElementById('result-theft');
  if (state.fuelLitresYear) {
    const theft = calculateTheftExposure(state.fuelLitresYear, state.theftPercent, state.dieselPrice);
    theftEl.textContent = formatCurrency(theft);
  } else {
    theftEl.textContent = '—';
  }
}

function updateTotalResults() {
  // Calculate rebate should get (uses total fuel from Section 1)
  const rebateShouldGet = (state.fuelLitresYear && state.offRoadPercent !== null) ?
    calculateRebateShouldGet(state.fuelLitresYear, state.offRoadPercent) : 0;
  
  document.getElementById('total-rebate-should').textContent = rebateShouldGet ? formatCurrency(rebateShouldGet) : '—';
  
  // What they're getting now (actual $ if filled, else gut feel $)
  const gettingNowItem = document.getElementById('getting-now-item');
  const gettingNowEl = document.getElementById('total-getting-now');
  const gettingNowNote = document.getElementById('getting-now-note');
  
  if (state.actualDollars || state.gutfeelDollars) {
    gettingNowItem.style.display = 'block';
    
    if (state.actualDollars) {
      gettingNowEl.textContent = formatCurrency(state.actualDollars);
      const actualPercent = rebateShouldGet > 0 ? ((state.actualDollars / rebateShouldGet) * 100).toFixed(1) : '0.0';
      gettingNowNote.textContent = `Actual: ${formatCurrency(state.actualDollars)} (${actualPercent}%)`;
    } else if (state.gutfeelDollars) {
      gettingNowEl.textContent = formatCurrency(state.gutfeelDollars);
      const gutfeelPercent = rebateShouldGet > 0 ? ((state.gutfeelDollars / rebateShouldGet) * 100).toFixed(1) : '0.0';
      gettingNowNote.textContent = `Gut feel: ${formatCurrency(state.gutfeelDollars)} (${gutfeelPercent}%)`;
    }
  } else {
    gettingNowItem.style.display = 'none';
  }
  
  // Calculate actual claim missed
  let actualMissed = 0;
  const actualMissedItem = document.getElementById('actual-missed-item');
  const actualMissedNote = document.getElementById('actual-missed-note');
  
  if (state.actualDollars && rebateShouldGet > 0) {
    actualMissed = Math.max(0, rebateShouldGet - state.actualDollars);
    actualMissedItem.style.display = 'block';
    document.getElementById('total-actual-missed').textContent = formatCurrency(actualMissed);
    
    // Over-claim check
    if (state.actualDollars > rebateShouldGet) {
      actualMissedNote.textContent = 'Over-claiming; check the figures.';
      actualMissedNote.classList.add('warning');
    } else {
      actualMissedNote.textContent = '';
      actualMissedNote.classList.remove('warning');
    }
  } else {
    actualMissedItem.style.display = 'none';
  }
  
  // Calculate gut feel missed
  let gutfeelMissed = 0;
  const gutfeelMissedItem = document.getElementById('gutfeel-missed-item');
  const gutfeelMissedNote = document.getElementById('gutfeel-missed-note');
  
  if (state.gutfeelDollars && rebateShouldGet > 0) {
    gutfeelMissed = Math.max(0, rebateShouldGet - state.gutfeelDollars);
    gutfeelMissedItem.style.display = 'block';
    document.getElementById('total-gutfeel-missed').textContent = formatCurrency(gutfeelMissed);
    
    // Over-claim check
    if (state.gutfeelDollars > rebateShouldGet) {
      gutfeelMissedNote.textContent = 'Over-claiming; check the figures.';
      gutfeelMissedNote.classList.add('warning');
    } else {
      gutfeelMissedNote.textContent = '';
      gutfeelMissedNote.classList.remove('warning');
    }
  } else {
    gutfeelMissedItem.style.display = 'none';
  }
  
  // Admin and operator
  const adminCost = state.adminHoursYear ? Math.round(state.adminHoursYear * state.adminRate) : 0;
  
  // Operator: minutes per dispense × dispenses per week × 52 / 60 × rate
  let operatorCost = 0;
  let operatorHoursPerMonth = 0;
  if (state.operatorMinutesPerDispense && state.operatorDispensesPerWeek) {
    const hoursPerYear = state.operatorMinutesPerDispense * state.operatorDispensesPerWeek * 52 / 60;
    operatorCost = Math.round(hoursPerYear * state.operatorRate);
    operatorHoursPerMonth = state.operatorMinutesPerDispense * state.operatorDispensesPerWeek * 52 / 12 / 60;
  }
  
  const totalAdminHoursNote = document.getElementById('admin-hours-note');
  if (adminCost) {
    document.getElementById('total-admin').textContent = formatCurrency(adminCost);
    
    // Calculate hours per month and format (drop .0)
    const hoursPerMonth = state.adminHoursYear / 12;
    const rounded = Math.round(hoursPerMonth * 10) / 10;
    const formatted = rounded % 1 === 0 ? Math.round(rounded) : rounded;
    totalAdminHoursNote.textContent = `· ${formatted} hrs per month`;
  } else {
    document.getElementById('total-admin').textContent = '—';
    totalAdminHoursNote.textContent = '';
  }
  
  const operatorItem = document.getElementById('operator-item');
  const totalOperatorHoursNote = document.getElementById('operator-hours-note');
  if (operatorCost > 0) {
    operatorItem.style.display = 'block';
    document.getElementById('total-operator').textContent = formatCurrency(operatorCost);
    
    // Format hours per month (drop .0)
    const rounded = Math.round(operatorHoursPerMonth * 10) / 10;
    const formatted = rounded % 1 === 0 ? Math.round(rounded) : rounded;
    totalOperatorHoursNote.textContent = `· ${formatted} hrs per month`;
  } else {
    operatorItem.style.display = 'none';
    totalOperatorHoursNote.textContent = '';
  }
  
  // Theft (uses total fuel from Section 1)
  const theftExposure = state.fuelLitresYear ?
    calculateTheftExposure(state.fuelLitresYear, state.theftPercent, state.dieselPrice) : 0;
  document.getElementById('total-theft').textContent = theftExposure ? formatCurrency(theftExposure) : '—';
  
  // Total savings: uses actual if filled, otherwise gut feel, otherwise $0
  let rebateMissedForTotal = 0;
  let savingsSource = '';
  
  if (state.actualDollars) {
    rebateMissedForTotal = actualMissed;
    savingsSource = '(using actual claim)';
  } else if (state.gutfeelDollars) {
    rebateMissedForTotal = gutfeelMissed;
    savingsSource = '(using gut feel)';
  }
  
  const totalSavings = calculateTotalSavings(rebateMissedForTotal, adminCost, operatorCost, theftExposure);
  document.getElementById('total-savings').textContent = formatCurrency(totalSavings);
  document.getElementById('savings-source').textContent = savingsSource;
}

// Setup thousands separators for all integer input fields
function setupThousandsSeparators() {
  // Fuel use - all integer fields
  addThousandsSeparator(document.getElementById('fuel-litres-week'));
  addThousandsSeparator(document.getElementById('fuel-litres-month'));
  addThousandsSeparator(document.getElementById('fuel-litres-year'));
  addThousandsSeparator(document.getElementById('fuel-dollars-week'));
  addThousandsSeparator(document.getElementById('fuel-dollars-month'));
  addThousandsSeparator(document.getElementById('fuel-dollars-year'));
  // diesel-price is decimal, skip
  
  // Rebate - dollars are integers, percents are decimals
  addThousandsSeparator(document.getElementById('actual-dollars'));
  addThousandsSeparator(document.getElementById('gutfeel-dollars'));
  // Percents are decimals, skip
  
  // Admin - dollars are integers, hours are decimals
  addThousandsSeparator(document.getElementById('admin-dollars-week'));
  addThousandsSeparator(document.getElementById('admin-dollars-month'));
  addThousandsSeparator(document.getElementById('admin-dollars-year'));
  addThousandsSeparator(document.getElementById('admin-rate'));
  // Hours are decimals, skip
  
  // Operator - rate is integer, minutes and dispenses are decimals/integers
  addThousandsSeparator(document.getElementById('operator-rate'));
  // minutes-per-dispense is decimal, skip
  // dispenses-per-week could be integer or decimal, skip for now
  
  // Theft - percent is decimal, skip
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', init);
}

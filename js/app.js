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
  formatNumber,
  formatCurrency
} from './calculator.js';

// App state
const state = {
  // Fuel use
  fuelLitresYear: null,
  dieselPrice: RATES.defaultDiesel,
  dieselPriceModified: false,
  
  // Dispensed
  dispensedLitresYear: null,
  dispensedModified: false,
  
  // Rebate
  offRoadPercent: null,
  offRoadModified: false,
  claimMode: null,
  claimValue: null,
  
  // Admin
  adminHoursYear: null,
  adminRate: RATES.defaultHourlyRate,
  adminRateModified: false,
  
  // Operator
  operatorHoursYear: null,
  operatorRate: RATES.defaultHourlyRate,
  operatorRateModified: false,
  
  // Theft
  riskLevel: 'medium',
  theftPercent: RATES.theft.medium * 100
};

// Initialize app
function init() {
  setupFuelFields();
  setupDispensedFields();
  setupRebateFields();
  setupAdminFields();
  setupOperatorFields();
  setupTheftFields();
  
  // Initial calculation
  updateAllCalculations();
}

// Fuel use fields
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
    const value = parseFloat(e.target.value);
    if (value) {
      state.fuelLitresYear = convertFuelUsage(value, 'week', 'year');
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  litresMonth.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.fuelLitresYear = convertFuelUsage(value, 'month', 'year');
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  litresYear.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.fuelLitresYear = value;
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  // Dollars inputs
  dollarsWeek.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      const litres = dollarsToLitres(value, state.dieselPrice);
      state.fuelLitresYear = convertFuelUsage(litres, 'week', 'year');
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  dollarsMonth.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      const litres = dollarsToLitres(value, state.dieselPrice);
      state.fuelLitresYear = convertFuelUsage(litres, 'month', 'year');
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  dollarsYear.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      const litres = dollarsToLitres(value, state.dieselPrice);
      state.fuelLitresYear = litres;
      updateFuelFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  // Diesel price
  dieselPrice.addEventListener('input', (e) => {
    state.dieselPrice = parseFloat(e.target.value) || RATES.defaultDiesel;
    state.dieselPriceModified = true;
    document.getElementById('diesel-price-badge').style.display = 'none';
    updateFuelFieldsFromAnnual();
    updateAllCalculations();
  });
}

function updateFuelFieldsFromAnnual() {
  if (!state.fuelLitresYear) return;
  
  const litresWeek = convertFuelUsage(state.fuelLitresYear, 'year', 'week');
  const litresMonth = convertFuelUsage(state.fuelLitresYear, 'year', 'month');
  
  document.getElementById('fuel-litres-week').value = Math.round(litresWeek);
  document.getElementById('fuel-litres-month').value = Math.round(litresMonth);
  document.getElementById('fuel-litres-year').value = Math.round(state.fuelLitresYear);
  
  const dollarsWeek = litresToDollars(litresWeek, state.dieselPrice);
  const dollarsMonth = litresToDollars(litresMonth, state.dieselPrice);
  const dollarsYear = litresToDollars(state.fuelLitresYear, state.dieselPrice);
  
  document.getElementById('fuel-dollars-week').value = Math.round(dollarsWeek);
  document.getElementById('fuel-dollars-month').value = Math.round(dollarsMonth);
  document.getElementById('fuel-dollars-year').value = Math.round(dollarsYear);
  
  // Update dispensed if not modified
  if (!state.dispensedModified && state.fuelLitresYear) {
    state.dispensedLitresYear = state.fuelLitresYear;
    updateDispensedFieldsFromAnnual();
  }
}

// Dispensed fields
function setupDispensedFields() {
  const dispensedWeek = document.getElementById('dispensed-litres-week');
  const dispensedMonth = document.getElementById('dispensed-litres-month');
  const dispensedYear = document.getElementById('dispensed-litres-year');
  
  dispensedWeek.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.dispensedLitresYear = convertFuelUsage(value, 'week', 'year');
      state.dispensedModified = true;
      updateDispensedFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  dispensedMonth.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.dispensedLitresYear = convertFuelUsage(value, 'month', 'year');
      state.dispensedModified = true;
      updateDispensedFieldsFromAnnual();
      updateAllCalculations();
    }
  });
  
  dispensedYear.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.dispensedLitresYear = value;
      state.dispensedModified = true;
      updateDispensedFieldsFromAnnual();
      updateAllCalculations();
    }
  });
}

function updateDispensedFieldsFromAnnual() {
  if (!state.dispensedLitresYear) return;
  
  const dispensedWeek = convertFuelUsage(state.dispensedLitresYear, 'year', 'week');
  const dispensedMonth = convertFuelUsage(state.dispensedLitresYear, 'year', 'month');
  
  document.getElementById('dispensed-litres-week').value = Math.round(dispensedWeek);
  document.getElementById('dispensed-litres-month').value = Math.round(dispensedMonth);
  document.getElementById('dispensed-litres-year').value = Math.round(state.dispensedLitresYear);
  
  // Hide estimate badges
  if (state.dispensedModified) {
    document.getElementById('dispensed-week-badge').style.display = 'none';
    document.getElementById('dispensed-month-badge').style.display = 'none';
    document.getElementById('dispensed-year-badge').style.display = 'none';
  }
  
  // Check warning
  const warning = document.getElementById('dispensed-warning');
  if (state.fuelLitresYear && isDispensedMoreThanTotal(state.fuelLitresYear, state.dispensedLitresYear)) {
    warning.style.display = 'block';
  } else {
    warning.style.display = 'none';
  }
}

// Rebate fields
function setupRebateFields() {
  const offRoadPercent = document.getElementById('offroad-percent');
  const industryPreset = document.getElementById('industry-preset');
  const claimMode = document.getElementById('claim-mode');
  
  // Off-road %
  offRoadPercent.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    state.offRoadPercent = value;
    state.offRoadModified = true;
    document.getElementById('offroad-badge').style.display = 'none';
    updateAllCalculations();
  });
  
  // Industry preset
  industryPreset.addEventListener('change', (e) => {
    const industry = e.target.value;
    if (industry && RATES.offRoadPresets[industry] !== undefined) {
      state.offRoadPercent = RATES.offRoadPresets[industry] * 100;
      offRoadPercent.value = state.offRoadPercent;
      state.offRoadModified = false;
      document.getElementById('offroad-badge').style.display = 'inline-block';
      updateAllCalculations();
    }
  });
  
  // Quick picks
  document.querySelectorAll('.btn-quick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseFloat(e.target.dataset.value);
      state.offRoadPercent = value;
      offRoadPercent.value = value;
      state.offRoadModified = true;
      document.getElementById('offroad-badge').style.display = 'none';
      updateAllCalculations();
    });
  });
  
  // Claim mode
  claimMode.addEventListener('change', (e) => {
    state.claimMode = e.target.value || null;
    renderClaimInput();
    updateAllCalculations();
  });
}

function renderClaimInput() {
  const container = document.getElementById('claim-input-container');
  
  if (!state.claimMode) {
    container.innerHTML = '';
    return;
  }
  
  if (state.claimMode === 'dollars') {
    container.innerHTML = `
      <div class="field-group">
        <label>$ claimed per year</label>
        <div class="input-with-prefix">
          <span class="prefix">$</span>
          <input type="number" id="claim-value" class="form-input" placeholder="e.g., 20000">
        </div>
      </div>
    `;
  } else if (state.claimMode === 'gutfeel') {
    container.innerHTML = `
      <div class="field-group">
        <label>Gut-feel % of entitlement</label>
        <input type="number" id="claim-value" class="form-input" placeholder="e.g., 80" min="0" max="100">
        <div class="quick-picks">
          <button type="button" class="btn-quick-claim" data-value="25">25%</button>
          <button type="button" class="btn-quick-claim" data-value="50">50%</button>
          <button type="button" class="btn-quick-claim" data-value="75">75%</button>
          <button type="button" class="btn-quick-claim" data-value="100">100%</button>
        </div>
      </div>
    `;
    
    // Add quick pick handlers
    document.querySelectorAll('.btn-quick-claim').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const value = parseFloat(e.target.dataset.value);
        state.claimValue = value;
        document.getElementById('claim-value').value = value;
        updateAllCalculations();
      });
    });
  }
  
  // Add input handler
  const claimInput = document.getElementById('claim-value');
  if (claimInput) {
    claimInput.addEventListener('input', (e) => {
      state.claimValue = parseFloat(e.target.value) || null;
      updateAllCalculations();
    });
  }
}

// Admin fields
function setupAdminFields() {
  const adminWeek = document.getElementById('admin-hours-week');
  const adminMonth = document.getElementById('admin-hours-month');
  const adminRate = document.getElementById('admin-rate');
  
  adminWeek.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.adminHoursYear = value * 52;
      adminMonth.value = Math.round(value * 52 / 12);
    } else {
      state.adminHoursYear = null;
      adminMonth.value = '';
    }
    updateAllCalculations();
  });
  
  adminMonth.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.adminHoursYear = value * 12;
      adminWeek.value = (value * 12 / 52).toFixed(1);
    } else {
      state.adminHoursYear = null;
      adminWeek.value = '';
    }
    updateAllCalculations();
  });
  
  adminRate.addEventListener('input', (e) => {
    state.adminRate = parseFloat(e.target.value) || RATES.defaultHourlyRate;
    state.adminRateModified = true;
    document.getElementById('admin-rate-badge').style.display = 'none';
    updateAllCalculations();
  });
  
  // Quick picks
  document.querySelectorAll('.btn-quick-admin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseFloat(e.target.dataset.value);
      state.adminRate = value;
      adminRate.value = value;
      state.adminRateModified = true;
      document.getElementById('admin-rate-badge').style.display = 'none';
      updateAllCalculations();
    });
  });
}

// Operator fields
function setupOperatorFields() {
  const operatorWeek = document.getElementById('operator-hours-week');
  const operatorMonth = document.getElementById('operator-hours-month');
  const operatorRate = document.getElementById('operator-rate');
  
  operatorWeek.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.operatorHoursYear = value * 52;
      operatorMonth.value = Math.round(value * 52 / 12);
    } else {
      state.operatorHoursYear = null;
      operatorMonth.value = '';
    }
    updateAllCalculations();
  });
  
  operatorMonth.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value) {
      state.operatorHoursYear = value * 12;
      operatorWeek.value = (value * 12 / 52).toFixed(1);
    } else {
      state.operatorHoursYear = null;
      operatorWeek.value = '';
    }
    updateAllCalculations();
  });
  
  operatorRate.addEventListener('input', (e) => {
    state.operatorRate = parseFloat(e.target.value) || RATES.defaultHourlyRate;
    state.operatorRateModified = true;
    document.getElementById('operator-rate-badge').style.display = 'none';
    updateAllCalculations();
  });
  
  // Quick picks
  document.querySelectorAll('.btn-quick-operator').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseFloat(e.target.dataset.value);
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
    state.theftPercent = parseFloat(e.target.value) || 0;
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
  if (state.dispensedLitresYear && state.offRoadPercent !== null) {
    const rebate = calculateRebateShouldGet(state.dispensedLitresYear, state.offRoadPercent);
    rebateShouldEl.textContent = formatCurrency(rebate);
  } else {
    rebateShouldEl.textContent = '—';
  }
  
  // Section 3: Admin
  const adminEl = document.getElementById('result-admin');
  if (state.adminHoursYear) {
    const cost = Math.round(state.adminHoursYear * state.adminRate);
    adminEl.textContent = formatCurrency(cost);
  } else {
    adminEl.textContent = '—';
  }
  
  const operatorLine = document.getElementById('result-operator-line');
  const operatorEl = document.getElementById('result-operator');
  if (state.operatorHoursYear) {
    const cost = Math.round(state.operatorHoursYear * state.operatorRate);
    operatorEl.textContent = formatCurrency(cost);
    operatorLine.style.display = 'flex';
  } else {
    operatorLine.style.display = 'none';
  }
  
  // Section 4: Theft
  const theftEl = document.getElementById('result-theft');
  if (state.dispensedLitresYear) {
    const theft = calculateTheftExposure(state.dispensedLitresYear, state.theftPercent, state.dieselPrice);
    theftEl.textContent = formatCurrency(theft);
  } else {
    theftEl.textContent = '—';
  }
}

function updateTotalResults() {
  // Calculate all values
  const rebateShouldGet = (state.dispensedLitresYear && state.offRoadPercent !== null) ?
    calculateRebateShouldGet(state.dispensedLitresYear, state.offRoadPercent) : 0;
  
  const rebateMissed = calculateRebateMissed(rebateShouldGet, state.claimMode, state.claimValue);
  
  const adminCost = state.adminHoursYear ? Math.round(state.adminHoursYear * state.adminRate) : 0;
  
  const operatorCost = state.operatorHoursYear ? Math.round(state.operatorHoursYear * state.operatorRate) : 0;
  
  const theftExposure = state.dispensedLitresYear ?
    calculateTheftExposure(state.dispensedLitresYear, state.theftPercent, state.dieselPrice) : 0;
  
  const totalSavings = calculateTotalSavings(rebateMissed, adminCost, operatorCost, theftExposure);
  
  // Update display
  document.getElementById('total-rebate-should').textContent = rebateShouldGet ? formatCurrency(rebateShouldGet) : '—';
  
  // Getting now
  const gettingNowItem = document.getElementById('getting-now-item');
  const gettingNowEl = document.getElementById('total-getting-now');
  if (state.claimMode) {
    gettingNowItem.style.display = 'block';
    if (state.claimMode === 'dollars' && state.claimValue) {
      gettingNowEl.textContent = formatCurrency(state.claimValue);
    } else if (state.claimMode === 'gutfeel' && state.claimValue) {
      gettingNowEl.textContent = state.claimValue + '% (gut-feel)';
    } else {
      gettingNowEl.textContent = '—';
    }
  } else {
    gettingNowItem.style.display = 'none';
  }
  
  // Rebate missed
  const rebateMissedItem = document.getElementById('rebate-missed-item');
  const rebateMissedEl = document.getElementById('total-rebate-missed');
  const rebateMissedNote = document.getElementById('rebate-missed-note');
  
  if (state.claimMode) {
    rebateMissedItem.style.display = 'block';
    rebateMissedEl.textContent = formatCurrency(rebateMissed);
    
    // Check for over-claim
    const overClaim = isOverClaimed(rebateShouldGet, state.claimMode, state.claimValue);
    if (overClaim) {
      rebateMissedNote.textContent = 'They may be claiming on fuel not dispensed on site; check the litres.';
      rebateMissedNote.classList.add('warning');
    } else {
      rebateMissedNote.textContent = '';
      rebateMissedNote.classList.remove('warning');
    }
  } else {
    rebateMissedItem.style.display = 'none';
  }
  
  // Admin
  document.getElementById('total-admin').textContent = adminCost ? formatCurrency(adminCost) : '—';
  
  // Operator
  const operatorItem = document.getElementById('operator-item');
  if (operatorCost > 0) {
    operatorItem.style.display = 'block';
    document.getElementById('total-operator').textContent = formatCurrency(operatorCost);
  } else {
    operatorItem.style.display = 'none';
  }
  
  // Theft
  document.getElementById('total-theft').textContent = theftExposure ? formatCurrency(theftExposure) : '—';
  
  // Total
  document.getElementById('total-savings').textContent = formatCurrency(totalSavings);
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', init);
}

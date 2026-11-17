/**
 * Fuel Numbers App - Main application logic
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
  currentStep: 0,
  data: {
    // Supporting A: About them
    industry: null,
    
    // Supporting B: What they want to solve
    problems: [],
    
    // Supporting C: Who fills
    whoFills: null,
    
    // Core 1: Fuel use
    fuelUseLitres: null,
    fuelUsePeriod: 'month',
    fuelUseDollars: null,
    dieselPrice: RATES.defaultDiesel,
    
    // Core 2: Rebate
    dispensedLitres: null,
    dispensedPeriod: 'month',
    offRoadPercent: null,
    claimMode: null,
    claimValue: null,
    
    // Core 3: Admin time
    adminHours: null,
    adminPeriod: 'week',
    adminRate: RATES.defaultHourlyRate,
    operatorHours: null,
    operatorPeriod: 'week',
    operatorRate: RATES.defaultHourlyRate,
    
    // Core 4: Contractor risk
    riskLevel: 'medium',
    theftPercent: RATES.theft.medium * 100
  },
  modified: {
    dieselPrice: false,
    adminRate: false,
    operatorRate: false,
    offRoadPercent: false,
    dispensedLitres: false
  }
};

// Step definitions
const steps = [
  // Supporting steps
  { id: 'a-about', title: 'About them', type: 'supporting', core: false },
  { id: 'b-problems', title: 'What they want to solve', type: 'supporting', core: false },
  { id: 'c-who-fills', title: 'Who fills', type: 'supporting', core: false },
  
  // Core steps
  { id: '1-fuel-use', title: 'Fuel use', type: 'core', core: true, coreStep: 1 },
  { id: '2-rebate', title: 'Rebate they should be getting', type: 'core', core: true, coreStep: 2 },
  { id: '3-admin', title: 'Admin time', type: 'core', core: true, coreStep: 3 },
  { id: '4-risk', title: 'Contractor fuel risk', type: 'core', core: true, coreStep: 4 },
  
  // Supporting steps
  { id: 'd-findings', title: 'Findings so far', type: 'supporting', core: false },
  { id: 'e-results', title: 'Results', type: 'results', core: false }
];

// Initialize app
function init() {
  renderStep();
  updateProgressBar();
  
  // Navigation
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-action="next"]')) {
      e.preventDefault();
      if (validateCurrentStep()) {
        nextStep();
      }
    } else if (e.target.matches('[data-action="back"]')) {
      e.preventDefault();
      previousStep();
    } else if (e.target.matches('[data-action="skip"]')) {
      e.preventDefault();
      nextStep();
    } else if (e.target.matches('[data-action="restart"]')) {
      e.preventDefault();
      restart();
    }
  });
}

// Navigation functions
function nextStep() {
  if (state.currentStep < steps.length - 1) {
    state.currentStep++;
    renderStep();
    updateProgressBar();
    window.scrollTo(0, 0);
  }
}

function previousStep() {
  if (state.currentStep > 0) {
    state.currentStep--;
    renderStep();
    updateProgressBar();
    window.scrollTo(0, 0);
  }
}

function restart() {
  state.currentStep = 0;
  renderStep();
  updateProgressBar();
  window.scrollTo(0, 0);
}

// Progress bar
function updateProgressBar() {
  const coreSteps = steps.filter(s => s.core);
  const completedCoreSteps = steps
    .slice(0, state.currentStep)
    .filter(s => s.core).length;
  const currentStep = steps[state.currentStep];
  const currentCoreStep = currentStep.core ? currentStep.coreStep : completedCoreSteps;
  
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  if (progressBar && progressText) {
    const percent = (completedCoreSteps / coreSteps.length) * 100;
    progressBar.style.width = percent + '%';
    progressText.textContent = `Step ${currentCoreStep} of ${coreSteps.length}`;
  }
}

// Render current step
function renderStep() {
  const step = steps[state.currentStep];
  const container = document.getElementById('step-container');
  
  container.innerHTML = '';
  
  switch (step.id) {
    case 'a-about':
      renderAboutStep(container);
      break;
    case 'b-problems':
      renderProblemsStep(container);
      break;
    case 'c-who-fills':
      renderWhoFillsStep(container);
      break;
    case '1-fuel-use':
      renderFuelUseStep(container);
      break;
    case '2-rebate':
      renderRebateStep(container);
      break;
    case '3-admin':
      renderAdminStep(container);
      break;
    case '4-risk':
      renderRiskStep(container);
      break;
    case 'd-findings':
      renderFindingsStep(container);
      break;
    case 'e-results':
      renderResultsStep(container);
      break;
  }
}

// Supporting A: About them
function renderAboutStep(container) {
  container.innerHTML = `
    <div class="step-content">
      <h2>About them</h2>
      <div class="question">What do you do, and whereabouts?</div>
      
      <div class="form-group">
        <label>Industry</label>
        <select id="industry" class="form-control">
          <option value="">Select...</option>
          <option value="civil" ${state.data.industry === 'civil' ? 'selected' : ''}>Civil construction</option>
          <option value="agriculture" ${state.data.industry === 'agriculture' ? 'selected' : ''}>Agriculture</option>
          <option value="transport" ${state.data.industry === 'transport' ? 'selected' : ''}>Transport</option>
          <option value="asphalt" ${state.data.industry === 'asphalt' ? 'selected' : ''}>Asphalt and road surfacing</option>
          <option value="other" ${state.data.industry === 'other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      
      <div class="say-this">
        <strong>Say this:</strong> This helps us estimate your off-road fuel usage.
      </div>
      
      ${renderNavigation(false, true, true)}
    </div>
  `;
  
  document.getElementById('industry').addEventListener('change', (e) => {
    state.data.industry = e.target.value || null;
    // Pre-fill off-road % based on industry
    if (e.target.value && RATES.offRoadPresets[e.target.value] !== undefined) {
      state.data.offRoadPercent = RATES.offRoadPresets[e.target.value] * 100;
      state.modified.offRoadPercent = false;
    }
  });
}

// Supporting B: What they want to solve
function renderProblemsStep(container) {
  container.innerHTML = `
    <div class="step-content">
      <h2>What they want to solve</h2>
      <div class="question">What's the main problem you're trying to solve?</div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" value="rebate" ${state.data.problems.includes('rebate') ? 'checked' : ''}>
          Rebate records
        </label>
        <label class="checkbox-label">
          <input type="checkbox" value="theft" ${state.data.problems.includes('theft') ? 'checked' : ''}>
          Theft or security
        </label>
        <label class="checkbox-label">
          <input type="checkbox" value="admin" ${state.data.problems.includes('admin') ? 'checked' : ''}>
          Admin time
        </label>
        <label class="checkbox-label">
          <input type="checkbox" value="costing" ${state.data.problems.includes('costing') ? 'checked' : ''}>
          Job costing
        </label>
        <label class="checkbox-label">
          <input type="checkbox" value="visibility" ${state.data.problems.includes('visibility') ? 'checked' : ''}>
          Tank visibility
        </label>
      </div>
      
      <div class="say-this">
        <strong>Say this:</strong> We'll prioritize these in your results.
      </div>
      
      ${renderNavigation(true, true, true)}
    </div>
  `;
  
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.data.problems = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(c => c.value);
    });
  });
}

// Supporting C: Who fills
function renderWhoFillsStep(container) {
  container.innerHTML = `
    <div class="step-content">
      <h2>Who fills</h2>
      <div class="question">Who fills up: just you, your team, or contractors too?</div>
      
      <div class="form-group">
        <select id="who-fills" class="form-control">
          <option value="">Select...</option>
          <option value="just-me" ${state.data.whoFills === 'just-me' ? 'selected' : ''}>Just me</option>
          <option value="team" ${state.data.whoFills === 'team' ? 'selected' : ''}>My team</option>
          <option value="contractors" ${state.data.whoFills === 'contractors' ? 'selected' : ''}>Contractors too</option>
        </select>
      </div>
      
      <div class="say-this">
        <strong>Say this:</strong> This helps us estimate your fuel security risk.
      </div>
      
      ${renderNavigation(true, true, true)}
    </div>
  `;
  
  document.getElementById('who-fills').addEventListener('change', (e) => {
    state.data.whoFills = e.target.value || null;
    // Pre-select risk level
    if (e.target.value === 'just-me') {
      state.data.riskLevel = 'low';
      state.data.theftPercent = RATES.theft.low * 100;
    } else if (e.target.value === 'team' || e.target.value === 'contractors') {
      state.data.riskLevel = 'medium';
      state.data.theftPercent = RATES.theft.medium * 100;
    }
  });
}

// Core 1: Fuel use
function renderFuelUseStep(container) {
  const litresValue = state.data.fuelUseLitres || '';
  const dollarsValue = state.data.fuelUseDollars || '';
  
  container.innerHTML = `
    <div class="step-content">
      <h2>Fuel use</h2>
      <div class="question">Roughly how much diesel do you go through: a week, a month or a year?</div>
      
      <div class="form-group">
        <label>Amount in litres</label>
        <div class="input-row">
          <input type="number" id="fuel-litres" class="form-control" value="${litresValue}" placeholder="e.g., 4000">
          <select id="fuel-period" class="form-control period-select">
            <option value="week" ${state.data.fuelUsePeriod === 'week' ? 'selected' : ''}>per week</option>
            <option value="month" ${state.data.fuelUsePeriod === 'month' ? 'selected' : ''}>per month</option>
            <option value="year" ${state.data.fuelUsePeriod === 'year' ? 'selected' : ''}>per year</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label>Or amount in dollars</label>
        <div class="input-row">
          <input type="number" id="fuel-dollars" class="form-control" value="${dollarsValue}" placeholder="e.g., 8880">
          <span class="unit-text">${state.data.fuelUsePeriod === 'week' ? 'per week' : state.data.fuelUsePeriod === 'month' ? 'per month' : 'per year'}</span>
        </div>
      </div>
      
      <div class="form-group">
        <label>Diesel price ${state.modified.dieselPrice ? '' : '<span class="estimate-badge">estimate</span>'}</label>
        <div class="input-row">
          <span class="currency-prefix">$</span>
          <input type="number" id="diesel-price" class="form-control" value="${state.data.dieselPrice}" step="0.01">
          <span class="unit-text">per litre</span>
        </div>
      </div>
      
      <div id="fuel-check" class="warning" style="display: none;"></div>
      
      <div class="say-this">
        <strong>Say this:</strong> We'll use this to calculate your rebate and potential savings.
      </div>
      
      ${renderNavigation(true, false, false)}
    </div>
  `;
  
  const litresInput = document.getElementById('fuel-litres');
  const dollarsInput = document.getElementById('fuel-dollars');
  const periodSelect = document.getElementById('fuel-period');
  const priceInput = document.getElementById('diesel-price');
  const fuelCheck = document.getElementById('fuel-check');
  
  function updateFromLitres() {
    const litres = parseFloat(litresInput.value);
    if (litres) {
      state.data.fuelUseLitres = litres;
      state.data.fuelUseDollars = litresToDollars(litres, state.data.dieselPrice);
      dollarsInput.value = Math.round(state.data.fuelUseDollars);
      
      // Check if it looks like dollars
      if (litres > 50000) {
        fuelCheck.textContent = 'Is that litres or dollars? (Looks quite high for litres)';
        fuelCheck.style.display = 'block';
      } else {
        fuelCheck.style.display = 'none';
      }
    }
  }
  
  function updateFromDollars() {
    const dollars = parseFloat(dollarsInput.value);
    if (dollars) {
      state.data.fuelUseDollars = dollars;
      state.data.fuelUseLitres = dollarsToLitres(dollars, state.data.dieselPrice);
      litresInput.value = Math.round(state.data.fuelUseLitres);
    }
  }
  
  function updatePeriod() {
    state.data.fuelUsePeriod = periodSelect.value;
    document.querySelectorAll('.unit-text')[0].textContent = 
      state.data.fuelUsePeriod === 'week' ? 'per week' : 
      state.data.fuelUsePeriod === 'month' ? 'per month' : 'per year';
  }
  
  function updatePrice() {
    state.data.dieselPrice = parseFloat(priceInput.value);
    state.modified.dieselPrice = true;
    // Recalculate dollars from litres
    if (state.data.fuelUseLitres) {
      state.data.fuelUseDollars = litresToDollars(state.data.fuelUseLitres, state.data.dieselPrice);
      dollarsInput.value = Math.round(state.data.fuelUseDollars);
    }
    renderStep(); // Re-render to update badge
  }
  
  litresInput.addEventListener('input', updateFromLitres);
  dollarsInput.addEventListener('input', updateFromDollars);
  periodSelect.addEventListener('change', updatePeriod);
  priceInput.addEventListener('change', updatePrice);
}

// Core 2: Rebate
function renderRebateStep(container) {
  const totalAnnualLitres = state.data.fuelUseLitres ? 
    convertFuelUsage(state.data.fuelUseLitres, state.data.fuelUsePeriod, 'year') : 0;
  
  const dispensedValue = state.modified.dispensedLitres ? 
    (state.data.dispensedLitres || '') : 
    (state.data.fuelUseLitres || '');
  
  container.innerHTML = `
    <div class="step-content">
      <h2>Rebate they should be getting</h2>
      
      <div class="form-group">
        <div class="question">How much of that do you dispense yourselves, from your own tanks, pods or trailers?</div>
        <label>On-site dispensed litres ${!state.modified.dispensedLitres ? '<span class="estimate-badge">estimate</span>' : ''}</label>
        <div class="input-row">
          <input type="number" id="dispensed-litres" class="form-control" value="${dispensedValue}" placeholder="e.g., 4000">
          <select id="dispensed-period" class="form-control period-select">
            <option value="week" ${state.data.dispensedPeriod === 'week' ? 'selected' : ''}>per week</option>
            <option value="month" ${state.data.dispensedPeriod === 'month' ? 'selected' : ''}>per month</option>
            <option value="year" ${state.data.dispensedPeriod === 'year' ? 'selected' : ''}>per year</option>
          </select>
        </div>
        <div id="dispensed-warning" class="warning" style="display: none;"></div>
      </div>
      
      <div class="info-box">
        <strong>Under-recording reminder:</strong> If they quote litres from their own records, check them against litres bought. Records are often missing fills, so the bought figure can be the truer one.
      </div>
      
      <div class="form-group">
        <div class="question">Roughly what % goes into off-road gear (plant, tractors, gensets) versus registered vehicles on the road?</div>
        <label>Off-road % ${!state.modified.offRoadPercent ? '<span class="estimate-badge">estimate</span>' : ''}</label>
        <input type="number" id="offroad-percent" class="form-control" value="${state.data.offRoadPercent || ''}" placeholder="e.g., 90" min="0" max="100">
        <div class="quick-picks">
          <button type="button" class="btn-quick" data-value="0">0%</button>
          <button type="button" class="btn-quick" data-value="25">25%</button>
          <button type="button" class="btn-quick" data-value="50">50%</button>
          <button type="button" class="btn-quick" data-value="75">75%</button>
          <button type="button" class="btn-quick" data-value="100">100%</button>
        </div>
      </div>
      
      <div class="form-group">
        <div class="question">How much are you claiming now, roughly? Or what's your gut feel on how much of that you're getting?</div>
        <label>Claim mode</label>
        <select id="claim-mode" class="form-control">
          <option value="">Leave blank (no comparison)</option>
          <option value="dollars" ${state.data.claimMode === 'dollars' ? 'selected' : ''}>$ per year claimed now</option>
          <option value="gutfeel" ${state.data.claimMode === 'gutfeel' ? 'selected' : ''}>Gut-feel % of entitlement</option>
        </select>
      </div>
      
      <div id="claim-input-container"></div>
      
      ${renderNavigation(true, false, false)}
    </div>
  `;
  
  const dispensedInput = document.getElementById('dispensed-litres');
  const dispensedPeriodSelect = document.getElementById('dispensed-period');
  const dispensedWarning = document.getElementById('dispensed-warning');
  const offroadInput = document.getElementById('offroad-percent');
  const claimModeSelect = document.getElementById('claim-mode');
  
  function checkDispensedWarning() {
    if (state.data.fuelUseLitres && state.data.dispensedLitres) {
      const totalAnnual = convertFuelUsage(state.data.fuelUseLitres, state.data.fuelUsePeriod, 'year');
      const dispensedAnnual = convertFuelUsage(state.data.dispensedLitres, state.data.dispensedPeriod, 'year');
      
      if (isDispensedMoreThanTotal(totalAnnual, dispensedAnnual)) {
        dispensedWarning.textContent = 'Warning: Dispensed amount is more than total fuel use.';
        dispensedWarning.style.display = 'block';
      } else {
        dispensedWarning.style.display = 'none';
      }
    }
  }
  
  dispensedInput.addEventListener('input', (e) => {
    state.data.dispensedLitres = parseFloat(e.target.value) || null;
    state.modified.dispensedLitres = true;
    checkDispensedWarning();
    renderStep(); // Re-render to update badge
  });
  
  dispensedPeriodSelect.addEventListener('change', (e) => {
    state.data.dispensedPeriod = e.target.value;
    checkDispensedWarning();
  });
  
  offroadInput.addEventListener('input', (e) => {
    state.data.offRoadPercent = parseFloat(e.target.value) || null;
    state.modified.offRoadPercent = true;
    renderStep(); // Re-render to update badge
  });
  
  document.querySelectorAll('.btn-quick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseFloat(e.target.dataset.value);
      state.data.offRoadPercent = value;
      state.modified.offRoadPercent = true;
      offroadInput.value = value;
    });
  });
  
  claimModeSelect.addEventListener('change', (e) => {
    state.data.claimMode = e.target.value || null;
    renderClaimInput();
  });
  
  function renderClaimInput() {
    const container = document.getElementById('claim-input-container');
    if (!state.data.claimMode) {
      container.innerHTML = '';
      return;
    }
    
    if (state.data.claimMode === 'dollars') {
      container.innerHTML = `
        <div class="form-group">
          <label>$ claimed per year</label>
          <input type="number" id="claim-value" class="form-control" value="${state.data.claimValue || ''}" placeholder="e.g., 20000">
        </div>
      `;
    } else if (state.data.claimMode === 'gutfeel') {
      container.innerHTML = `
        <div class="form-group">
          <label>Gut-feel % of entitlement</label>
          <input type="number" id="claim-value" class="form-control" value="${state.data.claimValue || ''}" placeholder="e.g., 80" min="0" max="100">
          <div class="quick-picks">
            <button type="button" class="btn-quick" data-value="25">25%</button>
            <button type="button" class="btn-quick" data-value="50">50%</button>
            <button type="button" class="btn-quick" data-value="75">75%</button>
            <button type="button" class="btn-quick" data-value="100">100%</button>
          </div>
        </div>
      `;
      
      document.querySelectorAll('.btn-quick').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const value = parseFloat(e.target.dataset.value);
          state.data.claimValue = value;
          document.getElementById('claim-value').value = value;
        });
      });
    }
    
    const claimInput = document.getElementById('claim-value');
    if (claimInput) {
      claimInput.addEventListener('input', (e) => {
        state.data.claimValue = parseFloat(e.target.value) || null;
      });
    }
  }
  
  renderClaimInput();
  checkDispensedWarning();
}

// Core 3: Admin time
function renderAdminStep(container) {
  container.innerHTML = `
    <div class="step-content">
      <h2>Admin time</h2>
      <div class="question">How many hours a week or a month go on reconciling fuel, transferring logbook data and supervising contractors' fuel use?</div>
      
      <div class="form-group">
        <label>Admin hours</label>
        <div class="input-row">
          <input type="number" id="admin-hours" class="form-control" value="${state.data.adminHours || ''}" placeholder="e.g., 1">
          <select id="admin-period" class="form-control period-select">
            <option value="week" ${state.data.adminPeriod === 'week' ? 'selected' : ''}>per week</option>
            <option value="month" ${state.data.adminPeriod === 'month' ? 'selected' : ''}>per month</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label>Hourly rate ${!state.modified.adminRate ? '<span class="estimate-badge">estimate</span>' : ''}</label>
        <div class="input-row">
          <span class="currency-prefix">$</span>
          <input type="number" id="admin-rate" class="form-control" value="${state.data.adminRate}" step="1">
          <span class="unit-text">per hour</span>
        </div>
        <div class="quick-picks">
          <button type="button" class="btn-quick" data-value="35">$35 (regional)</button>
          <button type="button" class="btn-quick" data-value="52">$52 (metro)</button>
          <button type="button" class="btn-quick" data-value="75">$75 (high-cost)</button>
        </div>
      </div>
      
      <div class="form-group">
        <div class="question">How long do operators spend filling in fuel forms or logbooks at each refill, in total hours a week or a month?</div>
        <label>Operator hours (optional)</label>
        <div class="input-row">
          <input type="number" id="operator-hours" class="form-control" value="${state.data.operatorHours || ''}" placeholder="e.g., 2">
          <select id="operator-period" class="form-control period-select">
            <option value="week" ${state.data.operatorPeriod === 'week' ? 'selected' : ''}>per week</option>
            <option value="month" ${state.data.operatorPeriod === 'month' ? 'selected' : ''}>per month</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label>Operator hourly rate ${!state.modified.operatorRate ? '<span class="estimate-badge">estimate</span>' : ''}</label>
        <div class="input-row">
          <span class="currency-prefix">$</span>
          <input type="number" id="operator-rate" class="form-control" value="${state.data.operatorRate}" step="1">
          <span class="unit-text">per hour</span>
        </div>
        <div class="quick-picks">
          <button type="button" class="btn-quick-op" data-value="35">$35 (regional)</button>
          <button type="button" class="btn-quick-op" data-value="52">$52 (metro)</button>
          <button type="button" class="btn-quick-op" data-value="75">$75 (high-cost)</button>
        </div>
      </div>
      
      <div class="say-this">
        <strong>Say this:</strong> This helps us calculate the time cost of manual fuel management.
      </div>
      
      ${renderNavigation(true, false, false)}
    </div>
  `;
  
  document.getElementById('admin-hours').addEventListener('input', (e) => {
    state.data.adminHours = parseFloat(e.target.value) || null;
  });
  
  document.getElementById('admin-period').addEventListener('change', (e) => {
    state.data.adminPeriod = e.target.value;
  });
  
  document.getElementById('admin-rate').addEventListener('change', (e) => {
    state.data.adminRate = parseFloat(e.target.value);
    state.modified.adminRate = true;
    renderStep();
  });
  
  document.querySelectorAll('.btn-quick').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseFloat(e.target.dataset.value);
      state.data.adminRate = value;
      state.modified.adminRate = true;
      document.getElementById('admin-rate').value = value;
    });
  });
  
  document.getElementById('operator-hours').addEventListener('input', (e) => {
    state.data.operatorHours = parseFloat(e.target.value) || null;
  });
  
  document.getElementById('operator-period').addEventListener('change', (e) => {
    state.data.operatorPeriod = e.target.value;
  });
  
  document.getElementById('operator-rate').addEventListener('change', (e) => {
    state.data.operatorRate = parseFloat(e.target.value);
    state.modified.operatorRate = true;
    renderStep();
  });
  
  document.querySelectorAll('.btn-quick-op').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = parseFloat(e.target.dataset.value);
      state.data.operatorRate = value;
      state.modified.operatorRate = true;
      document.getElementById('operator-rate').value = value;
    });
  });
}

// Core 4: Contractor risk
function renderRiskStep(container) {
  container.innerHTML = `
    <div class="step-content">
      <h2>Contractor fuel risk</h2>
      <div class="question">What interaction do contractors have with your fuel?</div>
      
      <div class="form-group">
        <label class="radio-label ${state.data.riskLevel === 'low' ? 'selected' : ''}">
          <input type="radio" name="risk" value="low" ${state.data.riskLevel === 'low' ? 'checked' : ''}>
          <div>
            <strong>Low:</strong> Locked up, or staff only<br>
            <small>Theft ${RATES.theft.low * 100}%</small>
          </div>
        </label>
        <label class="radio-label ${state.data.riskLevel === 'medium' ? 'selected' : ''}">
          <input type="radio" name="risk" value="medium" ${state.data.riskLevel === 'medium' ? 'checked' : ''}>
          <div>
            <strong>Medium:</strong> Some contractor access, mixed controls<br>
            <small>Theft ${RATES.theft.medium * 100}%</small>
          </div>
        </label>
        <label class="radio-label ${state.data.riskLevel === 'high' ? 'selected' : ''}">
          <input type="radio" name="risk" value="high" ${state.data.riskLevel === 'high' ? 'checked' : ''}>
          <div>
            <strong>High:</strong> Open access, remote, little oversight<br>
            <small>Theft ${RATES.theft.high * 100}%</small>
          </div>
        </label>
      </div>
      
      <div class="form-group">
        <label>Theft % (editable)</label>
        <input type="number" id="theft-percent" class="form-control" value="${state.data.theftPercent}" step="0.1" min="0" max="100">
      </div>
      
      <div class="say-this">
        <strong>Say this:</strong> This helps us calculate your fuel security exposure.
      </div>
      
      ${renderNavigation(true, false, false)}
    </div>
  `;
  
  document.querySelectorAll('input[name="risk"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.data.riskLevel = e.target.value;
      state.data.theftPercent = RATES.theft[e.target.value] * 100;
      document.getElementById('theft-percent').value = state.data.theftPercent;
      
      // Update selected styling
      document.querySelectorAll('.radio-label').forEach(label => {
        label.classList.remove('selected');
      });
      e.target.closest('.radio-label').classList.add('selected');
    });
  });
  
  document.getElementById('theft-percent').addEventListener('input', (e) => {
    state.data.theftPercent = parseFloat(e.target.value);
  });
}

// Supporting D: Findings
function renderFindingsStep(container) {
  const totalAnnualLitres = state.data.fuelUseLitres ? 
    convertFuelUsage(state.data.fuelUseLitres, state.data.fuelUsePeriod, 'year') : 0;
  const dispensedAnnualLitres = state.data.dispensedLitres ? 
    convertFuelUsage(state.data.dispensedLitres, state.data.dispensedPeriod, 'year') : 0;
  
  let findings = [];
  
  findings.push(`<strong>Fuel use:</strong> ${formatNumber(totalAnnualLitres)} litres per year`);
  
  if (state.data.industry) {
    const industryNames = {
      civil: 'Civil construction',
      agriculture: 'Agriculture',
      transport: 'Transport',
      asphalt: 'Asphalt and road surfacing',
      other: 'Other'
    };
    findings.push(`<strong>Industry:</strong> ${industryNames[state.data.industry]}`);
  }
  
  findings.push(`<strong>Dispensed on-site:</strong> ${formatNumber(dispensedAnnualLitres)} litres per year`);
  findings.push(`<strong>Off-road:</strong> ${state.data.offRoadPercent}%`);
  
  if (state.data.claimMode === 'dollars') {
    findings.push(`<strong>Currently claiming:</strong> ${formatCurrency(state.data.claimValue)} per year`);
  } else if (state.data.claimMode === 'gutfeel') {
    findings.push(`<strong>Gut-feel claiming:</strong> ${state.data.claimValue}% of entitlement`);
  } else {
    findings.push(`<strong>Currently claiming:</strong> Not specified`);
  }
  
  if (state.data.adminHours) {
    findings.push(`<strong>Admin time:</strong> ${state.data.adminHours} hours per ${state.data.adminPeriod} at ${formatCurrency(state.data.adminRate)}/hour`);
  }
  
  if (state.data.operatorHours) {
    findings.push(`<strong>Operator time:</strong> ${state.data.operatorHours} hours per ${state.data.operatorPeriod} at ${formatCurrency(state.data.operatorRate)}/hour`);
  }
  
  findings.push(`<strong>Risk level:</strong> ${state.data.riskLevel} (${state.data.theftPercent}% theft)`);
  
  container.innerHTML = `
    <div class="step-content">
      <h2>Findings so far</h2>
      <div class="question">Here's what we've gathered:</div>
      
      <div class="findings-list">
        ${findings.map(f => `<div class="finding-item">${f}</div>`).join('')}
      </div>
      
      <div class="say-this">
        <strong>Say this:</strong> Does that all sound right? Let me know if anything needs correcting.
      </div>
      
      ${renderNavigation(true, false, true)}
    </div>
  `;
}

// Supporting E: Results
function renderResultsStep(container) {
  // Calculate all results
  const totalAnnualLitres = state.data.fuelUseLitres ? 
    convertFuelUsage(state.data.fuelUseLitres, state.data.fuelUsePeriod, 'year') : 0;
  const dispensedAnnualLitres = state.data.dispensedLitres ? 
    convertFuelUsage(state.data.dispensedLitres, state.data.dispensedPeriod, 'year') : 0;
  
  const rebateShouldGet = calculateRebateShouldGet(dispensedAnnualLitres, state.data.offRoadPercent);
  const rebateMissed = calculateRebateMissed(rebateShouldGet, state.data.claimMode, state.data.claimValue);
  const adminCost = calculateAdminCost(state.data.adminHours, state.data.adminPeriod, state.data.adminRate);
  const operatorCost = calculateOperatorTimeCost(state.data.operatorHours, state.data.operatorPeriod, state.data.operatorRate);
  const theftExposure = calculateTheftExposure(dispensedAnnualLitres, state.data.theftPercent, state.data.dieselPrice);
  const totalSavings = calculateTotalSavings(rebateMissed, adminCost, operatorCost, theftExposure);
  
  const showOverClaim = state.data.claimMode === 'dollars' && 
    isOverClaimed(rebateShouldGet, state.data.claimMode, state.data.claimValue);
  
  const dispensedMonthlyLitres = dispensedAnnualLitres / 12;
  const showLowVolumeNote = dispensedMonthlyLitres < 10000;
  
  let resultsHTML = `
    <div class="result-item headline">
      <div class="result-label">Rebate they should be getting per year</div>
      <div class="result-value">${formatCurrency(rebateShouldGet)}</div>
      <div class="result-note">${RATE_SOURCE}</div>
    </div>
  `;
  
  if (state.data.claimMode) {
    resultsHTML += `
      <div class="result-item">
        <div class="result-label">What they're getting now</div>
        <div class="result-value">${state.data.claimMode === 'dollars' ? formatCurrency(state.data.claimValue) : state.data.claimValue + '% (gut-feel)'}</div>
      </div>
      <div class="result-item">
        <div class="result-label">Rebate being missed per year</div>
        <div class="result-value">${formatCurrency(rebateMissed)}</div>
        ${showOverClaim ? '<div class="result-note warning">They may be claiming on fuel not dispensed on site; check the litres.</div>' : '<div class="result-note">That gap is money left on the table each year.</div>'}
      </div>
    `;
  }
  
  resultsHTML += `
    <div class="result-item">
      <div class="result-label">Admin cost per year</div>
      <div class="result-value">${formatCurrency(adminCost)}</div>
    </div>
  `;
  
  if (operatorCost > 0) {
    resultsHTML += `
      <div class="result-item">
        <div class="result-label">Operator time cost per year</div>
        <div class="result-value">${formatCurrency(operatorCost)}</div>
      </div>
    `;
  }
  
  resultsHTML += `
    <div class="result-item">
      <div class="result-label">Theft exposure per year</div>
      <div class="result-value">${formatCurrency(theftExposure)}</div>
    </div>
    
    <div class="result-item total">
      <div class="result-label">Total potential savings per year</div>
      <div class="result-value">${formatCurrency(totalSavings)}</div>
    </div>
  `;
  
  // Talking points
  let talkingPoints = [];
  
  // Priority items from step B
  if (state.data.problems.length > 0) {
    const problemLabels = {
      rebate: 'Clean rebate records',
      theft: 'Improved security and theft prevention',
      admin: 'Reduced admin time',
      costing: 'Better job costing',
      visibility: 'Tank visibility'
    };
    talkingPoints.push('<strong>Your priorities:</strong>');
    state.data.problems.forEach(p => {
      talkingPoints.push(`• ${problemLabels[p]}`);
    });
  }
  
  if (showLowVolumeNote) {
    talkingPoints.push('<strong>Volume note:</strong> At this volume the main win is clean rebate records and less admin, more than big dollar savings.');
  }
  
  container.innerHTML = `
    <div class="step-content">
      <h2>Results</h2>
      
      <div class="results-container">
        ${resultsHTML}
      </div>
      
      ${talkingPoints.length > 0 ? `
        <div class="talking-points">
          <h3>Talking points</h3>
          ${talkingPoints.map(p => `<div class="talking-point">${p}</div>`).join('')}
        </div>
      ` : ''}
      
      <div class="say-this">
        <strong>Say this:</strong> These are the potential savings from installing a fuel management system.
      </div>
      
      ${renderNavigation(true, false, false, true)}
    </div>
  `;
}

// Validation
function validateCurrentStep() {
  const step = steps[state.currentStep];
  
  switch (step.id) {
    case '1-fuel-use':
      if (!state.data.fuelUseLitres) {
        alert('Please enter fuel usage in litres');
        return false;
      }
      return true;
      
    case '2-rebate':
      if (!state.data.dispensedLitres) {
        alert('Please enter dispensed litres');
        return false;
      }
      if (state.data.offRoadPercent === null || state.data.offRoadPercent === undefined) {
        alert('Please enter off-road %');
        return false;
      }
      // Pre-fill dispensed litres if not modified
      if (!state.modified.dispensedLitres) {
        state.data.dispensedLitres = state.data.fuelUseLitres;
        state.data.dispensedPeriod = state.data.fuelUsePeriod;
      }
      return true;
      
    case '3-admin':
      if (!state.data.adminHours) {
        alert('Please enter admin hours');
        return false;
      }
      return true;
      
    case '4-risk':
      return true;
      
    default:
      return true;
  }
}

// Navigation buttons
function renderNavigation(showBack, showSkip, showNext, showRestart = false) {
  let html = '<div class="navigation">';
  
  if (showBack) {
    html += '<button class="btn btn-secondary" data-action="back">Back</button>';
  }
  
  if (showSkip) {
    html += '<button class="btn btn-secondary" data-action="skip">Skip</button>';
  }
  
  if (showNext) {
    html += '<button class="btn btn-primary" data-action="next">Next</button>';
  }
  
  if (showRestart) {
    html += '<button class="btn btn-secondary" data-action="restart">Start Over</button>';
  }
  
  html += '</div>';
  return html;
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', init);
}

# Fuel Numbers

A mobile-first web calculator for Fuellox salespeople to calculate potential yearly fuel savings from installing a fuel management system (FMS).

## Overview

Fuel Numbers is a standalone, single-page application that guides a salesperson through four core questions during a call with a lead:

1. **Fuel use** - How much diesel they go through
2. **Rebate they should be getting** - What rebate entitlement they have
3. **Admin time** - Time spent on fuel reconciliation
4. **Contractor fuel risk** - Security exposure level

The app calculates and displays:
- Rebate they should be getting per year
- Rebate being missed (if claiming data provided)
- Admin cost per year
- Operator time cost per year (optional)
- Theft exposure per year
- **Total potential savings per year**

## Features

- **Mobile-first design** - Optimized for phone use during calls
- **Step-by-step flow** - Progress bar shows completion through 4 core steps
- **Linked fuel fields** - Six fields (litres and dollars in week/month/year) update automatically
- **Defaults labeled** - All estimates show "estimate" badge until edited
- **Supporting steps** - Optional questions to pre-fill values and prioritize results
- **Pure calculation logic** - Separate module with comprehensive test coverage
- **No backend** - Runs entirely in the browser, no data sent anywhere
- **No indexing** - Includes robots.txt and noindex meta tag

## Running Locally

### Prerequisites

- Python 3 (for the simple HTTP server) or PHP
- Node.js (for running tests)

### Start the app

Using Python:
```bash
npm run serve
# or
python3 -m http.server 8000
```

Using PHP:
```bash
npm run serve-alt
# or
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

### Run tests

```bash
npm test
# or
node js/calculator.test.js
```

All six test cases from the spec must pass:
1. Farm example (blank, 80% gut-feel, $20,000 claimed)
2. Civil example (with and without operator time)
3. Linked fields (conversion and price change)
4. Dispensed guard (warning when dispensed > total)
5. Skips (optional steps can be skipped)
6. Over-claim guard ($0 when claiming more than entitled)

## Project Structure

```
fuel-numbers/
├── index.html           # Main HTML page
├── robots.txt          # Disallow all crawlers
├── css/
│   └── styles.css      # Mobile-first styles
├── js/
│   ├── calculator.js   # Pure calculation module
│   ├── calculator.test.js  # Test suite (6 test cases)
│   └── app.js          # Main application logic
├── SPEC.md             # Complete specification
├── CHANGELOG.md        # Change history
├── package.json        # Project metadata and scripts
└── README.md           # This file
```

## Calculation Formulas

All formulas use annual figures:

- **Rebate they should be getting** = D × (off% × 53.7¢/L + on% × 21.3¢/L)
- **Rebate being missed**:
  - $ mode: rebate should get − $ claimed now
  - Gut-feel mode: rebate should get × (100 − gut%)%
  - Never below $0
- **Admin cost** = hours × (52 if per week, 12 if per month) × $/hour
- **Operator time cost** = hours × (52 if per week, 12 if per month) × $/hour
- **Theft exposure** = dispensed litres × theft % × diesel $/L
- **Total potential savings** = rebate missed + admin + operator + theft

## Rates and Defaults

- **Fuel tax credit rates** (ATO rates for fuel acquired from 3 Aug 2026):
  - Off-road: 53.7¢/L
  - Heavy vehicles on public roads: 21.3¢/L
- **Diesel price**: $2.22/L (default, editable)
- **Hourly rate**: $52 (default, presets: $35, $52, $75)
- **Theft by risk level**: Low 1%, Medium 3%, High 6%
- **Off-road pre-fill by industry**:
  - Civil construction: 80%
  - Agriculture: 90%
  - Transport: 5%
  - Asphalt and road surfacing: 75%

## Hard Limits

- **Standalone** - No backend, no API calls, no data storage
- **No customer contact** - App doesn't email or share results
- **No customer data** - No real customer names or data in code/tests
- **No pricing** - No hardware price, subscription, quote, or payback figures
- **All defaults editable** - Every estimate can be changed by the salesperson

## Browser Compatibility

Tested in:
- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## License

Private and confidential. Not for public distribution.

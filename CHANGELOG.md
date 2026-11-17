# Changelog

All notable changes to Fuel Numbers will be documented in this file.

## [1.0.0] - 2026-11-17

### Added
- Initial release of Fuel Numbers calculator
- Mobile-first single-page application
- Step-by-step call flow with progress bar showing 4 core steps
- Supporting steps A-E (About them, What they want to solve, Who fills, Findings, Results)
- Core step 1: Fuel use with six linked fields (litres/dollars in week/month/year)
- Core step 2: Rebate calculation with dispensed litres, off-road %, and claim comparison
- Core step 3: Admin time and operator time cost calculation
- Core step 4: Contractor fuel risk assessment
- Pure calculation module (`js/calculator.js`) with all formulas
- Comprehensive test suite covering all 6 worked test cases from spec
- Rates and defaults from ATO (fuel acquired from 3 Aug 2026)
- "Estimate" badges on all default values until edited
- Warning when dispensed litres exceed total use
- Over-claim guard showing $0 and check note when claiming more than entitled
- Low volume talking point (under 10,000 L/month dispensed)
- Priority problem display from step B
- Results screen with rebate headline, rate source, and total potential savings
- robots.txt disallowing all crawlers
- `<meta name="robots" content="noindex">` in HTML
- Complete SPEC.md documentation
- README.md with usage instructions
- No backend, no network calls, all client-side
- No customer data or real names anywhere

### Formulas
- Rebate they should be getting: D × (off% × 53.7¢/L + on% × 21.3¢/L)
- Rebate being missed: $ mode (R − $ claimed) or gut-feel mode (R × (100 − gut%)%)
- Admin cost: hours × (52 or 12) × $/hour
- Operator time cost: hours × (52 or 12) × $/hour
- Theft exposure: D × theft % × diesel $/L
- Total potential savings: rebate missed + admin + operator + theft

### Test Cases
1. Farm example - 4,000 L/month, 90% off-road, low risk
2. Civil example - 10,000 L/month dispensed, 80% off-road, medium risk
3. Linked fields - conversions and price changes
4. Dispensed guard - warning trigger
5. Skips - supporting steps optional
6. Over-claim guard - $0 when claiming more than entitled

### Technical
- Plain HTML/CSS/JavaScript (ES modules)
- No framework dependencies
- Static files suitable for Netlify Free hosting
- Mobile-first responsive design
- Tested on Chrome, Safari, Firefox, and mobile browsers

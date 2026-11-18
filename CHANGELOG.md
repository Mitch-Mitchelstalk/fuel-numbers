# Changelog

All notable changes to Fuel Numbers will be documented in this file.

## [1.2.8] - 2026-11-18

### Changed - Section Styling Refinement
- **White section body backgrounds** - Changed from tinted backgrounds to clean white
- **Full accent-colored outlines** - Replaced left-only border with complete 2px border around entire section card
- **Colored header bands** - Kept exactly as before (blue/purple/yellow/amber tinted headers)
- **Border colors:**
  - Section 1 (Fuel Use): Blue #3B82F6
  - Section 2 (Rebate): Purple #8B5CF6
  - Section 3 (Admin & Log-book): Yellow #CA8A04
  - Section 4 (Theft risk): Amber #D97706
- **Inner field groups** - Remain light neutral grey as before
- **All other styling** - Unchanged (shadows, rounded corners, spacing)

## [1.2.7] - 2026-11-18

### Fixed - Critical Display Bugs
- **Bug 1: Rebate missed line not displaying**
  - Fixed calculateRebateMissed() calls to include correct parameters ('dollars' mode)
  - Rebate missed now properly shows under "Rebate they should be getting"
  - Displays with actual claim if filled, otherwise gut feel
  - Shows source label and renders in soft red
- **Bug 2: Thousands separators missing on linked fields**
  - Added setFormattedValue() helper to format programmatically filled fields
  - All linked fields now show commas when not focused:
    * Fuel litres/dollars fields (week, month, year)
    * Rebate claim dollars (calculated from %)
    * Admin $ fields (week, month, year)
  - Only the field being actively typed shows raw digits
  - Formatting applies after blur, linking updates, and on page load

### Testing
- All 7 test cases pass
- Verified in browser with large numbers (1,200,000 L/yr)
- Confirmed rebate missed displays correctly
- Confirmed all linked fields show thousands separators

## [1.2.6] - 2026-11-18

### Added - Rebate Missed Display & Thousands Separators
- **Rebate missed in Section 2:** Live-updating "Rebate missed: $X" line displays under "Rebate they should be getting"
  - Shows actual claim if filled, otherwise gut feel
  - Labels source "(from actual claim)" or "(from gut feel)"
  - Displayed in soft red (#B42318 on #FEF3F2 background)
  - Hidden when no claim data available
- **Thousands separators:** All number input fields and displayed figures now show with commas (e.g. 1,234,567,890)
  - Format on blur without breaking cursor position
  - Parse strips commas for calculations
  - Decimal fields (diesel price, hours, percentages) keep their decimals
  - Test coverage: parse "1,234,567" → 1234567; format 48000 → "48,000"

### Changed - Section Colors Refinement
- **Section 3 (Admin & Log-book):** Changed from green to YELLOW
  - Accent: #CA8A04
  - Header background: #FEF9C3
  - Card background: #FEFCE8
  - Text: Dark brown #713F12 for AA contrast on yellow
- **Section 4 (Theft risk):** Changed to warmer AMBER (distinct from yellow)
  - Accent: #D97706
  - Header background: Gradient #FDE68A → #FED7AA
  - Card background: #FFF7ED
  - Text: Dark brown #92400E for AA contrast

### Testing
- All 7 test cases pass
- New test: Test Case 7 - Thousands separator parse/format

## [1.2.5] - 2026-11-18

### Changed - Green Total Savings Card
- **Total potential savings card:** Now displays in confident green instead of red
  - Text color: #067647 (confident readable green)
  - Background: #ECFDF3 (light green tint) with gradient to #F0FDF4
  - Border: #6EE7B7 (green border)
  - Rationale: Green represents positive outcome (savings opportunity), not a cost
- **Individual money-missing lines:** Remain in soft red (#B42318) as they represent costs/losses
- **Visual hierarchy:** Total savings card remains the most prominent result

## [1.2.4] - 2026-11-18

### Changed - Section Backgrounds
- **Tinted section cards:** Each section now has a soft tinted background in its accent color for improved visual differentiation
  - Section 1 (Fuel Use): Light blue background (#EFF6FF)
  - Section 2 (Rebate): Light purple background (#F5F3FF)
  - Section 3 (Admin & Log-book): Light green background (#ECFDF5)
  - Section 4 (Theft risk): Light amber background (#FFFBEB)
- **Section headers:** Stronger color tint on h2 headers (e.g. #DBEAFE for Fuel, #E9D5FF for Rebate)
- **Input fields:** Remain white (#FFFFFF) for contrast and readability
- **Accessibility:** All text maintains WCAG AA contrast requirements

## [1.2.3] - 2026-11-18

### Fixed - UI Bugs
- **Section number badges:** Fixed missing numbers 1-4 in section badges. Numbers now display in white inside each colored badge. Added `-webkit-text-fill-color: white` to override gradient text effect on h2 headers.
- **Admin hours linkage:** Hours per week and hours per month now properly sync with each other. Entering 1 hr/week auto-fills 4.3 hrs/month; entering 4.3 hrs/month auto-fills 1 hr/week. Conversions: month = week × 52 / 12, week = month × 12 / 52, rounded to 1 decimal place, dropping .0.
- **Test coverage:** Added test for admin hours linkage (1 hr/wk → 4.3 hrs/month).
- **All 6 tests pass** ✓

## [1.2.2] - 2026-11-18

### Changed - Modern UI Polish
- **Section-specific accent colors:** Each input section now has a distinct, tasteful accent color with colored left border and gradient section header (Blue for Fuel Use, Purple for Rebate, Green for Admin & Log-book, Amber for Theft Risk). Matching colored number badges.
- **Results panel color coding:** Money-missing figures (rebate missed actual/gut, admin cost, log-book cost, theft exposure, total potential savings) shown in soft muted crimson (#B42318) on light rose tint cards (#FEF3F2). "Rebate they should be getting" and "What they're getting now" stay neutral/blue. Total savings card most prominent with border emphasis.
- **Modern design system:** Soft shadows, rounded corners (6-12px), generous spacing, clear visual hierarchy, improved typography with modern font stack.
- **Enhanced form fields:** Better focus states (blue glow on focus), hover states, improved contrast (WCAG AA compliant), smooth transitions.
- **Button improvements:** All buttons have hover effects (lift + shadow), active states for percentage buttons, consistent styling.
- **Card-based layout:** Field columns have subtle background tint and hover effects, section results in gradient cards.
- **Visual polish:** Gradient header, soft page background gradient, improved scrollbar styling, better estimate badges with gradient.
- **All functionality unchanged:** All 6 tests pass, no breaking changes.

## [1.2.1] - 2026-11-18

### Added - Dispenses Default and Admin $ Fields
- **Dispenses per week default:** Automatically calculates from weekly litres / 100 (assumes 100 L average per dispense), rounded to nearest whole. Marked with "estimate" badge and note "(assumes 100 L per dispense)". Updates live when fuel use changes until rep types their own value; after that keeps the typed value.
- **Admin cost $ fields:** Added $ per week, $ per month, $ per year fields (horizontal row like Section 1), linked to each other and to hours × rate. Editing hours or rate updates the $ fields; editing a $ field updates the others and back-calculates hours from rate (1 decimal place). Example: $200/month → $2,400/year, $46/week, 1.3 hours/week at $35.
- **Admin cost reference line:** Shows "Admin cost: $X per month" inside Section 3 for easy reference.
- **Test case 6:** Added test for dispenses default (48,000 L/yr → 923 L/wk → 9 dispenses) and admin $ linkage ($200/month → $2,400/yr, $46/wk, 1.3 hrs/wk at $35).
- **All 6 tests pass** ✓

### Kept Unchanged
- All Section 2 rebate changes
- All formulas and calculations
- Log-book time formula and results

## [1.2.0] - 2026-11-18

### Changed - Section 2 Rebate Redesign
- **Removed dispensed litres fields:** On-site dispensed litres fields (week/month/year) removed entirely. Rebate and theft now use total fuel litres from Section 1 (D = L everywhere).
- **Off-road % buttons:** Added selectable percentage buttons (0%, 10%, 20%, ..., 100% in 10% increments) for quick selection
- **Industry preset buttons:** Changed from dropdown to 4 separate buttons (Civil 80%, Agriculture 90%, Transport 5%, Asphalt 75%)
- **Two claim pairs:** Replaced single claim mode dropdown with two always-visible editable pairs:
  - **Actual claim:** $ per year ↔ % per year (linked fields)
  - **Gut feel:** $ per year ↔ % per year (linked fields)
- **What they're getting now:** New result line in results panel showing $ per year (actual if filled, else gut feel) with subtitle indicating which claim and percentage (e.g., "Gut feel: $19,377 (80.0%)" or "Actual: $20,000 (82.6%)")
- **Admin and log-book hours subtitles:** Results panel now shows hours per month under admin cost and log-book time cost (e.g., "· 4.3 hrs per month"), converted from entered unit (per week × 52 / 12, per month as entered for admin; minutes per dispense × dispenses per week × 52 / 12 / 60 for log-book), rounded to 1 decimal place, dropping .0
- **Operator time changed to log-book time:** Section 3 operator inputs changed from hours per week/month to minutes per dispense (filling in the log book) and dispenses per week. Formula: cost per year = minutes per dispense × dispenses per week × 52 / 60 × rate. Hourly rate presets updated to $35, $40, $52. Civil test updated: 2 min per dispense, 30 dispenses per week, $40/hr → 52 hrs/year, $2,080/year, 4.3 hrs per month, total $27,765 (was $31,093)
- **Separate rebate missed calculations:** Rebate missed shown separately for actual claim and for gut feel (both always visible when filled)
- **Smart total savings:** Total uses actual claim missed if filled, otherwise gut feel missed, otherwise $0. Shows which figure is used: "(using actual claim)" or "(using gut feel)".
- **Over-claim warnings:** Each claim pair shows "Over-claiming; check the figures." if claim > rebate should get
- **Removed features:** Dispensed > total warning, under-recording helper text, claim mode dropdown
- **Updated formulas:** D = L throughout. Rebate and theft both use total fuel litres.
- **Updated tests:** Removed test 4 (dispensed guard), renumbered tests 5→4 (skips) and 6→5 (over-claim). Farm test now covers 4 scenarios: blank claims, gut feel 80%, actual $20,000, and both filled (uses actual). Civil test uses 120,000 L/year total (not 10,000 dispensed from 11,600 total). All 5 tests pass.
- **Updated SPEC:** Documented all Section 2 changes, updated formulas and test cases

### Kept Unchanged
- All formulas in calculator.js (calculateRebateShouldGet, etc.)
- Section 1 (six linked fuel fields with smart price behavior)
- Section 3 (Admin & Operator Time)
- Section 4 (Theft Risk)
- Linked fields test (test 3) unchanged
- All ATO rates (53.7¢/L off-road, 21.3¢/L on-road from 3 Aug 2026)

## [1.1.2] - 2026-11-18

### Changed - Restored Six Linked Fields with Smart Price Behavior
- **Six linked fields restored:** Section 1 now has two horizontal rows (Litres: week/month/year; Dollars: week/month/year)
- **Smart diesel price:** When price changes, keeps whichever field type (litres or dollars) was last entered fixed and recalculates the other
  - If rep typed litres: litres stay, $ update
  - If rep typed $: $ stay, litres update
- **Diesel price back in Section 1:** Moved from Section 2 back to Section 1 as the conversion rate between rows
- **Removed redundant line:** Removed "Fuel spend per year" read-only result (now redundant with dollar fields)
- **Updated test 3:** Tests $ entry ($8,880/month at $2.22) converting to litres, plus smart price change behavior
- Three linked fields → six linked fields (with smart price behavior)

### Kept Unchanged
- Dispensed litres in Section 2 stays litres-only (horizontal week/month/year row)
- All formulas and calculations (calculator.js)
- All 6 test cases pass with exact dollar values
- All other functionality and behaviors

## [1.1.1] - 2026-11-18

### Changed - Fuel Use Section Refinements
- **Horizontal layout:** Litres per week/month/year now arranged side by side in one row with clear visual separation
- **Simplified fuel use:** Removed dollar input fields from Section 1 - fuel use is litres only (3 linked fields)
- **Diesel price moved:** Now in Section 2 (Rebate) where it's used for calculations
- **Diesel price behavior:** Only affects downstream calculations (theft exposure), does not affect fuel use input fields
- **Added result line:** "Fuel spend per year" shown as read-only calculated result in Section 1
- **Horizontal dispensed litres:** On-site dispensed litres in Section 2 now also arranged horizontally (week/month/year)
- **Consolidated badge:** Dispensed litres now has one "estimate" badge for all three fields
- **Updated test 3:** Now tests litres field linking and diesel price affecting calculations only, not inputs
- Six linked fields → three linked litres fields

### Kept Unchanged
- All formulas and calculations (calculator.js untouched except test 3 update)
- All 6 test cases pass with exact dollar values
- All other functionality and behaviors

## [1.1.0] - 2026-11-18

### Changed - Complete UI Redesign
- **BREAKING:** Redesigned from mobile-first step-by-step to desktop-first single-page calculator
- Removed all navigation: no next/back buttons, no skip buttons, no progress bar
- Removed all sales script content: no questions-to-ask, no "say this" notes, no talking points
- Removed supporting steps (About them, What they want to solve, Who fills, Findings)
- All inputs now on one page in 4 numbered sections with live calculation updates
- Desktop-first layout (1280-1920px comfortable width) with sticky results panel on right
- Results update automatically as you type - no need to click anything
- Clean, professional calculator interface
- Each section shows its own intermediate results
- Industry preset dropdown remains as optional helper next to off-road %
- Keep all calculation logic, formulas, rates, and test cases exactly as before

### Kept Unchanged
- All 6 test cases pass with exact dollar values
- calculator.js module (formulas, rates, all calculations)
- "estimate" badges on defaults until edited
- Warnings (dispensed > total, over-claim $0 note)
- Under-recording reminder (as short helper text)
- noindex meta tag and robots.txt
- No customer data anywhere
- ATO rates (3 Aug 2026): off-road 53.7¢/L, on-road 21.3¢/L

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

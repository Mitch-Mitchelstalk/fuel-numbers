# Changelog

All notable changes to Fuel Numbers will be documented in this file.

## [1.6.5] - 2026-11-18

### Changed - Section 4 Layout Reorganization

**Theft Risk Section: Top-to-Bottom Flow**
- ✅ **Preset buttons moved to top** of section (above risk cards)
- ✅ **Risk cards in middle** row (Low/Medium/High)
- ✅ **Theft % input at bottom** (below cards)
- ✅ **All 8 preset buttons** in single horizontal row: 0%, 0.2%, 0.4%, 0.6%, 0.8%, 1%, 3%, 6%
- ✅ **Two-way sync maintained** across all 3 control types

**New Layout (top to bottom):**

1. **Quick presets (top):** 8 buttons in single row for instant access to common values
2. **Risk level cards (middle):** 3 compact cards showing Low (0.6%), Medium (3%), High (6%)
3. **Theft % input (bottom):** Direct editable field with ESTIMATE badge

**Why This Layout:**
- **Progressive disclosure:** Quick presets → risk context → precise input
- **Visual hierarchy:** Most-used controls (presets) at top for fastest access
- **Clear separation:** Each control type in its own row reduces visual clutter
- **Consistent flow:** Top-to-bottom matches typical form-filling pattern

**User Experience:**
- **Quick selection:** Preset buttons at top for immediate one-click access
- **Risk framing:** Cards provide context (Low/Medium/High scenarios)
- **Fine control:** Direct input at bottom for any custom percentage
- **All 3 methods stay synchronized:** Buttons ↔ Cards ↔ Input

**Implementation:**
- **index.html:** Reordered Section 4 field-groups (presets → cards → input)
- **No CSS or JS changes required** (existing sync logic works with new order)
- **All 8 buttons retained** (fit cleanly in single row at desktop widths)

**Testing:**
- All 7 automated tests pass ✓
- Two-way highlighting works correctly ✓
- Layout renders cleanly at 1280×700 ✓

**Updated:**
- **SPEC.md:** Section 4 now describes top-to-bottom layout flow
- **CHANGELOG.md:** This entry

## [1.6.4] - 2026-11-18

### Changed - Compact Risk Cards

**Section 4: Risk Cards Restored with Compact Design**
- ✅ **Restored Low/Medium/High risk cards** in compact single-row layout
- ✅ **Changed Low to 0.6%** (was 1%) - label now reads "Theft 0.6%"
- ✅ **Low selected by default** (matches 0.6% default theft %)
- ✅ **Medium stays 3%**, High stays 6%
- ✅ **Compact card design:** 3 cards side by side, each shows risk level name and theft %
- ✅ **Two-way highlighting:** 
  - Selecting a risk card sets the theft % and highlights the card (amber)
  - Typing a % or clicking a preset button highlights the matching card (0.6% → Low, 3% → Medium, 6% → High) or shows no card selected if no match

**Design:**
- Cards display in a single horizontal row above the theft % input
- Each card shows risk level (Low/Medium/High) and corresponding theft percentage
- Active card highlighted with amber background (Section 4 color)
- Compact sizing: `min-height: 64px`, flex layout, centered content

**User Experience:**
- **Quick presets:** Cards provide instant access to 3 most common scenarios
- **Granular control:** 8 preset buttons + direct input for precise values
- **Smart highlighting:** System always shows which risk level matches current %
- **Clear feedback:** Active card and active button both highlighted

**Implementation:**
- **calculator.js:** Updated `RATES.theft.low` from `0.01` to `0.006` (0.6%)
- **index.html:** Added `.risk-cards` with 3 `.risk-card` labels above theft % input
- **styles.css:** Added compact card styles with `:has()` selector for active state
- **app.js:** 
  - Added `state.riskLevel: 'low'`
  - Added risk radio event handlers in `setupTheftFields()`
  - Added `updateRiskCardStates()` to highlight matching card when user types/clicks
  - Risk card and preset button handlers call each other's update functions

**Why the Change:**
- Owner feedback preferred visible risk level cards for context
- Compact design keeps UI clean while providing clear risk framing
- Low at 0.6% aligns with conservative default estimate
- Two-way highlighting maintains consistency across all controls

### Testing
- All 7 automated tests pass ✓
- Risk cards render in single compact row ✓
- Selecting Low card sets 0.6%, Medium sets 3%, High sets 6% ✓
- Typing 0.6% highlights Low, typing 3% highlights Medium, typing 6% highlights High ✓
- Typing 1% or 0.4% shows no card selected (both card and button systems independent) ✓
- Clicking preset buttons updates both card and button highlighting ✓

### Updated
- **SPEC.md:** Section 4 now describes compact risk cards + theft input + preset buttons
- **CHANGELOG.md:** This entry

### Supersedes
- v1.6.3 risk card removal - cancelled per owner request

## [1.6.3] - 2026-11-18

### Removed - Risk Level Radio Buttons

**Section 4: Simplified Theft Input**
- ✅ **Removed Low/Medium/High risk radio cards** entirely
- ✅ **Kept only direct theft % input** (default 0.6%, ESTIMATE badge)
- ✅ **Kept 8 preset buttons** (0, 0.2, 0.4, 0.6, 0.8, 1, 3, 6)
- ✅ **Active button highlighted** in amber

**Rationale:**
- Risk radio buttons were redundant with preset buttons
- Direct % input is clearer and more flexible
- Preset buttons provide common scenarios without extra UI
- Simpler, cleaner interface

**Removed:**
- Risk level radio buttons (Low 1%, Medium 3%, High 6%)
- Risk level state tracking
- Risk radio button event handlers

**Unchanged:**
- Theft % calculation (total fuel × theft % × diesel price)
- Default 0.6%
- ESTIMATE badge behavior
- Preset button active state highlighting
- All 8 preset buttons

### Code Changes
- **HTML:** Removed entire risk level radio button group
- **JS state:** Removed `riskLevel: 'low'`
- **JS setupTheftFields():** Removed risk radio event handlers
- **No CSS changes needed:** Radio button styles remain for other sections

### Testing
- All 7 automated tests pass ✓
- Theft calculation unchanged ✓

### Updated
- **SPEC.md:** Section 4 now shows only theft % input and preset buttons

## [1.6.2] - 2026-11-18

### Changed - Granular Theft Risk Presets

**Theft Risk: More Granular Options**
- ✅ **Added 0.2%, 0.4%, 0.6%, 0.8% presets** alongside existing 0%, 1%, 3%, 6%
- ✅ **8 theft % quick-pick buttons total** (was 4): 0%, 0.2%, 0.4%, 0.6%, 0.8%, 1%, 3%, 6%
- ✅ **Default changed to 0.6%** (from 1%) - more conservative baseline
- ✅ **Theft input accepts decimals** (step 0.1)

**Rationale:**
- More granular control for low-theft scenarios
- 0.6% is a more conservative default than 1%
- Rep can fine-tune theft risk in 0.2% increments
- Common scenarios: 0% (secure), 0.2-0.8% (low risk), 1% (standard low), 3-6% (higher risk)

**Farm Example Updated:**
- 48,000 L/year × 0.6% theft × $2.50/L = **$720** theft exposure (was $1,200 at 1%)
- Total potential savings (blank claims): **$2,540** (was $3,020)
- Gut feel 80%: **$7,384** (was $7,864)
- Actual $20,000: **$6,761** (was $7,241)

### Code Changes
- **HTML:** 
  - Theft % input default value: "0.6" (from "1")
  - Added 4 new quick-pick buttons: 0.2%, 0.4%, 0.6%, 0.8%
  - Input already had step="0.1" (accepts decimals)
- **JS state:** 
  - `theftPercent: 0.6` (from `RATES.theft.low * 100`)

### Testing
- All 7 automated tests pass ✓
- Tests use explicit theft % values, not defaults

### Updated
- **SPEC.md:** 
  - Section 4: Default 0.6%, 8 buttons, accepts decimals
  - Farm example: Updated all totals with $720 theft (0.6%)

## [1.6.1] - 2026-11-18

### Fixed - Total Always Visible at Page Load

**Problem:**
- At 1280x700 with page scrolled to top (scrollTop 0), Total potential savings was cut off below the fold
- Large header (2.5rem padding, 2.25rem h1) pushed Results panel down
- Total not visible at page load without scrolling

**Solution: Compact Slim Header**
- Reduced header to slim bar: 0.75rem padding (from 2.5rem)
- H1: 1.25rem font (from 2.25rem)
- Subtitle: inline 0.875rem (from separate line)
- Header height: 52px (from ~140px)

**Result:**
- ✅ Total fully visible at scrollTop 0 at 1280x700 (top: 556px, bottom: 658px, viewport: 700px)
- ✅ Total visible while scrolling
- ✅ Header compact but readable
- ✅ More vertical space for Results panel

### Code Changes
- **CSS:** Header styling compacted
  - `header`: padding 0.75rem 1.5rem (from 2.5rem 2rem)
  - `header h1`: 1.25rem font, inline, margin 0 (from 2.25rem, block, margin-bottom 0.5rem)
  - `header .subtitle`: new inline style, 0.875rem font, margin-left 0.75rem

### Testing
- All 7 automated tests pass ✓
- Browser-verified at 1280x700:
  - Total fully visible at scrollTop 0 ✓
  - Total fully visible when scrolled ✓
  - Header height: 52px ✓

## [1.6.0] - 2026-11-18

### Changed - Compact Results Panel (No Scrolling)

**Results Panel: Everything Fits On Screen**
- ✅ **Whole Results panel fits on one desktop screen** at 1280x700 and up
- ✅ **No scrolling inside Results panel** - all results visible without scrolling
- ✅ **Total potential savings stays large, green, and prominent**
- ✅ **Results panel remains sticky** as inputs scroll

**Implementation:**
- Made individual result lines more compact:
  - Smaller type sizes (labels, values, notes)
  - Tighter spacing between items
  - Reduced padding in result cards
  - Compact ATO rate note
- Kept total prominent: larger font (30px vs 18px regular), green, bold
- No structural changes - same HTML, just tighter CSS

**Visual Changes:**
- Result items: Reduced padding (0.5rem 0.75rem from 1.25rem)
- Gap between items: 0.375rem (from 1rem)
- Labels: 0.6875rem font (from 0.875rem)
- Values: 1.0625rem font (from 1.5rem)
- Notes: 0.625rem font (from 0.75rem)
- Total value: 1.875rem font (still prominent, from 2.25rem)
- Results panel padding: 1.25rem 1rem (from 2rem 1.5rem)
- Header: 1.125rem font (from 1.5rem)

**Benefits:**
- Everything visible at a glance - no scrolling needed
- Total always visible (no scroll means always on screen)
- Clean, efficient use of space
- Works at minimum desktop size (1280x700)
- Total remains the visual anchor (largest, green, prominent)

### Code Changes
- **CSS only:** Compact sizing throughout Results panel
  - `.results-panel`: Reduced padding, smaller header
  - `.results-content`: Tighter gap (0.375rem)
  - `.result-item`: Smaller padding, border, shadow
  - `.result-label`, `.result-value`, `.result-note`: Smaller fonts, tighter margins
  - `.result-item.total`: Kept prominent but slightly smaller (30px vs 32px)
  - `.rate-source`: New compact style
- **No HTML or JavaScript changes**

### Testing
- All 7 automated tests pass ✓
- Browser-verified at 1280x700:
  - No scrolling needed in Results panel ✓
  - Content height: 584px, Panel height: 700px (fits) ✓
  - Total visible and prominent ✓
  - Total is green (#067647), money-missing is red (#B42318) ✓
- Browser-verified at 1920x1080:
  - No scrolling needed ✓
  - Everything fits comfortably ✓

### Updated
- **styles.css:** Compact sizing for Results panel components

## [1.5.1] - 2026-11-18

### Changed - Theft Risk Defaults to Low (1%)

**Section 4: Theft Risk**
- ✅ **Default theft % changed from 3% (medium) to 1% (low)** - marked ESTIMATE
- ✅ **Default risk level changed from Medium to Low**
- ✅ **Added 0% quick-pick button** alongside 1%, 3%, 6%
- ✅ **Selecting 0% gives $0 theft exposure** (useful for highly secure sites)
- ✅ **ESTIMATE badge on theft %** - disappears when user edits field or clicks quick-pick

**Rationale:**
- More conservative baseline (1% vs 3%)
- Most sites have basic security (locked up, staff only)
- 0% option supports sites with exceptional security
- Rep can still select Medium (3%) or High (6%) for riskier sites

**Farm Example Updated:**
- 48,000 L/year × 1% theft × $2.50/L = **$1,200** theft exposure (was $3,600 at 3%)
- Total potential savings (blank claims): $3,020 (was $4,820)

### Code Changes
- **HTML:** Risk level radio default changed to "low" (checked)
- **HTML:** Theft % default value changed to "1"
- **HTML:** Added ESTIMATE badge to theft % label
- **HTML:** Added 4 quick-pick buttons (0%, 1%, 3%, 6%)
- **JS state:** `riskLevel: 'low'`, `theftPercent: RATES.theft.low * 100`
- **JS state:** Added `theftModified: false` tracking
- **JS:** Updated `setupTheftFields()` with quick-pick button handlers
- **JS:** Theft % input handler removes ESTIMATE badge on edit

### Testing
- All 7 automated tests pass ✓
- Browser-verified:
  - Default theft %: 1 ✓
  - Default risk level: "low" ✓
  - Farm example theft exposure: $1,200 ✓
  - Click 0% button → $0 exposure ✓
  - ESTIMATE badge hidden after modification ✓
  - Click 3% button → $3,600 exposure ✓
  - All 4 quick-pick buttons present ✓

### Updated
- **SPEC.md:** Theft risk default = low (1%), quick-pick buttons documented
- **Farm example:** Theft exposure $1,200 (from $1,200 - unchanged, already used 1%)

## [1.5.0] - 2026-11-18

### Changed - Visual Redesign of Section 2 & 3

**Section 2: Claim Columns (Side by Side)**
- ✅ **Actual claim and Gut feel now displayed side by side** as two equal-width columns
- ✅ **Visual divider with "OR" badge** between columns emphasizes mutual exclusivity
- ✅ **Each column is a card:**
  - Title at top (h3)
  - $ per year field
  - % per year field
  - Stacked vertically inside card
- ✅ **Active/inactive visual states:**
  - **Active** (filled): White background, purple accent border, subtle shadow
  - **Inactive** (cleared): Grey background, light border, 50% opacity
  - **Neutral** (both empty): Grey background, no opacity reduction
- ✅ **Mutual exclusive logic unchanged** from v1.4.0
- ✅ **Layout benefits:** Clear "choose one OR the other" visual hierarchy

**Section 3: Admin Grid (Consistent Field Layout)**
- ✅ **All admin fields now in uniform 3×2 grid:**
  - Row 1: Hours per week | Hours per month | Hourly rate
  - Row 2: $ per week | $ per month | $ per year
- ✅ **Consistent styling:** All 6 fields in identical grey boxes
- ✅ **Same label style and input size** across all fields
- ✅ **Hourly rate presets** stay below the rate field
- ✅ **Field linking unchanged** from previous versions
- ✅ **Layout benefits:** Professional, scannable, easy to compare related fields

**Log-book Time Default**
- ✅ **Minutes per dispense now defaults to 1** (marked ESTIMATE)
- ✅ **Log-book cost shows by default** when fuel data is entered
- ✅ **Rationale:** Realistic baseline - most sites do some log-book entry

### Updated
- **SPEC.md:** Documented claim column layout, active/inactive states, admin grid structure
- **CSS:** New `.claim-columns`, `.claim-column`, `.claim-divider`, `.or-badge`, `.admin-grid`, `.admin-field-box` styles
- **JavaScript:** Added `updateClaimColumnStates()` function to manage visual states
- **HTML:** Restructured Section 2 (columns), Section 3 (grid), log-book default

### Testing
- All 7 automated tests pass ✓
- Browser-verified:
  - Initial state: Both columns neutral ✓
  - Fill actual: Actual active (white + border), gut feel inactive (grey + faded) ✓
  - Switch to gut feel: Gut feel active, actual inactive ✓
  - Minutes per dispense defaults to 1 ✓
  - Admin grid has 6 matching field boxes ✓

## [1.4.0] - 2026-11-18

### Changed - Claim Pairs Now Mutually Exclusive
- **Actual claim and Gut feel are now mutually exclusive**
- **Behavior:** Typing into either field of one pair clears both fields of the other pair
  - Type in Actual $ or % → Gut feel $ and % both clear
  - Type in Gut feel $ or % → Actual $ and % both clear
  - No cross-calculation between pairs
- **Within each pair:** $ ↔ % linking and last-typed wins behavior unchanged from v1.3.0
- **Results:** Use whichever pair is filled (only one can be filled at a time now)
- **"What they're getting now" subtitle:** Now shows "Actual claim" or "Gut feel" (simplified)
- **Rationale:** Simpler model - rep uses either actual claim OR gut feel, not both

### Updated
- **SPEC.md:** Documented mutual exclusivity behavior
- **Results panel description:** Updated subtitle format (no dollar/percent details)

### Testing
- All 7 automated tests pass
- Browser-verified:
  - Fill gut feel 90% → actual fields stay empty ✓
  - Type actual $20,000 → gut feel fields clear ✓
  - Type gut feel 75% → actual fields clear ✓
  - "What they're getting now" shows correct source ✓
  - Rebate missed uses correct pair ✓

## [1.3.1] - 2026-11-18

### Changed - Default Diesel Price
- **Default diesel price:** Changed from $2.22/L to $2.50/L
- **Still marked "estimate"** until user edits it
- **Rationale:** More realistic current market price
- **Updated:**
  - calculator.js: RATES.defaultDiesel = 2.50
  - index.html: diesel-price input value = 2.50
  - calculator.test.js: Farm example test updated for new theft calculation
    * Theft at $2.50: 48,000 L × 1% × $2.50 = $1,200 (was $1,066 at $2.22)
    * Total savings updated accordingly in all scenarios
  - SPEC.md: All worked examples updated to show diesel price used
    * Farm example now states "$2.50/L (default)" in inputs
    * Theft calculation shown: "48,000 L × 1% × $2.50"
    * All total savings recalculated with new theft amounts
    * Linked fields example updated to use $2.50 default

### Testing
- All 7 test cases pass with updated values
- Farm example (with $2.50 default):
  - Theft: $1,200 (was $1,066)
  - Claims blank total: $3,020 (was $2,886)
  - Gut feel 80% total: $7,864 (was $7,730)
  - Actual $20,000 total: $7,241 (was $7,107)
- Civil example unchanged (uses explicit $2.60/L)

## [1.3.0] - 2026-11-18

### Changed - Claim Fields "Last-Typed Wins" Behavior
- **Claim field linking:** Implemented "last-typed wins" behavior for actual and gut feel claim pairs
- **How it works:** The field most recently typed in each pair stays fixed when R (rebate should get) changes
  - When fuel use, diesel price, or off-road % changes → R changes
  - If % was last typed: % stays fixed, $ recalculates as R × % / 100
  - If $ was last typed: $ stays fixed, % recalculates as $ / R × 100
- **Example:** Gut feel % typed 90 → $ always = 90% of current R, even when R changes
- **Example:** Actual $ typed $20,000 → % recalculates when R changes to keep $ at $20,000
- **Similar to:** Diesel price behavior in Section 1 (last-entered type stays fixed)
- **State tracking:** Added actualLastTyped and gutfeelLastTyped to track which field was last entered

### Updated
- **Rebate missed calculation:** Now uses floored subtraction: R - claimed $ (floored at 0)
- **SPEC.md:** Documented last-typed wins behavior, claim field meanings (% = share of R claimed)

### Testing
- All 7 automated tests pass
- Browser-verified:
  - R = $24,221 (48,000 L/yr, 90% off-road)
  - Gut feel % = 90 → $ = $21,799, missed = $2,422 ✓
  - Change off-road to 85% (R → $23,443) → % stays 90, $ recalcs to $21,099 ✓
  - Actual $ = $20,000 → % = 82.6% ✓
  - Change off-road to 80% (R → $22,666) → $ stays $20,000, % recalcs to 88.2% ✓

## [1.2.9] - 2026-11-18

### Fixed - Linked Field Filling Regression
- **Bug:** Linked fields not being filled (gut feel $, admin $ per year empty)
- **Root cause:** Setting formatted strings (with commas) on `type="number"` inputs, which browsers reject
- **Solution:** Changed integer input fields to `type="text" inputmode="decimal"`
  - Allows formatted values with commas to be set programmatically
  - Mobile keyboards still show numeric keypad via `inputmode="decimal"`
  - All linked pairs/triples now fill properly with comma formatting
- **Changed fields:**
  - Fuel litres (week, month, year)
  - Fuel dollars (week, month, year)
  - Rebate claim dollars (actual, gut feel)
  - Admin rate and dollars (week, month, year)
  - Operator rate
- **Kept `type="number"`:** Decimal fields (diesel price, hours, minutes, percentages)
- **Verified:** All linked fields fill with commas when partner edited:
  - Litres w/m/y ↔ $ w/m/y
  - Actual $ ↔ %
  - Gut feel $ ↔ %
  - Admin hrs w ↔ m
  - Admin $ w/m/y

### Testing
- All 7 test cases pass
- Browser-verified with 950,000 L/yr:
  - All 6 fuel fields filled with commas (18,269 / 79,167 / 950,000 L and $ equivalents)
  - Gut feel 70% → $324,786 with commas
  - Admin 3 hrs/wk → $156/$676/$8,112 with commas

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

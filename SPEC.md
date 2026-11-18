---
name: fuel-numbers-app-spec
description: >-
  Use for any work on the Fuel Numbers salesperson calculator: the call flow
  (four required core questions: fuel use, rebate they should be getting, admin
  time, contractor risk; plus optional supporting steps), the six linked
  fuel-usage fields, the formulas and rates, worked test cases, and what the app
  must never do. Load before planning, briefing a cloud agent, or checking a
  build.
---
# Fuel Numbers: app spec

**End goal:** a Fuellox salesperson, including one who isn't confident with numbers, opens one link during a call. They work through Mitch's four core questions in order (with optional supporting steps around them), enter the answers, and talk the lead through the rebate they should be getting, what they're getting now, and what admin time, operator time and contractor risk cost. The result is the potential yearly savings from installing an FMS. The app is live at a shareable link, and the code is saved and verified on main.

**Call context (Mitch, 18 Nov 2026):** any Fuellox salesperson drives it, on the first call and the follow-up. Only the rep sees the screen and reads the numbers out, so every "say this" note is written for the rep. It's a quick on-call estimate before any quote. It never references a quote, pricing or payback; the investment link still comes after approval.

This skill is the source of truth for the app. Fuel Numbers owns it (Mitch, 18 Nov 2026: "this is your project now"). Log each change in the repo's CHANGELOG. A rate or formula that isn't written here is not used.

## Hard limits
- Standalone. No connection to Zoho, CRM or any Fuellox system: no API calls, no imports, no record IDs, no links into CRM. Nothing typed into the app is sent to or stored on a server. Browser-only local storage for the current session is optional.
- No customer contact. The app doesn't email, text or share results. The salesperson talks the numbers through on the call.
- No customer names or real customer data in the repo, examples or tests.
- No hardware price, subscription price, quote, payback or multi-year figure anywhere.
- Every default is shown on screen and can be edited. A default is labelled "estimate" until the salesperson changes it.

## The calculator layout (updated 18 Nov 2026)
Single-page desktop calculator with live calculations. All inputs grouped into 4 numbered sections down the page, with results updating as you type. A sticky results panel on the right shows the complete savings breakdown.

### Section 1: Fuel Use
Six linked input fields arranged as two horizontal rows:
- Row 1: Litres per week | per month | per year
- Row 2: $ per week | per month | per year

Typing in any one fills the other five. Diesel price ($/L) is the conversion rate between rows. When the price changes, whichever field type (litres or dollars) was last entered stays fixed and the other type recalculates from it.

### Section 2: Rebate
- **Off-road %:** Input field with selectable percentage buttons (0%, 10%, 20%, ..., 100% in 10% increments) plus industry preset buttons (Civil 80%, Agriculture 90%, Transport 5%, Asphalt 75%).
- **Claim columns (side by side):** Actual claim and Gut feel presented as two columns with:
  - **Visual layout:** Two equal-width columns separated by vertical divider with "OR" badge
  - **Each column:** Card with title, $ per year field, % per year field stacked vertically
  - **Active/inactive states:** 
    - Filled column gets white background + purple accent border + shadow (active)
    - Cleared column gets grey background + light border + 50% opacity (inactive)
    - Both neutral (grey, no opacity reduction) when neither filled
- **Actual claim:** Two linked fields ($ per year ↔ % per year). Last-typed wins: whichever field is most recently typed stays fixed when R (rebate should get) changes, and its partner recalculates. Meaning: % = share of R they HAVE claimed; $ = R × % / 100; % = $ / R × 100.
- **Gut feel:** Two linked fields ($ per year ↔ % per year). Same last-typed-wins behavior as actual claim.
- **Mutually exclusive:** Actual and Gut feel pairs are mutually exclusive. Typing into either field of one pair clears both fields of the other pair. No cross-calculation between pairs. Use whichever pair the rep last filled.
- Rebate missed is calculated from whichever pair is filled.
- **Last-typed wins behavior:** Similar to diesel price in Section 1. When fuel use, diesel price, or off-road % changes (causing R to change), each claim pair's last-typed field stays fixed and the other recalculates. Example: gut % typed 90 → gut $ always = 90% of current R; if gut $ typed $20,000, then % recalculates when R changes to keep $ fixed at $20,000.
- **Section result:** Shows "Rebate they should be getting" (R) calculated from total fuel litres (Section 1) and off-road %.
- **Rebate missed:** Displays "Rebate missed: $X" under "Rebate they should be getting" with source label "(from actual claim)" or "(from gut feel)". Rebate missed = R - claimed $ (floored at 0). Shows actual claim if filled, otherwise gut feel. Displayed in soft red. Hidden when no claim data available.
- **Note:** Rebate and theft calculations now use total fuel litres from Section 1 (D = L). On-site dispensed litres fields have been removed.

### Section 3: Admin & Operator Time
- **Admin time grid layout:** All linked fields in consistent 3×2 grid (matching grey box style):
  - **Row 1:** Hours per week | Hours per month | Hourly rate
  - **Row 2:** $ per week | $ per month | $ per year
  - All fields in identical grey boxes with same label style and input size
  - Hourly rate presets ($35, $52, $75) display under rate field. Default $52 with "estimate" label until edited.
- **Field linking:** Hours per week ↔ hours per month (linked); all three $ fields linked to each other and to hours × rate. Editing hours or rate updates the $ fields; editing a $ field updates the others and back-calculates hours from rate (1 decimal place).
- **Admin cost reference line:** Shows "Admin cost: $X per month" inside Section 3.
- **Log-book time (optional):** Minutes per dispense (default 1, marked ESTIMATE), dispenses per week (defaults to weekly litres / 100, rounded, with "estimate" badge and note "(assumes 100 L per dispense)"; updates live when fuel changes until rep types their own value), hourly rate with presets ($35, $40, $52).
- **Section result:** Shows admin cost per year (with hours per month subtitle) and log-book time cost per year (if entered, with hours per month subtitle).

### Section 4: Theft Risk

**Layout (top to bottom):**

1. **Quick-pick preset buttons (top row):** 0%, 0.2%, 0.4%, 0.6%, 0.8%, 1%, 3%, 6% in a single horizontal row. Active button highlighted in amber.
2. **Risk level cards (middle row):** Three compact cards side by side (Low 0.6%, Medium 3%, High 6%). Low selected by default. Active card highlighted in amber.
3. **Theft % input (bottom):** Direct editable input field. Default 0.6% (marked ESTIMATE). Accepts decimals (step 0.1). ESTIMATE badge disappears when user edits field or clicks preset button/card.

**Two-way sync:**
- Selecting a risk card → sets theft % and highlights matching preset button
- Clicking a preset button → sets theft % and highlights matching risk card (0.6% → Low, 3% → Medium, 6% → High)
- Typing a % → highlights matching card and button, or none if no match

**Section result:** Shows theft exposure per year (total fuel × theft % × diesel price).

### Results Panel (sticky right column)
Always visible, shows all calculated values updating live:
1. Rebate they should be getting (headline, per year)
2. What they're getting now - shown if either claim filled. Main number: actual claim $ if filled, otherwise gut feel $. Subtitle shows which: "Actual claim" or "Gut feel"
3. Rebate missed (actual claim) - shown if actual claim filled, with over-claim warning if applicable
4. Rebate missed (gut feel) - shown if gut feel filled, with over-claim warning if applicable
5. Admin cost per year - with subtitle showing hours per month (e.g., "· 4.3 hrs per month"), converted from entered unit (per week × 52 / 12, per month as entered), rounded to 1 decimal place, dropping .0
6. Log-book time cost per year (if entered) - with subtitle showing hours per month (e.g., "· 4.3 hrs per month"), calculated from minutes per dispense × dispenses per week × 52 / 12 / 60, rounded to 1 decimal place, dropping .0
7. Theft exposure per year
8. **Total potential savings per year** (highlighted) - uses actual claim if filled, otherwise gut feel, otherwise $0. Shows which figure is used: "(using actual claim)" or "(using gut feel)".
9. ATO rate source line at bottom

All results update automatically as inputs change. No navigation buttons, no progress bar, no separate screens.

## Number Formatting
- **Thousands separators:** All integer input fields (litres, dollars) and all displayed figures show with commas (e.g., 1,234,567,890).
- **Input behavior:** On blur, integer fields format with commas. On focus, commas are stripped for easier editing. Parsing always strips commas before calculations.
- **Decimal fields:** Diesel price, hours, and percentages keep their decimal places without commas.
- **Display:** All monetary results and large numbers display with thousands separators using toLocaleString('en-US').

## Six linked fuel-usage fields
Litres per week, month and year, and dollars per week, month and year. Typing in any one fills the other five.
- 1 year = 52 weeks = 12 months. For annual litres L: week = L ÷ 52, month = L ÷ 12.
- $ = litres × diesel price. The diesel price defaults to $2.50/L (marked "estimate") and is editable.
- When the price changes, whichever field type (litres or dollars) was last entered stays fixed and the other type recalculates from it. If litres were last typed, litres stay and $ update. If $ were last typed, $ stay and litres update.
- Show litres and $ to whole numbers. Keep full precision internally.
- Example: 48,000 L/year at $2.50/L = 4,000 L/month = 923 L/week. At $2.50/L that's $120,000/year, $10,000/month, and $2,308/week.

## Formulas (annual)
L = annual litres used (total fuel from Section 1). D = L (dispensed litres removed). R = rebate they should be getting (rounded to whole dollars).
- **Rebate they should be getting** R = L × (off% × off-road rate + (100 − off%)% × on-road rate).
- **Rebate being missed (actual claim):** R − $ actual claimed. Never below $0. If $ actual > R, show $0 and warning "Over-claiming; check the figures."
- **Rebate being missed (gut feel):** R − $ gut feel. Where $ gut feel = (gut feel % / 100) × R. Never below $0, same over-claim warning if applicable.
- **Admin cost** = hours × (52 if per week, 12 if per month) × $/hour.
- **Log-book time cost** = minutes per dispense × dispenses per week × 52 / 60 × $/hour, rounded.
- **Theft exposure** = L × theft % × diesel $/L.
- **Total potential savings a year** = rebate being missed + admin + log-book time + theft. Uses actual claim missed if filled, otherwise gut feel missed, otherwise $0. The full entitlement R is never counted as a saving, because they're probably already claiming some of it.
- Round each line to whole dollars before adding.

## Rates and defaults (check before every build)
- **Fuel tax credit rates** (ATO, fuel acquired from 3 Aug 2026; Mitch chose these 18 Nov 2026): off-road (all other business uses) **53.7¢/L**; heavy vehicles on public roads **21.3¢/L**.
  - Rates are indexed each February and August (next: Feb 2027). Before each build, check ato.gov.au for the current published rates and show Mitch any difference. Don't change a rate without his yes.
  - Show "ATO rates for fuel acquired from 3 Aug 2026" under the rebate result.
- **Diesel:** $2.50/L (marked "estimate"). **Hourly rate (admin and operator):** $52 (presets $35, $52 and $75). **Theft by risk level:** 1%, 3% and 6%.
- **Off-road pre-fill by industry (step A):** civil 80%, agriculture 90%, transport 5%, asphalt 75%.

## Worked test cases (must pass)
1. **Farm example.**
   - Inputs: use 4,000 L/month (48,000 L/year); off-road 90%; admin 1 hour/week at $35; no operator time; low risk (0.6% default), $2.50/L (default).
   - Results: rebate they should be getting $24,221; admin $1,820; theft $720 (48,000 L × 0.6% × $2.50).
   - Claims blank: **total potential savings $2,540** ($0 + $1,820 + $0 + $720).
   - Gut feel 80%: getting now $19,377 (80%), missed $4,844; **total $7,384** ($4,844 + $1,820 + $720).
   - Actual $20,000: getting now 82.6%, missed $4,221; **total $6,761** ($4,221 + $1,820 + $720).
   - Both actual and gut feel filled: **total uses actual ($6,761)** not gut feel.
2. **Civil example.**
   - Inputs: use 10,000 L/month (120,000 L/year); off-road 80%; admin 8 hours/month at $52; medium risk (3%), $2.60/L; gut feel 80%.
   - Results: rebate they should be getting $56,664; gut feel getting now $45,331 (80%), missed $11,333; admin $4,992 (8 hrs per month); theft $9,360; **total potential savings $25,685**.
   - Add log-book time 2 min per dispense, 30 dispenses per week at $40/hr: 52 hrs/year, log-book $2,080 (4.3 hrs per month); **total $27,765**.
3. **Linked fields.** Enter 48,000 L/year at $2.50/L (default): converts to 4,000 L/month, 923 L/week, plus $120,000/year, $10,000/month, and $2,308/week. Change price to $2.60/L with litres last typed: litres stay unchanged (923, 4,000, 48,000), $ values recalculate to $2,400/week, $10,400/month, $124,800/year.
4. **Skips.** Skipping every supporting step (admin, operator, theft, claims) still gives the core results (rebate only). Off-road must then be entered by hand. Choosing an industry preset button pre-fills the off-road %.
5. **Over-claim guard.** Farm example with actual claim $30,000: missed shows $0 with warning "Over-claiming; check the figures."
6. **Dispenses default and admin $ linkage.** 48,000 L/year → 923 L/week → 9 dispenses per week (default, assumes 100 L per dispense). Admin $ linkage: $200/month → $2,400/year, $46/week, 1.3 hours/week at $35 (back-calculated).

## Build and done
- Repo, hosting and link visibility follow the approved review pack: a private GitHub repo (Mitch-Mitchelstalk/fuel-numbers) deployed on Netlify Free, unlisted and noindex.
- Work goes through cloud agents only (rulebook R7). Mitch's go is needed for merges to main and for each public deploy.
- Mobile-first: a salesperson may have it open on a phone during a call.
- Done means: all six tests pass in the repo's automated tests; Mitch has clicked through the live link; the commit is verified on main (rulebook R14); the link is reported.

## Decided
- Theft exposure uses dispensed on-site litres (Mitch, 18 Nov 2026).
- No investment step, payback or multi-year figures; results show potential savings only, rebate first (Mitch, 18 Nov 2026).
- Rebate comparison: should be getting vs getting now ($ or gut-feel %) (Mitch, 18 Nov 2026).
- Risk wording stays; no mention of siphoning (Mitch, 18 Nov 2026).

## Later (not in the current build)
- Buy-back offer and its wording.
- A chart comparing current process costs with costs after an FMS, based on the findings.
- Whole-fleet view (moot while there's no quote or payback).

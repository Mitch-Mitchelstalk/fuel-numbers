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
Six linked input fields (litres and dollars, per week/month/year) that automatically update when any one is changed. Diesel price field with "estimate" label until edited, defaults to $2.22/L.

### Section 2: Rebate
- **On-site dispensed litres:** Three fields (week/month/year), pre-filled from total fuel use with "estimate" labels until edited.
- **Under-recording reminder:** Helper text shown below dispensed fields: "If they quote litres from their own records, check against litres bought - records often miss fills."
- **Dispensed > total warning:** Shows when dispensed exceeds total fuel use.
- **Off-road %:** Input field with quick picks (0%, 25%, 50%, 75%, 100%) and optional industry preset dropdown (Civil 80%, Agriculture 90%, Transport 5%, Asphalt 75%). Shows "estimate" label if set via industry preset.
- **What they're getting now:** Dropdown with three modes:
  - Leave blank (no comparison)
  - $ per year claimed now
  - Gut-feel % of entitlement (with quick picks 25%, 50%, 75%, 100%)
- **Section result:** Shows "Rebate they should be getting" calculated from dispensed litres and off-road %.

### Section 3: Admin & Operator Time
- **Admin time:** Hours per week and per month (linked), hourly rate with presets ($35, $52, $75). Default $52 with "estimate" label until edited.
- **Operator time (optional):** Same structure as admin - hours per week/month, hourly rate with presets. Blank counts as $0.
- **Section result:** Shows admin cost per year, and operator time cost per year (if entered).

### Section 4: Theft Risk
- **Risk level:** Radio buttons for Low (1%), Medium (3%), High (6%). Default medium.
- **Theft % (editable):** Updates automatically with risk level but remains editable.
- **Section result:** Shows theft exposure per year.

### Results Panel (sticky right column)
Always visible, shows all calculated values updating live:
1. Rebate they should be getting (headline, per year)
2. What they're getting now (if claim mode selected)
3. Rebate being missed (if claim mode selected, with over-claim warning if applicable)
4. Admin cost per year
5. Operator time cost per year (if entered)
6. Theft exposure per year
7. **Total potential savings per year** (highlighted)
8. ATO rate source line at bottom

All results update automatically as inputs change. No navigation buttons, no progress bar, no separate screens.

## Six linked fuel-usage fields
Litres per week, month and year, and dollars per week, month and year. Typing in any one fills the other five.
- 1 year = 52 weeks = 12 months. For annual litres L: week = L ÷ 52, month = L ÷ 12.
- $ = litres × diesel price. The diesel price defaults to $2.22/L and is editable. Changing the price recalculates the $ fields from the litres last entered.
- Show litres to whole numbers and $ to whole dollars. Keep full precision internally.
- Example: 4,000 L/month = 48,000 L/year = 923 L/week. At $2.22/L that's $8,880/month, $106,560/year and $2,049/week.

## Formulas (annual)
L = annual litres used. D = annual litres dispensed on site. R = rebate they should be getting (rounded to whole dollars).
- **Rebate they should be getting** R = D × (off% × off-road rate + (100 − off%)% × on-road rate).
- **Rebate being missed:**
  - $ mode: R − $ claimed now.
  - Gut-feel mode: R × (100 − gut%)%.
  - Never below $0. If $ claimed now is more than R, show $0 and the note "They may be claiming on fuel not dispensed on site; check the litres."
- **Admin cost** = hours × (52 if per week, 12 if per month) × $/hour.
- **Operator time cost** = hours × (52 if per week, 12 if per month) × $/hour.
- **Theft exposure** = D × theft % × diesel $/L. On-site fuel is the fuel contractors can reach (Mitch, 18 Nov 2026).
- **Total potential savings a year** = rebate being missed + admin + operator time + theft. The full entitlement R is never counted as a saving, because they're probably already claiming some of it.
- Round each line to whole dollars before adding.

## Rates and defaults (check before every build)
- **Fuel tax credit rates** (ATO, fuel acquired from 3 Aug 2026; Mitch chose these 18 Nov 2026): off-road (all other business uses) **53.7¢/L**; heavy vehicles on public roads **21.3¢/L**.
  - Rates are indexed each February and August (next: Feb 2027). Before each build, check ato.gov.au for the current published rates and show Mitch any difference. Don't change a rate without his yes.
  - Show "ATO rates for fuel acquired from 3 Aug 2026" under the rebate result.
- **Diesel:** $2.22/L. **Hourly rate (admin and operator):** $52 (presets $35, $52 and $75). **Theft by risk level:** 1%, 3% and 6%.
- **Off-road pre-fill by industry (step A):** civil 80%, agriculture 90%, transport 5%, asphalt 75%.

## Worked test cases (must pass)
1. **Farm example.**
   - Inputs: use 4,000 L/month, all dispensed on site (48,000 L/year); off-road 90%; admin 1 hour/week at $35; no operator time; low risk (1%), $2.22/L; getting now blank.
   - Results: rebate they should be getting $24,221; missed $0; admin $1,820; theft $1,066; **total potential savings $2,886**.
   - Gut-feel 80%: missed $4,844; **total $7,730**.
   - $ mode, $20,000 claimed now: missed $4,221; **total $7,107**.
2. **Civil example.**
   - Inputs: use 11,600 L/month, of which 10,000 L/month is dispensed on site (120,000 L/year); off-road 80%; admin 8 hours/month at $52; medium risk (3%), $2.60/L; gut-feel 80%.
   - Results: rebate they should be getting $56,664; missed $11,333; admin $4,992; theft $9,360; **total potential savings $25,685**.
   - Add operator time 2 hours/week at $52: operator $5,408; **total $31,093**.
3. **Linked fields.** Enter $8,880/month at $2.22: all six fields match the 4,000 L/month example. Change the price to $2.50: the litres stay the same and the $ fields update.
4. **Dispensed guard.** Total use 4,000 L/month and dispensed 5,000 L/month: a warning shows. The rebate still calculates on the dispensed figure.
5. **Skips.** Skipping every supporting step still gives the core results. Off-road must then be entered by hand. Choosing Civil in step A pre-fills 80% off-road.
6. **Over-claim guard.** Farm example in $ mode with $30,000 claimed now: missed shows $0 with the check note.

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

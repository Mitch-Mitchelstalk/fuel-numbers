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

## The call flow
Mitch's four questions (18 Nov 2026) are the backbone. They're marked **required** and stay in his order. Supporting screens are optional: the salesperson can skip them, and skipping only drops a default or a talking point. Each screen shows the question to ask, the input, and a short "say this" note for the rep. A progress bar shows the four core steps.

### Supporting (optional): opening
- **A. About them.** "What do you do, and whereabouts?"
  - Industry: Civil construction, Agriculture, Transport, Asphalt and road surfacing, Other.
  - The industry only pre-fills the off-road % in Core 2b, labelled "estimate": civil 80%, agriculture 90%, transport 5%, asphalt 75%. "Other" leaves it blank.
- **B. What they want to solve.** "What's the main problem you're trying to solve?"
  - Tick any of: rebate records, theft or security, admin time, job costing, tank visibility.
  - Ticked items are listed first on the results screen.
- **C. Who fills.** "Who fills up: just you, your team, or contractors too?"
  - Pre-selects the risk in Core 4: just me → low; team → medium; contractors → medium. The salesperson confirms it.

### Core (required, in Mitch's order)
1. **Fuel use (litres).** "Roughly how much diesel do you go through: a week, a month or a year?"
   - Use the six linked fields below. **Litres per year** is the headline figure.
   - If the litres figure looks like a dollar amount, show a check line: "Is that litres or dollars?"
2. **Rebate they should be getting.**
   - (a) "How much of that do you dispense yourselves, from your own tanks, pods or trailers?" Enter the on-site dispensed litres in the same week/month/year units. The field starts equal to total use, labelled "estimate". If it's more than total use, show a warning.
   - Under-recording reminder (always shown under 2a, for the rep): "If they quote litres from their own records, check them against litres bought. Records are often missing fills, so the bought figure can be the truer one."
   - (b) "Roughly what % goes into off-road gear (plant, tractors, gensets) versus registered vehicles on the road?" Enter the off-road %, with quick picks at 0, 25, 50, 75 and 100. Pre-filled from step A if an industry was chosen; otherwise blank and must be entered.
   - Result: **rebate they should be getting a year**, the full entitlement on dispensed litres. This is the headline figure of the whole app.
   - (c) **What they're getting now.** "How much are you claiming now, roughly? Or what's your gut feel on how much of that you're getting?" The rep picks one input mode:
     - **$ a year** claimed now; or
     - **gut-feel %** of the full entitlement, with quick picks at 25, 50, 75 and 100.
     - Left blank: no comparison is shown and rebate being missed counts as $0.
   - Result: **rebate being missed a year** (see formulas). Say this: "That gap is money left on the table each year."
3. **Admin time.** "How many hours a week or a month go on reconciling fuel, transferring logbook data and supervising contractors' fuel use?"
   - Hours, with a per week / per month toggle.
   - Hourly rate: presets regional $35, metro $52 and high-cost metro $75. The default is $52, labelled "estimate", and it's editable.
   - **Operator time** (optional sub-question on the same step): "How long do operators spend filling in fuel forms or logbooks at each refill, in total hours a week or a month?" Hours with its own per week / per month toggle, and its own hourly rate (same presets, default $52 "estimate"). Blank counts as $0.
4. **Contractor fuel risk.** "What interaction do contractors have with your fuel?"
   - **Low:** locked up, or staff only. Theft 1%.
   - **Medium:** some contractor access, mixed controls. Theft 3%.
   - **High:** open access, remote, little oversight. Theft 6%.
   - Default medium, or as pre-selected in step C. The theft % stays editable. Don't mention siphoning anywhere: an FMS doesn't stop it.

### Supporting (optional): close
- **D. Findings so far.** A one-screen summary of the core answers in plain words, so the rep can read it back and the lead can correct anything.
- **E. Results and talking points.**
  - Show, in this order:
    1. rebate they should be getting a year (headline, largest);
    2. what they're getting now and rebate being missed (if 2c was filled);
    3. admin cost a year;
    4. operator time cost a year (if entered);
    5. theft exposure a year;
    6. **total potential savings a year**.
  - Under the rebate, show the rate period and source.
  - Talking points:
    - Step B's ticked items come first.
    - At under 10,000 L a month dispensed: "At this volume the main win is clean rebate records and less admin, more than big dollar savings."

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

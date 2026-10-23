# India GCC Planner · Flexiple PM assignment prototype

You are helping Aadi Kalra (CS + AI student, Newton School of Technology) build a working
prototype for a Flexiple product internship assignment. Read this whole file before writing code.
Every product decision below is final unless Aadi changes it. Do not add features that are not here.

## 1. The assignment (what Flexiple asked for)

A deck + a working prototype covering:
- The problem: who the players are, who is hurt by the information asymmetry, how much, what they do today
- The opportunities: which matter most and why
- The solution: what exactly to build, and for whom first
- The positioning: why each stakeholder would come to it over what they use today

The deck is done. This repo is the prototype. **Its job is to show the user flow** and make
Flexiple feel "this would be easy to plug into our site". It is a demo of product thinking,
not a production app.

## 2. Context: Flexiple and the problem

- Flexiple helps companies build teams in India. Three paths on flexiple.com/gcc:
  Contractor, Managed Team ("micro-GCC"), and the company's own GCC (entity).
- Pricing (flexiple.com/gcc): managed employment is **$299 per person per month + salary at cost**
  while they build. Entity setup and workspace are "scoped once requirements are mapped, not quoted blind".
- Flexiple's own rules (flexiple.com/gcc/india, section 05):
  - "Weeks to a working team": team starts under managed employment while the entity is set up in parallel
  - "4 to 6 months to your entity": Pvt Ltd incorporation, PAN, TAN, GST, PF, ESIC, banking, auditor
  - "Break-even at 25 people": past 25 people, entity economics beat managed employment
  - "One resident director": Indian law needs one India-resident director (182+ days/yr); Flexiple provides one during the build
- Flexiple's brand is **honest data**: "Our own numbers, measured not surveyed", a "What we could not verify"
  section, salary cells that clear a 25-record publish gate or render as withheld. The prototype must keep this tone.

**The problem (deck):** a company entering India makes a big decision (model, city, cost, provider) on
referrals and public sources that disagree with each other (e.g. GCC count: 2,117 per Zinnov vs 536 verified
by Flexiple; states with GCC policies: 8 per CBRE vs 4 verifiable per Flexiple).
**Aadi's take:** the gap isn't missing data, it's missing trust. Buyers need proof from companies like them.

## 3. Product decisions (do not change)

1. **First user:** a mid-market company setting up in India for the first time (Flexiple's own target customer).
2. **Wedge = a plan, with proof.** Opportunity 1 (setup decision tool) + opportunity 2 (peer proof) in one flow.
3. **Built only on Flexiple's own published data** (files in /data, each record with sourceUrl to a flexiple.com page).
   No outside data. This is what makes it look easy to integrate.
4. **Every number shows its source.** Small source link / tooltip next to each figure. A missing value renders
   as "Not published" or "Withheld (under Flexiple's publish gate)", never a guess. Never invent numbers.
5. **Never rank cities as "best".** Show the comparison; you may highlight "lowest salary cost for your team"
   as a fact, plus Flexiple's own caveat: "Deeper markets pay more because more companies compete for the same people."
6. **No provider reviews or ratings.** Flexiple is a provider itself, so rating rivals is a conflict of interest.
7. **Peers instead of referrals.** "Companies like you" uses Flexiple's verified directory / new-centre announcements.
8. **Incentives:** only the 4 policies Flexiple could source (Karnataka, Gujarat, Maharashtra, Tamil Nadu).
   For other states show "No policy Flexiple could verify". Apply eligibility where it's published
   (e.g. Tamil Nadu scheme is limited to Forbes Global 2000 / Fortune 1000 parents committing 200+ direct jobs,
   so for a mid-market user show "Likely not eligible" with the reason).
9. **Model logic = Flexiple's break-even rule:** headcount < 25 → "Managed team"; >= 25 → "Start managed,
   move to your own entity" with the 4 to 6 month entity timeline. Always mention the resident director.
10. **Entity setup cost is not estimated.** Say "Scoped on a strategy call" (Flexiple's own policy). This is the hand-off.
11. **Exit = "Book a Strategy Call"** (Flexiple's real CTA text) with the plan attached as a summary.
    No real submission: show a confirmation "In production, this plan goes straight to Flexiple's team."
12. **Data modes (added by Aadi):** "Flexiple-verified only" (default) uses only Flexiple's own measured data and records
    it traced to a primary source. "All sources" adds the third-party figures Flexiple cites (data/market.json), always
    labelled "Third-party · not verified by Flexiple". `npm run verify` checks all of /data against the live pages.
13. **Not in v1:** logins, saved accounts, provider reviews, city scores, unverified incentives, PDF export, backend.

**Success metric (show on /about):** North star = strategy calls booked from the planner.
Inputs = plan completion rate, clicks on "Companies like you". Guardrail = 100% of numbers on a plan have a source.

## 4. User flow (single page, stepper with 4 steps)

**Hero** (looks like a flexiple.com/gcc section): eyebrow "GCC · PLANNER", headline
"Plan India on facts, not referrals.", sub "A sourced first plan for model, city and cost, plus the companies
like you that already built here.", button "Start your plan". Small line: "Built on Flexiple's talent graph · updated Aug 2026".

**Step 1 · Your team**
- Software engineers (count), Senior engineers 6+ yrs (count), Other roles (count, free text label)
- When do you need the team? (In 3 months / 6 months / 12 months)
- Parent HQ country, Sector (Flexiple's directory sectors: Technology, BFSI, Professional & info services,
  Engineering & industrial, Healthcare & pharma, Telecom & media, Energy, Other)
- Cities to consider (multi-select of the 6 metros, default all)

**Step 2 · Your plan**
- Model card: recommendation from rule 9, the break-even line, timeline (weeks to team, 4 to 6 months to entity), resident director.
- Managed fee: $299 × headcount per month (Flexiple pricing), shown while on managed employment.
- City comparison table for selected metros (cities.json): tracked professionals, companies with 25+ people,
  SWE median, senior median, **estimated annual salary cost for THEIR team** =
  SWE count × SWE median + senior count × senior median. Other roles: "Not estimated, see role pages".
  Label: "Estimate from Flexiple medians, all levels. Not a quote."
- Incentives for the selected cities' states (rule 8).
- "What we could not verify" box, in Flexiple's own words where possible.

**Step 3 · Companies like you**
- Cards from peers.json (recent centres Flexiple lists as new and upcoming): company, city, month/year, announced headcount, source.
- Filter by city (pre-set from step 1 choices) and size band of announced headcount (under 250 / 250 to 1,000 / 1,000+).
- Note: "From Flexiple's directory of 536 verified GCCs. In production this would filter by sector, parent country and size."

**Step 4 · Book a strategy call**
- Summary of the plan (model, cities, team cost per city, incentives) + "Book a Strategy Call" button → confirmation screen.

**/about** (or a section at the bottom): the problem in 2 lines, the decisions above in short, the metric, what v1 leaves out.

## 5. Look and feel (match flexiple.com exactly)

Read from flexiple.com computed styles:
- Dark green `#082C1C` (hero / dark sections, primary text on lime)
- Lime `#CFF07C` (primary buttons, highlights)
- Mint `#CBEED3` (soft cards, tags)
- White `#FFFFFF` page, light grey `#F5F5F5` sections, text `#1A1A1A`, secondary `#4A4A4A`, muted `#686868`
- Fonts: **Fraunces** (headings, 700), **Inter** (body), **JetBrains Mono** (eyebrows/labels, uppercase, letter-spacing)
- Buttons: pills (`border-radius: 9999px`), lime bg + dark green text; secondary = dark green bg + white text
- Cards: 16px radius, soft 1px borders, generous padding
- Copy tone: plain, factual, sourced. No hype words.

It should feel like a new page on flexiple.com (e.g. flexiple.com/gcc/planner), with a simple Flexiple-style nav and footer.

## 6. Tech

- Vite + React + TypeScript + Tailwind. No backend. Static deploy on Vercel.
- All data in `/data/*.json`, loaded through ONE module `src/lib/flexipleData.ts`
  (functions: getCities, getPolicies, getPeers, getSetupRules). Comment at the top:
  "Swap these for Flexiple's internal API; the UI does not change." This is the integration story.
- Plan logic in `src/lib/plan.ts` as pure functions, with a few unit tests (vitest) for the break-even rule and cost math.
- Mobile responsive. Accessible contrast. Indian number formatting for ₹ (lakh / crore), e.g. ₹1.2 Cr, ₹45.6L.
- README: run, edit data, deploy to Vercel.

## 7. Working rules for Claude Code

- Build step by step: scaffold → data layer → step 1 → step 2 → step 3 → step 4 → polish. Run locally after each.
- Never add data that isn't in /data. If something is missing, render "Not published" and tell Aadi.
- Keep copy free of em dashes.
- Ask Aadi before adding any feature not in section 3/4.

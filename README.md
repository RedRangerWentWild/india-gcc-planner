# India GCC Planner

**Live:** https://flexiple-chi.vercel.app · Concept prototype by Aadi Kalra, not an official Flexiple page.

A prototype for a Flexiple PM assignment by Aadi Kalra. A company entering India gets a sourced first plan
(model, city, cost, incentives), sees verified companies like them that already built here, then books a
strategy call with the plan attached.

Every number comes from Flexiple's own published pages and links back to its source. Missing values render as
"Not published", never a guess.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Other scripts:

- `npm test`: plan logic unit tests, plus a guardrail that every record carries a source
- `npm run verify`: re-fetches the live flexiple.com pages and checks every value in `/data` against them (260 checks; city figures are checked on three separate pages). Exits 1 on any mismatch. Run it before each deploy.
- `npm run build`: typecheck + production build

## Data modes

- **Flexiple-verified only** (default): Flexiple's own measured numbers (talent graph, verified directory, pricing and setup rules) and the policies and announcements Flexiple traced to a primary source.
- **All sources**: adds the third-party research Flexiple cites on its pages (Zinnov and nasscom, JLL, Colliers, state governments), each labelled "Third-party · not verified by Flexiple" with its publisher link. Shown in step 2 as market context.

## First-visit walkthrough

A 5-step guided tour (`src/components/Tour.tsx`) opens on a visitor's first visit and can be replayed from "Take the tour" in the nav.
Steps point at elements tagged `data-tour="..."`. Whether it was seen is stored per browser in localStorage (`src/lib/tourSeen.ts`).

## Edit the data

All data lives in `/data` and is read through one module, `src/lib/flexipleData.ts`
(`getCities`, `getPolicies`, `getPeers`, `getSetupRules`, `getMarket`).

| File | What it holds | Source |
| --- | --- | --- |
| `data/cities.json` | Talent pool and salary medians for the 6 metros | flexiple.com/gcc/statistics and city pages |
| `data/policies.json` | The 4 state GCC policies Flexiple could verify | flexiple.com/gcc/statistics |
| `data/peers.json` | All 48 new and upcoming GCC announcements, each with Flexiple's citation link | flexiple.com/gcc/india |
| `data/setup.json` | Pricing, break-even rule, timelines, CTA | flexiple.com/gcc, flexiple.com/gcc/india |
| `data/market.json` | Third-party figures Flexiple cites (All sources mode only) | flexiple.com/gcc/statistics and city pages |

After editing, run `npm run verify`. To go to production, swap these functions in `flexipleData.ts` for Flexiple's internal API. The UI does not change.

Plan logic (break-even rule, cost math, incentive eligibility, peer filters) is pure functions in `src/lib/plan.ts`,
tested in `src/lib/plan.test.ts`.

## Deploy to Vercel

Vercel detects Vite automatically (build `npm run build`, output `dist`). Either:

```bash
npx vercel --prod
```

or push this folder to GitHub and import the repo at vercel.com/new.

## Structure

```
data/                 Flexiple's published data (JSON)
src/lib/              flexipleData.ts (data access), plan.ts (pure plan logic) + tests
src/steps/            The 4 steps: team, plan, companies like you, book a call
src/components/ui.tsx Shared Flexiple-styled pieces (buttons, cards, source marker)
src/App.tsx           Nav, hero, stepper, about section, footer
```

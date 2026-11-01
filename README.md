# India in Data

An interactive, fully static explorer of India in numbers: **NCRB** crime statistics, the **Census of India 2011**, a warming climate, live air quality, sixty years of the economy, and how India compares on women's safety.

Built with **Next.js (App Router) + TypeScript**, exported as a static site and deployed to GitHub Pages. No server, no database, no API key.

> **Not an official product of NCRB, the Office of the Registrar General, or any government body.** Figures are as published by each source. Verify against the source reports before quoting. Every section carries its own methodology page listing sources, reconciliation and limitations.

## The census section

`/census` is a ten-page statistical profile of India from the **2011 census** — the last completed one. Population, density, decadal growth, sex ratio and child sex ratio, literacy by sex, urbanisation, age structure, and the largest cities. It also carries the cross-metric analysis (`/census/insights`), a genuine **district-level map** (`/census/map`, district toggle), a **state-vs-state comparison** (`/census/compare`), a profile page for each of the 36 states and UTs (`/census/state/[id]`), and — the page that only exists because this app holds two datasets — **registered crime against literacy and urbanisation** (`/census/crime`).

Nothing in it is modelled. Where a value was never published at a geography (Telangana, Ladakh and the merged DNH & Daman and Diu for child sex ratio and literacy), the cell is `null`, the table shows "—", and the map leaves it grey. `/census/methodology` documents the boundary reconciliation and the four derived measures.

---

## The substance section

`/substance` applies the framework from the working paper *The Substance of an Economy* to India. The argument there is that output metrics answer a **flow** question while the question that decides whether a society holds together is a **stock** question — a country can raise this year's output by drawing down its own foundations: working children instead of educating them, exporting clinicians instead of retaining them, financing consumption from a depleting rent instead of from production.

So every domain of capability is asked three questions rather than one. **Level** — is the capability adequate? **Endogeneity** — is it produced here, or imported, rented or donor-supplied? **Durability** — would it survive a funding withdrawal, a price spike, or a programme being renamed? Existing indices ask only the first.

The page carries a published-figure register across six domains — foundational competence, health, work, social security, fiscal and administrative capacity, and household material substance — every value with its source and reference period attached, and nothing modelled, interpolated or back-cast.

It publishes **no composite score for India**, and that is the finding rather than an omission. The framework requires three published indicators per axis before that axis is scored and refuses to impute the rest. Applied to India: the Level axis is reasonably measured in five of six domains, the Endogeneity axis in one, and the Durability axis in none. A single number computed from that evidence would be an artefact of what happens to be published, and would hide precisely the gap the framework exists to expose.

The working paper (PDF) and the standalone framework explorer are served from `public/substance/` and linked from the page. `/substance/methodology` carries the indicator register, the aggregation algebra, what is deliberately not published, and the known defect in every source.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → ./out
npm run typecheck  # tsc --noEmit
npm run fetch-data # refresh the bundled data snapshot
```

## What's in the app

| Route | What it shows |
|---|---|
| `/` | Headline KPIs, the ten-year national trend, IPC composition, top state rates |
| `/map` | Choropleth of India — state view and a district view (2024 district tables) |
| `/trends` | Year-wise totals, IPC vs SLL, and the population-normalised crime rate |
| `/crime-heads` | How recorded offences split across offence heads (all-IPC, women, cyber) |
| `/states` | State/UT comparison by crime rate, with a filterable, sortable table |
| `/women` | Crimes against women: trend, composition and state-wise rates |
| `/cyber` | Cybercrime FIRs, composition, and the I4C portal-vs-FIR reporting gap |
| `/justice` | Police strength against sanctioned posts, and the FIR → charge-sheet → conviction pipeline |
| `/transition` | The 2024 IPC → BNS transition, head by head, with reclassification flags and contribution analysis |
| `/census` | Census 2011 overview — national KPIs, regional split, distributions |
| `/census/map` | Choropleth of 16 state measures **and** 3 district measures |
| `/census/population` · `/growth` · `/sex-ratio` · `/literacy` · `/urbanisation` | One page per measure, with bands, rankings and scatter plots |
| `/census/age` | Population pyramid, dependency ratios, females per 1,000 males by age band |
| `/census/cities` | Largest cities with 2001 → 2011 growth, and size-vs-growth scatter |
| `/census/states` | Master table — every measure, region filter, CSV export |
| `/census/state/[id]` | Profile page for each of the 36 states and UTs |
| `/census/compare` | Any two states side by side, with ranks |
| `/census/insights` | Correlations, quadrant scatters, regional aggregates |
| `/census/crime` | Crime rate against census measures — and why the relationship confounds |
| `/census/methodology` | Sources, boundary reconciliation, missing cells, limits |
| `/glossary` | Plain-language definitions of the crime heads, legal categories and statistical terms |
| `/substance` | The framework applied to India — six domains, three axes, and why no composite score is published. |
| `/substance/methodology` | Indicator register, aggregation algebra and the defect in every source. |
| `/about` | Methodology, sources and limitations |

## Features

- **Live data with a bundled fallback** — each dataset declares a live URL and a snapshot; a badge on every page says which one you are seeing.
- **Choropleth map** — state and district views, rank-based shading, click a state to list its districts. The census map adds a district-level mode for the three measures the census publishes at that geography.
- **Derived, not invented** — shares, gaps, headcounts, bands and correlations are computed from published figures at render time, so no page hard-codes a number it cannot trace to a source.
- **Paginated tables** — every long table has a sticky header, a rows-per-page selector and pager; the CSV export always contains every filtered row, not just the visible page.
- **Ask this page** — a panel on every route that answers questions about the numbers on it (highest, lowest, compare two places, rank, average, distribution, correlation). Answers are computed in the browser from the same data as the charts, so no key and no network are needed; each answer is badged "computed from this page". An optional OpenAI-compatible endpoint can be configured to answer with a model instead, and the panel says which engine produced each answer. The conversation downloads as Markdown and the underlying series as CSV.
- **CSV export** — every table (and the map) can be downloaded.
- **Shareable URLs** — the map encodes its level, metric and selection in the query string.
- **Dark mode** — follows the system by default, with an explicit toggle.
- **Accessible alternatives** — a table view of the map, native SVG titles on every region.
- **Unit tests** — `npm test` (Vitest) covers the analytics, the district-name matcher, CSV and the projection. CI runs them before deploying.

## Architecture

```
src/
├── app/                      # routes (App Router) — one folder per page
│   ├── layout.tsx            # shell: fonts, header, footer
│   ├── globals.css           # design tokens + component styles
│   ├── page.tsx              # / (overview)
│   ├── trends/  crime-heads/  states/  women/  cyber/  about/
├── components/
│   ├── charts/               # LineChart, DonutChart, HorizontalBars (hand-rolled SVG)
│   ├── layout/               # Header, Footer
│   └── ui/                   # Card, StatCard, PageHeader, DataTable, LiveBadge
├── config/
│   ├── site.ts               # identity, navigation, source attribution
│   └── palette.ts            # chart colour tokens
└── lib/
    ├── data/
    │   ├── types.ts          # domain types (the contract)
    │   ├── sources.ts        # dataset registry: live URL + fallback
    │   ├── fallback.ts       # bundled snapshot (real NCRB-derived figures)
    │   └── client.ts         # fetch → fallback → cache
    ├── hooks/useDataset.ts   # renders snapshot instantly, upgrades to live
    ├── analytics.ts          # pure derived-metric helpers (CAGR, ranks, …)
    └── format.ts             # Indian number/percent formatting
scripts/fetch-data.mjs        # refresh the bundled snapshot
```

### The data layer, in one paragraph

Every dataset is registered once in `src/lib/data/sources.ts` with a **live URL** and a **bundled fallback**. `client.ts` tries the live source, falls back to the snapshot, and caches the result; `useDataset()` renders the snapshot immediately (so there is never a blank state) and swaps in the live payload when it arrives. A badge in each page header tells the reader which one they are seeing. **To add a dataset:** drop the JSON in, add one entry to `SOURCES`, and every hook, chart and table works with it — no page changes.

## Data sources

- **NCRB** — *Crime in India* reports (primary publisher) · <https://www.ncrb.gov.in/>
- **data.gov.in** — official *Crime in India* catalogues (ZIP downloads) · <https://www.data.gov.in/catalog/crime-india-2023>
- **Indian Data Project** — NCRB-derived JSON endpoints, CORS-enabled, no key (used as the live feed) · <https://indiandataproject.org/open-data>
- **OpenCity (CKAN)** — public-domain mirror of NCRB tables, including CSV resources · <https://data.opencity.in/>
- **Esri India Living Atlas** — NCRB district tables as queryable feature services (district layer) · <https://livingatlas.esri.in/server1/rest/services/NCRB>
- **ASER Centre** — citizen-led rural learning assessment, foundational reading and numeracy · <https://asercentre.org/>
- **MoSPI** — Periodic Labour Force Survey and the Time Use Survey · <https://www.mospi.gov.in/>
- **WHO** — UHC service coverage, health financing and out-of-pocket spending · <https://www.who.int/>
- **ILO** — World Social Protection Report and social protection coverage · <https://www.ilo.org/>
- **udit-001/india-maps-data** — India district boundaries (GeoJSON), simplified and bundled under `public/data/` · <https://github.com/udit-001/india-maps-data>

NCRB does not publish a clean public API, and data.gov.in requires an API key — which is why the app reads a CORS-enabled NCRB-derived feed at runtime and ships a bundled snapshot for resilience. The district layer is fetched at build time by `scripts/fetch-data.mjs` and bundled as `public/data/districts.json`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs, refreshes the data snapshot (best-effort), runs `next build` (static export to `./out`) and publishes it to GitHub Pages.

Because the site is a GitHub **project** page, production builds run under a `basePath` (`/india-in-data`) — see `next.config.mjs`.

## Limitations (short version)

Recorded offences are **not** a measure of underlying crime. Rates reflect reporting and registration as much as offending; offence heads are legal categories that change with statutes; and different chapters use different denominators and reference years. The About page lists these in full.

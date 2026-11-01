/**
 * Substance — the framework applied to India.
 *
 * The working paper ("The Substance of an Economy") argues that output metrics
 * answer a flow question, while what decides whether a society holds together is
 * the *stock* of capability and the process that reproduces it. For every domain
 * of capability it asks three questions rather than one:
 *
 *   L — Level         is the capability adequate?
 *   E — Endogeneity   is it produced here, or imported / rented / donor-supplied?
 *   D — Durability    would it survive a funding withdrawal or a change of government?
 *
 * This module holds the domain specifications, the India indicator evidence, and
 * the aggregation algebra used to demonstrate how the method behaves.
 *
 * PROVENANCE RULE — enforced by the `populated` flag on every indicator:
 *   every published figure carries its source and vintage, and an axis with no
 *   defensible published proxy is reported as NOT MEASURED rather than imputed.
 *   That is the framework's own rule (working paper, section 5.5): imputing from
 *   regional averages produces a complete-looking matrix in which the least
 *   well-measured places have the most invented data. The consequence for India
 *   is itself the finding — see `axisPopulation()`.
 */

export type Axis = 'L' | 'E' | 'D';

export const AXIS_LABEL: Record<Axis, string> = {
  L: 'Level',
  E: 'Endogeneity',
  D: 'Durability',
};

export const AXIS_QUESTION: Record<Axis, string> = {
  L: 'Is the capability adequate?',
  E: 'Is it produced here?',
  D: 'Would it survive?',
};

export interface DomainSpec {
  id: string;
  code: string;
  label: string;
  question: string;
  /** The conventional proxy this domain replaces. */
  conventional: string;
  /** Why that proxy fails. */
  whyFails: string;
  /** What an endogeneity score would be built from. */
  endogeneityProbes: string[];
  /** What a durability score would be built from. */
  durabilityProbes: string[];
  /** The known defect in the underlying data. */
  defect: string;
}

export const DOMAINS: DomainSpec[] = [
  {
    id: 'competence',
    code: 'D1',
    label: 'Foundational competence',
    question: 'Can an ordinary adult read, count and reason well enough to act in the world?',
    conventional: 'Mean years of schooling; gross enrolment; university rankings',
    whyFails:
      'Years of schooling count time served, not capability acquired. Enrolment measures presence in a building. ' +
      'Neither detects a child who has sat through eight grades without learning to read a paragraph — which is the ' +
      'ordinary case in much of India, not the exception.',
    endogeneityProbes: [
      'Share of teachers trained in domestically financed institutions',
      'Curriculum and examination authority held domestically',
      'Reliance on foreign school boards or imported textbooks',
    ],
    durabilityProbes: [
      'Learning retained after a six-month interruption in instruction',
      'Share of proficiency that survives the withdrawal of household tuition spending',
      'Whether the country assesses itself or waits for a donor survey',
    ],
    defect:
      'International assessments are voluntary, so participating countries are not a random sample. ASER is a ' +
      'citizen-led rural survey across 28 districts — excellent for a rural trend, unusable as a national level. ' +
      'Census literacy is self-declared and eleven years old.',
  },
  {
    id: 'health',
    code: 'D2',
    label: 'Health capability',
    question: 'Does illness impoverish a household, and would care survive without the current programme?',
    conventional: 'Life expectancy; health spending as a share of GDP; hospital beds per 1,000',
    whyFails:
      'Life expectancy is a lagging stock that moves slowly and hides distribution. Spending measures input, not ' +
      'access. Beds measure capacity to admit, not capacity to cure, and say nothing about who pays.',
    endogeneityProbes: [
      'Active pharmaceutical ingredient and device import dependence',
      'Reliance on foreign-trained clinicians',
      'External share of current health expenditure',
    ],
    durabilityProbes: [
      'Whether entitlement is statutory or lapses with a named scheme',
      'Coverage retained through a fiscal consolidation year',
      'Primary-care staffing retained through a political transition',
    ],
    defect:
      'UHC coverage is a modelled index of tracer indicators, not an observation of care received. Out-of-pocket ' +
      'shares are survey-based and understate forgone care: a household that cannot afford treatment never appears ' +
      'in the spending data at all.',
  },
  {
    id: 'work',
    code: 'D3',
    label: 'Work that sustains a life',
    question: 'Does a job reproduce a household, or merely register as activity?',
    conventional: 'Unemployment rate; GDP per worker; formal job-creation counts',
    whyFails:
      'The unemployment rate excludes anyone who has stopped looking and counts an hour of informal piece work as ' +
      'employment. In an economy where most work is informal it measures almost nothing — which is why India can ' +
      'report low unemployment alongside widespread underemployment.',
    endogeneityProbes: [
      'Remittance share of household income',
      'Export market concentration; dependence on a single buyer',
      'Whether employment rests on subsidy, protection or a public payroll',
    ],
    durabilityProbes: [
      'Employment retained through a demand shock',
      'Share of jobs that exist without subsidy or a public payroll',
      'Re-employment speed after displacement',
    ],
    defect:
      'Labour force surveys change methodology. India moved from the quinquennial Employment-Unemployment Survey ' +
      'to an annual PLFS in 2017-18, and the treatment of unpaid helpers in household enterprises materially shifts ' +
      'the female participation rate. Part of the recent rise is real, part is measurement, and the split is contested.',
  },
  {
    id: 'security',
    code: 'D4',
    label: 'Security against shocks',
    question: 'If income stops tomorrow, does the household survive it?',
    conventional: 'Law and order; homicide rate; rule-of-law perception indices',
    whyFails:
      'Order is the precondition of security, not its content. A state can be orderly and still leave every ' +
      'household one illness away from destitution. Perception indices of governance also track the opinions of a ' +
      'narrow expert panel rather than the experience of a household.',
    endogeneityProbes: [
      'Share of protection financed domestically and delivered by statute',
      'Reliance on donor or NGO delivery of core transfers',
      'Whether benefits are contributory entitlements or discretionary transfers',
    ],
    durabilityProbes: [
      'Coverage retained after an election',
      'Benefit real value retained through an inflation episode',
      'Portability across employers, sectors and states',
    ],
    defect:
      'Effective coverage counts receipt of at least one benefit, so a country paying a small child grant to many ' +
      'households scores well while leaving unemployment and disability unprotected. Adequacy is not measured.',
  },
  {
    id: 'capacity',
    code: 'D5',
    label: 'Fiscal and administrative capacity',
    question: 'Can the state tax, count, adjudicate and enforce?',
    conventional: 'Ease of doing business; government effectiveness perception score',
    whyFails:
      'Business-friendliness measures the cost of compliance for firms, a different object from the capacity of the ' +
      'state to raise revenue, produce statistics and enforce contracts for everyone else.',
    endogeneityProbes: [
      'Revenue dependence on resource rents, aid or a single tax handle',
      'Dependence on external technical assistance to run core surveys',
      'Whether the fiscal base is domestic activity or an offshore booking centre',
    ],
    durabilityProbes: [
      'Revenue retained through a commodity price fall',
      'Institutional authority vested in offices rather than individuals',
      'Continuity of statistical releases across administrations',
    ],
    defect:
      'Statistical capacity is measured by the World Bank SPI across 51 indicators covering only 14 of 22 framework ' +
      'dimensions; eight dimensions have no established measure at all. The capacity to measure capacity is itself ' +
      'unmeasured.',
  },
  {
    id: 'household',
    code: 'D6',
    label: 'Household material substance',
    question: 'Does the output reach the household, and what does it buy?',
    conventional: 'GDP per capita, at purchasing power parity',
    whyFails:
      'Output produced on a territory is not income received by its residents. Repatriated profit, depreciation and ' +
      'profit-shifting all sit between the two. A per-capita average also says nothing about the median household.',
    endogeneityProbes: [
      'Remittance share of household consumption',
      'Import dependence of the staple consumption basket',
      'Whether household income derives from domestic production or transferred rent',
    ],
    durabilityProbes: [
      'Consumption retained through a currency or terms-of-trade shock',
      'Asset holdings that can be drawn down',
      'Real income retained through a food and fuel price spike',
    ],
    defect:
      'Household consumption surveys are infrequent and expensive, and their aggregates are not reconciled to the ' +
      'national accounts. Survey-to-accounts gaps of large size are common and rarely explained.',
  },
];

export interface SubstanceIndicator {
  id: string;
  domain: string;
  axis: Axis;
  label: string;
  /** Display string — already formatted with its unit. */
  value: string;
  /** Numeric value where a chart or a comparison needs one. */
  raw: number | null;
  unit: string;
  /** Reference period of the figure. */
  year: string;
  source: string;
  /** Direction that is better, for reading the value at a glance. */
  better?: 'higher' | 'lower' | null;
  note?: string;
  /** false only for placeholder rows; real rows are always true. */
  populated: boolean;
}

/**
 * Published figures for India. Nothing here is modelled, interpolated or
 * back-cast. Where a figure is a regional aggregate rather than an India value,
 * the label says so.
 */
const PUBLISHED_INDICATORS: Omit<SubstanceIndicator, 'populated'>[] = [
  // ---------------- D1 · foundational competence ----------------
  {
    id: 'd1-read',
    domain: 'competence',
    axis: 'L',
    label: 'Youth aged 14–18 who can read a Std II-level text',
    value: '73.6%',
    raw: 73.6,
    unit: '%',
    year: '2023',
    source: 'ASER 2023 (rural, 28 districts)',
    better: 'higher',
    note: 'Inverse reading: about a quarter cannot. Six years earlier the figure was 76.6%, so it has fallen.',
  },
  {
    id: 'd1-div',
    domain: 'competence',
    axis: 'L',
    label: 'Youth aged 14–18 who can do a 3-digit by 1-digit division',
    value: '43.3%',
    raw: 43.3,
    unit: '%',
    year: '2023',
    source: 'ASER 2023 (rural, 28 districts)',
    better: 'higher',
    note: 'A Class III–IV competence, tested on people who have spent eight to ten years in school.',
  },
  {
    id: 'd1-unitary',
    domain: 'competence',
    axis: 'L',
    label: 'Youth who can apply arithmetic to an everyday task (unitary method)',
    value: '48.4%',
    raw: 48.4,
    unit: '%',
    year: '2023',
    source: 'ASER 2023',
    better: 'higher',
    note: 'Effectively unchanged from 50.2% in 2017 — the applied skill is not improving with the academic one.',
  },
  {
    id: 'd1-ors',
    domain: 'competence',
    axis: 'L',
    label: 'Youth who can read and interpret instructions on an ORS packet',
    value: '65.1%',
    raw: 65.1,
    unit: '%',
    year: '2023',
    source: 'ASER 2023',
    better: 'higher',
    note: 'Three of four questions correct. Functional literacy for a basic health decision.',
  },
  {
    id: 'd1-lit',
    domain: 'competence',
    axis: 'L',
    label: 'Adult literacy rate, population aged 7 and above',
    value: '74.04%',
    raw: 74.04,
    unit: '%',
    year: '2011',
    source: 'Census of India 2011',
    better: 'higher',
    note: 'Self-declared, and the last completed census. Female literacy was 65.46%, male 82.14%.',
  },
  {
    id: 'd1-lp',
    domain: 'competence',
    axis: 'L',
    label: 'Learning poverty, South Asia — regional aggregate, not an India value',
    value: '78%',
    raw: 78,
    unit: '%',
    year: '2022',
    source: 'World Bank / UNESCO / UNICEF, State of Global Learning Poverty',
    better: 'lower',
    note: 'Share of 10-year-olds unable to read and understand a simple text, post-pandemic; 60% before. India does not publish a national figure on this definition.',
  },

  // ---------------- D2 · health capability ----------------
  {
    id: 'd2-uhc',
    domain: 'health',
    axis: 'L',
    label: 'UHC service coverage index',
    value: '63 / 100',
    raw: 63,
    unit: 'index',
    year: '2021',
    source: 'WHO, SDG country profile — India',
    better: 'higher',
    note: 'Modelled geometric mean of tracer services. The South-East Asia region average was 49.',
  },
  {
    id: 'd2-oop',
    domain: 'health',
    axis: 'L',
    label: 'Household out-of-pocket spending as share of total health expenditure',
    value: '44.1%',
    raw: 44.1,
    unit: '%',
    year: '2021-22',
    source: 'WHO, Health financing — India',
    better: 'lower',
    note: 'Out-of-pocket spending is regressive: it converts illness directly into financial hardship.',
  },
  {
    id: 'd2-cat',
    domain: 'health',
    axis: 'L',
    label: 'Population spending more than 10% of household budget on health',
    value: '17.5%',
    raw: 17.5,
    unit: '%',
    year: '2021',
    source: 'WHO, SDG country profile — India',
    better: 'lower',
    note: 'The catastrophic-expenditure threshold used for SDG indicator 3.8.2.',
  },
  {
    id: 'd2-impov',
    domain: 'health',
    axis: 'L',
    label: 'People pushed into poverty by out-of-pocket health spending',
    value: '5.5% (≈ 7.8 crore)',
    raw: 5.5,
    unit: '%',
    year: '2021',
    source: 'WHO, SDG country profile — India',
    better: 'lower',
    note: 'Measured at the US$2.15 a day poverty line.',
  },
  {
    id: 'd2-the',
    domain: 'health',
    axis: 'L',
    label: 'Current health expenditure',
    value: '3.83% of GDP',
    raw: 3.83,
    unit: '% of GDP',
    year: '2021-22',
    source: 'WHO, Health financing — India',
    better: null,
    note: 'Against a stated government target of 2.5% of GDP for public spending alone.',
  },
  {
    id: 'd2-ghe',
    domain: 'health',
    axis: 'L',
    label: 'Government health expenditure',
    value: '1.8% of GDP',
    raw: 1.8,
    unit: '% of GDP',
    year: '2021-22',
    source: 'WHO, Health financing — India',
    better: 'higher',
    note: 'States carry 58.2% of government health spending, the Centre 41.8%.',
  },
  {
    id: 'd2-ext',
    domain: 'health',
    axis: 'E',
    label: 'External financing as share of current health expenditure',
    value: '1.1%',
    raw: 1.1,
    unit: '%',
    year: '2021-22',
    source: 'WHO, Health financing — India',
    better: 'lower',
    note: 'Low — health is overwhelmingly domestically financed. This says nothing about import dependence in medicines and devices, which is the larger endogeneity question and is not measured here.',
  },

  // ---------------- D3 · work ----------------
  {
    id: 'd3-lfpr',
    domain: 'work',
    axis: 'L',
    label: 'Labour force participation rate, age 15 and above',
    value: '60.1%',
    raw: 60.1,
    unit: '%',
    year: '2023-24',
    source: 'PLFS annual report, MoSPI',
    better: 'higher',
    note: 'Male 78.8%, female 41.7%.',
  },
  {
    id: 'd3-lfpr-f',
    domain: 'work',
    axis: 'L',
    label: 'Female labour force participation, age 15 and above',
    value: '41.7%',
    raw: 41.7,
    unit: '%',
    year: '2023-24',
    source: 'PLFS annual report, MoSPI',
    better: 'higher',
    note: 'Up from 23.3% in 2017-18. Part of the rise is real activity, part is better capture of unpaid household helpers — the decomposition is contested.',
  },
  {
    id: 'd3-lfpr-fu',
    domain: 'work',
    axis: 'L',
    label: 'Urban female labour force participation',
    value: '28.0%',
    raw: 28.0,
    unit: '%',
    year: '2023-24',
    source: 'PLFS annual report, MoSPI',
    better: 'higher',
    note: 'Against 47.6% in rural areas — the gap widens where childcare has no substitute.',
  },
  {
    id: 'd3-unpaid-f',
    domain: 'work',
    axis: 'L',
    label: 'Time spent on unpaid work, women',
    value: '305 min/day',
    raw: 305,
    unit: 'minutes',
    year: '2019',
    source: 'Time Use Survey 2019, MoSPI',
    better: 'lower',
    note: 'Of which 281 minutes are non-SNA production — activity the national accounts do not see at all.',
  },
  {
    id: 'd3-unpaid-m',
    domain: 'work',
    axis: 'L',
    label: 'Time spent on unpaid work, men',
    value: '67 min/day',
    raw: 67,
    unit: 'minutes',
    year: '2019',
    source: 'Time Use Survey 2019, MoSPI',
    better: null,
    note: 'Women spend roughly four and a half times as long on unpaid work as men.',
  },
  {
    id: 'd3-nonsna-m',
    domain: 'work',
    axis: 'L',
    label: 'Time on non-SNA production, men',
    value: '38 min/day',
    raw: 38,
    unit: 'minutes',
    year: '2019',
    source: 'Time Use Survey 2019, MoSPI',
    better: null,
    note: 'Against 281 minutes for women. This ratio, not the participation rate, is the binding constraint on female employment.',
  },

  // ---------------- D4 · security ----------------
  {
    id: 'd4-sp',
    domain: 'security',
    axis: 'L',
    label: 'Population covered by at least one social protection benefit',
    value: '48.4%',
    raw: 48.4,
    unit: '%',
    year: '2023',
    source: 'ILO, World Social Protection Report 2024-26',
    better: 'higher',
    note: 'Against a global average of 52.4%. Counts receipt of at least one benefit, so it says nothing about adequacy.',
  },

  // ---------------- D5 · fiscal and administrative capacity ----------------
  {
    id: 'd5-tax',
    domain: 'capacity',
    axis: 'L',
    label: 'Combined Centre and State tax revenue',
    value: '18.5% of GDP',
    raw: 18.5,
    unit: '% of GDP',
    year: '2023-24',
    source: 'Union and State budget documents, combined ratio',
    better: 'higher',
    note: 'Union gross tax revenue 11.7% of GDP, States’ own tax revenue 6.8%.',
  },
  {
    id: 'd5-direct',
    domain: 'capacity',
    axis: 'L',
    label: 'Direct taxes as share of total tax revenue',
    value: '56.7%',
    raw: 56.7,
    unit: '%',
    year: '2023-24',
    source: 'CBDT / CBIC, provisional',
    better: 'higher',
    note: 'Direct tax to GDP was 6.64%. A state that cannot tax capital and top incomes directly has limited capacity to redistribute.',
  },
  {
    id: 'd5-sotr',
    domain: 'capacity',
    axis: 'L',
    label: 'States’ own tax revenue',
    value: '6.9% of GDP',
    raw: 6.9,
    unit: '% of GDP',
    year: '2022-23',
    source: 'Reserve Bank of India, State Finances',
    better: 'higher',
    note: 'Indian States collect about 37% of general-government taxes while spending about 64% of expenditure — a wide vertical fiscal gap.',
  },
  {
    id: 'd5-itat',
    domain: 'capacity',
    axis: 'L',
    label: 'Tax disputes pending before the Income Tax Appellate Tribunal',
    value: '₹6.85 lakh crore',
    raw: 6.85,
    unit: '₹ lakh crore',
    year: '2025',
    source: 'Chief Justice of India, addressing the ITAT (Oct 2025)',
    better: 'lower',
    note: 'More than 2% of GDP held in unresolved tax litigation. Adjudicative capacity is part of fiscal capacity.',
  },

  // ---------------- D6 · household material substance ----------------
  // Populated live from the World Bank — see LIVE_HOUSEHOLD below.
];

/** Everything in the register above is a published figure, so `populated` is true throughout. */
export const INDIA_INDICATORS: SubstanceIndicator[] = PUBLISHED_INDICATORS.map((i) => ({ ...i, populated: true }));

/** Household-material indicators fetched live, so the page never hard-codes a figure it cannot trace. */
export const LIVE_HOUSEHOLD: { id: string; wbId: string; label: string; unit: string; better: 'higher' | 'lower' | null }[] = [
  {
    id: 'd6-cons-pc',
    wbId: 'NE.CON.PRVT.PC.KD',
    label: 'Household final consumption per capita, constant prices',
    unit: 'constant 2015 US$',
    better: 'higher',
  },
  {
    id: 'd6-cons-share',
    wbId: 'NE.CON.PRVT.ZS',
    label: 'Household final consumption as share of GDP',
    unit: '% of GDP',
    better: null,
  },
  {
    id: 'd6-gini',
    wbId: 'SI.POV.GINI',
    label: 'Gini index',
    unit: 'index',
    better: 'lower',
  },
];

/** Domain × axis population status — the honest answer to "how much of this is measured?". */
export interface AxisStatus {
  domain: string;
  label: string;
  code: string;
  L: number;
  E: number;
  D: number;
  /** A domain needs at least three populated indicators on an axis to be scored on it. */
  scoredOn: Axis[];
}

export const MIN_INDICATORS_PER_AXIS = 3;

export function axisPopulation(extra: SubstanceIndicator[] = []): AxisStatus[] {
  const all = [...INDIA_INDICATORS, ...extra];
  return DOMAINS.map((d) => {
    const count = (axis: Axis) => all.filter((i) => i.domain === d.id && i.axis === axis && i.populated).length;
    const L = count('L');
    const E = count('E');
    const D = count('D');
    const scoredOn: Axis[] = [];
    if (L >= MIN_INDICATORS_PER_AXIS) scoredOn.push('L');
    if (E >= MIN_INDICATORS_PER_AXIS) scoredOn.push('E');
    if (D >= MIN_INDICATORS_PER_AXIS) scoredOn.push('D');
    return { domain: d.id, label: d.label, code: d.code, L, E, D, scoredOn };
  });
}

export function domainById(id: string): DomainSpec | undefined {
  return DOMAINS.find((d) => d.id === id);
}

export function indicatorsFor(domain: string, axis?: Axis): SubstanceIndicator[] {
  return INDIA_INDICATORS.filter((i) => i.domain === domain && (!axis || i.axis === axis));
}

// ---------------------------------------------------------------------------
// Aggregation algebra
//
// Domain substance is a weighted geometric mean of the three axes, because the
// axes are not substitutes: a domain fully present but entirely imported is not
// two-thirds of a capability, it is a contingent one. Level carries half the
// weight because it is the only axis measured directly rather than by proxy.
// ---------------------------------------------------------------------------

export function domainSubstance(L: number, E: number, D: number): number {
  return Math.pow(L, 0.5) * Math.pow(E, 0.25) * Math.pow(D, 0.25);
}

export function geometricMean(values: number[]): number {
  if (!values.length) return 0;
  if (values.some((v) => v <= 0)) return 0;
  return Math.pow(
    values.reduce((a, b) => a * b, 1),
    1 / values.length,
  );
}

export type AggregationMode = 'linear' | 'geometric' | 'penalised';

export interface Archetype {
  name: string;
  gdpPcIndex: number;
  note: string;
  /** One [level, endogeneity, durability] triple per domain, in DOMAINS order. */
  scores: [number, number, number][];
}

/**
 * Synthetic archetypal profiles — NOT countries.
 *
 * They exist so the reader can see how much the ordering moves when the
 * aggregation rule changes. The decisive case is "Lopsided", which pairs strong
 * delivery in five domains with a failed education system: it ranks third under
 * linear aggregation and fifth under the penalised rule, crossing below a profile
 * that is merely adequate everywhere. That crossing is the argument for
 * non-compensatory aggregation, and it is invisible in any single published rank.
 */
export const ARCHETYPES: Archetype[] = [
  {
    name: 'Mature welfare state',
    gdpPcIndex: 100,
    note: 'Broad capability, domestically financed, institutionally durable.',
    scores: [[0.88, 0.86, 0.9], [0.86, 0.82, 0.88], [0.8, 0.84, 0.82], [0.86, 0.88, 0.9], [0.84, 0.86, 0.86], [0.82, 0.86, 0.84]],
  },
  {
    name: 'Rent-financed high income',
    gdpPcIndex: 130,
    note: 'Purchased capability: imported clinicians, imported goods, rent-dependent budget.',
    scores: [[0.62, 0.28, 0.34], [0.72, 0.26, 0.32], [0.48, 0.3, 0.3], [0.66, 0.34, 0.28], [0.44, 0.4, 0.36], [0.74, 0.24, 0.3]],
  },
  {
    name: 'Fast-growth assembler',
    gdpPcIndex: 72,
    note: 'Work and output expand; protection and fiscal capacity lag behind.',
    scores: [[0.54, 0.58, 0.56], [0.52, 0.54, 0.5], [0.66, 0.48, 0.44], [0.34, 0.52, 0.4], [0.46, 0.6, 0.52], [0.58, 0.52, 0.46]],
  },
  {
    name: 'Frontier agrarian',
    gdpPcIndex: 14,
    note: 'Low capability everywhere, but locally produced and socially reproduced.',
    scores: [[0.24, 0.74, 0.62], [0.26, 0.6, 0.48], [0.34, 0.7, 0.58], [0.18, 0.66, 0.52], [0.22, 0.72, 0.6], [0.2, 0.68, 0.54]],
  },
  {
    name: 'Staged delivery state',
    gdpPcIndex: 40,
    note: 'Campaign-mode delivery: high reported reach, thin institutional base.',
    scores: [[0.58, 0.46, 0.24], [0.62, 0.4, 0.2], [0.42, 0.48, 0.3], [0.5, 0.42, 0.22], [0.38, 0.44, 0.26], [0.46, 0.5, 0.28]],
  },
  {
    name: 'Fragile state',
    gdpPcIndex: 10,
    note: 'Neither capability nor the institutions that would reproduce it.',
    scores: [[0.16, 0.3, 0.22], [0.18, 0.28, 0.2], [0.22, 0.32, 0.24], [0.1, 0.26, 0.18], [0.12, 0.24, 0.16], [0.14, 0.3, 0.2]],
  },
  {
    name: 'Remittance economy',
    gdpPcIndex: 34,
    note: 'Household consumption financed from abroad rather than from domestic production.',
    scores: [[0.46, 0.4, 0.48], [0.44, 0.38, 0.42], [0.3, 0.34, 0.36], [0.36, 0.32, 0.34], [0.32, 0.36, 0.4], [0.52, 0.28, 0.38]],
  },
  {
    name: 'Commodity exporter, strong institutions',
    gdpPcIndex: 88,
    note: 'The counter-case: rents converted into durable domestic capability.',
    scores: [[0.74, 0.78, 0.8], [0.72, 0.74, 0.76], [0.64, 0.62, 0.66], [0.7, 0.76, 0.74], [0.68, 0.72, 0.7], [0.7, 0.7, 0.68]],
  },
  {
    name: 'Booking-centre financial economy',
    gdpPcIndex: 145,
    note: 'Measured output inflated by activity that does not employ or house anyone.',
    scores: [[0.78, 0.62, 0.7], [0.76, 0.58, 0.66], [0.58, 0.44, 0.52], [0.7, 0.6, 0.64], [0.62, 0.54, 0.58], [0.8, 0.22, 0.48]],
  },
  {
    name: 'Learning-poor middle income',
    gdpPcIndex: 46,
    note: 'Health and connectivity advance while foundational competence stalls.',
    scores: [[0.26, 0.56, 0.42], [0.58, 0.5, 0.52], [0.44, 0.46, 0.4], [0.4, 0.48, 0.44], [0.42, 0.54, 0.48], [0.5, 0.48, 0.44]],
  },
  {
    name: 'Lopsided: services without schooling',
    gdpPcIndex: 64,
    note: 'Strong delivery in five domains, a failed education system in the sixth.',
    scores: [[0.1, 0.66, 0.68], [0.8, 0.64, 0.72], [0.78, 0.6, 0.7], [0.76, 0.62, 0.7], [0.74, 0.66, 0.72], [0.82, 0.58, 0.68]],
  },
  {
    name: 'Even but modest',
    gdpPcIndex: 38,
    note: 'Adequate everywhere, outstanding nowhere, failing nowhere.',
    scores: [[0.5, 0.6, 0.58], [0.5, 0.6, 0.58], [0.5, 0.6, 0.58], [0.5, 0.6, 0.58], [0.5, 0.6, 0.58], [0.5, 0.6, 0.58]],
  },
];

export function scoreArchetype(a: Archetype, gamma: number, mode: AggregationMode): number {
  const ds = a.scores.map(([L, E, D]) => domainSubstance(L, E, D));
  if (mode === 'linear') return ds.reduce((x, y) => x + y, 0) / ds.length;
  const g = geometricMean(ds);
  if (mode === 'geometric') return g;
  const weakest = Math.min(...ds);
  return g * (1 - gamma + gamma * weakest);
}

export function bindingConstraint(a: Archetype): string {
  const ds = a.scores.map(([L, E, D]) => domainSubstance(L, E, D));
  const idx = ds.indexOf(Math.min(...ds));
  return DOMAINS[idx]?.label ?? '—';
}

export interface ArchetypeRow {
  name: string;
  note: string;
  gdpPcIndex: number;
  linear: number;
  geometric: number;
  penalised: number;
  binding: string;
}

export function archetypeRows(gamma: number): ArchetypeRow[] {
  return ARCHETYPES.map((a) => ({
    name: a.name,
    note: a.note,
    gdpPcIndex: a.gdpPcIndex,
    linear: scoreArchetype(a, gamma, 'linear'),
    geometric: scoreArchetype(a, gamma, 'geometric'),
    penalised: scoreArchetype(a, gamma, 'penalised'),
    binding: bindingConstraint(a),
  }));
}

/** Rank of each archetype under a given rule, 1 = highest substance. */
export function ranksUnder(rows: ArchetypeRow[], key: 'linear' | 'geometric' | 'penalised'): Map<string, number> {
  const sorted = [...rows].sort((a, b) => b[key] - a[key]);
  return new Map(sorted.map((r, i) => [r.name, i + 1]));
}

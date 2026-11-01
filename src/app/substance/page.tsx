'use client';

/**
 * /substance — the framework applied to India.
 *
 * This page does not publish a composite score, and that is the deliberate
 * design decision, not an omission. The working paper's rule is that missing
 * indicators are not imputed and an axis with fewer than three published
 * indicators is reported as unmeasured. Applied to India the result is
 * informative in itself: capability *levels* are reasonably well measured, and
 * the provenance and durability axes — the two the framework actually adds —
 * are almost entirely unmeasured.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardGrid } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { usePublishPageData } from '@/components/insights/PageDataContext';
import type { PageContext } from '@/lib/insights/engine';
import { fetchIndiaIndicator } from '@/lib/data/worldbank';
import { ChoroplethMap } from '@/components/charts/ChoroplethMap';
import { HorizontalBars } from '@/components/charts/HorizontalBars';
import { useGeo } from '@/lib/hooks/useGeo';
import { ranked as mospiRanked, genderGap, MOSPI_META, summary as mospiSummary } from '@/lib/data/mospi';
import {
  AXIS_LABEL,
  AXIS_QUESTION,
  DOMAINS,
  INDIA_INDICATORS,
  LIVE_HOUSEHOLD,
  MIN_INDICATORS_PER_AXIS,
  archetypeRows,
  axisPopulation,
  ranksUnder,
  type Axis,
  type SubstanceIndicator,
} from '@/lib/data/substance';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const AXES: Axis[] = ['L', 'E', 'D'];

const fmtLive = (id: string, v: number): string => {
  if (id === 'd6-cons-pc') return `$${Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v)}`;
  if (id === 'd6-cons-share') return `${v.toFixed(1)}%`;
  return v.toFixed(1);
};

export default function SubstancePage() {
  const [household, setHousehold] = useState<SubstanceIndicator[]>([]);
  const [householdFailed, setHouseholdFailed] = useState(false);

  // Household-material indicators are fetched live from the World Bank, so this
  // page never hard-codes a figure it cannot trace to a source.
  useEffect(() => {
    let alive = true;
    Promise.all(LIVE_HOUSEHOLD.map((h) => fetchIndiaIndicator(h.wbId).then((pts) => ({ h, pts }))))
      .then((results) => {
        if (!alive) return;
        const rows: SubstanceIndicator[] = results.flatMap(({ h, pts }) => {
          const last = pts[pts.length - 1];
          if (!last) return [];
          return [
            {
              id: h.id,
              domain: 'household',
              axis: 'L' as Axis,
              label: h.label,
              value: fmtLive(h.id, last.value),
              raw: last.value,
              unit: h.unit,
              year: String(last.year),
              source: 'World Bank Open Data',
              better: h.better,
              note: 'Fetched live at page load.',
              populated: true,
            },
          ];
        });
        setHousehold(rows);
        setHouseholdFailed(rows.length === 0);
      })
      .catch(() => alive && setHouseholdFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const allIndicators = useMemo(() => [...INDIA_INDICATORS, ...household], [household]);
  const population = useMemo(() => axisPopulation(household), [household]);

  // ---- state view: the one domain where MoSPI publishes State-level data ----
  const { geo } = useGeo();
  const [domainFilter, setDomainFilter] = useState<string>('all');

  const femaleLfpr = useMemo(() => mospiRanked('lfpr', 'total', 'female'), []);
  const lfprStats = useMemo(() => mospiSummary(femaleLfpr), [femaleLfpr]);
  const lfprGaps = useMemo(() => genderGap('lfpr', 'total'), []);

  const mapValues = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of femaleLfpr) m.set(r.name.trim().toLowerCase(), r.value);
    return m;
  }, [femaleLfpr]);

  const ALIASES: Record<string, string> = useMemo(
    () => ({
      'jammu & kashmir': 'jammu and kashmir',
      'andaman & n. island': 'andaman and nicobar islands',
      'dadra and nagar haveli': 'dadra and nagar haveli and daman and diu',
      'daman and diu': 'dadra and nagar haveli and daman and diu',
      'nct of delhi': 'delhi',
      orissa: 'odisha',
      uttaranchal: 'uttarakhand',
      pondicherry: 'puducherry',
    }),
    [],
  );

  const valueOfState = useMemo(
    () => (f: { state: string }) => {
      const k = f.state.trim().toLowerCase().replace(/\s+/g, ' ');
      return mapValues.get(k) ?? mapValues.get(ALIASES[k] ?? '\u0000');
    },
    [mapValues, ALIASES],
  );

  // ---- computed insights over the register ---------------------------------
  const insights = useMemo(() => {
    const total = allIndicators.length;
    const level = allIndicators.filter((i) => i.axis === 'L').length;
    const measuredDomains = population.filter((p) => p.L >= MIN_INDICATORS_PER_AXIS).length;
    const aser = allIndicators.filter((i) => i.source.startsWith('ASER'));
    const weakest = population.slice().sort((a, b) => a.L - b.L)[0];
    return { total, level, measuredDomains, aser: aser.length, weakest };
  }, [allIndicators, population]);

  const visibleDomains = useMemo(
    () => (domainFilter === 'all' ? DOMAINS : DOMAINS.filter((d) => d.id === domainFilter)),
    [domainFilter],
  );

  // ---- the aggregation demonstration -------------------------------------
  const [gamma, setGamma] = useState(0.5);

  const demoRows = useMemo(() => {
    const rows = archetypeRows(gamma);
    const rL = ranksUnder(rows, 'linear');
    const rG = ranksUnder(rows, 'geometric');
    const rP = ranksUnder(rows, 'penalised');
    return rows.map((r) => ({
      name: r.name,
      note: r.note,
      gdp: r.gdpPcIndex,
      rankLinear: rL.get(r.name) ?? 0,
      rankGeometric: rG.get(r.name) ?? 0,
      rankPenalised: rP.get(r.name) ?? 0,
      scorePenalised: r.penalised,
      binding: r.binding,
    }));
  }, [gamma]);

  // ---- publish to the "ask this page" panel ------------------------------
  const pageData = useMemo<PageContext | null>(() => {
    if (!population.length) return null;
    const lTotal = population.reduce((a, p) => a + p.L, 0);
    const eTotal = population.reduce((a, p) => a + p.E, 0);
    const dTotal = population.reduce((a, p) => a + p.D, 0);
    return {
      route: '/substance',
      title: 'India — substance of the economy',
      blurb:
        `The substance framework applied to India: ${population.length} domains, ${lTotal} published Level indicators, ` +
        `${eTotal} Endogeneity indicators and ${dTotal} Durability indicators. No composite score is published, ` +
        'because the endogeneity and durability axes are largely unmeasured.',
      series: [
        {
          id: 'populated',
          label: 'Published Level indicators, by domain',
          short: 'Level indicators',
          unit: 'indicators',
          format: (v: number) => String(v),
          higherIsBetter: null,
          note:
            'Counts of published Level indicators per domain. Endogeneity and Durability are counted separately and ' +
            'are mostly zero — that gap is the page\'s main finding.',
          points: population.map((p) => ({ name: p.label, value: p.L })),
        },
      ],
      caveats: [
        'No composite score is published for India. The framework requires at least three published indicators per axis before that axis is scored, and the Endogeneity and Durability axes fall well short.',
        'ASER covers rural districts only (28 districts across 26 states) — it is a rural trend, not a national level.',
        'Census literacy is self-declared and dates from 2011, the last completed census.',
        'PLFS changed methodology in 2017-18; part of the measured rise in female participation is real and part is better capture of unpaid helpers.',
        'Household indicators come from the World Bank and lag one to two years.',
      ],
      source: 'ASER, PLFS, MoSPI Time Use Survey, WHO, ILO, CBDT/CBIC, RBI, Census 2011, World Bank',
      prompts: [
        'Which domain has the most measured indicators?',
        'Which domain is least measured?',
        'Why is no composite score published?',
        'Summarise this page',
      ],
    };
  }, [population]);

  usePublishPageData(pageData);

  const indicatorColumns: Column<SubstanceIndicator>[] = [
    {
      key: 'label',
      header: 'Indicator',
      width: '38%',
      render: (r) => (
        <span>
          {r.label}
          {r.note ? <span className="muted" style={{ display: 'block', fontSize: '0.85em' }}>{r.note}</span> : null}
        </span>
      ),
      sortValue: (r) => r.label,
    },
    { key: 'value', header: 'Value', align: 'right', render: (r) => <strong>{r.value}</strong>, sortValue: (r) => r.raw ?? 0 },
    { key: 'axis', header: 'Axis', render: (r) => AXIS_LABEL[r.axis], sortValue: (r) => r.axis },
    { key: 'year', header: 'Reference', render: (r) => r.year, sortValue: (r) => r.year },
    { key: 'source', header: 'Source', render: (r) => <span className="muted">{r.source}</span>, sortValue: (r) => r.source },
  ];

  const demoColumns: Column<(typeof demoRows)[number]>[] = [
    {
      key: 'name',
      header: 'Archetypal profile',
      width: '32%',
      render: (r) => (
        <span>
          {r.name}
          <span className="muted" style={{ display: 'block', fontSize: '0.85em' }}>{r.note}</span>
        </span>
      ),
      sortValue: (r) => r.name,
    },
    { key: 'gdp', header: 'GDP p.c. index', align: 'right', render: (r) => r.gdp, sortValue: (r) => r.gdp },
    { key: 'rankLinear', header: 'Rank · linear', align: 'right', render: (r) => r.rankLinear, sortValue: (r) => r.rankLinear },
    { key: 'rankGeometric', header: 'Rank · geometric', align: 'right', render: (r) => r.rankGeometric, sortValue: (r) => r.rankGeometric },
    {
      key: 'rankPenalised',
      header: 'Rank · penalised',
      align: 'right',
      render: (r) => <strong>{r.rankPenalised}</strong>,
      sortValue: (r) => r.rankPenalised,
    },
    { key: 'binding', header: 'Binding constraint', render: (r) => <span className="muted">{r.binding}</span>, sortValue: (r) => r.binding },
  ];

  const lopsided = demoRows.find((r) => r.name.startsWith('Lopsided'));
  const even = demoRows.find((r) => r.name === 'Even but modest');

  return (
    <>
      <PageHeader
        title="What India's economy can reproduce"
        description="Output is a flow. What decides whether a society holds together is the stock of capability behind it — and whether that capability is produced here, or merely purchased, subsidised or staged. This is the substance framework applied to India, populated only as far as published data allows."
        source="ASER, PLFS, MoSPI, WHO, ILO, RBI, CBDT, Census 2011, World Bank"
      />

      <div className="stack">
        {/* ------------------------------------------------ the problem */}
        <Card
          title="Four numbers that a growth rate does not show"
          caption="Each is a published figure for India. None of them appears in a GDP series."
        >
          <div className="card-grid" style={{ ['--min' as string]: '220px' }}>
            <StatCard
              label="Rural youth 14–18 who cannot do a Class III division"
              value="56.7%"
              note="ASER 2023. A 3-digit by 1-digit problem, on people with eight to ten years of schooling."
              tone="warn"
            />
            <StatCard
              label="Health spending paid out of pocket"
              value="44.1%"
              note="2021-22. 5.5% of the population — about 7.8 crore people — is pushed into poverty by medical bills."
              tone="warn"
            />
            <StatCard
              label="Unpaid work, women against men"
              value="4.5×"
              note="Time Use Survey 2019: 305 minutes a day against 67. None of it enters the national accounts."
              tone="accent2"
            />
            <StatCard
              label="Covered by at least one social protection benefit"
              value="48.4%"
              note="ILO 2023, against a global average of 52.4%. Receipt of one benefit is not adequacy."
              tone="accent"
            />
          </div>
        </Card>

        {/* ------------------------------------------------ the test */}
        <Card
          title="Three questions, not one"
          caption="Existing indices ask the first. The framework's claim is that the second and third decide what happens next."
        >
          <CardGrid min={260}>
            {AXES.map((a) => (
              <div key={a} className="card" style={{ boxShadow: 'none' }}>
                <h3>
                  {a} — {AXIS_LABEL[a]}
                </h3>
                <p className="card-cap">{AXIS_QUESTION[a]}</p>
                <p className="muted" style={{ fontSize: '0.92em' }}>
                  {a === 'L'
                    ? 'Measured by direct assessment wherever one exists: learning poverty rather than years of schooling, effective coverage rather than hospital beds.'
                    : a === 'E'
                      ? 'Or is it imported, rented or donor-supplied? Expatriate clinicians, imported active pharmaceutical ingredients, a foreign examination board, a remittance-financed household budget.'
                      : 'Through a funding withdrawal, a political transition, a price spike, a programme being renamed. Statutory entitlement survives; a named scheme does not.'}
                </p>
              </div>
            ))}
          </CardGrid>
          <p className="muted" style={{ marginTop: '1rem' }}>
            Domain substance is the weighted geometric mean{' '}
            <code>S = L^0.50 · E^0.25 · D^0.25</code> — a product, not a sum, because a domain fully present but
            entirely imported is not two-thirds of a capability. It is a contingent one.
          </p>
        </Card>

        {/* ------------------------------------------------ population status */}
        <Card
          title="What India's published data can actually support"
          caption={`An axis needs at least ${MIN_INDICATORS_PER_AXIS} published indicators before it is scored. Everything short of that is reported as unmeasured rather than filled in from a regional average.`}
        >
          <DataTable
            rows={population}
            columns={[
              { key: 'code', header: 'Domain', render: (r) => r.code, sortValue: (r) => r.code },
              { key: 'label', header: 'Capability', render: (r) => r.label, sortValue: (r) => r.label },
              {
                key: 'L',
                header: 'L · Level',
                align: 'right',
                render: (r) => (r.L >= MIN_INDICATORS_PER_AXIS ? <strong>{r.L}</strong> : <span className="muted">{r.L || '—'}</span>),
                sortValue: (r) => r.L,
              },
              {
                key: 'E',
                header: 'E · Endogeneity',
                align: 'right',
                render: (r) => (r.E >= MIN_INDICATORS_PER_AXIS ? <strong>{r.E}</strong> : <span className="muted">{r.E || '—'}</span>),
                sortValue: (r) => r.E,
              },
              {
                key: 'D',
                header: 'D · Durability',
                align: 'right',
                render: (r) => (r.D >= MIN_INDICATORS_PER_AXIS ? <strong>{r.D}</strong> : <span className="muted">{r.D || '—'}</span>),
                sortValue: (r) => r.D,
              },
              {
                key: 'scored',
                header: 'Scored on',
                render: (r) => (r.scoredOn.length ? r.scoredOn.join(', ') : <span className="muted">nothing yet</span>),
                sortValue: (r) => r.scoredOn.length,
              },
            ]}
            initialSort="code"
            initialDir="asc"
            pageSize={0}
            caption="Counts of published indicators per domain and axis. Level is largely measured; Endogeneity and Durability are not."
            exportName="india-substance-population.csv"
            csvRow={(r) => ({ domain: r.label, level: r.L, endogeneity: r.E, durability: r.D, scored_on: r.scoredOn.join(' ') })}
          />
        </Card>

        {/* ------------------------------------------------ state map */}
        <Card
          title="The one domain with a genuine State-level series"
          caption={`Female labour force participation by State and UT, ${MOSPI_META.period}. MoSPI PLFS, usual status, age 15 and above. Darker is higher.`}
        >
          {geo ? (
            <ChoroplethMap
              geo={geo}
              valueOf={valueOfState}
              format={(v) => `${v.toFixed(1)}%`}
              legendTitle="Female LFPR (%)"
              ariaLabel="Female labour force participation rate by Indian State and Union Territory"
              from="var(--surface-3)"
              to="var(--c3)"
            />
          ) : (
            <div className="chart-empty">Loading boundaries…</div>
          )}
          <div className="card-grid" style={{ ['--min' as string]: '190px', marginTop: '1rem' }}>
            <StatCard
              label="All-India female LFPR"
              value="41.7%"
              note="up from 23.3% in 2017-18"
              tone="accent"
            />
            <StatCard
              label="Highest State"
              value={lfprStats ? `${lfprStats.max.value.toFixed(1)}%` : '—'}
              note={lfprStats?.max.name}
              tone="good"
            />
            <StatCard
              label="Lowest State"
              value={lfprStats ? `${lfprStats.min.value.toFixed(1)}%` : '—'}
              note={lfprStats?.min.name}
              tone="warn"
            />
            <StatCard
              label="Spread"
              value={lfprStats ? `${lfprStats.spread.toFixed(1)} pp` : '—'}
              note="a range that no single national figure conveys"
              tone="accent2"
            />
          </div>
          <div className="chip-row" style={{ marginTop: '0.9rem' }}>
            <Link className="chip" href="/substance/work">
              Full State-level labour analysis
            </Link>
          </div>
        </Card>

        {/* ------------------------------------------------ insights */}
        <Card
          title="What the register already shows"
          caption="Computed from the published figures on this page, not asserted."
        >
          <div className="card-grid" style={{ ['--min' as string]: '210px' }}>
            <StatCard
              label="Published indicators in the register"
              value={String(insights.total)}
              note={`${insights.level} on the Level axis`}
              tone="accent"
            />
            <StatCard
              label="Domains clearing the Level threshold"
              value={`${insights.measuredDomains} of 6`}
              note={`at least ${MIN_INDICATORS_PER_AXIS} indicators each`}
              tone="accent2"
            />
            <StatCard
              label="Weakest-measured domain"
              value={insights.weakest ? String(insights.weakest.L) : '—'}
              note={insights.weakest?.label}
              tone="warn"
            />
            <StatCard
              label="Indicators from citizen-led ASER"
              value={String(insights.aser)}
              note="the only direct learning assessment in the register"
              tone="accent2"
            />
          </div>

          <p className="muted" style={{ marginTop: '1rem' }}>
            The gender gap in participation is not a national constant. The widest gaps sit where women&rsquo;s
            paid work is least socially acceptable, not where jobs are scarcest — a different constraint from the
            one a jobs programme addresses.
          </p>
          <HorizontalBars
            items={lfprGaps.slice(0, 8).map((g) => ({ label: g.name, value: g.value }))}
            valueFormat={(v) => `${v.toFixed(1)} pp`}
          />
        </Card>

        {/* ------------------------------------------------ the domains */}
        <Card
          title="Browse by domain"
          caption="Filter the register to a single capability, or read all six."
        >
          <div className="chip-row">
            <button
              className={`chip${domainFilter === 'all' ? ' active' : ''}`}
              onClick={() => setDomainFilter('all')}
            >
              All six
            </button>
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                className={`chip${domainFilter === d.id ? ' active' : ''}`}
                onClick={() => setDomainFilter(d.id)}
              >
                {d.code} · {d.label}
              </button>
            ))}
          </div>
        </Card>

        {visibleDomains.map((d) => {
          const rows = allIndicators.filter((i) => i.domain === d.id);
          const status = population.find((p) => p.domain === d.id);
          return (
            <Card key={d.id} title={`${d.code} · ${d.label}`} caption={d.question}>
              <div className="chip-row" style={{ marginBottom: '0.9rem' }}>
                {AXES.map((a) => {
                  const n = status ? status[a] : 0;
                  const ok = n >= MIN_INDICATORS_PER_AXIS;
                  return (
                    <span key={a} className={`badge${ok ? '' : ' badge-muted'}`}>
                      {a} · {AXIS_LABEL[a]}: {n ? `${n} measured` : 'not measured'}
                    </span>
                  );
                })}
              </div>

              <p className="muted" style={{ fontSize: '0.92em' }}>
                <strong>Measured instead:</strong> {d.conventional}. <strong>Why that fails:</strong> {d.whyFails}
              </p>

              {rows.length ? (
                <DataTable
                  rows={rows}
                  columns={indicatorColumns}
                  initialSort="label"
                  initialDir="asc"
                  pageSize={0}
                  exportName={`india-substance-${d.id}.csv`}
                  csvRow={(r) => ({ indicator: r.label, value: r.value, axis: r.axis, year: r.year, source: r.source })}
                />
              ) : (
                <div className="callout warn">
                  No published indicator on any axis has been assembled for this domain yet
                  {d.id === 'household' && householdFailed ? ' — the live World Bank fetch failed.' : '.'}
                </div>
              )}

              <div className="grid-2" style={{ marginTop: '0.9rem' }}>
                <div>
                  <div className="card-cap">What an endogeneity score would need</div>
                  <ul className="about-list">
                    {d.endogeneityProbes.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="card-cap">What a durability score would need</div>
                  <ul className="about-list">
                    {d.durabilityProbes.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="callout" style={{ marginTop: '0.6rem' }}>
                <strong>Known data defect.</strong> {d.defect}
              </div>
            </Card>
          );
        })}

        {/* ------------------------------------------------ withheld composite */}
        <Card title="Why no composite score appears on this page">
          <p>
            The framework requires three published indicators per axis before that axis is scored, and it refuses to
            impute the rest. Applied to India, that rule has a consequence worth stating plainly: the Level axis clears the three-indicator threshold in four of the six domains from published figures alone — five once the live World Bank household series load — while the Endogeneity axis carries a single indicator across the entire register and the Durability axis carries none.
          </p>
          <p>
            A single number computed from that evidence would be an artefact of what happens to be published. Worse, it
            would hide precisely the thing the framework exists to expose — that India's capability levels are far
            better documented than the question of whether that capability is domestically produced and institutionally
            durable. Publishing a score would make the gap invisible; leaving it open is the finding.
          </p>
          <div className="callout warn">
            <strong>What this is, and is not.</strong> Every figure on this page is a published value with its source
            and reference period attached. Nothing is modelled, interpolated or back-cast. What the page does not
            contain is a substance score for India, because the evidence does not yet support one.
          </div>
        </Card>

        {/* ------------------------------------------------ the algebra */}
        <Card
          title="How the algebra behaves, on synthetic data"
          caption="Twelve archetypal profiles, constructed to demonstrate the method. These are not countries and these are not India."
        >
          <div className="field" style={{ maxWidth: 420, marginBottom: '1rem' }}>
            <label htmlFor="gamma">
              Binding-constraint penalty γ = <strong>{gamma.toFixed(2)}</strong>
            </label>
            <input
              id="gamma"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={gamma}
              onChange={(e) => setGamma(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <p className="muted" style={{ fontSize: '0.88em' }}>
              At γ = 0 the composite is a pure geometric mean, which is the HDI&rsquo;s rule. At γ = 1 a failed domain
              zeroes the score regardless of everything else.
            </p>
          </div>

          <DataTable
            rows={demoRows}
            columns={demoColumns}
            initialSort="rankPenalised"
            initialDir="asc"
            pageSize={0}
            exportName="substance-archetypes.csv"
            csvRow={(r) => ({
              profile: r.name,
              gdp_index: r.gdp,
              rank_linear: r.rankLinear,
              rank_geometric: r.rankGeometric,
              rank_penalised: r.rankPenalised,
              score_penalised: Number(r.scorePenalised.toFixed(4)),
              binding_constraint: r.binding,
            })}
          />

          <p className="muted" style={{ marginTop: '0.9rem' }}>
            Drag γ and watch the ordering rearrange. The decisive case is{' '}
            <strong>{lopsided?.name ?? 'Lopsided'}</strong> — strong delivery in five domains, a failed education system
            in the sixth. It ranks <strong>{lopsided?.rankLinear}</strong> under linear aggregation and{' '}
            <strong>{lopsided?.rankPenalised}</strong> under the penalised rule, crossing below{' '}
            <strong>{even?.name ?? 'Even but modest'}</strong> ({even?.rankLinear} → {even?.rankPenalised}), which is
            merely adequate everywhere and failing nowhere. That crossing is the argument for non-compensatory
            aggregation, and it is invisible in any single published rank.
          </p>
        </Card>

        {/* ------------------------------------------------ the study */}
        <Card title="Read the full study">
          <p>
            The framework, the six-domain indicator register, the aggregation algebra, the robustness protocol and the
            ledger of what each data source can and cannot bear are set out in the working paper.
          </p>
          <div className="chip-row">
            <a className="chip" href={`${BASE}/substance/the-substance-of-an-economy.pdf`} download>
              Working paper (PDF)
            </a>
            <a className="chip" href={`${BASE}/substance/framework-explorer.html`} target="_blank" rel="noreferrer">
              Interactive framework explorer
            </a>
            <Link className="chip" href="/substance/methodology">
              Sources and method
            </Link>
          </div>
          <p className="muted" style={{ fontSize: '0.9em', marginTop: '0.8rem' }}>
            Framework and method only. The working paper publishes no country scores, and neither does this page.
          </p>
        </Card>
      </div>
    </>
  );
}

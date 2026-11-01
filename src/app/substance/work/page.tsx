'use client';

/**
 * /substance/work — the substance template applied to MoSPI's own data.
 *
 * Every figure on this page comes from the Ministry of Statistics and Programme
 * Implementation's published PLFS tables: state-wise LFPR, WPR and unemployment
 * rate in usual status for ages 15+, plus the national trend since 2017-18.
 * Nothing is modelled here — see src/lib/data/mospi.ts for the extraction notes
 * and the validation against MoSPI's own published aggregates.
 *
 * The reading follows the framework rather than the headline: a low
 * unemployment rate beside a low participation rate is not good news, and a
 * high female participation rate in a State with a high unpaid-care burden is
 * not the same achievement as one without it.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ChoroplethMap } from '@/components/charts/ChoroplethMap';
import { LineChart } from '@/components/charts/LineChart';
import { HorizontalBars } from '@/components/charts/HorizontalBars';
import { useGeo } from '@/lib/hooks/useGeo';
import { usePublishPageData } from '@/components/insights/PageDataContext';
import type { PageContext } from '@/lib/insights/engine';
import {
  INDICATORS,
  MOSPI_INDIA,
  MOSPI_META,
  RESIDENCES,
  SEXES,
  TREND_YEARS,
  genderGap,
  indiaValue,
  ranked,
  specOf,
  summary,
  trendValue,
  type IndicatorId,
  type RankedRow,
  type Residence,
  type Sex,
} from '@/lib/data/mospi';
import { censusStates } from '@/lib/data/census';

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** The boundary file names States differently from the census tables. */
const ALIASES: Record<string, string> = {
  orissa: 'odisha',
  uttaranchal: 'uttarakhand',
  'nct of delhi': 'delhi',
  'jammu & kashmir': 'jammu and kashmir',
  'andaman & nicobar islands': 'andaman and nicobar islands',
  'andaman & n. island': 'andaman and nicobar islands',
  'dadra and nagar haveli': 'dadra and nagar haveli and daman and diu',
  'daman and diu': 'dadra and nagar haveli and daman and diu',
  pondicherry: 'puducherry',
};

const pct = (v: number) => `${v.toFixed(1)}%`;

export default function WorkPage() {
  const { geo } = useGeo();
  const [ind, setInd] = useState<IndicatorId>('lfpr');
  const [res, setRes] = useState<Residence>('total');
  const [sex, setSex] = useState<Sex>('female');

  const spec = specOf(ind);
  const rows = useMemo(() => ranked(ind, res, sex), [ind, res, sex]);
  const stats = useMemo(() => summary(rows), [rows]);
  const gaps = useMemo(() => genderGap(ind, res), [ind, res]);
  const national = indiaValue(ind, res, sex);

  const nationalGap = useMemo(() => {
    const m = MOSPI_INDIA[ind][res].male;
    const f = MOSPI_INDIA[ind][res].female;
    return typeof m === 'number' && typeof f === 'number' ? m - f : null;
  }, [ind, res]);

  /* ------------------------------------------------------------ map values */
  const mapValues = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(norm(r.name), r.value);
    return m;
  }, [rows]);

  const valueOfRegion = useMemo(
    () => (f: { state: string }) =>
      mapValues.get(norm(f.state)) ?? mapValues.get(ALIASES[norm(f.state)] ?? '\u0000'),
    [mapValues],
  );

  /* --------------------------------------------------------------- trend */
  const trendSeries = useMemo(
    () => [
      {
        name: `${spec.short} — ${SEXES.find((s) => s.id === sex)?.label}, ${RESIDENCES.find((r) => r.id === res)?.label}`,
        color: 'var(--c1)',
        area: true,
        points: TREND_YEARS.map((y) => ({ x: y, y: trendValue(ind, y, res, sex) ?? 0 })).filter((p) => p.y > 0),
      },
    ],
    [ind, res, sex, spec.short],
  );

  const firstYear = TREND_YEARS[0];
  const lastYear = TREND_YEARS[TREND_YEARS.length - 1];
  const t0 = trendValue(ind, firstYear, res, sex);
  const t1 = trendValue(ind, lastYear, res, sex);

  /* ------------------------------------------------ female LFPR vs literacy */
  const literacyScatter = useMemo(() => {
    const lit = new Map(censusStates.map((s) => [norm(s.name), s.literacyFemale]));
    return rows
      .map((r) => {
        const x = lit.get(norm(r.name));
        return typeof x === 'number' ? { label: r.name, x, y: r.value } : null;
      })
      .filter((p): p is { label: string; x: number; y: number } => p !== null);
  }, [rows]);

  /* -------------------------------------------------------- publish to panel */
  const pageData = useMemo<PageContext | null>(() => {
    if (!rows.length) return null;
    return {
      route: '/substance/work',
      title: `India — ${spec.label} by State (${SEXES.find((s) => s.id === sex)?.label}, ${RESIDENCES.find((r) => r.id === res)?.label})`,
      blurb:
        `MoSPI PLFS 2023-24, usual status, age 15+. All-India ${spec.short} for this selection is ` +
        `${national != null ? pct(national) : 'n/a'}; the State range runs from ${stats?.min.value.toFixed(1)}% ` +
        `(${stats?.min.name}) to ${stats?.max.value.toFixed(1)}% (${stats?.max.name}).`,
      series: [
        {
          id: 'states',
          label: `${spec.short} by State/UT`,
          short: spec.short,
          unit: '%',
          format: pct,
          higherIsBetter: spec.better === 'higher',
          note:
            'State estimates from MoSPI PLFS 2023-24, Table 16/17/18 (usual status, age 15+). Smaller States ' +
            'and UTs rest on small samples; MoSPI publishes relative standard errors in Appendix B.',
          points: rows.map((r) => ({ name: r.name, value: r.value })),
        },
      ],
      caveats: [
        'Usual status (ps+ss) over 365 days — a person who worked even briefly as a subsidiary activity counts as employed.',
        'State estimates carry sampling error; small States and UTs are the least reliable.',
        'PLFS changed methodology in 2017-18, so the trend series is not continuous with the earlier quinquennial surveys.',
        'Participation is not the same as decent work: PLFS does not measure informality, earnings adequacy or contract status here.',
      ],
      source: 'MoSPI, Periodic Labour Force Survey Annual Report 2023-24',
      prompts: [
        'Which State has the highest value?',
        'Which State has the lowest?',
        'Rank the States',
        'What is the all-India figure?',
        'Summarise this page',
      ],
    };
  }, [rows, spec, sex, res, national, stats]);

  usePublishPageData(pageData);

  const columns: Column<RankedRow>[] = [
    { key: 'rank', header: '#', align: 'right', render: (r) => r.rank, sortValue: (r) => r.rank },
    { key: 'name', header: 'State / UT', render: (r) => r.name, sortValue: (r) => r.name },
    {
      key: 'value',
      header: `${spec.short} (%)`,
      align: 'right',
      render: (r) => <strong>{r.value.toFixed(1)}</strong>,
      sortValue: (r) => r.value,
    },
    {
      key: 'vs',
      header: 'vs all-India',
      align: 'right',
      render: (r) =>
        national == null ? (
          <span className="muted">—</span>
        ) : (
          <span className="muted">
            {r.value - national > 0 ? '+' : ''}
            {(r.value - national).toFixed(1)}
          </span>
        ),
      sortValue: (r) => (national == null ? 0 : r.value - national),
    },
  ];

  return (
    <>
      <PageHeader
        title="Work that sustains a life, State by State"
        description="MoSPI's own labour force estimates, read through the substance framework: participation, employment and unemployment across every State and Union Territory, with the gender gap and the seven-year trend."
        source="MoSPI, Periodic Labour Force Survey 2023-24 (usual status, age 15+)"
      />

      <div className="stack">
        {/* ------------------------------------------------------- controls */}
        <Card title="Choose a measure" caption={`${MOSPI_META.period} · ${MOSPI_META.status} · age ${MOSPI_META.ageGroup}`}>
          <div className="field">
            <span className="card-cap">Indicator</span>
            <div className="chip-row">
              {INDICATORS.map((i) => (
                <button key={i.id} className={`chip${ind === i.id ? ' active' : ''}`} onClick={() => setInd(i.id)}>
                  {i.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="card-cap">Residence</span>
            <div className="chip-row">
              {RESIDENCES.map((r) => (
                <button key={r.id} className={`chip${res === r.id ? ' active' : ''}`} onClick={() => setRes(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="card-cap">Sex</span>
            <div className="chip-row">
              {SEXES.map((s) => (
                <button key={s.id} className={`chip${sex === s.id ? ' active' : ''}`} onClick={() => setSex(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <p className="muted" style={{ marginBottom: 0 }}>
            {spec.blurb}
          </p>
        </Card>

        {/* ---------------------------------------------------------- stats */}
        <div className="card-grid" style={{ ['--min' as string]: '200px' }}>
          <StatCard
            label={`All-India ${spec.short}`}
            value={national != null ? pct(national) : '—'}
            note={`${SEXES.find((s) => s.id === sex)?.label}, ${RESIDENCES.find((r) => r.id === res)?.label}`}
            tone="accent"
          />
          <StatCard
            label="Highest State / UT"
            value={stats ? pct(stats.max.value) : '—'}
            note={stats?.max.name}
            tone="good"
          />
          <StatCard
            label="Lowest State / UT"
            value={stats ? pct(stats.min.value) : '—'}
            note={stats?.min.name}
            tone="warn"
          />
          <StatCard
            label="Spread across States"
            value={stats ? `${stats.spread.toFixed(1)} pp` : '—'}
            note="percentage points, highest minus lowest"
            tone="accent2"
          />
          <StatCard
            label="Gender gap, all-India"
            value={nationalGap != null ? `${nationalGap.toFixed(1)} pp` : '—'}
            note="male minus female, this residence split"
            tone="accent2"
          />
        </div>

        {/* ------------------------------------------------------------ map */}
        <Card
          title={`${spec.short} by State and Union Territory`}
          caption={`${spec.label}, ${SEXES.find((s) => s.id === sex)?.label}, ${RESIDENCES.find((r) => r.id === res)?.label}, ${MOSPI_META.period}. Darker is higher.`}
        >
          {geo ? (
            <ChoroplethMap
              geo={geo}
              valueOf={valueOfRegion}
              format={pct}
              legendTitle={`${spec.short} (%)`}
              ariaLabel={`${spec.label} by Indian State and Union Territory`}
              from="var(--surface-3)"
              to="var(--c1)"
            />
          ) : (
            <div className="chart-empty">Loading boundaries…</div>
          )}
          <p className="muted" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
            States the survey does not cover at this disaggregation are left unshaded rather than guessed. Every
            value here is a published MoSPI estimate for the State as a whole.
          </p>
        </Card>

        {/* ---------------------------------------------------------- trend */}
        <Card
          title="Seven years of the same measure"
          caption={`${spec.label} — ${SEXES.find((s) => s.id === sex)?.label}, ${RESIDENCES.find((r) => r.id === res)?.label}. ${MOSPI_META.trendSource}.`}
        >
          <LineChart series={trendSeries} height={280} yFormat={(v) => `${v.toFixed(0)}%`} valueFormat={pct} />
          {t0 != null && t1 != null ? (
            <p className="muted" style={{ marginTop: '0.7rem', marginBottom: 0 }}>
              {firstYear} → {lastYear}: {t0.toFixed(1)}% to {t1.toFixed(1)}% ({t1 - t0 > 0 ? '+' : ''}
              {(t1 - t0).toFixed(1)} percentage points).
              {ind === 'ur' && t1 < t0
                ? ' Unemployment fell over the period — but read it beside participation, because a falling rate can mean fewer people looking rather than more people working.'
                : ''}
              {ind === 'lfpr' && sex === 'female'
                ? ' Almost the whole rise is female participation, and part of it is better capture of unpaid helpers in household enterprises rather than new paid work.'
                : ''}
            </p>
          ) : null}
        </Card>

        {/* ------------------------------------------------------- rankings */}
        <Card
          title={`Every State and UT, ranked`}
          caption={`${spec.short}, ${SEXES.find((s) => s.id === sex)?.label}, ${RESIDENCES.find((r) => r.id === res)?.label}. Sorted best-first for this indicator.`}
        >
          <DataTable
            rows={rows}
            columns={columns}
            initialSort="rank"
            initialDir="asc"
            pageSize={0}
            exportName={`mospi-plfs-${ind}-${res}-${sex}.csv`}
            csvRow={(r) => ({ state: r.name, [spec.short]: r.value, rank: r.rank })}
          />
        </Card>

        {/* ----------------------------------------------------- gender gap */}
        <Card
          title="The gender gap is not a national constant"
          caption={`Male minus female ${spec.short}, ${RESIDENCES.find((r) => r.id === res)?.label}, in percentage points. Twelve widest gaps shown.`}
        >
          <HorizontalBars
            items={gaps.slice(0, 12).map((g) => ({ label: g.name, value: g.value }))}
            valueFormat={(v) => `${v.toFixed(1)} pp`}
          />
          <p className="muted" style={{ marginTop: '0.7rem', marginBottom: 0 }}>
            The all-India gap is {nationalGap != null ? `${nationalGap.toFixed(1)} percentage points` : '—'}. The
            widest gaps are not in the poorest States: they sit where women&rsquo;s work is least socially
            acceptable, which is a different constraint from a shortage of jobs.
          </p>
        </Card>

        {/* -------------------------------------------------------- literacy */}
        {literacyScatter.length > 8 ? (
          <Card
            title="Participation and female literacy do not move together simply"
            caption="Female LFPR (y) against female literacy from Census 2011 (x), one point per State."
          >
            <div className="tbl-scroll">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>State / UT</th>
                    <th style={{ textAlign: 'right' }}>Female literacy 2011 (%)</th>
                    <th style={{ textAlign: 'right' }}>Female LFPR 2023-24 (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {literacyScatter
                    .slice()
                    .sort((a, b) => b.x - a.x)
                    .slice(0, 12)
                    .map((p) => (
                      <tr key={p.label}>
                        <td>{p.label}</td>
                        <td style={{ textAlign: 'right' }}>{p.x.toFixed(1)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <strong>{p.y.toFixed(1)}</strong>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="muted" style={{ marginTop: '0.7rem', marginBottom: 0 }}>
              The most literate States are frequently the ones with the lowest female participation — Kerala,
              Tamil Nadu and Himachal Pradesh all sit high on literacy and mid-to-low on participation. Education
              raises the reservation wage and delays entry; it does not by itself create work that a woman can
              take without withdrawing from unpaid care. The binding constraint is the care burden, not the
              qualification.
            </p>
          </Card>
        ) : null}

        {/* ---------------------------------------------------------- caveats */}
        <Card title="What these numbers can and cannot bear">
          <ul className="about-list">
            <li>
              <strong>Usual status is generous.</strong> A person counts as employed if they worked even briefly
              during the reference year as a subsidiary activity. WPR under usual status therefore sits above what
              a weekly measure would show.
            </li>
            <li>
              <strong>Small States carry large sampling error.</strong> MoSPI publishes relative standard errors in
              Appendix B of the report. A one- or two-point difference between two States is not necessarily real,
              and the rankings should be read as bands rather than an exact order.
            </li>
            <li>
              <strong>Participation is not decent work.</strong> PLFS measures whether someone is in the labour
              force, not whether the work pays enough, is secure, or is formal. India&rsquo;s informality share is
              the reason the framework treats employment quality as a separate question.
            </li>
            <li>
              <strong>The series starts in 2017-18.</strong> PLFS replaced the quinquennial Employment-Unemployment
              Survey, so this trend is not continuous with earlier data.
            </li>
            <li>
              <strong>Chandigarh is reconstructed.</strong> The report prints six values for it because its entire
              area is urban; the total column here is set equal to the urban column and that is flagged in the
              data module.
            </li>
          </ul>
          <p className="muted" style={{ marginBottom: 0 }}>
            Source: {MOSPI_META.source}. {MOSPI_META.report}, released {MOSPI_META.released}. Extracted directly
            from Tables 16, 17 and 18 of the report; the all-India rows reproduce MoSPI&rsquo;s published
            aggregates exactly. Not an official product of MoSPI.
          </p>
        </Card>

        <Card title="Where this sits in the framework">
          <p>
            Work is domain D3 of the substance framework, and this page measures only its <strong>Level</strong>{' '}
            axis — whether work is available and taken up. The framework&rsquo;s two harder questions are not
            answerable from PLFS alone.
          </p>
          <p>
            <strong>Endogeneity:</strong> whether the employment rests on domestic production or on remittances,
            a single export market or a public payroll. India publishes no comparative series for this at State
            level. <strong>Durability:</strong> whether the work survives a demand shock — the framework&rsquo;s
            proxies are structural features, and no Indian series measures them.
          </p>
          <div className="chip-row">
            <Link className="chip" href="/substance">
              The framework
            </Link>
            <Link className="chip" href="/substance/methodology">
              Sources and method
            </Link>
            <Link className="chip" href="/economy">
              Sixty years of economy data
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  AXIS_LABEL,
  AXIS_QUESTION,
  DOMAINS,
  INDIA_INDICATORS,
  MIN_INDICATORS_PER_AXIS,
  type Axis,
} from '@/lib/data/substance';

const AXES: Axis[] = ['L', 'E', 'D'];

export const metadata = {
  title: 'Substance — sources and method',
  description:
    'How the substance framework is applied to India: the indicator register, the aggregation algebra, what is deliberately not published, and the known defect in every source.',
};

export default function SubstanceMethodologyPage() {
  const byDomain = DOMAINS.map((d) => ({
    domain: d,
    rows: INDIA_INDICATORS.filter((i) => i.domain === d.id),
  }));

  return (
    <>
      <PageHeader
        title="Substance — sources and method"
        description="What this section measures, how it is aggregated, what it deliberately refuses to publish, and the defect in every source it relies on."
      />

      <div className="stack">
        <Card title="What this section is">
          <p>
            A companion to the working paper <em>The Substance of an Economy</em>. The argument there is narrow and
            specific: output metrics answer a flow question well, and the question that decides whether a society holds
            together is a stock question. A country can raise this year&rsquo;s output by drawing down its own
            foundations — working children instead of educating them, exporting clinicians instead of retaining them,
            financing consumption from a depleting rent instead of from production.
          </p>
          <p>
            So the framework asks three questions of every domain of capability rather than one. It is the second and
            third that existing indices leave out, and they are the two that predict what happens next.
          </p>
          <div className="grid-2" style={{ marginTop: '0.8rem' }}>
            {AXES.map((a) => (
              <div key={a}>
                <div className="card-cap">
                  {a} — {AXIS_LABEL[a]}
                </div>
                <p className="muted">{AXIS_QUESTION[a]}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="The aggregation algebra"
          caption="Stated here so it can be disputed. Every parameter is a judgement call, not a measurement."
        >
          <p>
            <strong>Domain substance</strong> is the weighted geometric mean of the three axes:{' '}
            <code>S = L^0.50 · E^0.25 · D^0.25</code>. The geometric form is chosen because the axes are not
            substitutes — a domain fully present but entirely imported is not two-thirds of a capability, it is a
            contingent one. Level carries half the weight because it is the only axis measured directly rather than by
            proxy; giving the proxies equal weight would let measurement uncertainty dominate the result.
          </p>
          <p>
            <strong>The composite</strong> carries a binding-constraint penalty:{' '}
            <code>SI = G · [(1 − γ) + γ · min_d S_d]</code>, where G is the geometric mean across domains. At γ = 0 this
            is a pure geometric mean, which is the HDI&rsquo;s rule; at γ = 1 a failed domain zeroes the score. The
            default is γ = 0.5, and the main page exposes the full path so a reader who disagrees with the penalty can
            see what the disagreement costs.
          </p>
          <p>
            <strong>Missing data is not imputed.</strong> An axis needs at least {MIN_INDICATORS_PER_AXIS} published
            indicators before it is scored, and a domain short of that is reported as unmeasured with its count shown.
            The alternative — imputing from regional averages, as the learning-poverty methodology does — produces a
            complete-looking matrix in which the least well-measured places carry the most invented data.
          </p>
          <div className="callout warn">
            <strong>No composite score is published for India.</strong> The Level axis clears the three-indicator threshold in four of six domains from the static register, and five once the live World Bank household series load. The Endogeneity axis carries a single indicator across the entire register, and the Durability axis carries none. A number computed from that
            evidence would be an artefact of what happens to be published, and it would hide the gap it was meant to
            expose.
          </div>
        </Card>

        <Card
          title="Indicator register"
          caption="Every figure is a published value with its source and reference period. Nothing is modelled, interpolated or back-cast."
        >
          {byDomain.map(({ domain, rows }) => (
            <div key={domain.id} style={{ marginBottom: '1.6rem' }}>
              <h3>
                {domain.code} · {domain.label}
              </h3>
              <p className="muted" style={{ fontSize: '0.92em' }}>
                {domain.question}
              </p>
              {rows.length ? (
                <div className="table-wrap">
                  <table className="dtable">
                    <thead>
                      <tr>
                        <th>Indicator</th>
                        <th style={{ textAlign: 'right' }}>Value</th>
                        <th>Axis</th>
                        <th>Reference</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <td>
                            {r.label}
                            {r.note ? (
                              <span className="muted" style={{ display: 'block', fontSize: '0.85em' }}>
                                {r.note}
                              </span>
                            ) : null}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong>{r.value}</strong>
                          </td>
                          <td>{AXIS_LABEL[r.axis]}</td>
                          <td>{r.year}</td>
                          <td className="muted">{r.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted">
                  Household-material indicators are fetched live from the World Bank on the main page and are not
                  duplicated here.
                </p>
              )}
              <div className="callout" style={{ marginTop: '0.6rem' }}>
                <strong>Known data defect.</strong> {domain.defect}
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="How the MoSPI labour data was extracted"
          caption="The State-level series on /substance/work comes from MoSPI's own published tables, not from a third-party aggregator."
        >
          <p>
            The figures are read directly out of the Ministry&rsquo;s <em>Annual Report, Periodic Labour Force
            Survey (PLFS), 2023-24</em>, released 23 September 2024, at three tables:
          </p>
          <ul className="about-list">
            <li>
              <strong>Table (16)</strong> — Labour Force Participation Rate, usual status (ps+ss), age 15 years and
              above, for each State/UT.
            </li>
            <li>
              <strong>Table (17)</strong> — Worker Population Ratio, same basis.
            </li>
            <li>
              <strong>Table (18)</strong> — Unemployment Rate, same basis.
            </li>
          </ul>
          <p>
            Each table gives nine values per State — rural, urban and combined, each split by male, female and
            person — across all 36 States and Union Territories. The national trend since 2017-18 comes from
            Tables 1–3 of MoSPI&rsquo;s press note of the same date.
          </p>
          <div className="callout">
            <strong>Validation.</strong> The all-India rows extracted from these tables reproduce MoSPI&rsquo;s
            published aggregates exactly: LFPR 60.1% (male 78.8, female 41.7), WPR 58.2% (76.3 / 40.3) and UR 3.2%
            (3.2 / 3.2) for July 2023 – June 2024. That match is the check on the extraction — if a future
            re-extraction drifts from those numbers, the extraction is wrong, not the data.
          </div>
          <p>
            <strong>One reconstruction, flagged.</strong> The report prints only six values for Chandigarh, because
            its entire area is treated as urban and the rural and urban columns are identical. Its total column is
            therefore set equal to the urban column, and the data module says so.
          </p>
          <p className="muted" style={{ marginBottom: 0 }}>
            Nothing on that page is modelled, interpolated or estimated. Where MoSPI does not publish a State
            estimate at this disaggregation, the State is left unshaded on the map rather than guessed.
          </p>
        </Card>

        <Card title="The research agenda this implies">
          <p>Four pieces of work would turn the framework from a specification into an instrument for India:</p>
          <ul className="about-list">
            <li>
              <strong>Build the durability proxies.</strong> Code statutory versus discretionary entitlement across
              social programmes, and measure retention through comparable fiscal consolidation episodes. This is the
              largest gap: no Indian series measures whether a capability survives a shock.
            </li>
            <li>
              <strong>Build the endogeneity measures.</strong> Import dependence in essential medicines and diagnostics,
              expatriate share of clinical staffing, remittance share of household consumption, and rent share of
              government revenue are all constructible from existing sources and none is currently assembled into a
              comparative series.
            </li>
            <li>
              <strong>Move to the states.</strong> India&rsquo;s states are the natural unit: PLFS, NFHS, ASER and RBI
              state finances give genuine sub-national coverage, and the Kerala–Gujarat divergence in output against
              human capability is exactly the phenomenon the framework is built to describe.
            </li>
            <li>
              <strong>Test the reflexivity risk.</strong> If a published substance score becomes a target, durability
              becomes something to be performed. Compare scores against subsequent behaviour once they are public.
            </li>
          </ul>
        </Card>

        <Card title="Sources">
          <ul className="about-sources">
            <li>
              <strong>ASER Centre</strong> — Annual Status of Education Report (Rural) 2023: Beyond Basics. Citizen-led
              household survey, 28 districts across 26 states, ~35,000 youth aged 14–18. Rural only.
            </li>
            <li>
              <strong>MoSPI</strong> — Periodic Labour Force Survey annual reports (2017-18 to 2023-24); Time Use Survey
              2019.
            </li>
            <li>
              <strong>Census of India 2011</strong> — literacy by sex, population aged 7 and above.
            </li>
            <li>
              <strong>World Health Organization</strong> — SDG country profile: India (2024); Health financing: India;
              Global Health Expenditure Database; UHC service coverage index.
            </li>
            <li>
              <strong>International Labour Organization</strong> — World Social Protection Report 2024-26, including the
              Asia and the Pacific regional companion.
            </li>
            <li>
              <strong>CBDT / CBIC</strong> — direct and indirect tax collections, provisional, FY2023-24.
            </li>
            <li>
              <strong>Reserve Bank of India</strong> — State Finances: A Study of Budgets, revenue dynamics and fiscal
              capacity of Indian states.
            </li>
            <li>
              <strong>MoSPI / NSSO</strong> — Annual Report, Periodic Labour Force Survey (PLFS) 2023-24, Tables 16–18
              (State-wise LFPR, WPR and UR, usual status, age 15+) and press note Tables 1–3 (national trend). The
              State-level series on /substance/work is extracted from these tables.
            </li>
            <li>
              <strong>World Bank Open Data</strong> — household final consumption per capita and as a share of GDP, and
              the Gini index, fetched live on the main page.
            </li>
            <li>
              <strong>World Bank / UNESCO / UNICEF</strong> — The State of Global Learning Poverty: 2022 Update, used
              only for the South Asia regional aggregate; India does not publish a national figure on that definition.
            </li>
          </ul>
          <p className="muted" style={{ marginTop: '0.8rem' }}>
            Not an official product of NCRB, MoSPI, WHO or any government body. Figures are as published by each source
            and carry their own reference period; several are modelled estimates by the publishing agency. Verify
            against the source report before quoting.
          </p>
        </Card>

        <Card title="Related reading in this app">
          <ul className="about-list">
            <li>
              <Link href="/economy">Economy</Link> — sixty years of World Bank indicators for India, the flow view this
              section sits against.
            </li>
            <li>
              <Link href="/census/literacy">Census literacy</Link> — the 2011 baseline the competence indicators move
              away from.
            </li>
            <li>
              <Link href="/justice">Justice</Link> — police strength and the FIR-to-conviction pipeline, the
              adjudicative side of state capacity.
            </li>
            <li>
              <Link href="/safety">Women&rsquo;s safety</Link> — a 50-country comparison, with its caveats.
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}

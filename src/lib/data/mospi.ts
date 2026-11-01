/**
 * MoSPI — Periodic Labour Force Survey, state-wise estimates.
 *
 * Everything in this file is extracted from the Ministry of Statistics and
 * Programme Implementation's own published tables. Nothing is modelled,
 * interpolated or estimated here.
 *
 * Source tables (Annual Report, PLFS 2023-24, released 23 September 2024):
 *   Table (16) LFPR, usual status (ps+ss), age 15+, for each State/UT
 *   Table (17) WPR,  usual status (ps+ss), age 15+, for each State/UT
 *   Table (18) UR,   usual status (ps+ss), age 15+, for each State/UT
 *
 * National trend from the MoSPI press note of the same date, Tables 1-3.
 *
 * VALIDATION: the all-India rows extracted from these tables reproduce the
 * official published aggregates exactly — LFPR 60.1% (male 78.8, female 41.7),
 * WPR 58.2% (76.3 / 40.3), UR 3.2% (3.2 / 3.2) for July 2023 - June 2024.
 * If a future re-extraction drifts from those numbers, the extraction is wrong.
 *
 * One reconstruction is made and flagged: the report prints only six values for
 * Chandigarh because its entire area is urban (rural and urban columns are
 * identical), so the total column is derived as equal to the urban column.
 */

export type Sex = 'male' | 'female' | 'person';
export type Residence = 'rural' | 'urban' | 'total';
export type IndicatorId = 'lfpr' | 'wpr' | 'ur';

export interface Cell {
  male: number | null;
  female: number | null;
  person: number | null;
}

export interface Split {
  rural: Cell;
  urban: Cell;
  total: Cell;
}

export interface StateRow {
  id: string;
  name: string;
  lfpr: Split;
  wpr: Split;
  ur: Split;
}

export const MOSPI_META = {
  source: 'Ministry of Statistics and Programme Implementation (MoSPI), NSSO',
  report: 'Annual Report, Periodic Labour Force Survey (PLFS), 2023-24',
  period: 'July 2023 – June 2024',
  released: '23 September 2024',
  trendSource: 'MoSPI press note on PLFS Annual Report 2023-24, Tables 1-3',
  status: 'Usual status (ps+ss) — principal plus subsidiary activity status over 365 days',
  ageGroup: '15 years and above',
  note:
    'State estimates rest on sample sizes that are small for the smaller States and UTs. MoSPI publishes ' +
    'relative standard errors for these tables in Appendix B of the report; a difference of a point or two ' +
    'between two States is not necessarily real. The national aggregates are far more reliable than any ' +
    'single State figure.',
};

export interface IndicatorSpec {
  id: IndicatorId;
  label: string;
  short: string;
  unit: string;
  better: 'higher' | 'lower' | null;
  blurb: string;
}

export const INDICATORS: IndicatorSpec[] = [
  {
    id: 'lfpr',
    label: 'Labour force participation rate',
    short: 'LFPR',
    unit: '%',
    better: 'higher',
    blurb:
      'Share of the population aged 15 and above that is either working or seeking or available for work. ' +
      'It counts willingness to work, not whether work was found.',
  },
  {
    id: 'wpr',
    label: 'Worker population ratio',
    short: 'WPR',
    unit: '%',
    better: 'higher',
    blurb:
      'Share of the population aged 15 and above that is actually employed. The gap between LFPR and WPR is ' +
      'the unemployment rate, by construction.',
  },
  {
    id: 'ur',
    label: 'Unemployment rate',
    short: 'UR',
    unit: '%',
    better: 'lower',
    blurb:
      'Share of the labour force without work. Low unemployment alongside low participation means people have ' +
      'stopped looking, not that work is plentiful.',
  },
];

export const SEXES: { id: Sex; label: string }[] = [
  { id: 'person', label: 'All persons' },
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
];

export const RESIDENCES: { id: Residence; label: string }[] = [
  { id: 'total', label: 'Rural + urban' },
  { id: 'rural', label: 'Rural' },
  { id: 'urban', label: 'Urban' },
];

/** National aggregates, from the same tables' all-India row. */
export const MOSPI_INDIA: Record<IndicatorId, Split> = {
  lfpr: { rural: { male: 80.2, female: 47.6, person: 63.7 }, urban: { male: 75.6, female: 28.0, person: 52.0 }, total: { male: 78.8, female: 41.7, person: 60.1 } },
  wpr: { rural: { male: 78.1, female: 46.5, person: 62.1 }, urban: { male: 72.3, female: 26.0, person: 49.4 }, total: { male: 76.3, female: 40.3, person: 58.2 } },
  ur: { rural: { male: 2.7, female: 2.1, person: 2.5 }, urban: { male: 4.4, female: 7.1, person: 5.1 }, total: { male: 3.2, female: 3.2, person: 3.2 } },
};

/** State and UT estimates, sorted by all-person LFPR, highest first. */
export const MOSPI_STATES: StateRow[] = [
  { id: 'ML', name: 'Meghalaya', lfpr: { rural: { male: 84.8, female: 76.9, person: 80.8 }, urban: { male: 69.5, female: 47.7, person: 57.9 }, total: { male: 82.3, female: 71.8, person: 76.9 } }, wpr: { rural: { male: 81.8, female: 71.9, person: 76.7 }, urban: { male: 63.3, female: 37.9, person: 49.8 }, total: { male: 78.7, female: 65.9, person: 72.1 } }, ur: { rural: { male: 3.6, female: 6.6, person: 5.0 }, urban: { male: 8.9, female: 20.6, person: 14.0 }, total: { male: 4.3, female: 8.2, person: 6.2 } } },
  { id: 'SK', name: 'Sikkim', lfpr: { rural: { male: 85.7, female: 77.9, person: 81.9 }, urban: { male: 76.2, female: 32.2, person: 57.0 }, total: { male: 83.4, female: 68.2, person: 76.2 } }, wpr: { rural: { male: 83.4, female: 76.7, person: 80.1 }, urban: { male: 74.9, female: 30.0, person: 55.3 }, total: { male: 81.3, female: 66.8, person: 74.4 } }, ur: { rural: { male: 2.7, female: 1.6, person: 2.2 }, urban: { male: 1.7, female: 6.9, person: 3.0 }, total: { male: 2.5, female: 2.1, person: 2.3 } } },
  { id: 'HP', name: 'Himachal Pradesh', lfpr: { rural: { male: 82.4, female: 70.2, person: 76.0 }, urban: { male: 77.5, female: 45.1, person: 63.2 }, total: { male: 81.7, female: 67.6, person: 74.4 } }, wpr: { rural: { male: 79.8, female: 65.3, person: 72.2 }, urban: { male: 73.8, female: 36.9, person: 57.5 }, total: { male: 78.9, female: 62.3, person: 70.3 } }, ur: { rural: { male: 3.2, female: 7.0, person: 5.0 }, urban: { male: 4.8, female: 18.2, person: 9.0 }, total: { male: 3.4, female: 7.8, person: 5.5 } } },
  { id: 'NL', name: 'Nagaland', lfpr: { rural: { male: 85.4, female: 69.0, person: 77.1 }, urban: { male: 75.3, female: 52.1, person: 64.0 }, total: { male: 82.4, female: 64.3, person: 73.3 } }, wpr: { rural: { male: 80.7, female: 65.0, person: 72.7 }, urban: { male: 66.9, female: 46.1, person: 56.8 }, total: { male: 76.6, female: 59.7, person: 68.1 } }, ur: { rural: { male: 5.5, female: 5.8, person: 5.7 }, urban: { male: 11.1, female: 11.6, person: 11.3 }, total: { male: 7.0, female: 7.1, person: 7.1 } } },
  { id: 'AR', name: 'Arunachal Pradesh', lfpr: { rural: { male: 80.0, female: 70.8, person: 75.5 }, urban: { male: 75.1, female: 46.4, person: 60.5 }, total: { male: 79.2, female: 66.5, person: 73.0 } }, wpr: { rural: { male: 75.6, female: 67.5, person: 71.7 }, urban: { male: 68.1, female: 38.0, person: 52.8 }, total: { male: 74.4, female: 62.4, person: 68.5 } }, ur: { rural: { male: 5.4, female: 4.6, person: 5.1 }, urban: { male: 9.4, female: 18.1, person: 12.8 }, total: { male: 6.1, female: 6.2, person: 6.1 } } },
  { id: 'CT', name: 'Chhattisgarh', lfpr: { rural: { male: 84.6, female: 65.9, person: 75.2 }, urban: { male: 78.8, female: 34.0, person: 57.0 }, total: { male: 83.4, female: 59.5, person: 71.5 } }, wpr: { rural: { male: 83.2, female: 65.0, person: 74.1 }, urban: { male: 73.7, female: 30.4, person: 52.6 }, total: { male: 81.2, female: 58.1, person: 69.7 } }, ur: { rural: { male: 1.6, female: 1.3, person: 1.5 }, urban: { male: 6.4, female: 10.6, person: 7.6 }, total: { male: 2.6, female: 2.4, person: 2.5 } } },
  { id: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu', lfpr: { rural: { male: 85.8, female: 72.3, person: 79.2 }, urban: { male: 89.1, female: 24.8, person: 62.4 }, total: { male: 87.8, female: 46.5, person: 69.4 } }, wpr: { rural: { male: 82.2, female: 72.3, person: 77.4 }, urban: { male: 87.3, female: 23.9, person: 61.0 }, total: { male: 85.3, female: 46.0, person: 67.8 } }, ur: { rural: { male: 4.2, female: 0.0, person: 2.3 }, urban: { male: 2.0, female: 3.8, person: 2.3 }, total: { male: 2.9, female: 1.1, person: 2.3 } } },
  { id: 'MP', name: 'Madhya Pradesh', lfpr: { rural: { male: 87.3, female: 61.1, person: 74.5 }, urban: { male: 78.3, female: 28.5, person: 53.4 }, total: { male: 85.0, female: 52.3, person: 68.9 } }, wpr: { rural: { male: 86.8, female: 60.8, person: 74.2 }, urban: { male: 76.0, female: 27.7, person: 51.9 }, total: { male: 84.0, female: 51.9, person: 68.3 } }, ur: { rural: { male: 0.6, female: 0.3, person: 0.5 }, urban: { male: 2.9, female: 2.6, person: 2.8 }, total: { male: 1.1, female: 0.7, person: 1.0 } } },
  { id: 'AS', name: 'Assam', lfpr: { rural: { male: 83.8, female: 52.8, person: 68.5 }, urban: { male: 80.0, female: 31.5, person: 55.8 }, total: { male: 83.3, female: 50.2, person: 66.9 } }, wpr: { rural: { male: 80.8, female: 50.9, person: 66.1 }, urban: { male: 75.4, female: 27.8, person: 51.6 }, total: { male: 80.2, female: 48.1, person: 64.3 } }, ur: { rural: { male: 3.6, female: 3.5, person: 3.5 }, urban: { male: 5.7, female: 11.8, person: 7.4 }, total: { male: 3.8, female: 4.1, person: 3.9 } } },
  { id: 'AN', name: 'Andaman and Nicobar Islands', lfpr: { rural: { male: 84.2, female: 54.0, person: 69.5 }, urban: { male: 84.3, female: 36.9, person: 60.9 }, total: { male: 84.3, female: 46.3, person: 65.7 } }, wpr: { rural: { male: 78.4, female: 45.0, person: 62.1 }, urban: { male: 78.4, female: 26.3, person: 52.7 }, total: { male: 78.4, female: 36.7, person: 58.0 } }, ur: { rural: { male: 6.9, female: 16.6, person: 10.6 }, urban: { male: 7.0, female: 28.6, person: 13.5 }, total: { male: 7.0, female: 20.9, person: 11.8 } } },
  { id: 'OD', name: 'Odisha', lfpr: { rural: { male: 82.9, female: 52.6, person: 67.1 }, urban: { male: 75.0, female: 30.8, person: 53.2 }, total: { male: 81.7, female: 49.4, person: 64.9 } }, wpr: { rural: { male: 80.5, female: 51.5, person: 65.4 }, urban: { male: 70.8, female: 27.8, person: 49.6 }, total: { male: 78.9, female: 48.0, person: 62.9 } }, ur: { rural: { male: 2.9, female: 2.0, person: 2.6 }, urban: { male: 5.6, female: 9.7, person: 6.8 }, total: { male: 3.3, female: 2.7, person: 3.1 } } },
  { id: 'GJ', name: 'Gujarat', lfpr: { rural: { male: 84.9, female: 57.9, person: 71.5 }, urban: { male: 79.3, female: 29.6, person: 55.4 }, total: { male: 82.4, female: 46.0, person: 64.6 } }, wpr: { rural: { male: 84.5, female: 57.8, person: 71.3 }, urban: { male: 77.7, female: 28.6, person: 54.1 }, total: { male: 81.5, female: 45.6, person: 63.9 } }, ur: { rural: { male: 0.5, female: 0.2, person: 0.4 }, urban: { male: 2.0, female: 3.3, person: 2.3 }, total: { male: 1.1, female: 1.0, person: 1.1 } } },
  { id: 'RJ', name: 'Rajasthan', lfpr: { rural: { male: 80.2, female: 58.7, person: 69.1 }, urban: { male: 73.4, female: 29.9, person: 52.4 }, total: { male: 78.2, female: 50.9, person: 64.4 } }, wpr: { rural: { male: 77.5, female: 57.1, person: 67.0 }, urban: { male: 68.6, female: 26.7, person: 48.3 }, total: { male: 74.8, female: 48.9, person: 61.7 } }, ur: { rural: { male: 3.5, female: 2.7, person: 3.1 }, urban: { male: 6.5, female: 10.9, person: 7.7 }, total: { male: 4.3, female: 4.0, person: 4.2 } } },
  { id: 'JK', name: 'Jammu and Kashmir', lfpr: { rural: { male: 76.0, female: 56.8, person: 66.7 }, urban: { male: 74.6, female: 33.1, person: 54.5 }, total: { male: 75.7, female: 52.1, person: 64.3 } }, wpr: { rural: { male: 73.4, female: 52.8, person: 63.4 }, urban: { male: 71.0, female: 24.1, person: 48.3 }, total: { male: 72.9, female: 47.1, person: 60.4 } }, ur: { rural: { male: 3.5, female: 7.1, person: 5.0 }, urban: { male: 4.8, female: 27.2, person: 11.4 }, total: { male: 3.8, female: 9.7, person: 6.1 } } },
  { id: 'JH', name: 'Jharkhand', lfpr: { rural: { male: 80.9, female: 57.3, person: 68.7 }, urban: { male: 68.8, female: 19.4, person: 44.5 }, total: { male: 78.3, female: 49.8, person: 63.8 } }, wpr: { rural: { male: 80.2, female: 57.2, person: 68.4 }, urban: { male: 64.8, female: 18.3, person: 41.9 }, total: { male: 76.9, female: 49.6, person: 63.0 } }, ur: { rural: { male: 0.8, female: 0.1, person: 0.5 }, urban: { male: 5.8, female: 5.8, person: 5.8 }, total: { male: 1.8, female: 0.5, person: 1.3 } } },
  { id: 'TR', name: 'Tripura', lfpr: { rural: { male: 81.0, female: 50.7, person: 66.0 }, urban: { male: 69.2, female: 31.4, person: 49.9 }, total: { male: 78.9, female: 47.1, person: 63.0 } }, wpr: { rural: { male: 79.7, female: 50.1, person: 65.1 }, urban: { male: 67.4, female: 30.0, person: 48.3 }, total: { male: 77.5, female: 46.3, person: 62.0 } }, ur: { rural: { male: 1.6, female: 1.2, person: 1.4 }, urban: { male: 2.7, female: 4.4, person: 3.2 }, total: { male: 1.7, female: 1.6, person: 1.7 } } },
  { id: 'LA', name: 'Ladakh', lfpr: { rural: { male: 72.5, female: 54.3, person: 63.6 }, urban: { male: 73.1, female: 33.0, person: 55.1 }, total: { male: 72.5, female: 51.6, person: 62.5 } }, wpr: { rural: { male: 71.0, female: 50.7, person: 61.1 }, urban: { male: 69.0, female: 21.7, person: 47.7 }, total: { male: 70.7, female: 47.1, person: 59.3 } }, ur: { rural: { male: 2.0, female: 6.6, person: 3.9 }, urban: { male: 5.6, female: 34.4, person: 13.4 }, total: { male: 2.6, female: 8.8, person: 5.1 } } },
  { id: 'TS', name: 'Telangana', lfpr: { rural: { male: 79.5, female: 55.7, person: 67.1 }, urban: { male: 76.9, female: 31.8, person: 54.4 }, total: { male: 78.5, female: 46.7, person: 62.2 } }, wpr: { rural: { male: 76.6, female: 54.0, person: 64.8 }, urban: { male: 72.2, female: 28.5, person: 50.4 }, total: { male: 74.8, female: 44.3, person: 59.2 } }, ur: { rural: { male: 3.7, female: 3.1, person: 3.5 }, urban: { male: 6.0, female: 10.4, person: 7.3 }, total: { male: 4.6, female: 5.0, person: 4.8 } } },
  { id: 'WB', name: 'West Bengal', lfpr: { rural: { male: 84.0, female: 43.9, person: 63.7 }, urban: { male: 79.0, female: 32.4, person: 55.4 }, total: { male: 82.4, female: 40.4, person: 61.1 } }, wpr: { rural: { male: 82.1, female: 42.9, person: 62.2 }, urban: { male: 76.9, female: 30.8, person: 53.5 }, total: { male: 80.5, female: 39.2, person: 59.6 } }, ur: { rural: { male: 2.2, female: 2.3, person: 2.2 }, urban: { male: 2.6, female: 5.0, person: 3.3 }, total: { male: 2.3, female: 3.0, person: 2.5 } } },
  { id: 'UK', name: 'Uttarakhand', lfpr: { rural: { male: 76.9, female: 52.6, person: 64.5 }, urban: { male: 75.0, female: 24.4, person: 49.5 }, total: { male: 76.4, female: 45.6, person: 60.7 } }, wpr: { rural: { male: 73.2, female: 51.2, person: 61.9 }, urban: { male: 72.4, female: 21.2, person: 46.6 }, total: { male: 73.0, female: 43.7, person: 58.1 } }, ur: { rural: { male: 4.8, female: 2.7, person: 3.9 }, urban: { male: 3.5, female: 13.0, person: 5.8 }, total: { male: 4.5, female: 4.1, person: 4.3 } } },
  { id: 'AP', name: 'Andhra Pradesh', lfpr: { rural: { male: 77.9, female: 51.2, person: 64.2 }, urban: { male: 73.9, female: 30.2, person: 51.3 }, total: { male: 76.7, female: 44.8, person: 60.2 } }, wpr: { rural: { male: 75.0, female: 49.7, person: 62.0 }, urban: { male: 69.8, female: 28.1, person: 48.2 }, total: { male: 73.4, female: 43.1, person: 57.8 } }, ur: { rural: { male: 3.8, female: 2.9, person: 3.4 }, urban: { male: 5.5, female: 6.9, person: 5.9 }, total: { male: 4.3, female: 3.7, person: 4.1 } } },
  { id: 'MN', name: 'Manipur', lfpr: { rural: { male: 71.6, female: 49.6, person: 60.5 }, urban: { male: 68.8, female: 46.6, person: 57.5 }, total: { male: 70.8, female: 48.7, person: 59.6 } }, wpr: { rural: { male: 68.2, female: 46.3, person: 57.2 }, urban: { male: 65.0, female: 41.8, person: 53.1 }, total: { male: 67.2, female: 45.0, person: 56.0 } }, ur: { rural: { male: 4.7, female: 6.6, person: 5.5 }, urban: { male: 5.6, female: 10.3, person: 7.5 }, total: { male: 5.0, female: 7.7, person: 6.1 } } },
  { id: 'MH', name: 'Maharashtra', lfpr: { rural: { male: 77.8, female: 48.0, person: 63.0 }, urban: { male: 76.4, female: 29.4, person: 53.6 }, total: { male: 77.2, female: 40.1, person: 59.0 } }, wpr: { rural: { male: 75.7, female: 47.4, person: 61.6 }, urban: { male: 72.7, female: 27.6, person: 50.9 }, total: { male: 74.4, female: 39.1, person: 57.0 } }, ur: { rural: { male: 2.8, female: 1.1, person: 2.1 }, urban: { male: 4.9, female: 6.0, person: 5.2 }, total: { male: 3.7, female: 2.7, person: 3.3 } } },
  { id: 'TN', name: 'Tamil Nadu', lfpr: { rural: { male: 77.0, female: 54.2, person: 65.2 }, urban: { male: 74.2, female: 30.2, person: 51.3 }, total: { male: 75.7, female: 43.2, person: 58.8 } }, wpr: { rural: { male: 74.3, female: 52.7, person: 63.1 }, urban: { male: 71.8, female: 28.4, person: 49.2 }, total: { male: 73.2, female: 41.5, person: 56.8 } }, ur: { rural: { male: 3.5, female: 2.7, person: 3.1 }, urban: { male: 3.2, female: 6.0, person: 4.1 }, total: { male: 3.4, female: 3.8, person: 3.5 } } },
  { id: 'UP', name: 'Uttar Pradesh', lfpr: { rural: { male: 80.5, female: 39.1, person: 59.5 }, urban: { male: 76.2, female: 17.5, person: 47.7 }, total: { male: 79.5, female: 34.5, person: 56.9 } }, wpr: { rural: { male: 78.4, female: 38.5, person: 58.1 }, urban: { male: 71.8, female: 15.6, person: 44.5 }, total: { male: 76.9, female: 33.6, person: 55.1 } }, ur: { rural: { male: 2.6, female: 1.5, person: 2.2 }, urban: { male: 5.7, female: 11.0, person: 6.7 }, total: { male: 3.3, female: 2.5, person: 3.1 } } },
  { id: 'KA', name: 'Karnataka', lfpr: { rural: { male: 76.3, female: 43.5, person: 59.8 }, urban: { male: 74.1, female: 28.8, person: 51.7 }, total: { male: 75.5, female: 38.0, person: 56.8 } }, wpr: { rural: { male: 74.4, female: 43.1, person: 58.7 }, urban: { male: 71.1, female: 27.5, person: 49.6 }, total: { male: 73.1, female: 37.2, person: 55.2 } }, ur: { rural: { male: 2.5, female: 0.9, person: 1.9 }, urban: { male: 4.1, female: 4.4, person: 4.2 }, total: { male: 3.1, female: 1.9, person: 2.7 } } },
  { id: 'KL', name: 'Kerala', lfpr: { rural: { male: 75.3, female: 44.2, person: 58.6 }, urban: { male: 73.5, female: 37.0, person: 53.7 }, total: { male: 74.4, female: 40.8, person: 56.2 } }, wpr: { rural: { male: 71.8, female: 38.8, person: 54.1 }, urban: { male: 70.4, female: 33.0, person: 50.1 }, total: { male: 71.1, female: 36.0, person: 52.2 } }, ur: { rural: { male: 4.6, female: 12.1, person: 7.7 }, urban: { male: 4.2, female: 10.9, person: 6.7 }, total: { male: 4.4, female: 11.6, person: 7.2 } } },
  { id: 'PB', name: 'Punjab', lfpr: { rural: { male: 80.1, female: 34.9, person: 57.4 }, urban: { male: 79.4, female: 24.6, person: 52.9 }, total: { male: 79.8, female: 31.1, person: 55.7 } }, wpr: { rural: { male: 76.0, female: 32.7, person: 54.3 }, urban: { male: 75.7, female: 22.4, person: 49.9 }, total: { male: 75.9, female: 28.9, person: 52.7 } }, ur: { rural: { male: 5.1, female: 6.2, person: 5.4 }, urban: { male: 4.7, female: 8.6, person: 5.6 }, total: { male: 4.9, female: 6.9, person: 5.5 } } },
  { id: 'CH', name: 'Chandigarh', lfpr: { rural: { male: 76.9, female: 31.0, person: 54.7 }, urban: { male: 76.9, female: 31.0, person: 54.7 }, total: { male: 76.9, female: 31.0, person: 54.7 } }, wpr: { rural: { male: 73.9, female: 26.2, person: 50.9 }, urban: { male: 73.9, female: 26.2, person: 50.9 }, total: { male: 73.9, female: 26.2, person: 50.9 } }, ur: { rural: { male: 3.9, female: 15.3, person: 7.1 }, urban: { male: 3.9, female: 15.3, person: 7.1 }, total: { male: 3.9, female: 15.3, person: 7.1 } } },
  { id: 'MZ', name: 'Mizoram', lfpr: { rural: { male: 67.4, female: 42.6, person: 55.7 }, urban: { male: 64.5, female: 40.6, person: 52.5 }, total: { male: 66.1, female: 41.7, person: 54.2 } }, wpr: { rural: { male: 66.3, female: 42.2, person: 54.9 }, urban: { male: 62.4, female: 39.1, person: 50.7 }, total: { male: 64.6, female: 40.7, person: 53.0 } }, ur: { rural: { male: 1.5, female: 1.0, person: 1.3 }, urban: { male: 3.2, female: 3.9, person: 3.4 }, total: { male: 2.2, female: 2.4, person: 2.3 } } },
  { id: 'BR', name: 'Bihar', lfpr: { rural: { male: 76.8, female: 32.0, person: 54.3 }, urban: { male: 67.8, female: 16.7, person: 43.4 }, total: { male: 75.8, female: 30.5, person: 53.2 } }, wpr: { rural: { male: 74.2, female: 31.7, person: 52.8 }, urban: { male: 63.1, female: 15.1, person: 40.3 }, total: { male: 73.1, female: 30.1, person: 51.6 } }, ur: { rural: { male: 3.3, female: 1.0, person: 2.6 }, urban: { male: 6.8, female: 9.2, person: 7.3 }, total: { male: 3.6, female: 1.4, person: 3.0 } } },
  { id: 'PY', name: 'Puducherry', lfpr: { rural: { male: 73.1, female: 42.5, person: 57.3 }, urban: { male: 73.4, female: 29.4, person: 49.4 }, total: { male: 73.3, female: 34.2, person: 52.4 } }, wpr: { rural: { male: 73.0, female: 40.5, person: 56.2 }, urban: { male: 68.8, female: 27.4, person: 46.2 }, total: { male: 70.5, female: 32.2, person: 50.0 } }, ur: { rural: { male: 0.1, female: 4.7, person: 1.9 }, urban: { male: 6.3, female: 6.9, person: 6.5 }, total: { male: 3.9, female: 5.9, person: 4.6 } } },
  { id: 'GA', name: 'Goa', lfpr: { rural: { male: 75.9, female: 27.5, person: 52.0 }, urban: { male: 72.8, female: 30.5, person: 51.6 }, total: { male: 74.1, female: 29.3, person: 51.8 } }, wpr: { rural: { male: 70.5, female: 23.7, person: 47.4 }, urban: { male: 70.0, female: 24.9, person: 47.4 }, total: { male: 70.2, female: 24.4, person: 47.4 } }, ur: { rural: { male: 7.1, female: 13.8, person: 8.9 }, urban: { male: 3.8, female: 18.6, person: 8.2 }, total: { male: 5.2, female: 16.7, person: 8.5 } } },
  { id: 'HR', name: 'Haryana', lfpr: { rural: { male: 71.9, female: 26.3, person: 50.0 }, urban: { male: 73.9, female: 20.8, person: 48.6 }, total: { male: 72.7, female: 24.2, person: 49.5 } }, wpr: { rural: { male: 69.3, female: 25.9, person: 48.5 }, urban: { male: 70.9, female: 20.1, person: 46.7 }, total: { male: 69.9, female: 23.6, person: 47.8 } }, ur: { rural: { male: 3.6, female: 1.7, person: 3.1 }, urban: { male: 4.1, female: 3.3, person: 4.0 }, total: { male: 3.8, female: 2.2, person: 3.4 } } },
  { id: 'LD', name: 'Lakshadweep', lfpr: { rural: { male: 83.0, female: 20.4, person: 57.0 }, urban: { male: 71.0, female: 15.9, person: 45.0 }, total: { male: 74.7, female: 17.1, person: 48.5 } }, wpr: { rural: { male: 82.0, female: 10.4, person: 52.3 }, urban: { male: 63.1, female: 11.6, person: 38.8 }, total: { male: 69.0, female: 11.3, person: 42.7 } }, ur: { rural: { male: 1.2, female: 49.1, person: 8.3 }, urban: { male: 11.1, female: 27.2, person: 13.8 }, total: { male: 7.7, female: 34.1, person: 11.9 } } },
  { id: 'DL', name: 'Delhi', lfpr: { rural: { male: 79.9, female: 17.9, person: 52.5 }, urban: { male: 69.9, female: 18.5, person: 46.3 }, total: { male: 70.1, female: 18.5, person: 46.4 } }, wpr: { rural: { male: 77.0, female: 14.5, person: 49.4 }, urban: { male: 68.3, female: 18.3, person: 45.4 }, total: { male: 68.6, female: 18.3, person: 45.5 } }, ur: { rural: { male: 3.6, female: 19.5, person: 6.0 }, urban: { male: 2.2, female: 1.1, person: 2.0 }, total: { male: 2.2, female: 1.5, person: 2.1 } } },
];

/** National trend, 2017-18 to 2023-24. */
export const MOSPI_TREND: Record<IndicatorId, Record<string, Split>> = {
  lfpr: {
    '2017-18': { rural: { male: 76.4, female: 24.6, person: 50.7 }, urban: { male: 74.5, female: 20.4, person: 47.6 }, total: { male: 75.8, female: 23.3, person: 49.8 } },
    '2018-19': { rural: { male: 76.4, female: 26.4, person: 51.5 }, urban: { male: 73.7, female: 20.4, person: 47.5 }, total: { male: 75.5, female: 24.5, person: 50.2 } },
    '2019-20': { rural: { male: 77.9, female: 33.0, person: 55.5 }, urban: { male: 74.6, female: 23.3, person: 49.3 }, total: { male: 76.8, female: 30.0, person: 53.5 } },
    '2020-21': { rural: { male: 78.1, female: 36.5, person: 57.4 }, urban: { male: 74.6, female: 23.2, person: 49.1 }, total: { male: 77.0, female: 32.5, person: 54.9 } },
    '2021-22': { rural: { male: 78.2, female: 36.6, person: 57.5 }, urban: { male: 74.7, female: 23.8, person: 49.7 }, total: { male: 77.2, female: 32.8, person: 55.2 } },
    '2022-23': { rural: { male: 80.2, female: 41.5, person: 60.8 }, urban: { male: 74.5, female: 25.4, person: 50.4 }, total: { male: 78.5, female: 37.0, person: 57.9 } },
    '2023-24': { rural: { male: 80.2, female: 47.6, person: 63.7 }, urban: { male: 75.6, female: 28.0, person: 52.0 }, total: { male: 78.8, female: 41.7, person: 60.1 } },
  },
  wpr: {
    '2017-18': { rural: { male: 72.0, female: 23.7, person: 48.1 }, urban: { male: 69.3, female: 18.2, person: 43.9 }, total: { male: 71.2, female: 22.0, person: 46.8 } },
    '2018-19': { rural: { male: 72.2, female: 25.5, person: 48.9 }, urban: { male: 68.6, female: 18.4, person: 43.9 }, total: { male: 71.0, female: 23.3, person: 47.3 } },
    '2019-20': { rural: { male: 74.4, female: 32.2, person: 53.3 }, urban: { male: 69.9, female: 21.3, person: 45.8 }, total: { male: 73.0, female: 28.7, person: 50.9 } },
    '2020-21': { rural: { male: 75.1, female: 35.8, person: 55.5 }, urban: { male: 70.0, female: 21.2, person: 45.8 }, total: { male: 73.5, female: 31.4, person: 52.6 } },
    '2021-22': { rural: { male: 75.3, female: 35.8, person: 55.6 }, urban: { male: 70.4, female: 21.9, person: 46.6 }, total: { male: 73.8, female: 31.7, person: 52.9 } },
    '2022-23': { rural: { male: 78.0, female: 40.7, person: 59.4 }, urban: { male: 71.0, female: 23.5, person: 47.7 }, total: { male: 76.0, female: 35.9, person: 56.0 } },
    '2023-24': { rural: { male: 78.1, female: 46.5, person: 62.1 }, urban: { male: 72.3, female: 26.0, person: 49.4 }, total: { male: 76.3, female: 40.3, person: 58.2 } },
  },
  ur: {
    '2017-18': { rural: { male: 5.7, female: 3.8, person: 5.3 }, urban: { male: 6.9, female: 10.8, person: 7.7 }, total: { male: 6.1, female: 5.6, person: 6.0 } },
    '2018-19': { rural: { male: 5.5, female: 3.5, person: 5.0 }, urban: { male: 7.0, female: 9.8, person: 7.6 }, total: { male: 6.0, female: 5.1, person: 5.8 } },
    '2019-20': { rural: { male: 4.5, female: 2.6, person: 3.9 }, urban: { male: 6.4, female: 8.9, person: 6.9 }, total: { male: 5.0, female: 4.2, person: 4.8 } },
    '2020-21': { rural: { male: 3.8, female: 2.1, person: 3.3 }, urban: { male: 6.1, female: 8.6, person: 6.7 }, total: { male: 4.5, female: 3.5, person: 4.2 } },
    '2021-22': { rural: { male: 3.8, female: 2.1, person: 3.2 }, urban: { male: 5.8, female: 7.9, person: 6.3 }, total: { male: 4.4, female: 3.3, person: 4.1 } },
    '2022-23': { rural: { male: 2.7, female: 1.8, person: 2.4 }, urban: { male: 4.7, female: 7.5, person: 5.4 }, total: { male: 3.3, female: 2.9, person: 3.2 } },
    '2023-24': { rural: { male: 2.7, female: 2.1, person: 2.5 }, urban: { male: 4.4, female: 7.1, person: 5.1 }, total: { male: 3.2, female: 3.2, person: 3.2 } },
  },

};

export const TREND_YEARS = ["2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24"];

export function specOf(id: IndicatorId): IndicatorSpec {
  return INDICATORS.find((i) => i.id === id) ?? INDICATORS[0];
}

export function valueOf(row: StateRow, ind: IndicatorId, res: Residence, sex: Sex): number | null {
  return row[ind][res][sex];
}

export function indiaValue(ind: IndicatorId, res: Residence, sex: Sex): number | null {
  return MOSPI_INDIA[ind][res][sex];
}

export function trendValue(ind: IndicatorId, year: string, res: Residence, sex: Sex): number | null {
  const s = MOSPI_TREND[ind]?.[year];
  return s ? s[res][sex] : null;
}

export interface RankedRow {
  id: string;
  name: string;
  value: number;
  rank: number;
}

/** Every State/UT with a value for this selection, ranked best-first. */
export function ranked(ind: IndicatorId, res: Residence, sex: Sex): RankedRow[] {
  const better = specOf(ind).better ?? 'higher';
  const rows = MOSPI_STATES
    .map((s) => ({ id: s.id, name: s.name, value: valueOf(s, ind, res, sex) }))
    .filter((r): r is { id: string; name: string; value: number } => typeof r.value === 'number');
  rows.sort((a, b) => (better === 'lower' ? a.value - b.value : b.value - a.value));
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

export interface Summary {
  n: number;
  min: { name: string; value: number };
  max: { name: string; value: number };
  median: number;
  mean: number;
  spread: number;
}

export function summary(rows: RankedRow[]): Summary | null {
  if (!rows.length) return null;
  const vals = rows.map((r) => r.value).slice().sort((a, b) => a - b);
  const mid = Math.floor(vals.length / 2);
  const median = vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
  const lo = rows.reduce((a, b) => (b.value < a.value ? b : a));
  const hi = rows.reduce((a, b) => (b.value > a.value ? b : a));
  return {
    n: rows.length,
    min: { name: lo.name, value: lo.value },
    max: { name: hi.name, value: hi.value },
    median,
    mean: vals.reduce((a, b) => a + b, 0) / vals.length,
    spread: hi.value - lo.value,
  };
}

/** Gap between the male and female value for each State, in percentage points. */
export function genderGap(ind: IndicatorId, res: Residence): RankedRow[] {
  const rows = MOSPI_STATES
    .map((s) => {
      const m = valueOf(s, ind, res, 'male');
      const f = valueOf(s, ind, res, 'female');
      return typeof m === 'number' && typeof f === 'number'
        ? { id: s.id, name: s.name, value: m - f }
        : null;
    })
    .filter((r): r is { id: string; name: string; value: number } => r !== null);
  rows.sort((a, b) => b.value - a.value);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

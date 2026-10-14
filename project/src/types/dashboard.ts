import type {
  Feature,
  FeatureCollection,
  Point,
  Polygon,
  MultiPolygon,
} from 'geojson';
export const YEARS = [2016, 2021, 2026, 2031] as const;
export type AnalysisYear = (typeof YEARS)[number];
export type VulnerabilityField = 'vuln' | 'vuln_15' | 'vuln_20' | 'vuln_25';
export type VulnerabilityClass = '확정' | '경계' | '비취약';
export type VulnerabilityValue = VulnerabilityClass | 'missing';
export type LisaCluster = 'HH' | 'LL' | 'HL' | 'LH' | 'NS';
export const VULNERABILITY_FIELDS: Array<{
  value: VulnerabilityField;
  label: string;
}> = [
  { value: 'vuln', label: '기본 분류' },
  { value: 'vuln_15', label: '민감도 분석 15' },
  { value: 'vuln_20', label: '민감도 분석 20' },
  { value: 'vuln_25', label: '민감도 분석 25' },
];
export const VULNERABILITY_INFO: Record<
  VulnerabilityValue,
  { label: string; color: string; description: string }
> = {
  확정: {
    label: '확정 취약',
    color: '#E74C3C',
    description: '제공된 분류에서 확정 취약으로 표시된 지역입니다.',
  },
  경계: {
    label: '경계',
    color: '#F39C12',
    description: '제공된 분류에서 경계로 표시된 지역입니다.',
  },
  비취약: {
    label: '비취약',
    color: '#27AE60',
    description:
      '제공된 분류에서 비취약으로 표시된 지역입니다. 안전을 보장하는 뜻은 아닙니다.',
  },
  missing: {
    label: '자료 없음',
    color: '#94A3B8',
    description: '해당 분류 값이 제공되지 않았습니다.',
  },
};
export const VULNERABILITY_ORDER: VulnerabilityValue[] = [
  '확정',
  '경계',
  '비취약',
  'missing',
];
export const LISA_INFO: Record<
  LisaCluster,
  { label: string; description: string }
> = {
  HH: {
    label: 'HH (고-고)',
    description: '높은 접근성이 높은 접근성 지역과 함께 형성된 군집입니다.',
  },
  LL: {
    label: 'LL (저-저)',
    description: '낮은 접근성이 낮은 접근성 지역과 함께 형성된 군집입니다.',
  },
  HL: {
    label: 'HL (고-저)',
    description:
      '높은 접근성 지역 주변에 낮은 접근성 지역이 나타나는 이상치입니다.',
  },
  LH: {
    label: 'LH (저-고)',
    description:
      '낮은 접근성 지역 주변에 높은 접근성 지역이 나타나는 이상치입니다.',
  },
  NS: {
    label: 'NS (유의하지 않음)',
    description: '유의미한 공간 군집으로 표시되지 않은 결과입니다.',
  },
};
export const LISA_DEFINITION_HELP =
  '접근성 군집 결과입니다. 분석 변수와 공간가중치의 세부 정의는 제공 자료만으로 확인할 수 없어 추가 확인이 필요합니다.';
export const D_BUS_W_HELP =
  '가중 버스 거리(원자료 d_bus_w)입니다. 산출식이 제공되지 않아 정의 확인이 필요하며 단위를 임의로 단정하지 않습니다.';
export const ACC_INDEX_HELP =
  '2SFCA 접근성 지수(원자료 단위)입니다. 값이 클수록 접근성이 높습니다. 임의의 점수로 환산하지 않습니다.';
export const POLICY_MISSING_LABEL = '제공된 정책 우선순위 목록에 없음';
export const SCENARIO_NOTICE =
  '2031년은 예측이 아니라 의료 공급이 2026년 그대로일 때의 시나리오. 고령인구는 2026 주민등록에 인천 생명표 생존율과 통계청 장래인구추계 증가율을 적용했고, 신규 아파트 입주에 따른 유입은 반영하지 않음.';
export interface DongHistoryFields {
  eld_ratio_2016: number | null;
  eld_ratio_2021: number | null;
  eld_ratio_2026: number | null;
  d_ratio_16_26: number | null;
  eld_gr_16_26: number | null;
  gu: string | null;
  aging_rank: number | null;
  aging_fast: number | null;
  eld_2016: number | null;
  pop_2016: number | null;
  eld_2021: number | null;
  pop_2021: number | null;
  hist_merged: number | null;
  eld_2031_trend: number | null;
  acc_600_2031: number | null;
  acc_1000_2031: number | null;
  eld_gr_26_31: number | null;
  acc_600_chg: number | null;
  vuln_2031: string | null;
  vuln_2031_rel: string | null;
  eld_2031_raw: number | null;
  eld_2031: number | null;
}
export interface DongRecord {
  adm_cd: string;
  adm_nm: string;
  sgg_nm: string | null;
  mois_codes: string | null;
  pop_total: number | null;
  eld_65: number | null;
  eld_single: number | null;
  eld_ratio: number | null;
  eld_single_ratio: number | null;
  doc_S_in_dong: number | null;
  doc_per_1k_eld: number | null;
  building_count: number | null;
  eld_allocated: number | null;
  eld_unallocated: number | null;
  accessibility_eligible: number | null;
  exclusion_reason: string | null;
  population_reference: string | null;
  boundary_reference: string | null;
  d_bus_w: number | null;
  acc_600: number | null;
  acc_1000: number | null;
  nofac_600_ratio: number | null;
  island: number | null;
  vuln_15: string | null;
  vuln_20: string | null;
  vuln_25: string | null;
  vuln: string | null;
  lisa: LisaCluster | null;
  lisa_p: number | null;
  pattern: string | null;
  cluster: string | null;
  cluster_nm: string | null;
  unit: string | null;
  policy: string | null;
  rank: number | null;
  region: string | null;
  hub: string | null;
  acc_600_z: number | null;
  d_bus_w_z: number | null;
  eld_single_ratio_z: number | null;
  policyJoinStatus: 'unique' | 'ambiguous' | 'missing';
  history: DongHistoryFields;
}
export interface PolicyPriorityRow {
  rank: number | null;
  adm_nm: string;
  vuln: string | null;
  pattern: string | null;
  unit: string | null;
  cluster_nm: string | null;
  policy: string | null;
  region: string | null;
  eld_65: number | null;
  eld_single: number | null;
  acc_600_z: number | null;
  d_bus_w_z: number | null;
  eld_single_ratio_z: number | null;
  matchedAdmCd: string | null;
  joinStatus: 'unique' | 'ambiguous' | 'missing';
}
export interface BoundaryProperties {
  fid?: number | string;
  adm_cd: string;
  adm_nm: string;
  sgg_nm?: string | null;
  boundary_date?: string | null;
  [key: string]: unknown;
}
export type BoundaryFeature = Feature<
  Polygon | MultiPolygon,
  BoundaryProperties
>;
export type BoundaryCollection = FeatureCollection<
  Polygon | MultiPolygon,
  BoundaryProperties
>;
export interface FacilityProperties {
  fid?: number | string;
  fac_id: string;
  name: string;
  type: string;
  S: number | null;
  chronic_spec: number | null;
  chronic_gp: number | null;
  adm_cd: string | null;
  adm_nm: string | null;
  address: string | null;
  admin_join_ok: number;
  [key: string]: unknown;
}
export type FacilityFeature = Feature<Point, FacilityProperties>;
export type FacilityCollection = FeatureCollection<Point, FacilityProperties>;
export interface JoinValidation {
  currentRowCount: number;
  historyRowCount: number;
  policyRowCount: number;
  boundaryFeatureCount: number;
  facilityFeatureCount: number;
  matchedFacilityCount: number;
  unmatchedFacilityCount: number;
  currentDuplicateCodes: string[];
  historyDuplicateCodes: string[];
  boundaryDuplicateCodes: string[];
  codesOnlyInCurrent: string[];
  codesOnlyInHistory: string[];
  codesOnlyInBoundary: string[];
  sharedColumnDisagreements: string[];
  policyJoinMessages: string[];
  warnings: string[];
}
export interface DashboardData {
  records: DongRecord[];
  byCode: Record<string, DongRecord>;
  boundaries: BoundaryCollection;
  facilities: FacilityCollection;
  policies: PolicyPriorityRow[];
  validation: JoinValidation;
}
export function vulnerabilityFromValue(
  value: string | null | undefined,
): VulnerabilityValue {
  if (value === '확정' || value === '경계' || value === '비취약') return value;
  return 'missing';
}
export function normalizeLisa(value: string | null): LisaCluster | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return normalized === 'HH' ||
    normalized === 'LL' ||
    normalized === 'HL' ||
    normalized === 'LH' ||
    normalized === 'NS'
    ? normalized
    : null;
}
export function isVulnerable(value: string | null | undefined): boolean {
  return value === '확정' || value === '경계';
}

export function has2016PopulationData(
  record: Pick<DongRecord, 'history'>,
): boolean {
  return (
    record.history.eld_2016 !== null ||
    record.history.pop_2016 !== null ||
    record.history.eld_ratio_2016 !== null
  );
}

export type VulnClass = '확정' | '경계' | '비취약';

export type VulnField = 'vuln' | 'vuln_15' | 'vuln_20' | 'vuln_25';

export type LisaClusterType = 'HH' | 'LL' | 'HL' | 'LH' | 'NS';

export type PatternType = '산발형' | '밀집형' | '고립형';

export type KmeansClusterId = '1' | '2' | '3' | '4' | '도서형';

export const POLICY_MISSING_LABEL = '제공된 정책 우선순위 목록에 없음';

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
  lisa: string | null;
  lisaDisplay: LisaClusterType | string | null;
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
  policyJoinStatus: 'unique' | 'none';
  history: DongHistoryFields | null;
}

export type PersonaVisualGrade = 'high' | 'mediumHigh' | 'moderate' | 'low';

export interface Persona {
  id: number;
  visualGrade: PersonaVisualGrade;
  title: string;
  name: string;
  age: number;
  location: string;
  description: string;
  challenges: string[];
  needs: string[];
  icon: string;
  gradient: string;
}

export interface GeoJSONFeatureProperties {
  adm_cd?: string;
  name?: string;
  adm_nm?: string;
  base_year?: string;
  name_eng?: string;
  code?: string;
  [key: string]: unknown;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties: GeoJSONFeatureProperties;
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface JoinValidation {
  currentRowCount: number;
  historyRowCount: number;
  policyRowCount: number;
  currentDuplicateCodes: string[];
  historyDuplicateCodes: string[];
  codesOnlyInCurrent: string[];
  codesOnlyInHistory: string[];
  sharedColumnDisagreements: string[];
  policyJoinMessages: string[];
  warnings: string[];
}

export const VULN_FIELD_INFO: Record<VulnField, { label: string; help: string }> = {
  vuln: {
    label: '기본 분류(vuln)',
    help: '원자료에 제공된 취약 분류입니다. 브라우저에서 임계값을 다시 계산하지 않습니다.',
  },
  vuln_15: {
    label: '민감도 vuln_15',
    help: '원자료 민감도 분석 분류입니다. 임계값을 다시 계산하지 않습니다.',
  },
  vuln_20: {
    label: '민감도 vuln_20',
    help: '원자료 민감도 분석 분류입니다. 임계값을 다시 계산하지 않습니다.',
  },
  vuln_25: {
    label: '민감도 vuln_25',
    help: '원자료 민감도 분석 분류입니다. 임계값을 다시 계산하지 않습니다.',
  },
};

export const VULN_INFO: Record<VulnClass | 'missing', {
  label: string;
  color: string;
  description: string;
}> = {
  확정: {
    label: '확정 취약',
    color: '#EF4444',
    description: '원자료에서 확정 취약으로 분류된 행정동입니다. 분류는 제공된 값을 그대로 사용합니다.',
  },
  경계: {
    label: '경계',
    color: '#F59E0B',
    description: '원자료에서 경계로 분류된 행정동입니다. 확정 취약과 비취약 사이의 민감 구간입니다.',
  },
  비취약: {
    label: '비취약',
    color: '#64748B',
    description: '원자료에서 비취약으로 분류된 행정동입니다. 비취약은 안전 보장을 의미하지 않습니다.',
  },
  missing: {
    label: '자료 없음',
    color: '#334155',
    description: '해당 민감도 필드에 분류 값이 없습니다.',
  },
};

export const VULN_LEGEND_ORDER: Array<VulnClass | 'missing'> = ['확정', '경계', '비취약', 'missing'];

export const LISA_INFO: Record<LisaClusterType, { label: string; description: string }> = {
  HH: {
    label: 'HH (고-고)',
    description: '높은 접근성이 높은 접근성 지역에 둘러싸인 접근성 군집입니다.',
  },
  LL: {
    label: 'LL (저-저)',
    description: '낮은 접근성이 낮은 접근성 지역에 둘러싸인 접근성 군집입니다.',
  },
  HL: {
    label: 'HL (고-저)',
    description: '높은 접근성이 낮은 접근성 지역에 둘러싸인 이상치입니다.',
  },
  LH: {
    label: 'LH (저-고)',
    description: '낮은 접근성이 높은 접근성 지역에 둘러싸인 이상치입니다.',
  },
  NS: {
    label: 'NS (유의하지 않음)',
    description: '유의미한 공간 군집으로 제시되지 않은 결과입니다.',
  },
};

export const LISA_DEFINITION_HELP =
  'LISA는 제공된 공간군집 결과입니다. 정확한 분석 변수와 공간가중치 정의는 원자료에 별도 문서가 없어 확인이 필요합니다.';

export const D_BUS_W_HELP =
  '가중 버스 거리(원자료 d_bus_w)입니다. 정확한 산출식은 확인이 필요하며, 검증 전에 미터 단위로 단정하지 않습니다. 교통 접근성 백분율로 사용하지 않습니다.';

export const ACC_INDEX_HELP =
  '2SFCA 접근성 지수(원자료 단위)입니다. 값이 클수록 접근성이 더 좋습니다. 임의의 0–100 점수나 취약성 점수로 변환하지 않습니다.';

export const KMEANS_CLUSTER_INFO: Record<KmeansClusterId, { label: string; color: string; description: string }> = {
  '1': { label: '군집 1', color: '#38BDF8', description: 'K-means 숫자 군집 1. 군집명은 cluster_nm을 그대로 표시합니다.' },
  '2': { label: '군집 2', color: '#A78BFA', description: 'K-means 숫자 군집 2. 군집명은 cluster_nm을 그대로 표시합니다.' },
  '3': { label: '군집 3', color: '#F472B6', description: 'K-means 숫자 군집 3. 군집명은 cluster_nm을 그대로 표시합니다.' },
  '4': { label: '군집 4', color: '#FB923C', description: 'K-means 숫자 군집 4. 군집명은 cluster_nm을 그대로 표시합니다.' },
  도서형: {
    label: '도서형',
    color: '#34D399',
    description: '도서형은 숫자 K-means 군집과 별도 범주입니다.',
  },
};

export const PERSONA_VISUAL_INFO: Record<PersonaVisualGrade, { label: string; color: string }> = {
  high: { label: '가상 사례 · 높은 제약', color: '#EF4444' },
  mediumHigh: { label: '가상 사례 · 중간 제약', color: '#F97316' },
  moderate: { label: '가상 사례 · 일부 제약', color: '#EAB308' },
  low: { label: '가상 사례 · 상대적으로 낮은 제약', color: '#64748B' },
};

export function isVulnClass(value: string | null | undefined): value is VulnClass {
  return value === '확정' || value === '경계' || value === '비취약';
}

export function vulnFromDong(dong: DongRecord, field: VulnField): VulnClass | 'missing' {
  const raw = dong[field];
  return isVulnClass(raw) ? raw : 'missing';
}

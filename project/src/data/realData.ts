import Papa from 'papaparse';
import type {
  BoundaryCollection,
  DashboardData,
  DongHistoryFields,
  DongRecord,
  FacilityCollection,
  JoinValidation,
  LisaCluster,
  PolicyPriorityRow,
} from '@/types/dashboard';
import { has2016PopulationData, normalizeLisa } from '@/types/dashboard';
import { fetchIncheonGeoJSON } from '@/data/geoJsonLoader';
type CsvRow = Record<string, string | undefined>;
const CURRENT_NUMERIC_FIELDS = [
  'pop_total',
  'eld_65',
  'eld_single',
  'eld_ratio',
  'eld_single_ratio',
  'doc_S_in_dong',
  'doc_per_1k_eld',
  'building_count',
  'eld_allocated',
  'eld_unallocated',
  'accessibility_eligible',
  'd_bus_w',
  'acc_600',
  'acc_1000',
  'nofac_600_ratio',
  'island',
  'lisa_p',
  'rank',
] as const;
const HISTORY_NUMERIC_FIELDS = [
  'eld_ratio_2016',
  'eld_ratio_2021',
  'eld_ratio_2026',
  'd_ratio_16_26',
  'eld_gr_16_26',
  'aging_rank',
  'aging_fast',
  'eld_2016',
  'pop_2016',
  'eld_2021',
  'pop_2021',
  'hist_merged',
  'eld_2031_trend',
  'acc_600_2031',
  'acc_1000_2031',
  'eld_gr_26_31',
  'acc_600_chg',
  'eld_2031_raw',
  'eld_2031',
] as const;
const POLICY_NUMERIC_FIELDS = [
  'rank',
  'eld_65',
  'eld_single',
  'acc_600_z',
  'd_bus_w_z',
  'eld_single_ratio_z',
] as const;
const CURRENT_TEXT_FIELDS = [
  'adm_nm',
  'sgg_nm',
  'mois_codes',
  'exclusion_reason',
  'population_reference',
  'boundary_reference',
  'vuln_15',
  'vuln_20',
  'vuln_25',
  'vuln',
  'pattern',
  'cluster',
  'cluster_nm',
  'unit',
  'policy',
  'region',
  'hub',
] as const;
const HISTORY_TEXT_FIELDS = ['gu', 'vuln_2031', 'vuln_2031_rel'] as const;
const POLICY_TEXT_FIELDS = [
  'adm_nm',
  'vuln',
  'pattern',
  'unit',
  'cluster_nm',
  'policy',
  'region',
] as const;
const SHARED_CURRENT_COLUMNS = [
  'adm_nm',
  'sgg_nm',
  'mois_codes',
  'pop_total',
  'eld_65',
  'eld_single',
  'eld_ratio',
  'eld_single_ratio',
  'doc_S_in_dong',
  'doc_per_1k_eld',
  'building_count',
  'eld_allocated',
  'eld_unallocated',
  'accessibility_eligible',
  'exclusion_reason',
  'population_reference',
  'boundary_reference',
  'd_bus_w',
  'acc_600',
  'acc_1000',
  'nofac_600_ratio',
  'island',
  'vuln_15',
  'vuln_20',
  'vuln_25',
  'vuln',
  'lisa',
  'lisa_p',
  'pattern',
  'cluster',
  'cluster_nm',
  'unit',
  'policy',
  'rank',
  'region',
  'hub',
] as const;
async function fetchCsv(path: string): Promise<CsvRow[]> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const text = (await response.text()).replace(/^\uFEFF/, '');
  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });
  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0];
    throw new Error(
      `${path}: CSV ${firstError.code} (${firstError.row ?? '행 알 수 없음'})`,
    );
  }
  if (
    parsed.data.length === 0 ||
    (!parsed.meta.fields?.includes('adm_cd') && path.includes('dong_'))
  ) {
    throw new Error(`${path}: 필수 CSV 열 또는 데이터가 없습니다.`);
  }
  return parsed.data;
}
async function fetchJson<T>(
  path: string,
  validate: (data: unknown) => data is T,
): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const data: unknown = await response.json();
  if (!validate(data))
    throw new Error(`${path}: GeoJSON 구조가 올바르지 않습니다.`);
  return data;
}
function textValue(
  row: CsvRow,
  field: string,
  required = false,
): string | null {
  const value = row[field]?.trim() ?? '';
  if (!value) {
    if (required) throw new Error(`필수 문자열 값이 없습니다: ${field}`);
    return null;
  }
  return value;
}
function numericValue(row: CsvRow, field: string): number | null {
  const value = row[field]?.trim() ?? '';
  if (value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number))
    throw new Error(`숫자 값이 올바르지 않습니다: ${field}=${value}`);
  return number;
}
function assertColumns(
  rows: CsvRow[],
  fields: readonly string[],
  file: string,
): void {
  const firstRow = rows[0];
  const missing = fields.filter((field) => !(field in firstRow));
  if (missing.length > 0)
    throw new Error(`${file}: 필수 열이 없습니다 (${missing.join(', ')})`);
}
function requiredCode(row: CsvRow, file: string): string {
  const code = textValue(row, 'adm_cd', true);
  if (!code || !/^\d{8}$/.test(code))
    throw new Error(`${file}: 8자리 adm_cd가 올바르지 않습니다.`);
  return code;
}
function duplicateCodes(codes: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const code of codes) {
    if (seen.has(code)) duplicates.add(code);
    seen.add(code);
  }
  return [...duplicates];
}
function asNumericFields<T extends readonly string[]>(
  row: CsvRow,
  fields: T,
): Record<T[number], number | null> {
  return Object.fromEntries(
    fields.map((field) => [field, numericValue(row, field)]),
  ) as Record<T[number], number | null>;
}
function asTextFields<T extends readonly string[]>(
  row: CsvRow,
  fields: T,
): Record<T[number], string | null> {
  return Object.fromEntries(
    fields.map((field) => [field, textValue(row, field)]),
  ) as Record<T[number], string | null>;
}
function parseHistory(row: CsvRow = {}): DongHistoryFields {
  return {
    ...asNumericFields(row, HISTORY_NUMERIC_FIELDS),
    ...asTextFields(row, HISTORY_TEXT_FIELDS),
  };
}
function parsePolicy(row: CsvRow): PolicyPriorityRow {
  return {
    ...asNumericFields(row, POLICY_NUMERIC_FIELDS),
    ...asTextFields(row, POLICY_TEXT_FIELDS),
    adm_nm: textValue(row, 'adm_nm', true) ?? '',
    matchedAdmCd: null,
    joinStatus: 'missing',
  };
}
function parseCurrent(row: CsvRow, history: DongHistoryFields): DongRecord {
  const code = requiredCode(row, '/data/dong_current.csv');
  const lisaText = textValue(row, 'lisa');
  const lisa: LisaCluster | null = normalizeLisa(lisaText);
  return {
    adm_cd: code,
    ...asTextFields(row, CURRENT_TEXT_FIELDS),
    ...asNumericFields(row, CURRENT_NUMERIC_FIELDS),
    acc_600_z: null,
    d_bus_w_z: null,
    eld_single_ratio_z: null,
    adm_nm: textValue(row, 'adm_nm', true) ?? '',
    lisa,
    policyJoinStatus: 'missing',
    history,
  };
}
function assertFeatureCollections(
  boundaries: BoundaryCollection,
  facilities: FacilityCollection,
): void {
  if (boundaries.features.length === 0)
    throw new Error(
      '/data/dong_boundary.geojson: 경계 데이터가 비어 있습니다.',
    );
  if (facilities.features.length === 0)
    throw new Error('/data/facilities.geojson: 시설 데이터가 비어 있습니다.');
  for (const feature of boundaries.features) {
    if (!/^\d{8}$/.test(feature.properties.adm_cd)) {
      throw new Error(
        '/data/dong_boundary.geojson: 8자리 adm_cd가 올바르지 않습니다.',
      );
    }
  }
  for (const feature of facilities.features) {
    if (
      feature.geometry.type !== 'Point' ||
      feature.geometry.coordinates.length < 2
    ) {
      throw new Error(
        '/data/facilities.geojson: 시설 위치가 Point 형식이 아닙니다.',
      );
    }
  }
}
export async function loadFacilitiesGeoJSON(): Promise<FacilityCollection> {
  return fetchJson<FacilityCollection>(
    '/data/facilities.geojson',
    (data): data is FacilityCollection => {
      if (!data || typeof data !== 'object') return false;
      const collection = data as { type?: unknown; features?: unknown };
      return (
        collection.type === 'FeatureCollection' &&
        Array.isArray(collection.features)
      );
    },
  );
}
export async function loadDashboardData(): Promise<DashboardData> {
  const [currentRows, historyRows, policyRows, boundaries, facilities] =
    await Promise.all([
      fetchCsv('/data/dong_current.csv'),
      fetchCsv('/data/dong_history_future.csv'),
      fetchCsv('/data/policy_matrix.csv'),
      fetchIncheonGeoJSON(),
      loadFacilitiesGeoJSON(),
    ]);
  assertColumns(
    currentRows,
    ['adm_cd', ...CURRENT_TEXT_FIELDS, ...CURRENT_NUMERIC_FIELDS, 'lisa'],
    'dong_current.csv',
  );
  assertColumns(
    historyRows,
    ['adm_cd', ...HISTORY_NUMERIC_FIELDS, ...HISTORY_TEXT_FIELDS],
    'dong_history_future.csv',
  );
  assertColumns(
    policyRows,
    [...POLICY_TEXT_FIELDS, ...POLICY_NUMERIC_FIELDS],
    'policy_matrix.csv',
  );
  assertFeatureCollections(boundaries, facilities);
  const currentCodes = currentRows.map((row) =>
    requiredCode(row, 'dong_current.csv'),
  );
  const historyCodes = historyRows.map((row) =>
    requiredCode(row, 'dong_history_future.csv'),
  );
  const currentDuplicateCodes = duplicateCodes(currentCodes);
  const historyDuplicateCodes = duplicateCodes(historyCodes);
  const currentCodeSet = new Set(currentCodes);
  const incheonBoundaries: BoundaryCollection = {
    ...boundaries,
    features: boundaries.features.filter((feature) =>
      currentCodeSet.has(feature.properties.adm_cd),
    ),
  };
  const excludedBoundaryCount =
    boundaries.features.length - incheonBoundaries.features.length;
  const boundaryCodes = incheonBoundaries.features.map(
    (feature) => feature.properties.adm_cd,
  );
  const boundaryDuplicateCodes = duplicateCodes(boundaryCodes);
  if (
    currentDuplicateCodes.length ||
    historyDuplicateCodes.length ||
    boundaryDuplicateCodes.length
  ) {
    throw new Error('행정동 코드 중복이 발견되어 안전하게 결합할 수 없습니다.');
  }
  const historyCodeSet = new Set(historyCodes);
  const boundaryCodeSet = new Set(boundaryCodes);
  const invalidFacilities = facilities.features.filter((feature) => {
    const code = String(feature.properties.adm_cd ?? '').trim();
    return (
      feature.properties.admin_join_ok !== 1 ||
      !code ||
      !currentCodeSet.has(code) ||
      !boundaryCodeSet.has(code)
    );
  });
  if (invalidFacilities.length > 0) {
    throw new Error(
      `시설 GeoJSON에 행정동으로 연결할 수 없는 시설 ${invalidFacilities.length}개가 포함되어 있습니다.`,
    );
  }
  const codesOnlyInCurrent = currentCodes.filter(
    (code) => !boundaryCodeSet.has(code),
  );
  const codesOnlyInHistory = historyCodes.filter(
    (code) => !currentCodeSet.has(code),
  );
  const codesOnlyInBoundary = boundaryCodes.filter(
    (code) => !currentCodeSet.has(code),
  );
  if (codesOnlyInCurrent.length || codesOnlyInBoundary.length) {
    throw new Error(
      `현재 행정동과 경계 코드가 일치하지 않습니다 (경계가 없는 현재 동 ${codesOnlyInCurrent.length}, 현재 자료에 없는 경계 ${codesOnlyInBoundary.length}).`,
    );
  }
  const historyByCode = new Map<string, CsvRow>();
  for (const row of historyRows)
    historyByCode.set(requiredCode(row, 'dong_history_future.csv'), row);
  const sharedColumnDisagreements = new Set<string>();
  for (const row of currentRows) {
    const code = requiredCode(row, 'dong_current.csv');
    const historyRow = historyByCode.get(code);
    if (!historyRow) continue;
    for (const column of SHARED_CURRENT_COLUMNS) {
      if ((row[column] ?? '') !== (historyRow[column] ?? ''))
        sharedColumnDisagreements.add(column);
    }
  }
  if (sharedColumnDisagreements.size > 0) {
    console.warn(
      '현재 master와 과거·미래 파일의 공통 열 불일치 (현재 master 우선):',
      [...sharedColumnDisagreements],
    );
  }
  const records = currentRows.map((row) => {
    const code = requiredCode(row, 'dong_current.csv');
    const futureRow = historyByCode.get(code);
    return parseCurrent(row, parseHistory(futureRow));
  });
  const recordsByName = new Map<string, DongRecord[]>();
  for (const record of records) {
    const matches = recordsByName.get(record.adm_nm) ?? [];
    matches.push(record);
    recordsByName.set(record.adm_nm, matches);
  }
  const policies = policyRows.map(parsePolicy);
  const policyJoinMessages: string[] = [];
  for (const policy of policies) {
    const matches = recordsByName.get(policy.adm_nm) ?? [];
    if (matches.length === 1) {
      const record = matches[0];
      policy.matchedAdmCd = record.adm_cd;
      policy.joinStatus = 'unique';
      record.policyJoinStatus = 'unique';
      if (!record.policy) record.policy = policy.policy;
      if (record.rank === null) record.rank = policy.rank;
      if (!record.unit) record.unit = policy.unit;
      if (!record.region) record.region = policy.region;
      record.acc_600_z = policy.acc_600_z;
      record.d_bus_w_z = policy.d_bus_w_z;
      record.eld_single_ratio_z = policy.eld_single_ratio_z;
    } else {
      policy.joinStatus = matches.length === 0 ? 'missing' : 'ambiguous';
      policyJoinMessages.push(
        matches.length === 0
          ? `정책 행정동 이름을 찾을 수 없습니다: ${policy.adm_nm}`
          : `정책 행정동 이름이 중복되어 결합하지 않았습니다: ${policy.adm_nm}`,
      );
    }
  }
  policies.sort(
    (a, b) =>
      (a.rank ?? Number.POSITIVE_INFINITY) -
      (b.rank ?? Number.POSITIVE_INFINITY),
  );
  const byCode: Record<string, DongRecord> = {};
  for (const record of records) byCode[record.adm_cd] = record;
  const matchedFacilityCount = facilities.features.filter(
    (feature) => feature.properties.admin_join_ok === 1,
  ).length;
  const unmatchedFacilityCount =
    facilities.features.length - matchedFacilityCount;
  const warnings: string[] = [];
  if (currentRows.length !== 156)
    warnings.push(`현재 분석 행 수가 156이 아닙니다: ${currentRows.length}`);
  if (historyRows.length !== 156)
    warnings.push(
      `과거·미래 자료 행 수가 156이 아닙니다: ${historyRows.length}. 현재 행정동과 연결되지 않는 과거 코드는 현재 지도에서 제외하며, 누락된 현재 동의 과거 값은 자료 없음으로 표시합니다.`,
    );
  if (incheonBoundaries.features.length !== 156)
    warnings.push(
      `인천 행정경계 수가 156이 아닙니다: ${incheonBoundaries.features.length}`,
    );
  if (excludedBoundaryCount > 0) {
    warnings.push(
      `현재 인천 행정동 코드와 일치하지 않는 경계 ${excludedBoundaryCount}개를 지도에서 제외했습니다.`,
    );
  }
  if (codesOnlyInHistory.length > 0) {
    warnings.push(
      `과거·미래 자료의 비활성 행정동 코드 ${codesOnlyInHistory.length}개는 현재 행정동·경계와 연결하지 않았습니다.`,
    );
  }
  if (policies.length !== 31)
    warnings.push(`정책 우선순위 행 수가 31이 아닙니다: ${policies.length}`);
  if (facilities.features.length !== 696)
    warnings.push(
      `연결 가능한 의료기관 수가 696이 아닙니다: ${facilities.features.length}`,
    );
  if (matchedFacilityCount !== 696 || unmatchedFacilityCount !== 0) {
    warnings.push(
      `의료기관 행정동 연결 결과가 예상과 다릅니다: 연결 ${matchedFacilityCount}, 미연결 ${unmatchedFacilityCount}`,
    );
  }
  if (sharedColumnDisagreements.size)
    warnings.push(
      `공통 열 불일치 ${sharedColumnDisagreements.size}개: 현재 master 값을 사용합니다.`,
    );
  const missingHistoryRows = currentCodes.filter(
    (code) => !historyCodeSet.has(code),
  );
  if (missingHistoryRows.length > 0) {
    const names = records
      .filter((record) => missingHistoryRows.includes(record.adm_cd))
      .map((record) => record.adm_nm)
      .join(', ');
    warnings.push(
      `과거·미래 파일에 행이 없는 현재 행정동 ${missingHistoryRows.length}곳을 현재 자료와 경계에 유지하고 과거 값은 자료 없음으로 처리합니다: ${names}`,
    );
  }
  const missing2016Population = records.filter(
    (record) => !has2016PopulationData(record),
  );
  if (missing2016Population.length > 0) {
    warnings.push(
      `2016 인구 비교 자료가 없는 현재 행정동 ${missing2016Population.length}곳을 제외하지 않았습니다: ${missing2016Population.map((record) => record.adm_nm).join(', ')}`,
    );
  }
  warnings.push(...policyJoinMessages);
  const countValues = (values: Array<string | null>): Record<string, number> =>
    values.reduce<Record<string, number>>((counts, value) => {
      if (value) counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {});
  const vulnerabilityCounts = countValues(records.map((record) => record.vuln));
  if (
    vulnerabilityCounts['확정'] !== 28 ||
    vulnerabilityCounts['경계'] !== 3 ||
    vulnerabilityCounts['비취약'] !== 125
  ) {
    warnings.push('기본 취약 분류 건수가 제공된 검증 기준과 다릅니다.');
  }
  const lisaCounts = countValues(records.map((record) => record.lisa));
  if (
    lisaCounts.HH !== 14 ||
    lisaCounts.LL !== 14 ||
    lisaCounts.LH !== 7 ||
    lisaCounts.HL !== 2 ||
    lisaCounts.NS !== 119
  ) {
    warnings.push('정규화한 LISA 건수가 제공된 검증 기준과 다릅니다.');
  }
  const clusterCounts = countValues(records.map((record) => record.cluster_nm));
  const expectedClusters: Record<string, number> = {
    평균형: 59,
    '고령 1인가구 밀집형': 48,
    '의료 양호형': 29,
    '의료·교통 동시 취약형': 13,
    도서형: 7,
  };
  if (
    Object.entries(expectedClusters).some(
      ([name, count]) => clusterCounts[name] !== count,
    )
  ) {
    warnings.push('cluster_nm 유형별 건수가 제공된 검증 기준과 다릅니다.');
  }
  const patternCounts = countValues(records.map((record) => record.pattern));
  if (
    patternCounts['산발형'] !== 17 ||
    patternCounts['밀집형'] !== 13 ||
    patternCounts['고립형'] !== 1
  ) {
    warnings.push('pattern 유형별 건수가 제공된 검증 기준과 다릅니다.');
  }
  const futureVulnerable = records.filter(
    (record) =>
      record.history.vuln_2031 === '확정' ||
      record.history.vuln_2031 === '경계',
  );
  const futureClassificationCounts = countValues(
    records.map((record) => record.history.vuln_2031),
  );
  if (
    futureClassificationCounts['확정'] !== 33 ||
    futureClassificationCounts['경계'] !== 8 ||
    futureClassificationCounts['비취약'] !== 115
  ) {
    warnings.push('2031 고정 기준선 분류 건수가 제공된 검증 기준과 다릅니다.');
  }
  const currentVulnerable = records.filter(
    (record) => record.vuln === '확정' || record.vuln === '경계',
  );
  const newlyVulnerable = records.filter(
    (record) =>
      record.vuln === '비취약' &&
      (record.history.vuln_2031 === '확정' ||
        record.history.vuln_2031 === '경계'),
  );
  const relativeVulnerable = records.filter(
    (record) =>
      record.history.vuln_2031_rel === '확정' ||
      record.history.vuln_2031_rel === '경계',
  );
  const relativeOverlap = relativeVulnerable.filter(
    (record) => record.vuln === '확정' || record.vuln === '경계',
  ).length;
  if (
    currentVulnerable.length !== 31 ||
    futureVulnerable.length !== 41 ||
    newlyVulnerable.length !== 10
  ) {
    warnings.push(
      '2026→2031 취약 분류 전환 건수가 제공된 검증 기준과 다릅니다.',
    );
  }
  if (relativeVulnerable.length !== 31 || relativeOverlap !== 29) {
    warnings.push(
      `상대 2031 분류와 현재 취약 분류의 중복이 기준과 다릅니다: ${relativeOverlap}/${relativeVulnerable.length}`,
    );
  }
  const validChanges = records.flatMap((record) =>
    record.history.acc_600_chg === null ? [] : [record.history.acc_600_chg],
  );
  const zeroBaselineMissingChange = records.filter(
    (record) => record.acc_600 === 0 && record.history.acc_600_chg === null,
  ).length;
  if (
    validChanges.length !== 139 ||
    validChanges.some((change) => change >= 0) ||
    zeroBaselineMissingChange !== 17
  ) {
    warnings.push(
      '600m 접근성 변화율의 건수·부호 또는 원래 0 값 검증이 예상과 다릅니다.',
    );
  }
  const growthDeltas = records.flatMap((record) => {
    const elderly2031 = record.history.eld_2031;
    const elderly2026 = record.eld_65;
    const suppliedGrowth = record.history.eld_gr_26_31;
    if (
      elderly2031 === null ||
      elderly2026 === null ||
      elderly2026 === 0 ||
      suppliedGrowth === null
    )
      return [];
    return [Math.abs((elderly2031 / elderly2026 - 1) * 100 - suppliedGrowth)];
  });
  if (growthDeltas.some((delta) => delta > 0.05 + 1e-9)) {
    warnings.push(
      '2031 고령인구 증가율과 eld_gr_26_31 사이에 반올림 범위를 넘는 차이가 있습니다.',
    );
  }
  const with2021Values = missing2016Population.filter(
    (record) =>
      record.history.eld_2021 !== null ||
      record.history.pop_2021 !== null ||
      record.history.eld_ratio_2021 !== null,
  );
  if (with2021Values.length > 0) {
    warnings.push(
      `2016 인구 비교 자료가 없는 동 중 ${with2021Values.length}곳은 2021 값이 제공되어 해당 연도 지표에는 포함됩니다.`,
    );
  }
  if (
    records.filter(
      (record) =>
        record.history.aging_fast === 1 &&
        (record.vuln === '확정' || record.vuln === '경계'),
    ).length !== 15
  ) {
    warnings.push('aging_fast=1 및 2026 취약 동 교집합이 15곳과 다릅니다.');
  }
  const exclusionFlagConflicts = records.filter(
    (record) =>
      record.building_count === 0 &&
      record.accessibility_eligible === 0 &&
      record.acc_600 !== null &&
      record.acc_600 !== 0,
  );
  if (exclusionFlagConflicts.length > 0) {
    warnings.push(
      `접근성 값과 기존 제외 플래그가 불일치하는 행정동 ${exclusionFlagConflicts.length}곳이 있습니다. 원자료 값을 변경하지 않았습니다.`,
    );
  }
  const validation: JoinValidation = {
    currentRowCount: currentRows.length,
    historyRowCount: historyRows.length,
    policyRowCount: policies.length,
    boundaryFeatureCount: incheonBoundaries.features.length,
    facilityFeatureCount: facilities.features.length,
    matchedFacilityCount,
    unmatchedFacilityCount,
    currentDuplicateCodes,
    historyDuplicateCodes,
    boundaryDuplicateCodes,
    codesOnlyInCurrent,
    codesOnlyInHistory,
    codesOnlyInBoundary,
    sharedColumnDisagreements: [...sharedColumnDisagreements],
    policyJoinMessages,
    warnings,
  };
  return {
    records,
    byCode,
    boundaries: incheonBoundaries,
    facilities,
    policies,
    validation,
  };
}

import type { DongMetrics, DongTimeSeries, Persona, PolicySolution, RiskGrade, LisAClusterType } from '@/types/dashboard';
import { RISK_GRADE_INFO, riskGradeFromScore, YEAR_RANGE } from '@/types/dashboard';
import { riskGradeFromScore as gradeFromScore } from '@/utils/colors';

const DONG_DATA: { code: string; name: string; nameEng: string }[] = [
  { code: '2301052', name: '연안동', nameEng: 'Yeonandong' },
  { code: '2301053', name: '신포동', nameEng: 'Sinpo-dong' },
  { code: '2301054', name: '신흥동', nameEng: 'Sinheung-dong' },
  { code: '2301056', name: '도원동', nameEng: 'Dowon-dong' },
  { code: '2301057', name: '율목동', nameEng: 'Yulmok-dong' },
  { code: '2301058', name: '동인천동', nameEng: 'Dongincheondong' },
  { code: '2301060', name: '북성동', nameEng: 'Bukseongdong' },
  { code: '2301061', name: '송월동', nameEng: 'Songwol-dong' },
  { code: '2301063', name: '용유동', nameEng: 'Yongyudong' },
  { code: '2301064', name: '운서동', nameEng: 'Unseo-dong' },
  { code: '2301065', name: '영종동', nameEng: 'Yeongjongdong' },
  { code: '2301066', name: '영종1동', nameEng: 'Yeongjong-1-dong' },
  { code: '2302051', name: '만석동', nameEng: 'Manseok-dong' },
  { code: '2302052', name: '화수1·화평동', nameEng: 'Hwasu1·Hwapyeong-dong' },
  { code: '2302053', name: '화수2동', nameEng: 'Hwasu-2-dong' },
  { code: '2302055', name: '송현1·2동', nameEng: 'Songhyeon1·2-dong' },
  { code: '2302057', name: '송현3동', nameEng: 'Songhyeon-3-dong' },
  { code: '2302058', name: '송림1동', nameEng: 'Songnim-1-dong' },
  { code: '2302059', name: '송림2동', nameEng: 'Songnim-2-dong' },
  { code: '2302060', name: '송림3·5동', nameEng: 'Songnim3·5-dong' },
  { code: '2302061', name: '송림4동', nameEng: 'Songnim-4-dong' },
  { code: '2302063', name: '송림6동', nameEng: 'Songnim-6-dong' },
  { code: '2302064', name: '금창동', nameEng: 'Geumchangdong' },
  { code: '2303052', name: '숭의2동', nameEng: 'Sungui-2-dong' },
  { code: '2303054', name: '숭의4동', nameEng: 'Sungui-4-dong' },
  { code: '2303056', name: '용현2동', nameEng: 'Yonghyeon-2-dong' },
  { code: '2303057', name: '용현3동', nameEng: 'Yonghyeon-3-dong' },
  { code: '2303059', name: '용현5동', nameEng: 'Yonghyeon-5-dong' },
  { code: '2303060', name: '학익1동', nameEng: 'Hagik-1-dong' },
  { code: '2303061', name: '학익2동', nameEng: 'Hagik-2-dong' },
  { code: '2303062', name: '도화1동', nameEng: 'Dohwa-1-dong' },
  { code: '2303065', name: '주안1동', nameEng: 'Juan-1-dong' },
  { code: '2303066', name: '주안2동', nameEng: 'Juan-2-dong' },
  { code: '2303067', name: '주안3동', nameEng: 'Juan-3-dong' },
  { code: '2303068', name: '주안4동', nameEng: 'Juan-4-dong' },
  { code: '2303069', name: '주안5동', nameEng: 'Juan-5-dong' },
  { code: '2303070', name: '주안6동', nameEng: 'Juan-6-dong' },
  { code: '2303071', name: '주안7동', nameEng: 'Juan-7-dong' },
  { code: '2303072', name: '주안8동', nameEng: 'Juan-8-dong' },
  { code: '2303073', name: '관교동', nameEng: 'Gwangyo-dong' },
  { code: '2303074', name: '문학동', nameEng: 'Munhak-dong' },
  { code: '2303075', name: '숭의1·3동', nameEng: 'Sungui1·3-dong' },
  { code: '2303076', name: '용현1·4동', nameEng: 'Yonghyeon1·4-dong' },
  { code: '2303077', name: '도화2·3동', nameEng: 'Dohwa2·3-dong' },
  { code: '2304051', name: '옥련1동', nameEng: 'Ongnyeon1-dong' },
  { code: '2304052', name: '선학동', nameEng: 'Seonhak-dong' },
  { code: '2304053', name: '연수1동', nameEng: 'Yeonsu-1-dong' },
  { code: '2304054', name: '연수2동', nameEng: 'Yeonsu-2-dong' },
  { code: '2304055', name: '연수3동', nameEng: 'Yeonsu-3-dong' },
  { code: '2304056', name: '청학동', nameEng: 'Cheonghak-dong' },
  { code: '2304057', name: '동춘1동', nameEng: 'Dongchun-1-dong' },
  { code: '2304058', name: '동춘2동', nameEng: 'Dongchun-2-dong' },
  { code: '2304059', name: '동춘3동', nameEng: 'Dongchun3-dong' },
  { code: '2304060', name: '옥련2동', nameEng: 'Ongnyeon2-dong' },
  { code: '2304063', name: '송도2동', nameEng: 'Songdo2-dong' },
  { code: '2304064', name: '송도1동', nameEng: 'Songdo1-dong' },
  { code: '2304065', name: '송도3동', nameEng: 'Songdo-3-dong' },
  { code: '2305051', name: '구월1동', nameEng: 'Guwol-1-dong' },
  { code: '2305052', name: '구월2동', nameEng: 'Guwol-2-dong' },
  { code: '2305053', name: '구월3동', nameEng: 'Guwol-3-dong' },
  { code: '2305054', name: '구월4동', nameEng: 'Guwol-4-dong' },
  { code: '2305055', name: '간석1동', nameEng: 'Ganseok-1-dong' },
  { code: '2305056', name: '간석2동', nameEng: 'Ganseek-2-dong' },
  { code: '2305057', name: '간석3동', nameEng: 'Ganseok-3-dong' },
  { code: '2305058', name: '간석4동', nameEng: 'Ganseek-4-dong' },
  { code: '2305059', name: '만수1동', nameEng: 'Mansu-1-dong' },
  { code: '2305060', name: '만수2동', nameEng: 'Mansu-2-dong' },
  { code: '2305061', name: '만수3동', nameEng: 'Mansu-3-dong' },
  { code: '2305062', name: '만수4동', nameEng: 'Mansu-4-dong' },
  { code: '2305063', name: '만수5동', nameEng: 'Mansu-5-dong' },
  { code: '2305064', name: '만수6동', nameEng: 'Mansu-6-dong' },
  { code: '2305065', name: '장수서창동', nameEng: 'Jangsuseochangdong' },
  { code: '2305067', name: '남촌도림동', nameEng: 'Namchondorimdong' },
  { code: '2305072', name: '논현1동', nameEng: 'Nonhyeon-1-dong' },
  { code: '2305073', name: '논현2동', nameEng: 'Nonhyeon-2-dong' },
  { code: '2305074', name: '논현고잔동', nameEng: 'Nonhyeongojandong' },
  { code: '2306051', name: '부평1동', nameEng: 'Bupyeong-1-dong' },
  { code: '2306052', name: '부평2동', nameEng: 'Bupyeong-2-dong' },
  { code: '2306053', name: '부평3동', nameEng: 'Bupyeong-3-dong' },
  { code: '2306054', name: '부평4동', nameEng: 'Bupyeong-4-dong' },
  { code: '2306055', name: '부평5동', nameEng: 'Bupyeong-5-dong' },
  { code: '2306056', name: '부평6동', nameEng: 'Bupyeong-6-dong' },
  { code: '2306057', name: '산곡1동', nameEng: 'Sangok-1-dong' },
  { code: '2306058', name: '산곡2동', nameEng: 'Sangok-2-dong' },
  { code: '2306059', name: '산곡3동', nameEng: 'Sangok-3-dong' },
  { code: '2306060', name: '산곡4동', nameEng: 'Sangok-4-dong' },
  { code: '2306061', name: '청천1동', nameEng: 'Cheongcheon-1-dong' },
  { code: '2306062', name: '청천2동', nameEng: 'Cheongcheon-2-dong' },
  { code: '2306063', name: '갈산1동', nameEng: 'Galsan-1-dong' },
  { code: '2306064', name: '갈산2동', nameEng: 'Galsan-2-dong' },
  { code: '2306065', name: '삼산1동', nameEng: 'Samsan1-dong' },
  { code: '2306066', name: '부개1동', nameEng: 'Bugae-1-dong' },
  { code: '2306067', name: '부개2동', nameEng: 'Bugae-2-dong' },
  { code: '2306068', name: '부개3동', nameEng: 'Bugae-3-dong' },
  { code: '2306069', name: '일신동', nameEng: 'Ilsin-dong' },
  { code: '2306070', name: '십정1동', nameEng: 'Sipjeong-1-dong' },
  { code: '2306071', name: '십정2동', nameEng: 'Sipjeong-2-dong' },
  { code: '2306072', name: '삼산2동', nameEng: 'Samsan2-dong' },
  { code: '2307051', name: '효성1동', nameEng: 'Hyoseong-1-dong' },
  { code: '2307052', name: '효성2동', nameEng: 'Hyoseong-2-dong' },
  { code: '2307053', name: '계산1동', nameEng: 'Gyesan-1-dong' },
  { code: '2307054', name: '계산2동', nameEng: 'Gyesan-2-dong' },
  { code: '2307055', name: '계산3동', nameEng: 'Gyesan-3-dong' },
  { code: '2307056', name: '작전1동', nameEng: 'Jakjeon-1-dong' },
  { code: '2307057', name: '작전2동', nameEng: 'Jakjeon-2-dong' },
  { code: '2307058', name: '작전서운동', nameEng: 'Jakjeonseoundong' },
  { code: '2307061', name: '계양2동', nameEng: 'Gyeyang2-dong' },
  { code: '2307062', name: '계산4동', nameEng: 'Gyesan4-dong' },
  { code: '2307063', name: '계양1동', nameEng: 'Gyeyang1-dong' },
  { code: '2307064', name: '계양3동', nameEng: 'Gyeyang-3-dong' },
  { code: '2308051', name: '검암경서동', nameEng: 'Geomamgyeongseodong' },
  { code: '2308053', name: '연희동', nameEng: 'Yeonhui-dong' },
  { code: '2308054', name: '가정1동', nameEng: 'Gajeong-1-dong' },
  { code: '2308055', name: '가정2동', nameEng: 'Gajeong-2-dong' },
  { code: '2308056', name: '가정3동', nameEng: 'Gajeong-3-dong' },
  { code: '2308058', name: '석남1동', nameEng: 'Seongnam-1-dong' },
  { code: '2308059', name: '석남2동', nameEng: 'Seongnam-2-dong' },
  { code: '2308060', name: '석남3동', nameEng: 'Seongnam-3-dong' },
  { code: '2308062', name: '가좌1동', nameEng: 'Gajwa-1-dong' },
  { code: '2308063', name: '가좌2동', nameEng: 'Gajwa-2-dong' },
  { code: '2308064', name: '가좌3동', nameEng: 'Gajwa-3-dong' },
  { code: '2308065', name: '가좌4동', nameEng: 'Gajwa-4-dong' },
  { code: '2308069', name: '검단2동', nameEng: 'Geomdan2-dong' },
  { code: '2308070', name: '검단3동', nameEng: 'Geomdan3-dong' },
  { code: '2308071', name: '검단4동', nameEng: 'Geomdan4-dong' },
  { code: '2308073', name: '신현원창동', nameEng: 'Sinhyeonwonchangdong' },
  { code: '2308074', name: '청라1동', nameEng: 'Cheongna1-dong' },
  { code: '2308076', name: '검단1동', nameEng: 'Geomdan-1-dong' },
  { code: '2308077', name: '검단5동', nameEng: 'Geomdan-5-dong' },
  { code: '2308078', name: '청라2동', nameEng: 'Cheongna2-dong' },
  { code: '2308079', name: '청라3동', nameEng: 'Cheongna-dong' },
  { code: '2331011', name: '강화읍', nameEng: 'Ganghwa-eup' },
  { code: '2331031', name: '선원면', nameEng: 'Seonwon-myeon' },
  { code: '2331032', name: '불은면', nameEng: 'Bureun-myeon' },
  { code: '2331033', name: '길상면', nameEng: 'Gilsang-myeon' },
  { code: '2331034', name: '화도면', nameEng: 'Hwado-myeon' },
  { code: '2331035', name: '양도면', nameEng: 'Yangdo-myeon' },
  { code: '2331036', name: '내가면', nameEng: 'Naega-myeon' },
  { code: '2331037', name: '하점면', nameEng: 'Hajeom-myeon' },
  { code: '2331038', name: '양사면', nameEng: 'Yangsa-myeon' },
  { code: '2331039', name: '송해면', nameEng: 'Songhae-myeon' },
  { code: '2331040', name: '교동면', nameEng: 'Gyodong-myeon' },
  { code: '2331041', name: '삼산면', nameEng: 'Samsan-myeon' },
  { code: '2331042', name: '서도면', nameEng: 'Seodo-myeon' },
  { code: '2332031', name: '북도면', nameEng: 'Bukdo-myeon' },
  { code: '2332032', name: '연평면', nameEng: 'Yeonpyeong-myeon' },
  { code: '2332033', name: '백령면', nameEng: 'Baengnyeong-myeon' },
  { code: '2332034', name: '대청면', nameEng: 'Daecheong-myeon' },
  { code: '2332035', name: '덕적면', nameEng: 'Deokjeok-myeon' },
  { code: '2332036', name: '자월면', nameEng: 'Jawol-myeon' },
  { code: '2332037', name: '영흥면', nameEng: 'Yeongheung-myeon' },
];

const ISLAND_CODES = new Set([
  '2301063', '2301064', '2301065', '2301066',
  '2331011', '2331031', '2331032', '2331033', '2331034', '2331035',
  '2331036', '2331037', '2331038', '2331039', '2331040', '2331041',
  '2331042', '2332031', '2332032', '2332033', '2332034', '2332035',
  '2332036', '2332037',
]);

const OLD_DOWNTOWN_CODES = new Set([
  '2301052', '2301053', '2301054', '2301056', '2301057', '2301058',
  '2301060', '2301061', '2302051', '2302052', '2302053', '2302055',
  '2302057', '2302058', '2302059', '2302060', '2302061', '2302063',
  '2302064',
]);

const NEW_CITY_CODES = new Set([
  '2304051', '2304052', '2304053', '2304054', '2304055', '2304056',
  '2304057', '2304058', '2304059', '2304060', '2304063', '2304064',
  '2304065', '2305051', '2305052', '2305053', '2305054', '2308074',
  '2308078', '2308079',
]);

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function generateYearMetrics(
  dong: { code: string; name: string; nameEng: string },
  year: number,
  index: number,
): DongMetrics {
  const isIsland = ISLAND_CODES.has(dong.code);
  const isOldDowntown = OLD_DOWNTOWN_CODES.has(dong.code);
  const isNewCity = NEW_CITY_CODES.has(dong.code);

  const yearOffset = year - 2020;
  const seed = parseInt(dong.code.slice(-4)) + index * 7 + yearOffset * 13;
  const r1 = seededRandom(seed);
  const r2 = seededRandom(seed + 1);
  const r3 = seededRandom(seed + 2);
  const r4 = seededRandom(seed + 3);

  let baseAging: number;
  if (isIsland) baseAging = 28 + r1 * 22 + yearOffset * 1.5;
  else if (isOldDowntown) baseAging = 18 + r1 * 12 + yearOffset * 1.2;
  else if (isNewCity) baseAging = 4 + r1 * 8 + yearOffset * 0.5;
  else baseAging = 10 + r1 * 15 + yearOffset * 1.0;

  const agingRate = Math.round(baseAging * 10) / 10;

  const totalPopulation = isNewCity
    ? Math.round(15000 + r2 * 30000 + yearOffset * 800)
    : isIsland
      ? Math.round(800 + r2 * 5000 - yearOffset * 50)
      : Math.round(8000 + r2 * 25000 - yearOffset * 200);

  const agingPopulation = Math.round((agingRate / 100) * totalPopulation);

  let twoSfca: number;
  if (isIsland) twoSfca = 0.05 + r3 * 0.2 + yearOffset * 0.01;
  else if (isOldDowntown) twoSfca = 0.3 + r3 * 0.3 + yearOffset * 0.005;
  else if (isNewCity) twoSfca = 0.6 + r3 * 0.35 + yearOffset * 0.01;
  else twoSfca = 0.25 + r3 * 0.4 + yearOffset * 0.008;
  twoSfca = Math.min(1, Math.round(twoSfca * 1000) / 1000);

  const doctorsCount = isIsland
    ? Math.round(r1 * 3)
    : isNewCity
      ? Math.round(15 + r1 * 40)
      : Math.round(5 + r1 * 20);

  const transportAccessibility = isIsland
    ? Math.round((10 + r4 * 20) * 10) / 10
    : isOldDowntown
      ? Math.round((40 + r4 * 30) * 10) / 10
      : isNewCity
        ? Math.round((70 + r4 * 25) * 10) / 10
        : Math.round((45 + r4 * 35) * 10) / 10;

  const vulnerabilityScore = Math.round(
    Math.min(100, agingRate * 1.2 + (1 - twoSfca) * 45 + (isIsland ? 15 : 0) + (100 - transportAccessibility) * 0.15)
  );

  const riskGrade = gradeFromScore(vulnerabilityScore);

  const majorHospitals = isIsland ? 0 : isNewCity ? Math.round(r1 * 3) : Math.round(r1 * 2);
  const smallClinics = isIsland ? Math.round(r2 * 3) : Math.round(5 + r2 * 25);
  const pharmacies = isIsland ? Math.round(r3 * 4) : Math.round(8 + r3 * 30);
  const emergencyRoomCount = majorHospitals > 0 ? Math.round(majorHospitals * 0.6) : 0;

  const spatialGini = Math.round(
    ((1 - twoSfca) * 0.4 + (agingRate / 50) * 0.3 + (isIsland ? 0.2 : 0)) * 1000
  ) / 1000;

  return {
    code: dong.code,
    name: dong.name,
    nameEng: dong.nameEng,
    year,
    agingPopulation,
    totalPopulation,
    agingRate,
    twoSfcaScore: twoSfca,
    doctorsCount,
    transportAccessibility,
    vulnerabilityScore,
    spatialGini,
    emergencyRoomCount,
    riskGrade,
    majorHospitals,
    smallClinics,
    pharmacies,
  };
}

export function generateTimeSeriesData(): DongTimeSeries[] {
  return DONG_DATA.map((dong, i) => {
    const yearlyData: Record<number, DongMetrics> = {};
    for (const year of YEAR_RANGE) {
      yearlyData[year] = generateYearMetrics(dong, year, i);
    }
    return {
      code: dong.code,
      name: dong.name,
      nameEng: dong.nameEng,
      yearlyData,
    };
  });
}

export const TIME_SERIES_DATA: DongTimeSeries[] = generateTimeSeriesData();

export function getMetricsForYear(year: number): DongMetrics[] {
  return TIME_SERIES_DATA.map((ts) => ts.yearlyData[year]).filter(Boolean);
}

export function getMetricsMapForYear(year: number): Record<string, DongMetrics> {
  const map: Record<string, DongMetrics> = {};
  for (const ts of TIME_SERIES_DATA) {
    const m = ts.yearlyData[year];
    if (m) map[ts.code] = m;
  }
  return map;
}

export function getDongTimeSeries(code: string): DongTimeSeries | undefined {
  return TIME_SERIES_DATA.find((ts) => ts.code === code);
}

export const DONG_NAMES: { code: string; name: string }[] = DONG_DATA.map((d) => ({
  code: d.code,
  name: d.name,
}));

export const PERSONAS: Persona[] = [
  {
    id: 0,
    riskGrade: 'high',
    title: '초고령 의료 사각지대',
    name: '김순자 할머니',
    age: 82,
    location: '강화도 외곽 면 지역',
    description: '외곽 섬 마을에 거주하는 할머니로, 가까운 응급실까지 40분 이상 소요됩니다. 마을에 의원이 없고, 월 1회 방문 의료 서비스에만 의존하고 있습니다.',
    challenges: [
      '반경 10km 이내 의료기관 부재',
      '응급실 이동 시간 40분 이상',
      '육상 대형병원 접근 대중교통 부족',
      '고혈압·당뇨 등 만성질환 정기 모니터링 필요',
    ],
    needs: [
      '월 2회 이상 찾아가는 보건소 진료',
      '마을회관 원격진료 키오스크 설치',
      '긴급 구급약품 드론 배송 체계',
      '일상 건강 확인 커뮤니티 보건 인력 배치',
    ],
    icon: '🔴',
    gradient: 'from-red-600 to-red-900',
  },
  {
    id: 1,
    riskGrade: 'mediumHigh',
    title: '인프라 소외 지역',
    name: '박철수 어르신',
    age: 71,
    location: '영흥도 / 덕적도',
    description: '외곽 섬에서 은퇴한 어민으로, 계절적 인구 변동이 큰 지역에 거주합니다. 보건지소 1곳이 단축 운영되는 것이 유일한 의료 서비스입니다.',
    challenges: [
      '보건지소 1곳, 단축 운영',
      '섬 내 약국 부재 - 약품은 여객선으로 반입',
      '기상에 따른 응급 의료 이송 제약',
      '관광객 급증 시 의료 수요 불규칙',
    ],
    needs: [
      '24시간 원격 진료 거점 및 자동 진단 장비',
      '무인 약국 자동 조제기 설치',
      '헬기 응급 후송 프로토콜 구축',
      '통합 섬 보건 정보 시스템',
    ],
    icon: '🟠',
    gradient: 'from-orange-500 to-orange-800',
  },
  {
    id: 2,
    riskGrade: 'moderate',
    title: '도심 노후화 지역',
    name: '이영희 어르신',
    age: 68,
    location: '동구 구도심',
    description: '인천 원도심의 40년 된 아파트에 거주하는 독거 어르신입니다. 인근에 소규모 의원은 있으나 대형병원까지 버스로 30분 이상 이동해야 합니다.',
    challenges: [
      '노후 건축물 접근성 시설 부족',
      '소규모 의원은 전문 진료·검사 장비 부족',
      '대형병원 대중교통 30분 이상',
      '상권 축소로 도보 생활편의시설 감소',
    ],
    needs: [
      '지역밀착형 통합 돌봄 센터',
      '대형병원 셔틀버스 정기 운행',
      '방문 간호를 통한 약물 관리',
      '고령친화 도시재생 인프라',
    ],
    icon: '🟡',
    gradient: 'from-yellow-500 to-amber-700',
  },
  {
    id: 3,
    riskGrade: 'safe',
    title: '안전 지역',
    name: '최명숙 어르신',
    age: 65,
    location: '송도국제도시',
    description: '신시도시에 거주하는 최근 은퇴한 전문직 어르신입니다. 도보 거리 내 다수의 병원·의원이 있고, 대중교통 접근성도 우수합니다.',
    challenges: [
      '예방 의료 및 웰니스 프로그램 필요',
      '만성질환 조기 발견 건강 모니터링',
      '사회적 고립 방지를 위한 교류 필요',
      '선택 진료 보험 활용 안내',
    ],
    needs: [
      '커뮤니티 웰니스 센터 및 운동 프로그램',
      '정기 건강검진 프로그램',
      '디지털 헬스 플랫폼 연계',
      '시니어 사회 동호회 및 활동 모임',
    ],
    icon: '🟢',
    gradient: 'from-green-500 to-emerald-800',
  },
];

export function getPolicySolutions(metrics: DongMetrics): PolicySolution[] {
  const solutions: PolicySolution[] = [];
  const grade = metrics.riskGrade;

  if (grade === 'high') {
    solutions.push(
      { title: '찾아가는 이동 보건의료투 지정 운영', description: '당 진료 및 약품 처방이 가능한 이동 보건의료투를 격주로 파견하여 초고령 인구를 직접 진료합니다.', priority: 'high', category: '의료 접근성' },
      { title: '원격진료 허브 설치', description: '지역 커뮤니티 센터에 인천의료원 전문의 연계 원격진료 키오스크를 설치하고 생체신호 모니터링 기기를 배치합니다.', priority: 'high', category: '디지털 헬스' },
      { title: '긴급 구급약품 드론 배송', description: '육상 약국에서 드론으로 긴급 약품을 배송하는 회랑을 구축하여 응답 시간을 수시간에서 30분으로 단축합니다.', priority: 'medium', category: '응급 대응' },
    );
  } else if (grade === 'mediumHigh') {
    solutions.push(
      { title: '24시간 원격 진료 스테이션', description: '기존 보건지소를 무인 원격 진료 스테이션으로 24시간 운영하고 자동 진단 기기와 약품 조제기를 설치합니다.', priority: 'high', category: '의료 접근성' },
      { title: '헬기 응급 후송 프로토콜', description: '기상 최적화 비행 경로와 대기 승무원을 갖춘 전용 헬기 응급 의료 후송 프로토콜을 구축합니다.', priority: 'high', category: '응급 대응' },
      { title: '커뮤니티 보건 인력 양성', description: '지역 주민을 인증된 커뮤니티 보건 인력으로 교육하여 일일 생체신호 모니터링 및 1차 대응을 담당합니다.', priority: 'medium', category: '역량 강화' },
    );
  } else if (grade === 'moderate') {
    solutions.push(
      { title: '지역밀착형 통합 돌봄 센터', description: '간호·재활·복지 서비스를 한 곳에서 제공하는 통합 돌봄 센터를 접근성 좋은 위치에 설치합니다.', priority: 'high', category: '의료 접근성' },
      { title: '대형병원 셔틀버스 정기 운행', description: '구도심과 대형병원을 연결하는 셔틀버스를 평일 2시간 간격으로 운행합니다.', priority: 'medium', category: '교통' },
      { title: '고령친화 도시재생', description: '공공공간을 배리어프리로 재설계하고 100m마다 휴식 공간과 건강 서비스 포인트를 마련합니다.', priority: 'medium', category: '도시계획' },
    );
  } else {
    solutions.push(
      { title: '예방 웰니스 프로그램', description: '지역 커뮤니티 센터에서 운동 클래스, 영양 교육, 정기 건강검진을 포함한 웰니스 프로그램을 운영합니다.', priority: 'low', category: '예방' },
      { title: '디지털 헬스 플랫폼', description: '기존 의료 서비스를 통합 디지털 헬스 플랫폼으로 연계하여 예약, 복약 관리, 원격진료를 통합합니다.', priority: 'low', category: '디지털 헬스' },
      { title: '시니어 사회 참여 프로그램', description: '시니어 동호회와 세대 간 활동 프로그램을 통해 사회적 고립을 방지하고 인지 건강을 유지합니다.', priority: 'low', category: '사회 복지' },
    );
  }

  if (metrics.vulnerabilityScore > 70) {
    solutions.push({ title: '의료취약지구 지정 및 예산 우선 배분', description: '당 행정동을 의료취약 우선지구로 지정하고 의료 인프라 개선을 위한 시 예산을 우선 배분합니다.', priority: 'high', category: '정책' });
  }

  return solutions;
}

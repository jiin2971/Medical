export interface PersonaDefinition {
  id: string;
  clusterName: string;
  typeTitle: string;
  name: string;
  age: number;
  location: string;
  quote: string;
  challenges: string[];
}

// Editable user-provided examples. These fictional details are not resident interviews or verified service claims.
export const PERSONA_DATA: PersonaDefinition[] = [
  {
    id: 'vulnerable-transit-medical',
    clusterName: '의료·교통 동시 취약형',
    typeTitle: '의료교통 동시 취약형',
    name: '김순자 할머니',
    age: 82,
    location: '강화군 교동면',
    quote:
      '마을에 병원은커녕 약국도 저 멀리 하나 밖에 없어요. 버스 한번 타려면 한참 걸어 나가야 하고, 병원이라도 가려면 배나 차 타고 40분 넘게 나가야 하니 아파도 꾹 참게 됩니다.',
    challenges: [
      '반경 10km 이내 일차 의료기관(의원/병원) 부재',
      '최단 거리 종합병원까지 이동 시간 40분 이상 소요',
      '마을 버스 배차 간격이 길고 버스정류장까지 도보 접근성 불량',
      '마을 내 소규모의 보건진료소에 전적으로 의존',
    ],
  },
  {
    id: 'elderly-single-dense',
    clusterName: '고령 1인가구 밀집형',
    typeTitle: '고령 1인가구 밀집형',
    name: '이성호 할아버지',
    age: 79,
    location: '삼산 1동',
    quote:
      '동네에 병원은 몇 군데 있지만, 혼자 살다 보니 동행해 줄 사람이 없어요. 무릎이 아파 버스 계단 오르내리는 것도 큰 일입니다.',
    challenges: [
      '혼자 거주하는 고령 1인 가구로 병원 방문 시 동행자 부재',
      '관절염 등 만성질환을 겪고 있으나 이동 보조 수단 부족',
      '정보 접근성 부족으로 복지 간병/동행 서비스 신청에 어려움',
      '거주지 주변 계단 및 경사로가 많아 도보 이동 제한',
    ],
  },
  {
    id: 'average-type',
    clusterName: '평균형',
    typeTitle: '평균형',
    name: '박정숙 할머니',
    age: 76,
    location: '산곡 3동',
    quote:
      '집 근처에 걸어갈 수 있는 병원은 없지만, 집 앞 정류장에서 버스를 타면 시내 병원에 갈 수 있어요. 다만 어느 버스를 타야 할지 헷갈려요.',
    challenges: [
      '도보 600m 이내 생활권 내 의원급 의료기관 부재',
      '대중교통(버스)으로 이동은 가능하나 복잡함',
      '야간/주말 의료 이용 시 접근성 저하',
    ],
  },
  {
    id: 'island-type',
    clusterName: '도서형',
    typeTitle: '도서형',
    name: '정학철 할아버지',
    age: 84,
    location: '옹진군 덕적면',
    quote:
      '육지 병원에 한번 가려면 아침 일찍 배를 타고 나가야 해요. 기상이 악화되어 배가 뜨지 않으면 진료나 약 처방을 받을 방법이 전혀 없습니다.',
    challenges: [
      '섬 지역 특성상 해상 교통(여객선) 의존도 100%',
      '하루 3~4번 정도로 운항 횟수 저조',
      '기상 악화(풍랑주의보, 안개 등)시 이동 불가능',
      '섬의 도서 보건지소 외 진료과목별 전문의 및 정밀 검사 장비 부족',
    ],
  },
];

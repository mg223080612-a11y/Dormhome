// 메인 대시보드 - 공지사항 (important: true 면 "중요" 배지 표시)
export const notices = [
  { id: 1, title: '6월 급식 만족도 조사 안내', dept: '학생회', date: '2026-06-26', important: true },
  { id: 2, title: 'Global Culture Day 자원봉사 모집', dept: '홍보대사', date: '2026-06-24', important: true },
  { id: 3, title: '생활관 대청소 일정 변경 (6/5 → 6/7)', dept: '자치위원', date: '2026-06-22', important: false },
  { id: 4, title: '상점·벌점 기준 카드뉴스 게시', dept: '자치법정', date: '2026-06-20', important: false },
  { id: 5, title: 'GMB 숏폼 업로드 마감 D-3', dept: 'GMB', date: '2026-06-18', important: false }
];

// 메인 대시보드 - 최근 사진 (dept 는 부서 id, 카드 색상 그라데이션에 사용)
export const galleryPhotos = [
  { id: 1, title: '학생회 정기 회의', dept: 'studentCouncil', tag: '학생회' },
  { id: 2, title: '생활관 이벤트 나이트', dept: 'autonomyCommittee', tag: '자치위원' },
  { id: 3, title: '홍보대사 캠퍼스 촬영', dept: 'ambassador', tag: '홍보대사' },
  { id: 4, title: '신문부 취재 현장', dept: 'newspaper', tag: '신문부' },
  { id: 5, title: 'GMB 브이로그 촬영', dept: 'gmb', tag: 'GMB' },
  { id: 6, title: '자치법정 모의재판', dept: 'court', tag: '자치법정' }
];

export const academicEvents = [];

// ── 공약 ──────────────────────────────────────────────────
// 공약은 부서별로 묶여 있고, '공약 이행도' 페이지에서 부서 하위탭으로 나눠 봅니다.
// 진행률(progress)은 여기서 0 으로 시작하고 관리자 > 공약 관리에서 조정합니다.
export const pledgeDepartments = [
  {
    id: 'planning',
    label: '기획부',
    titles: [
      '문경생활 가이드북(MSG)',
      'SBS 생활관 방송',
      '희망 메뉴',
      '라면데이',
      '층별자치활동',
      '계절별 생일케이크',
      '눈이 오잖아',
      '휴지 쟁탈전'
    ]
  },
  {
    id: 'welfare',
    label: '복지부',
    titles: [
      '토요일 1시 인원점검',
      '샤워기 해바라기 필터 설치',
      '카페 화장실 활성화',
      '발수건 설치',
      '제습제 설치',
      '주말 아침 상점 부활',
      '공용우산 배치',
      '우천시 우산탈수기·신발 매트 배치',
      '식당 앞 세면대 가글 배치',
      '각 기숙사 1층 택배함·반품함 설치',
      '식당 음료수컵 변경',
      '고사기간 간식 day',
      '청매 B파트 쓰레기통 설치',
      '일반간식 메뉴 다양화',
      '무선 청소기 배치',
      '아이스크림 자판기',
      '급식실 TV 활성화',
      '도어후크 설치',
      '자치위원 복지 공약',
      '의료비품 배치',
      '주말 TV 채널 시간표 제작'
    ]
  },
  {
    id: 'faith',
    label: '영성학술부',
    titles: [
      '저녁시간 기도회',
      '아침찬양·청소찬양 신청곡',
      '야외 금찬',
      '자치위원 불평팔찌',
      '선택적 야간 주말 자습',
      '고사기간 프린터기 예약제',
      '고사기간 카페 노트북 사용'
    ]
  },
  {
    id: 'promotion',
    label: '홍보예체능부',
    titles: [
      '방별 숏폼 콘테스트',
      '지비 폴라로이드',
      '배달음식 메뉴판 업데이트·다양화',
      '축구부 원정 경기 직관',
      '헬스장 필요 도구 추가',
      '아이싱 비닐봉지 배치',
      '출사동이 공기주입기 배치'
    ]
  }
];

export const getPledgeDepartment = (id) =>
  pledgeDepartments.find((dept) => dept.id === id) || pledgeDepartments[0];

// 공약 저장 키. 부서별 구조로 바뀌면서 예전 'admin-pledges' 와 형식이 달라져
// 새 키를 씁니다. (예전 키에 남은 값은 읽지 않습니다)
export const PLEDGE_STORAGE_KEY = 'admin-pledges-v2';

// 화면과 관리자에서 함께 쓰는 평평한 목록.
// id 는 저장된 진행률을 다시 붙이는 기준이라 한 번 정해지면 바뀌면 안 됩니다.
export const pledges = pledgeDepartments.flatMap((dept) =>
  dept.titles.map((title, index) => ({
    id: `${dept.id}-${index + 1}`,
    dept: dept.id,
    title,
    progress: 0,
    status: '진행중'
  }))
);

export const surveys = [
  {
    id: 1,
    title: '6월 급식 만족도 조사',
    description: '급식 메뉴와 배식 환경에 대한 의견을 받습니다.',
    url: 'https://forms.gle/example-meal',
    due: '2026-06-30',
    owner: '학생회'
  },
  {
    id: 2,
    title: '생활관 꿀팁 제보',
    description: '후배들에게 알려주고 싶은 생활관 노하우를 남겨 주세요.',
    url: 'https://forms.gle/example-dormtip',
    due: '2026-07-05',
    owner: '자치위원'
  },
  {
    id: 3,
    title: 'GMB 숏폼 아이디어 모집',
    description: '학교 생활을 담은 짧은 영상 아이디어를 받습니다.',
    url: 'https://forms.gle/example-gmb',
    due: '2026-07-10',
    owner: 'GMB'
  }
];

export const weeklyMeals = [
  { day: '월', breakfast: '토스트 / 계란 / 우유', lunch: '닭갈비덮밥 / 미역국', dinner: '돈가스 / 샐러드' },
  { day: '화', breakfast: '시리얼 / 과일', lunch: '불고기비빔밥 / 된장국', dinner: '카레라이스 / 김치' },
  { day: '수', breakfast: '밥 / 소시지 / 김', lunch: '스파게티 / 수프', dinner: '제육볶음 / 콩나물국' },
  { day: '목', breakfast: '프렌치토스트 / 요구르트', lunch: '치킨마요덮밥', dinner: '김치찌개 / 계란말이' },
  { day: '금', breakfast: '죽 / 장조림', lunch: '잔치국수 / 만두', dinner: '볶음밥 / 탕수육' }
];

export const weeklyVerse = {
  reference: '빌립보서 4:13',
  text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라',
  memo: '이번 주는 시험과 행사 준비 속에서도 하나님 안에서 성실하게 버티는 한 주입니다.'
};

export const birthdays = [
  { id: 1, name: '12A 김OO', date: '06-02', grade: '12' },
  { id: 2, name: '11B 박OO', date: '06-12', grade: '11' },
  { id: 3, name: '10C 이OO', date: '06-21', grade: '10' },
  { id: 4, name: '09A 최OO', date: '06-28', grade: '9' }
];

export const dormSchedule = [
  { time: '06:40', title: '기상 및 점호', place: '생활관' },
  { time: '07:20', title: '아침 식사', place: '식당' },
  { time: '18:00', title: '저녁 식사', place: '식당' },
  { time: '19:20', title: '자습 시작', place: '학습실' },
  { time: '22:30', title: '취침 준비', place: '생활관' }
];

export const pointGuides = [
  { title: '상점 예시', items: ['공동체 봉사', '분실물 신고', '행사 지원', '생활관 모범 활동'] },
  { title: '주의 항목', items: ['무단 외출', '지각', '공용공간 정리 미흡', '전자기기 규정 위반'] }
];

export const tips = [
  { title: '세탁 꿀팁', body: '세탁망을 사용하면 옷 손상이 줄고, 이름표를 붙이면 분실을 줄일 수 있습니다.' },
  { title: '시험기간 루틴', body: '자습 시작 전 할 일을 3개만 적고, 쉬는 시간에는 자리에서 멀리 떨어져 집중을 회복하세요.' },
  { title: '생활관 공동체', body: '룸메이트와 소등 시간, 알람 시간, 청소 순서를 미리 정하면 갈등이 줄어듭니다.' }
];

export const shortforms = [
  { id: 1, title: 'GVCS 하루 브이로그', type: 'shortform', url: 'https://example.com/shorts/1', owner: 'GMB' },
  { id: 2, title: 'Global Culture Day 사진첩', type: 'vsco', url: 'https://example.com/gallery/1', owner: '홍보대사' },
  { id: 3, title: '급식 메뉴 월드컵', type: 'shortform', url: 'https://example.com/shorts/2', owner: 'GMB' }
];

export const initialMarketItems = [
  { id: 1, title: '영어 단어장', price: '3,000원', seller: '익명', status: '판매중' },
  { id: 2, title: '깨끗한 파일철 3개', price: '나눔', seller: '익명', status: '예약중' }
];

// 이벤트 - 선착순 신청형 (숏폼 콘테스트, 휴지 쟁탈전 등)
export const events = [
  {
    id: 1,
    title: '숏폼 콘테스트',
    description: 'GVCS 생활을 담은 15초 숏폼을 찍어 제출하세요. 우수작은 학교 SNS에 게시됩니다.',
    tag: 'GMB',
    capacity: 30,
    applied: 18,
    deadline: '2026-07-11'
  },
  {
    id: 2,
    title: '휴지 쟁탈전',
    description: '생활관 라운지에서 열리는 선착순 미니게임 이벤트. 우승 팀에게 간식이 제공됩니다.',
    tag: '자치위원',
    capacity: 20,
    applied: 12,
    deadline: '2026-07-08'
  }
];

export const initialTaxiRequests = [
  { id: 1, date: '2026-06-28', time: '15:30', destination: '문경역', max: 4, memo: '캐리어 1개 가능', author: '12학년' },
  { id: 2, date: '2026-06-28', time: '16:00', destination: '점촌터미널', max: 3, memo: '시간 맞으면 같이 이동', author: '11학년' }
];

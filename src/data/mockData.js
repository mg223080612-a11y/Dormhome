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

export const academicEvents = [
  { id: 1, title: '기말고사', date: '2026-06-18', type: 'exam', dept: '학생회' },
  { id: 2, title: '기말고사', date: '2026-06-19', type: 'exam', dept: '학생회' },
  { id: 3, title: '기말고사', date: '2026-06-22', type: 'exam', dept: '학생회' },
  { id: 4, title: '학생회 공청회', date: '2026-06-25', type: 'hearing', dept: '학생회' },
  { id: 5, title: '자치위원 공청회', date: '2026-06-29', type: 'hearing', dept: '자치위원' },
  { id: 6, title: '방학식', date: '2026-07-04', type: 'event', dept: '학생회' }
];

export const pledges = [
  { id: 1, title: '생활관 스케줄표 온라인 공개', progress: 80, owner: '자치위원', status: '진행중' },
  { id: 2, title: '급식 희망 메뉴 투표 정례화', progress: 45, owner: '학생회', status: '진행중' },
  { id: 3, title: '학생 건의함 답변 주간 리포트', progress: 65, owner: '학생회', status: '검토중' },
  { id: 4, title: '학교 행사 사진첩 정리', progress: 70, owner: '홍보대사', status: '진행중' },
  { id: 5, title: '상점·벌점 기준 카드뉴스 제작', progress: 55, owner: '자치법정', status: '진행중' }
];

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

export const initialTaxiRequests = [
  { id: 1, date: '2026-06-28', time: '15:30', destination: '문경역', max: 4, memo: '캐리어 1개 가능', author: '12학년' },
  { id: 2, date: '2026-06-28', time: '16:00', destination: '점촌터미널', max: 3, memo: '시간 맞으면 같이 이동', author: '11학년' }
];

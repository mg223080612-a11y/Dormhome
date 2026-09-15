export const mainTabs = [
  { id: 'home', label: '홈' },
  { id: 'survey', label: '설문조사' },
  { id: 'pledges', label: '공약 이행도' },
  { id: 'events', label: '이벤트' },
];

// ============================================================
// 사이드바 메뉴 트리 — 4개 카테고리 + 각 카테고리의 하위 메뉴
// 카테고리 자체도 페이지이므로 id 는 App.jsx 의 pageMap 키와 같아야 합니다.
// 하위 메뉴를 옮기려면 아래 children 배열에서 항목을 이동시키면 됩니다.
// ============================================================
export const navTree = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    children: [
      { id: 'calendar', label: '달력', icon: 'calendar' },
      { id: 'verse', label: '주별 말씀', icon: 'verse' },
      { id: 'shortform', label: '사진첩', icon: 'camera' },
    ],
  },
  {
    id: 'survey',
    label: 'Surveys',
    icon: 'survey',
    children: [
      { id: 'suggestions', label: '건의함', icon: 'suggestions' },
      { id: 'cafeteriaWish', label: '희망메뉴/급식', icon: 'cafeteria' },
      { id: 'storeWish', label: '희망메뉴/매점', icon: 'store' },
    ],
  },
  {
    id: 'pledges',
    label: 'Policy Progress',
    icon: 'pledges',
    children: [
      { id: 'dormRepair', label: '수리 요청', icon: 'repair' },
    ],
  },
  {
    id: 'events',
    label: 'Events',
    icon: 'events',
    children: [
      { id: 'meal', label: '급식', icon: 'meal' },
      { id: 'taxiMate', label: '택시메이트', icon: 'taxi' },
      { id: 'market', label: '마켓', icon: 'market' },
    ],
  },
];

export const primaryMenu = navTree.map(({ children, ...item }) => item);

export const secondaryMenu = navTree.flatMap((group) => group.children);

export const menu = [...primaryMenu, ...secondaryMenu];

/** 해당 페이지가 속한 카테고리 id (카테고리 자신이면 자기 id) */
export const parentOf = (pageId) =>
  navTree.find(
    (group) => group.id === pageId || group.children.some((child) => child.id === pageId)
  )?.id || null;

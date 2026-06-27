export const primaryMenu = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'calendar', label: '달력/스케줄표', icon: '🗓️' },
  { id: 'pledges', label: '공약 이행도', icon: '✅' },
  { id: 'taxiMate', label: '택시메이트', icon: '🚕' },
  { id: 'suggestions', label: '건의함', icon: '📮' },
  { id: 'meal', label: '급식', icon: '🍱' },
  { id: 'survey', label: '설문조사', icon: '📊' }
];

export const detailMenu = [
  { id: 'dormRepair', label: '기숙사 수리 요청', icon: '🛠️' },
  { id: 'academic', label: '학사일정/시험 카운트', icon: '⏳' },
  { id: 'points', label: '상점 관련', icon: '⭐' },
  { id: 'tips', label: '생활관 꿀팁', icon: '💡' },
  { id: 'birthday', label: '달력/생일자', icon: '🎂' },
  { id: 'verse', label: '주별 말씀', icon: '📖' },
  { id: 'dormSchedule', label: '생활관 스케줄표', icon: '🏫' },
  { id: 'cafeteriaWish', label: '희망 메뉴/급식실', icon: '🥘' },
  { id: 'storeWish', label: '희망 메뉴/매점', icon: '🛒' },
  { id: 'shortform', label: '숏폼 + 사진첩', icon: '🎬' },
  { id: 'market', label: '당근마켓', icon: '🥕' }
];

export const allMenu = [...primaryMenu, ...detailMenu];

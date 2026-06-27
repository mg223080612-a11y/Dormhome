// 상단 검은색 바(GMB) 오른쪽에 표시되는 부서 순서:
// 학생회 → 자치위원 → 신문부 → 자치법정 → 홍보대사
export const departments = [
  {
    id: 'studentCouncil',
    label: '학생회',
    shortLabel: '학생회',
    color: '#1E40AF',
    soft: '#EEF2FF',
    text: '#FFFFFF',
    card: '#FFFFFF',
    line: '#ECECEC',
    description: '전체 공지, 공약 이행도, 스케줄 관리',
    focus: ['pledges', 'calendar', 'survey', 'suggestions']
  },
  {
    id: 'autonomyCommittee',
    label: '자치위원',
    shortLabel: '자치위',
    color: '#800020',
    soft: '#FBEAEF',
    text: '#FFFFFF',
    card: '#FFFFFF',
    line: '#ECECEC',
    description: '생활관 스케줄, 생활관 꿀팁, 수리 요청',
    focus: ['dormSchedule', 'tips', 'dormRepair', 'birthday']
  },
  {
    id: 'newspaper',
    label: '신문부',
    shortLabel: '신문부',
    color: '#2B2B2B',
    soft: '#FFFFF0',
    text: '#FFFFFF',
    card: '#FFFFF0',
    line: '#E6E2D2',
    description: '기사, 학교 소식, 인터뷰 콘텐츠',
    focus: ['shortform', 'verse', 'calendar']
  },
  {
    id: 'court',
    label: '자치법정',
    shortLabel: '자법',
    color: '#008080',
    soft: '#E2F5F5',
    text: '#FFFFFF',
    card: '#FFFFFF',
    line: '#ECECEC',
    description: '상점·벌점 안내, 규정 안내, 질의응답',
    focus: ['points', 'suggestions']
  },
  {
    id: 'ambassador',
    label: '홍보대사',
    shortLabel: '홍대',
    color: '#EC4899',
    soft: '#FDEAF3',
    text: '#FFFFFF',
    card: '#FFFFFF',
    line: '#ECECEC',
    description: '사진첩, 홍보 콘텐츠, 학교 브랜딩',
    focus: ['shortform', 'market']
  },
  {
    id: 'gmb',
    label: 'GMB',
    shortLabel: 'GMB',
    color: '#000000',
    soft: '#EDEDED',
    text: '#FFFFFF',
    card: '#FFFFFF',
    line: '#E2E2E2',
    description: '영상, 숏폼, 방송 콘텐츠',
    focus: ['shortform', 'cafeteriaWish']
  }
];

export const getDepartment = (id) => {
  return departments.find((dept) => dept.id === id) || departments[0];
};

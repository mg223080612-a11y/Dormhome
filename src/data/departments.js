// 자치부서 정의 (단일 소스)
// ────────────────────────────────────────────────────────────
// 색상은 theme.css 의 :root 팔레트(--student-council 등)를 그대로 참조합니다.
// 색을 바꾸고 싶으면 theme.css 의 :root 한 곳만 수정하면 됩니다.
//
// 필드 의미:
//   color : 액센트(버튼/진행바/카드 상단 라인/선택 탭에 채움색으로 사용)
//   ink   : 글자용 진한 버전(라벨·배지 글자·활성 메뉴 글자처럼 가독성이 필요한 곳)
//   soft  : 아주 옅은 배경 틴트(배지 배경·활성 메뉴 배경 등)
//   text  : 액센트 채움 위에 올라가는 글자색
export const departments = [
  {
    id: 'studentCouncil',
    label: '학생회',
    color: 'var(--student-council)',
    ink: '#172554',
    soft: '#eff6ff',
    text: '#ffffff',
    description: '전체 공지, 공약 이행도, 스케줄 관리',
    focus: ['pledges', 'calendar', 'survey', 'suggestions']
  },
  {
    id: 'autonomyCommittee',
    label: '자치위원',
    color: 'var(--committee)',
    ink: '#7f1d1d',
    soft: '#f7ecec',
    text: '#ffffff',
    description: '생활관 스케줄, 생활관 꿀팁, 수리 요청',
    focus: ['dormSchedule', 'tips', 'dormRepair', 'birthday', 'cafeteriaWish', 'market', 'shortform']
  },
  {
    id: 'newspaper',
    label: '신문부',
    // 아이보리/회색: 옅은 아이보리는 배경 틴트, 회색은 액센트로 사용
    color: 'var(--press-dark)',
    ink: '#4b5563',
    soft: '#f4f1e8',
    text: '#ffffff',
    description: '기사, 학교 소식, 인터뷰 콘텐츠',
    focus: ['shortform', 'verse', 'calendar']
  },
  {
    id: 'court',
    label: '자치법정',
    color: 'var(--court)',
    ink: '#14532d',
    soft: '#ecfdf5',
    text: '#ffffff',
    description: '상점·벌점 안내, 규정 안내, 질의응답',
    focus: ['points', 'suggestions']
  },
  {
    id: 'ambassador',
    label: '홍보대사',
    // 베이비 핑크: 밝은 색이라 글자는 진한 로즈(text)로 대비를 줍니다
    color: 'var(--ambassador)',
    ink: '#be185d',
    soft: '#fdf2f8',
    text: '#831843',
    description: '사진첩, 홍보 콘텐츠, 학교 브랜딩',
    focus: []
  },
  {
    id: 'gmb',
    label: 'GMB',
    color: 'var(--gmb)',
    ink: '#111111',
    soft: '#ededed',
    text: '#ffffff',
    description: '영상, 숏폼, 방송 콘텐츠',
    focus: []
  }
];

export const getDepartment = (id) =>
  departments.find((dept) => dept.id === id) || departments[0];

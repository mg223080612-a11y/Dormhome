export const departments = [
  {
    id: 'studentCouncil',
    label: '학생회',
    shortLabel: '학생회',
    color: '#586174',
    soft: '#EEF1F6',
    text: '#FFFFFF',
    description: '전체 공지, 공약 이행도, 스케줄 관리'
  },
  {
    id: 'autonomyCommittee',
    label: '자치위원',
    shortLabel: '자치위',
    color: '#7A1F32',
    soft: '#F7E9ED',
    text: '#FFFFFF',
    description: '생활관 스케줄, 생활관 꿀팁, 수리 요청'
  },
  {
    id: 'gmb',
    label: 'GMB',
    shortLabel: 'GMB',
    color: '#111111',
    soft: '#ECECEC',
    text: '#FFFFFF',
    description: '영상, 숏폼, 방송 콘텐츠'
  },
  {
    id: 'newspaper',
    label: '신문부',
    shortLabel: '신문부',
    color: '#F2E7D2',
    soft: '#FFF8EA',
    text: '#4A3D2E',
    description: '기사, 학교 소식, 인터뷰 콘텐츠'
  },
  {
    id: 'ambassador',
    label: '홍보대사',
    shortLabel: '홍대',
    color: '#F4A6BC',
    soft: '#FFF0F5',
    text: '#5E2237',
    description: '사진첩, 홍보 콘텐츠, 학교 브랜딩'
  },
  {
    id: 'court',
    label: '자치법정',
    shortLabel: '자법',
    color: '#008C8C',
    soft: '#E5F8F8',
    text: '#FFFFFF',
    description: '상점·벌점 안내, 규정 안내, 질의응답'
  }
];

export const getDepartment = (id) => {
  return departments.find((dept) => dept.id === id) || departments[0];
};

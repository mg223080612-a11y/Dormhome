import StatCard from '../components/StatCard';
import { getDepartment } from '../data/departments';
import {
  academicEvents,
  galleryPhotos,
  initialTaxiRequests,
  notices,
  surveys,
  weeklyMeals
} from '../data/mockData';

// 메인 대시보드에서 잘 보이도록 모아 둔 자주 쓰는 메뉴 (북마크)
const bookmarks = [
  { id: 'meal', label: '급식', icon: '🍱', desc: '주간 급식표 보기' },
  { id: 'taxiMate', label: '택시메이트', icon: '🚕', desc: '함께 탈 친구 찾기' },
  { id: 'survey', label: '설문조사', icon: '📊', desc: '열린 설문 참여' },
  { id: 'suggestions', label: '건의함', icon: '📮', desc: '의견 남기기' },
  { id: 'dormSchedule', label: '생활관 스케줄', icon: '🏫', desc: '하루 일정 확인' },
  { id: 'market', label: '당근마켓', icon: '🥕', desc: '교내 나눔·거래' }
];

const pickNextEvent = (events) => {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const upcoming = events
    .filter((event) => new Date(`${event.date}T00:00:00`) >= todayOnly)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  // 다가오는 일정이 없으면 가장 최근 일정을 보여 줍니다.
  return upcoming[0] || [...events].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};

function SectionHead({ title, actionLabel, onAction }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {onAction && (
        <button type="button" className="text-link" onClick={onAction}>
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const todayMeal = weeklyMeals[0];
  const nextEvent = pickNextEvent(academicEvents);

  return (
    <div className="dashboard">
      {/* 오늘의 요약 */}
      <section className="section">
        <SectionHead title="오늘의 요약" />
        <div className="summary-grid">
          <StatCard label="오늘 일정" value={nextEvent.title} caption={nextEvent.date} onClick={() => onNavigate('calendar')} />
          <StatCard label="오늘 급식" value={todayMeal.lunch} caption="점심 기준" onClick={() => onNavigate('meal')} />
          <StatCard label="진행 중 설문" value={`${surveys.length}개`} caption="버튼형 설문 링크" onClick={() => onNavigate('survey')} />
          <StatCard label="택시메이트" value={`${initialTaxiRequests.length}건`} caption="모집 중" onClick={() => onNavigate('taxiMate')} />
        </div>
      </section>

      {/* 북마크 */}
      <section className="section">
        <SectionHead title="북마크" />
        <div className="bookmark-grid">
          {bookmarks.map((item) => (
            <button key={item.id} type="button" className="bookmark-card" onClick={() => onNavigate(item.id)}>
              <span className="bookmark-icon">{item.icon}</span>
              <span className="bookmark-text">
                <strong>{item.label}</strong>
                <small>{item.desc}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 최근 사진 */}
      <section className="section">
        <SectionHead title="최근 사진" actionLabel="사진첩 전체보기" onAction={() => onNavigate('shortform')} />
        <div className="gallery-grid">
          {galleryPhotos.map((photo) => (
            <article
              key={photo.id}
              className="photo-card"
              style={{ '--photo': getDepartment(photo.dept).ink }}
            >
              <div className="photo-thumb">
                <span className="photo-tag">{photo.tag}</span>
              </div>
              <h3 className="photo-title">{photo.title}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* 공지사항 */}
      <section className="section">
        <SectionHead title="공지사항" actionLabel="달력에서 보기" onAction={() => onNavigate('calendar')} />
        <div className="notice-list">
          {notices.map((notice) => (
            <article key={notice.id} className="notice-item">
              <div className="notice-main">
                {notice.important && <span className="badge badge-alert">중요</span>}
                <h3>{notice.title}</h3>
              </div>
              <div className="notice-meta">
                <span>{notice.dept}</span>
                <small>{notice.date}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

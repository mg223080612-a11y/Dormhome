import { getDepartment } from '../data/departments';
import {
  events,
  galleryPhotos,
  notices,
  pledges,
  surveys,
  weeklyMeals
} from '../data/mockData';

const MEAL_PERIOD_LABEL = { breakfast: '아침', lunch: '점심', dinner: '저녁' };
const WEEKDAY_TO_MEAL_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }; // 월~금만 급식 제공

// 현재 시각에 따라 아침/점심/저녁 중 보여줄 급식을 고릅니다.
const getMealPeriod = () => {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 16) return 'lunch';
  return 'dinner';
};

const getTodayMeal = () => {
  const meal = weeklyMeals[WEEKDAY_TO_MEAL_INDEX[new Date().getDay()]];
  return meal || null;
};

const pickNextEvent = (list) => {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const upcoming = list
    .filter((event) => new Date(`${event.date}T00:00:00`) >= todayOnly)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  // 다가오는 일정이 없으면 가장 최근 일정을 보여 줍니다.
  return upcoming[0] || [...list].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
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
  const mealPeriod = getMealPeriod();
  const todayMeal = getTodayMeal();
  const mealText = todayMeal ? todayMeal[mealPeriod] : '주말에는 급식 정보가 없어요';

  const latestSurvey = surveys[0];
  const avgPledgeProgress = Math.round(
    pledges.reduce((sum, pledge) => sum + pledge.progress, 0) / pledges.length
  );
  const upcomingEvent = pickNextEvent(events.map((event) => ({ ...event, date: event.deadline })));

  return (
    <div className="dashboard">
      {/* 홈 주요 기능 */}
      <section className="section">
        <SectionHead title="홈 주요 기능" />
        <div className="feature-grid">
          <button type="button" className="feature-card" onClick={() => onNavigate('meal')}>
            <span className="feature-label">오늘의 급식 · {MEAL_PERIOD_LABEL[mealPeriod]}</span>
            <strong className="feature-value">{mealText}</strong>
          </button>

          <article className="feature-card feature-survey">
            <span className="feature-label">최근 올라온 설문</span>
            <strong className="feature-value">{latestSurvey.title}</strong>
            <small className="feature-caption">마감 {latestSurvey.due} · {latestSurvey.owner}</small>
            <div className="feature-actions">
              <a href={latestSurvey.url} target="_blank" rel="noreferrer" className="link-button">구글폼 바로가기</a>
              <button type="button" className="ghost-button" onClick={() => onNavigate('survey')}>설문조사 탭</button>
            </div>
          </article>

          <button type="button" className="feature-card" onClick={() => onNavigate('pledges')}>
            <span className="feature-label">공약 이행도</span>
            <div className="pledge-chart">
              <svg viewBox="0 0 36 36" className="pledge-ring">
                <path className="pledge-ring-bg" d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32" />
                <path
                  className="pledge-ring-fill"
                  strokeDasharray={`${avgPledgeProgress}, 100`}
                  d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32"
                />
              </svg>
              <strong className="feature-value">{avgPledgeProgress}%</strong>
            </div>
            <small className="feature-caption">전체 공약 평균 진행률</small>
          </button>

          <button type="button" className="feature-card" onClick={() => onNavigate('events')}>
            <span className="feature-label">이벤트 · 선착순 신청</span>
            <strong className="feature-value">{upcomingEvent.title}</strong>
            <small className="feature-caption">
              {upcomingEvent.applied}/{upcomingEvent.capacity}명 신청 · 마감 {upcomingEvent.deadline}
            </small>
          </button>
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

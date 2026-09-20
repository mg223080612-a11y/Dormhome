import MonthCalendar from '../components/MonthCalendar';
import { academicEvents, notices } from '../data/mockData';
import useApiData from '../utils/useApiData';

const MEAL_PERIOD_LABEL = { breakfast: '아침', lunch: '점심', dinner: '저녁' };

const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 현재 시각에 따라 아침/점심/저녁 중 보여줄 급식을 고릅니다.
const getMealPeriod = () => {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 16) return 'lunch';
  return 'dinner';
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
  // 오늘 날짜의 급식만 D1 에서 읽어옵니다.
  const today = todayKey();
  // 라벨에 쓸 '9/20' 형식 (앞의 0 없이)
  const todayLabel = `${new Date().getMonth() + 1}/${new Date().getDate()}`;
  const { data: meals } = useApiData(`/api/meals?from=${today}&to=${today}`, []);
  const todayMeal = meals[0] || null;
  const mealText = todayMeal?.[mealPeriod] || '오늘 급식 정보가 아직 없어요';

  // 관리자 > 일정 관리에서 등록한 일정을 D1 에서 읽어옵니다.
  const { data: calEvents } = useApiData('/api/events', academicEvents);

  return (
    <div className="dashboard">
      {/* 오늘의 급식 */}
      <section className="section">
        <div className="feature-grid feature-grid-single">
          <button type="button" className="feature-card" onClick={() => onNavigate('meal')}>
            <span className="feature-label">
              {todayLabel} 오늘의 급식 ({MEAL_PERIOD_LABEL[mealPeriod]})
            </span>
            {/* 메뉴가 줄바꿈으로 저장돼 있어 한 줄씩 나눠 보여줍니다. (굵게 하지 않습니다) */}
            <div className="meal-today-list">
              {mealText.split('\n').map((line, index) =>
                line ? <span key={index}>{line}</span> : null
              )}
            </div>
          </button>
        </div>
      </section>

      {/* 달력 */}
      <section className="section">
        <SectionHead title="달력" actionLabel="달력 전체보기" onAction={() => onNavigate('calendar')} />
        <MonthCalendar events={calEvents} />
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

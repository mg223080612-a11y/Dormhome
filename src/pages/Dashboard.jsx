import MonthCalendar from '../components/MonthCalendar';
import { academicEvents, notices, weeklyMeals } from '../data/mockData';
import useApiData from '../utils/useApiData';

const MEAL_PERIOD_LABEL = { breakfast: '아침', lunch: '점심', dinner: '저녁' };
const WEEKDAY_TO_MEAL_INDEX = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }; // 월~금만 급식 제공

// 현재 시각에 따라 아침/점심/저녁 중 보여줄 급식을 고릅니다.
const getMealPeriod = () => {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 16) return 'lunch';
  return 'dinner';
};

const getTodayMeal = (meals) => {
  const meal = meals[WEEKDAY_TO_MEAL_INDEX[new Date().getDay()]];
  return meal || null;
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
  // 관리자 > 급식 관리에서 저장한 표를 D1 에서 읽어옵니다.
  const { data: meals } = useApiData('/api/meals', weeklyMeals);
  const todayMeal = getTodayMeal(meals);
  const mealText = todayMeal ? todayMeal[mealPeriod] : '주말에는 급식 정보가 없어요';

  // 관리자 > 일정 관리에서 등록한 일정을 D1 에서 읽어옵니다.
  const { data: calEvents } = useApiData('/api/events', academicEvents);

  return (
    <div className="dashboard">
      {/* 오늘의 급식 */}
      <section className="section">
        <div className="feature-grid feature-grid-single">
          <button type="button" className="feature-card" onClick={() => onNavigate('meal')}>
            <span className="feature-label">오늘의 급식 · {MEAL_PERIOD_LABEL[mealPeriod]}</span>
            <strong className="feature-value">{mealText}</strong>
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

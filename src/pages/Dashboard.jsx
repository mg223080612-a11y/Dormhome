import StatCard from '../components/StatCard';
import { academicEvents, pledges, surveys, weeklyMeals, weeklyVerse } from '../data/mockData';

const average = (items) => {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length);
};

const pickNextEvent = (events) => {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const upcoming = events
    .filter((event) => new Date(`${event.date}T00:00:00`) >= todayOnly)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (upcoming.length) return upcoming[0];
  // 다가오는 일정이 없으면 가장 최근 일정을 보여 줍니다.
  return [...events].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};

export default function Dashboard({ onNavigate }) {
  const todayMeal = weeklyMeals[0];
  const nextEvent = pickNextEvent(academicEvents);

  return (
    <div className="dashboard-grid">
      <StatCard label="진행 중 공약" value={`${pledges.length}개`} caption={`평균 이행률 ${average(pledges)}%`} onClick={() => onNavigate('pledges')} />
      <StatCard label="열린 설문" value={`${surveys.length}개`} caption="버튼형 설문 링크" onClick={() => onNavigate('survey')} />
      <StatCard label="다음 일정" value={nextEvent.title} caption={nextEvent.date} onClick={() => onNavigate('calendar')} />
      <StatCard label="오늘 급식" value={todayMeal.lunch} caption="월요일 점심 기준" onClick={() => onNavigate('meal')} />

      <section className="wide-card">
        <div className="wide-card-title">
          <span>이번 주 말씀</span>
          <button type="button" onClick={() => onNavigate('verse')}>자세히</button>
        </div>
        <h2>{weeklyVerse.reference}</h2>
        <p>{weeklyVerse.text}</p>
        <small>{weeklyVerse.memo}</small>
      </section>

      <section className="wide-card muted">
        <div className="wide-card-title">
          <span>홈 UI 방향</span>
          <button type="button" onClick={() => onNavigate('suggestions')}>건의하기</button>
        </div>
        <p>
          상단에는 자치부서 전환, 좌측에는 세부 기능, 중앙에는 학교생활에 필요한 정보를 카드형으로 배치합니다.
          자치위원은 버건디, 홍보대사는 핑크, 신문부는 아이보리, 자치법정은 청록, GMB는 검정 계열로 구분합니다.
        </p>
      </section>
    </div>
  );
}

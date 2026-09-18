import { useState } from 'react';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 월 단위 달력. 일정은 해당 날짜 칸에 표시하며, 이전/다음 버튼으로 연·월을 이동할 수 있습니다.
 * 홈(Dashboard)과 달력 페이지에서 함께 씁니다.
 */
export default function MonthCalendar({ events }) {
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;
  const [view, setView] = useState({ year: defaultYear, month: defaultMonth });
  const goMonth = (delta) => {
    setView((prev) => {
      const next = prev.month + delta;
      if (next < 1) return { year: prev.year - 1, month: 12 };
      if (next > 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: next };
    });
  };

  const monthIndex = view.month - 1;
  const firstWeekday = new Date(view.year, monthIndex, 1).getDay(); // 0=일
  const daysInMonth = new Date(view.year, monthIndex + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === view.year && today.getMonth() === monthIndex;
  const todayDate = today.getDate();

  const prefix = `${view.year}-${String(view.month).padStart(2, '0')}`;
  const eventsByDay = {};
  events
    .filter((event) => event.date.startsWith(prefix))
    .forEach((event) => {
      const day = Number(event.date.slice(8, 10));
      (eventsByDay[day] = eventsByDay[day] || []).push(event);
    });

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  return (
    <div className="calendar">
      <div className="calendar-nav">
        <button type="button" className="calendar-nav-btn" onClick={() => goMonth(-1)} aria-label="이전 달">‹</button>
        <div className="calendar-title">{view.year}년 {view.month}월</div>
        <button type="button" className="calendar-nav-btn" onClick={() => goMonth(1)} aria-label="다음 달">›</button>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((name, index) => (
          <div
            key={name}
            className={`calendar-weekday${index === 0 ? ' sun' : ''}${index === 6 ? ' sat' : ''}`}
          >
            {name}
          </div>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="calendar-day empty" />;

          const weekday = (firstWeekday + day - 1) % 7;
          const classes = ['calendar-day'];
          if (isCurrentMonth && day === todayDate) classes.push('today');
          if (weekday === 0) classes.push('sun');
          if (weekday === 6) classes.push('sat');

          return (
            <div key={day} className={classes.join(' ')}>
              <span className="day-num">{day}</span>
              {(eventsByDay[day] || []).map((event) => (
                <span key={event.id} className="cal-event" title={event.title}>{event.title}</span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

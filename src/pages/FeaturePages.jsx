import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import {
  academicEvents,
  birthdays,
  dormSchedule,
  initialMarketItems,
  initialTaxiRequests,
  pledges,
  pointGuides,
  shortforms,
  surveys,
  tips,
  weeklyMeals,
  weeklyVerse
} from '../data/mockData';
import { addStorageItem, readStorage, writeStorage } from '../utils/storage';
import { genderLabel } from '../utils/auth';

const dateLabel = (value) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(date);
};

const daysUntil = (value) => {
  const today = new Date();
  const target = new Date(`${value}T00:00:00`);
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetOnly = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((targetOnly - todayOnly) / (1000 * 60 * 60 * 24));
};

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}

export function CalendarPage() {
  return (
    <PageShell title="달력 / 스케줄표" description="학교 주요 일정, 시험, 부서 일정을 한눈에 확인합니다.">
      <div className="timeline">
        {academicEvents.map((event) => (
          <article key={event.id} className="timeline-item">
            <div className="date-box">
              <strong>{dateLabel(event.date)}</strong>
              <small>{daysUntil(event.date) >= 0 ? `D-${daysUntil(event.date)}` : '종료'}</small>
            </div>
            <div>
              <h3>{event.title}</h3>
              <p>{event.dept} · {event.type}</p>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function PledgePage() {
  return (
    <PageShell title="공약 이행도" description="학생회와 자치부서 공약의 진행률을 공개합니다.">
      <div className="list-grid">
        {pledges.map((pledge) => (
          <article key={pledge.id} className="progress-card">
            <div className="between">
              <h3>{pledge.title}</h3>
              <span className="badge">{pledge.status}</span>
            </div>
            <p>{pledge.owner}</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pledge.progress}%` }} />
            </div>
            <strong>{pledge.progress}%</strong>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function TaxiMatePage({ session }) {
  const [items, setItems] = useState(() => readStorage('taxi-requests', initialTaxiRequests));
  const [form, setForm] = useState({ date: '', time: '', destination: '', max: 4, memo: '' });
  const visibleItems = items.filter((item) => item.gender === session.gender);
  const canUse = session.gender === 'female' || session.gender === 'male';

  const submit = (event) => {
    event.preventDefault();
    if (!canUse || !form.date || !form.time || !form.destination) return;

    const next = addStorageItem(
      'taxi-requests',
      {
        ...form,
        gender: session.gender,
        author: session.name,
        max: Number(form.max)
      },
      initialTaxiRequests
    );
    setItems(next);
    setForm({ date: '', time: '', destination: '', max: 4, memo: '' });
  };

  return (
    <PageShell
      title="택시메이트"
      description="MG 끝자리로 구분된 그룹만 보이도록 만든 화면입니다. 실제 운영 시에는 서버 권한 규칙으로 보호해야 합니다."
    >
      <div className="notice-card">
        현재 로그인 그룹: <b>{genderLabel(session.gender)}</b>
      </div>

      {!canUse ? (
        <EmptyState text="MG 끝자리로 그룹을 확인하지 못했습니다. auth.js의 GENDER_RULE을 확인해 주세요." />
      ) : (
        <>
          <form className="inline-form" onSubmit={submit}>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <input placeholder="목적지" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            <input type="number" min="2" max="6" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} />
            <input placeholder="메모" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
            <button type="submit">등록</button>
          </form>

          <div className="list-grid">
            {visibleItems.map((item) => (
              <article key={item.id} className="simple-card">
                <div className="between">
                  <h3>{item.destination}</h3>
                  <span className="badge">최대 {item.max}명</span>
                </div>
                <p>{item.date} {item.time}</p>
                <small>{item.memo || '메모 없음'} · 작성자 {item.author}</small>
              </article>
            ))}
            {visibleItems.length === 0 && <EmptyState text="아직 등록된 택시메이트가 없습니다." />}
          </div>
        </>
      )}
    </PageShell>
  );
}

export function SuggestionPage({ session }) {
  const [items, setItems] = useState(() => readStorage('suggestions', []));
  const [form, setForm] = useState({ category: '학교생활', title: '', body: '' });

  const submit = (event) => {
    event.preventDefault();
    if (!form.title || !form.body) return;
    const next = addStorageItem('suggestions', { ...form, author: session.name, status: '접수' });
    setItems(next);
    setForm({ category: '학교생활', title: '', body: '' });
  };

  return (
    <PageShell title="건의함" description="학교생활, 급식, 생활관, 행사 관련 의견을 접수합니다.">
      <form className="stack-form" onSubmit={submit}>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>학교생활</option>
          <option>급식</option>
          <option>생활관</option>
          <option>행사</option>
          <option>기타</option>
        </select>
        <input placeholder="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="내용" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button type="submit">건의 등록</button>
      </form>

      <div className="list-grid top-gap">
        {items.map((item) => (
          <article key={item.id} className="simple-card">
            <div className="between">
              <h3>{item.title}</h3>
              <span className="badge">{item.status}</span>
            </div>
            <p>{item.body}</p>
            <small>{item.category} · {item.author}</small>
          </article>
        ))}
        {items.length === 0 && <EmptyState text="등록된 건의가 없습니다." />}
      </div>
    </PageShell>
  );
}

export function MealPage() {
  return (
    <PageShell title="급식" description="주간 급식표와 희망 메뉴 기능으로 연결합니다.">
      <div className="meal-table">
        {weeklyMeals.map((meal) => (
          <article key={meal.day} className="meal-row">
            <strong>{meal.day}</strong>
            <span>아침: {meal.breakfast}</span>
            <span>점심: {meal.lunch}</span>
            <span>저녁: {meal.dinner}</span>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function SurveyPage() {
  const [surveyItems, setSurveyItems] = useState(() => readStorage('surveys', surveys));
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const refresh = () => {
    const stored = readStorage('surveys', surveys);
    setSurveyItems(stored);
    setRefreshedAt(new Date());
  };

  const reset = () => {
    writeStorage('surveys', surveys);
    setSurveyItems(surveys);
    setRefreshedAt(new Date());
  };

  return (
    <PageShell title="설문조사" description="설문 링크를 버튼 형태로 모아두고 새로고침할 수 있습니다.">
      <div className="between toolbar">
        <small>마지막 새로고침: {refreshedAt.toLocaleString('ko-KR')}</small>
        <div className="button-row">
          <button type="button" onClick={refresh}>새로고침</button>
          <button type="button" className="ghost-button" onClick={reset}>기본 링크 복원</button>
        </div>
      </div>

      <div className="list-grid">
        {surveyItems.map((survey) => (
          <article key={survey.id} className="simple-card survey-card">
            <div className="between">
              <h3>{survey.title}</h3>
              <span className="badge">{survey.owner}</span>
            </div>
            <p>{survey.description}</p>
            <small>마감: {survey.due}</small>
            <a href={survey.url} target="_blank" rel="noreferrer" className="link-button">설문 열기</a>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function DormRepairPage({ session }) {
  const [items, setItems] = useState(() => readStorage('repair-requests', []));
  const [form, setForm] = useState({ room: '', category: '전기', body: '' });

  const submit = (event) => {
    event.preventDefault();
    if (!form.room || !form.body) return;
    const next = addStorageItem('repair-requests', { ...form, author: session.name, status: '접수' });
    setItems(next);
    setForm({ room: '', category: '전기', body: '' });
  };

  return (
    <PageShell title="기숙사 수리 요청" description="생활관 시설 문제를 접수하고 처리 상태를 확인합니다.">
      <form className="inline-form" onSubmit={submit}>
        <input placeholder="호실" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>전기</option>
          <option>수도</option>
          <option>가구</option>
          <option>냉난방</option>
          <option>기타</option>
        </select>
        <input placeholder="수리 내용" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button type="submit">요청</button>
      </form>

      <div className="list-grid top-gap">
        {items.map((item) => (
          <article key={item.id} className="simple-card">
            <div className="between">
              <h3>{item.room} · {item.category}</h3>
              <span className="badge">{item.status}</span>
            </div>
            <p>{item.body}</p>
            <small>{item.author}</small>
          </article>
        ))}
        {items.length === 0 && <EmptyState text="수리 요청이 없습니다." />}
      </div>
    </PageShell>
  );
}

export function AcademicPage() {
  const exams = academicEvents.filter((event) => event.type === 'exam');
  return (
    <PageShell title="학사일정 / 주요 일정 카운트" description="중간고사, 기말고사, 주요 행사까지 남은 일수를 보여줍니다.">
      <div className="list-grid">
        {exams.map((exam) => (
          <article key={exam.id} className="countdown-card">
            <span>{exam.title}</span>
            <strong>{daysUntil(exam.date) >= 0 ? `D-${daysUntil(exam.date)}` : '종료'}</strong>
            <small>{exam.date}</small>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function PointsPage() {
  return (
    <PageShell title="상점 관련" description="상점 기준과 생활 규정 안내를 카드 형태로 정리합니다.">
      <div className="list-grid">
        {pointGuides.map((guide) => (
          <article key={guide.title} className="simple-card">
            <h3>{guide.title}</h3>
            <ul className="clean-list">
              {guide.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function TipsPage() {
  return (
    <PageShell title="생활관 꿀팁" description="생활관 적응과 공동체 생활에 필요한 노하우를 모읍니다.">
      <div className="list-grid">
        {tips.map((tip) => (
          <article key={tip.title} className="simple-card">
            <h3>{tip.title}</h3>
            <p>{tip.body}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function BirthdayPage() {
  return (
    <PageShell title="달력 / 생일자" description="월별 생일자를 확인합니다. 실제 운영 시 공개 범위 동의가 필요합니다.">
      <div className="list-grid">
        {birthdays.map((person) => (
          <article key={person.id} className="simple-card birthday-card">
            <strong>{person.date}</strong>
            <h3>{person.name}</h3>
            <p>{person.grade}학년</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function VersePage() {
  return (
    <PageShell title="주별 말씀" description="한 주의 말씀과 적용 메모를 올립니다.">
      <article className="verse-card">
        <span>{weeklyVerse.reference}</span>
        <h2>{weeklyVerse.text}</h2>
        <p>{weeklyVerse.memo}</p>
      </article>
    </PageShell>
  );
}

export function DormSchedulePage() {
  return (
    <PageShell title="생활관 스케줄표" description="생활관 하루 흐름을 시간표로 정리합니다.">
      <div className="timeline compact">
        {dormSchedule.map((item) => (
          <article key={item.time} className="timeline-item">
            <div className="date-box"><strong>{item.time}</strong></div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.place}</p>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function WantedMenuPage({ type }) {
  const storageKey = type === 'store' ? 'store-wish' : 'cafeteria-wish';
  const label = type === 'store' ? '매점' : '급식실';
  const [items, setItems] = useState(() => readStorage(storageKey, []));
  const [menu, setMenu] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!menu) return;
    const next = addStorageItem(storageKey, { menu, votes: 1 });
    setItems(next);
    setMenu('');
  };

  return (
    <PageShell title={`희망 메뉴 / ${label}`} description={`${label}에 원하는 메뉴 또는 재출시 요청 메뉴를 등록합니다.`}>
      <form className="inline-form" onSubmit={submit}>
        <input placeholder="원하는 메뉴 입력" value={menu} onChange={(e) => setMenu(e.target.value)} />
        <button type="submit">등록</button>
      </form>

      <div className="list-grid top-gap">
        {items.map((item) => (
          <article key={item.id} className="simple-card">
            <div className="between">
              <h3>{item.menu}</h3>
              <span className="badge">추천 {item.votes}</span>
            </div>
          </article>
        ))}
        {items.length === 0 && <EmptyState text="아직 등록된 희망 메뉴가 없습니다." />}
      </div>
    </PageShell>
  );
}

export function ShortformPage() {
  return (
    <PageShell title="숏폼 + VSCO 사진첩" description="GMB 영상과 홍보대사 사진첩 링크를 모아 보여줍니다.">
      <div className="media-grid">
        {shortforms.map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="media-card">
            <div className="media-thumb">{item.type === 'vsco' ? '📷' : '▶'}</div>
            <h3>{item.title}</h3>
            <p>{item.owner} · {item.type}</p>
          </a>
        ))}
      </div>
    </PageShell>
  );
}

export function MarketPage() {
  const [items, setItems] = useState(() => readStorage('market-items', initialMarketItems));
  const [form, setForm] = useState({ title: '', price: '', seller: '익명' });

  const submit = (event) => {
    event.preventDefault();
    if (!form.title || !form.price) return;
    const next = addStorageItem('market-items', { ...form, status: '판매중' }, initialMarketItems);
    setItems(next);
    setForm({ title: '', price: '', seller: '익명' });
  };

  return (
    <PageShell title="당근마켓" description="학교 안에서 필요한 물건을 안전하게 나눔·거래하는 게시판입니다.">
      <form className="inline-form" onSubmit={submit}>
        <input placeholder="물건 이름" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="가격 또는 나눔" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="판매자 표시명" value={form.seller} onChange={(e) => setForm({ ...form, seller: e.target.value })} />
        <button type="submit">등록</button>
      </form>

      <div className="list-grid top-gap">
        {items.map((item) => (
          <article key={item.id} className="simple-card">
            <div className="between">
              <h3>{item.title}</h3>
              <span className="badge">{item.status}</span>
            </div>
            <p>{item.price}</p>
            <small>{item.seller}</small>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function NotFoundPage({ onNavigate }) {
  return (
    <PageShell title="페이지를 찾을 수 없습니다" description="좌측 메뉴에서 다시 선택해 주세요.">
      <button type="button" onClick={() => onNavigate('home')}>홈으로 이동</button>
    </PageShell>
  );
}

export function useCurrentMonthEvents() {
  return useMemo(() => academicEvents, []);
}

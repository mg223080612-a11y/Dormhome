import { useState } from 'react';
import MonthCalendar from '../components/MonthCalendar';
import PageShell from '../components/PageShell';
import {
  PLEDGE_STORAGE_KEY,
  academicEvents,
  events,
  getPledgeDepartment,
  initialMarketItems,
  initialTaxiRequests,
  pledgeDepartments,
  pledges,
  shortforms,
  surveys,
  weeklyMeals,
  weeklyVerse
} from '../data/mockData';
import { addStorageItem, readStorage, writeStorage } from '../utils/storage';
import useStoredValue from '../utils/useStoredValue';

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
  const calEvents = readStorage('admin-events', academicEvents);
  const upcoming = calEvents
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <PageShell title="달력 / 스케줄표" description="학교 주요 일정, 시험, 부서 일정을 한눈에 확인합니다.">
      <MonthCalendar events={calEvents} />

      {upcoming.length > 0 && (
        <>
          <h3 className="subhead">다가오는 일정</h3>
          <div className="timeline">
            {upcoming.map((event) => (
              <article key={event.id} className="timeline-item">
                <div className="date-box">
                  <strong>{dateLabel(event.date)}</strong>
                  <small>D-{daysUntil(event.date)}</small>
                </div>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.dept} · {event.type}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}

// 목록의 평균 진행률(소수점 버림). 항목이 없으면 0.
const averageProgress = (list) =>
  list.length === 0
    ? 0
    : Math.round(list.reduce((sum, item) => sum + (Number(item.progress) || 0), 0) / list.length);

export function PledgePage() {
  const [deptId, setDeptId] = useState(pledgeDepartments[0].id);
  // 관리자 > 공약 관리에서 저장한 값을 바로 반영합니다.
  const allPledges = useStoredValue(PLEDGE_STORAGE_KEY, pledges);

  const current = getPledgeDepartment(deptId);
  const deptPledges = allPledges.filter((pledge) => pledge.dept === deptId);
  const deptAverage = averageProgress(deptPledges);
  const doneCount = deptPledges.filter((pledge) => Number(pledge.progress) >= 100).length;

  return (
    <PageShell title="공약 이행도" description="자치부서 공약의 진행률을 부서별로 공개합니다.">
      {/* 부서 하위탭 — 탭에 해당 부서 평균 이행도를 같이 보여 줍니다. */}
      <div className="subtabs">
        {pledgeDepartments.map((dept) => {
          const list = allPledges.filter((pledge) => pledge.dept === dept.id);
          return (
            <button
              key={dept.id}
              type="button"
              className={dept.id === deptId ? 'subtab active' : 'subtab'}
              onClick={() => setDeptId(dept.id)}
            >
              <span className="subtab-label">{dept.label}</span>
              <span className="subtab-pct">{averageProgress(list)}%</span>
            </button>
          );
        })}
      </div>

      {/* 선택한 부서 요약 */}
      <section className="dept-summary">
        <div className="between">
          <h3>{current.label} 이행도</h3>
          <strong className="dept-summary-pct">{deptAverage}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${deptAverage}%` }} />
        </div>
        <small>
          공약 {deptPledges.length}개 · 완료 {doneCount}개
        </small>
      </section>

      {deptPledges.length === 0 ? (
        <EmptyState text="등록된 공약이 없습니다." />
      ) : (
        <div className="list-grid">
          {deptPledges.map((pledge, index) => (
            <article key={pledge.id} className="progress-card">
              <div className="between">
                <h3>
                  <span className="pledge-no">{index + 1}</span>
                  {pledge.title}
                </h3>
                <span className="badge">{pledge.status}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pledge.progress}%` }} />
              </div>
              <strong>{pledge.progress}%</strong>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export function EventPage({ session }) {
  const [applicants, setApplicants] = useState(() => readStorage('event-applicants', {}));

  const join = (event) => {
    const list = applicants[event.id] || [];
    if (list.includes(session.name)) return;
    if (event.applied + list.length >= event.capacity) return;
    const next = { ...applicants, [event.id]: [...list, session.name] };
    writeStorage('event-applicants', next);
    setApplicants(next);
  };

  return (
    <PageShell title="이벤트" description="숏폼 콘테스트, 휴지 쟁탈전 등 선착순 신청 이벤트에 참여해 보세요.">
      <div className="list-grid">
        {events.map((event) => {
          const list = applicants[event.id] || [];
          const current = event.applied + list.length;
          const full = current >= event.capacity;
          const joined = list.includes(session.name);

          return (
            <article key={event.id} className="simple-card event-card">
              <div className="between">
                <h3>{event.title}</h3>
                <span className="badge">{event.tag}</span>
              </div>
              <p>{event.description}</p>
              <small>마감: {event.deadline} · 선착순 {event.capacity}명</small>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, (current / event.capacity) * 100)}%` }} />
              </div>
              <div className="between">
                <strong>{current}/{event.capacity}명 신청</strong>
                <button type="button" disabled={full || joined} onClick={() => join(event)}>
                  {joined ? '신청 완료' : full ? '마감' : '선착순 신청'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

export function TaxiMatePage({ session }) {
  const [items, setItems] = useState(() => readStorage('taxi-requests', initialTaxiRequests));
  const [form, setForm] = useState({ date: '', time: '', destination: '', max: 4, memo: '' });

  const submit = (event) => {
    event.preventDefault();
    if (!form.date || !form.time || !form.destination) return;

    const next = addStorageItem(
      'taxi-requests',
      {
        ...form,
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
      description="함께 택시를 탈 친구를 찾는 화면입니다. 실제 운영 시에는 서버 권한 규칙으로 보호해야 합니다."
    >
      <form className="inline-form" onSubmit={submit}>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        <input placeholder="목적지" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
        <input type="number" min="2" max="6" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} />
        <input placeholder="메모" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
        <button type="submit">등록</button>
      </form>

      <div className="list-grid">
        {items.map((item) => (
          <article key={item.id} className="simple-card">
            <div className="between">
              <h3>{item.destination}</h3>
              <span className="badge">최대 {item.max}명</span>
            </div>
            <p>{item.date} {item.time}</p>
            <small>{item.memo || '메모 없음'} · 작성자 {item.author}</small>
          </article>
        ))}
        {items.length === 0 && <EmptyState text="아직 등록된 택시메이트가 없습니다." />}
      </div>
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

export function VersePage() {
  // 관리자 페이지 > 주별 말씀 에서 저장한 내용을 그대로 보여줍니다.
  const verse = useStoredValue('admin-verse', weeklyVerse);

  return (
    <PageShell title="주별 말씀" description="한 주의 말씀과 적용 메모를 올립니다.">
      <article className="verse-card">
        <span>{verse.reference}</span>
        <h2>{verse.text}</h2>
        {verse.memo && <p>{verse.memo}</p>}
        {verse.updatedAt && (
          <small className="verse-updated">
            업데이트 {new Intl.DateTimeFormat('ko-KR', {
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).format(new Date(verse.updatedAt))}
          </small>
        )}
      </article>
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
            <span className="media-icon">{item.type === 'vsco' ? '📷' : '▶'}</span>
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

export function SosPage() {
  return (
    <PageShell title="SOS" description="SOS 소개 페이지입니다.">
      <div className="empty-state">내용이 곧 추가됩니다.</div>
    </PageShell>
  );
}

export function SyncPage() {
  return (
    <PageShell title="Sync" description="Sync 소개 페이지입니다.">
      <div className="empty-state">내용이 곧 추가됩니다.</div>
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

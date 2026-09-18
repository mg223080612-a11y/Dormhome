import { useState } from 'react';
import MonthCalendar from '../components/MonthCalendar';
import PageShell from '../components/PageShell';
import {
  academicEvents,
  events,
  initialMarketItems,
  initialTaxiRequests,
  pledgeDepartments,
  pledges,
  shortforms,
  weeklyVerse
} from '../data/mockData';
import { addStorageItem, readStorage, writeStorage } from '../utils/storage';
import useApiData from '../utils/useApiData';

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
  // 관리자 > 일정 관리에서 등록한 일정을 D1 에서 읽어옵니다.
  const { data: calEvents } = useApiData('/api/events', academicEvents);
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

// 부서 이행도 = 체크된 공약 수 / 전체 공약 수
const donePercent = (list) =>
  list.length === 0 ? 0 : Math.round((list.filter((item) => item.done).length / list.length) * 100);

export function PledgePage() {
  // 열려 있는 부서 하나만 펼칩니다. null 이면 모두 접힘.
  const [openDept, setOpenDept] = useState(null);
  // 관리자가 저장한 이행 여부를 D1 에서 읽어옵니다.
  // 불러오지 못하면 코드의 기본 목록(전부 미이행)을 보여 줍니다.
  const { data: allPledges, loading } = useApiData('/api/pledges', pledges);

  const totalDone = allPledges.filter((pledge) => pledge.done).length;
  const totalPercent = donePercent(allPledges);

  return (
    <PageShell title="공약 이행도" description="자치부서 공약의 이행도를 부서별로 공개합니다. 부서를 누르면 공약 명단이 펼쳐집니다.">
      {/* 전체(네 부서 합산) 이행도 */}
      <section className="pledge-total">
        <div className="between">
          <h3>전체 공약 이행도</h3>
          <strong className="pledge-total-pct">{loading ? '…' : `${totalPercent}%`}</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${loading ? 0 : totalPercent}%` }} />
        </div>
        <small>공약 {allPledges.length}개 중 {totalDone}개 이행</small>
      </section>

      <div className="pledge-accordion">
        {pledgeDepartments.map((dept) => {
          const list = allPledges.filter((pledge) => pledge.dept === dept.id);
          const doneCount = list.filter((pledge) => pledge.done).length;
          const percent = donePercent(list);
          const open = openDept === dept.id;

          return (
            <article key={dept.id} className={open ? 'pledge-dept open' : 'pledge-dept'}>
              <button
                type="button"
                className="pledge-dept-head"
                aria-expanded={open}
                onClick={() => setOpenDept(open ? null : dept.id)}
              >
                <span className="pledge-dept-name">
                  <span className="pledge-caret" aria-hidden="true">›</span>
                  {dept.label}
                </span>
                <span className="pledge-dept-pct">{percent}%</span>
              </button>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <small className="pledge-dept-note">
                공약 {list.length}개 중 {doneCount}개 이행
              </small>

              {open &&
                (list.length === 0 ? (
                  <EmptyState text="등록된 공약이 없습니다." />
                ) : (
                  <ul className="pledge-list">
                    {list.map((pledge, index) => (
                      <li key={pledge.id} className={pledge.done ? 'done' : ''}>
                        <span className="pledge-no">{index + 1}</span>
                        <span className="pledge-title">{pledge.title}</span>
                        {pledge.done && <span className="pledge-check" aria-label="이행 완료">✓</span>}
                      </li>
                    ))}
                  </ul>
                ))}
            </article>
          );
        })}
      </div>
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

// 이번 주 월요일(일요일이면 지난 월요일)을 구합니다.
const mondayOf = (base) => {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const shift = (date.getDay() + 6) % 7; // 월=0 … 일=6
  date.setDate(date.getDate() - shift);
  return date;
};

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function MealPage() {
  // 0 = 이번 주, -1 = 지난 주, 1 = 다음 주
  const [weekOffset, setWeekOffset] = useState(0);

  const monday = mondayOf(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);

  const week = WEEKDAY_LABELS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { label, date, key: toDateKey(date) };
  });

  const from = week[0].key;
  const to = week[6].key;
  const { data: meals, loading } = useApiData(`/api/meals?from=${from}&to=${to}`, []);

  const byDate = {};
  meals.forEach((meal) => {
    byDate[meal.date] = meal;
  });

  const todayKey = toDateKey(new Date());
  const hasAny = week.some((day) => {
    const meal = byDate[day.key];
    return meal && (meal.breakfast || meal.lunch || meal.dinner);
  });

  return (
    <PageShell title="급식" description="주간 급식표입니다. 월요일부터 일요일까지 보여줍니다.">
      <div className="between toolbar">
        <button type="button" className="ghost-button" onClick={() => setWeekOffset(weekOffset - 1)}>‹ 지난 주</button>
        <strong>
          {monday.getFullYear()}년 {monday.getMonth() + 1}월 {monday.getDate()}일 주
          {weekOffset === 0 && ' (이번 주)'}
        </strong>
        <button type="button" className="ghost-button" onClick={() => setWeekOffset(weekOffset + 1)}>다음 주 ›</button>
      </div>

      {loading ? (
        <EmptyState text="불러오는 중…" />
      ) : !hasAny ? (
        <EmptyState text="이 주의 급식이 아직 등록되지 않았습니다." />
      ) : (
        <div className="meal-week">
          {week.map((day) => {
            const meal = byDate[day.key] || {};
            const isToday = day.key === todayKey;
            return (
              <article key={day.key} className={isToday ? 'meal-day today' : 'meal-day'}>
                <header className="meal-day-head">
                  <strong>{day.label}</strong>
                  <small>{day.date.getMonth() + 1}/{day.date.getDate()}</small>
                  {isToday && <span className="badge">오늘</span>}
                </header>
                <div className="meal-day-body">
                  {[
                    ['아침', meal.breakfast],
                    ['점심', meal.lunch],
                    ['저녁', meal.dinner]
                  ].map(([label, value]) => (
                    <div key={label} className="meal-slot">
                      <span className="meal-slot-label">{label}</span>
                      {value ? (
                        <ul>
                          {value.split('\n').filter(Boolean).map((item, i) => (
                            <li key={`${label}-${i}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="meal-slot-empty">—</p>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

export function SurveyPage() {
  // 관리자 > 설문 관리에서 등록한 링크를 D1 에서 읽어옵니다.
  const { data: surveyItems, loading, reload } = useApiData('/api/surveys', []);
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const refresh = () => {
    reload();
    setRefreshedAt(new Date());
  };

  return (
    <PageShell title="설문조사" description="설문 링크를 버튼 형태로 모아둡니다.">
      <div className="between toolbar">
        <small>마지막 새로고침: {refreshedAt.toLocaleString('ko-KR')}</small>
        <div className="button-row">
          <button type="button" onClick={refresh}>새로고침</button>
        </div>
      </div>

      {loading ? (
        <EmptyState text="불러오는 중…" />
      ) : surveyItems.length === 0 ? (
        <EmptyState text="등록된 설문이 없습니다. 관리자 페이지에서 추가할 수 있습니다." />
      ) : (
        <div className="list-grid">
          {surveyItems.map((survey) => (
            <article key={survey.id} className="simple-card survey-card">
              <div className="between">
                <h3>{survey.title}</h3>
                {survey.owner && <span className="badge">{survey.owner}</span>}
              </div>
              {survey.description && <p>{survey.description}</p>}
              {survey.due && <small>마감: {survey.due}</small>}
              <a href={survey.url} target="_blank" rel="noreferrer" className="link-button">설문 열기</a>
            </article>
          ))}
        </div>
      )}
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
  // 관리자 페이지 > 주별 말씀 에서 저장한 내용을 D1 에서 읽어옵니다.
  const { data: verse } = useApiData('/api/verse', weeklyVerse);

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

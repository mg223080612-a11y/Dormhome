import { useState } from 'react';
import PageShell from '../components/PageShell';
import {
  academicEvents as defaultEvents,
  pledges as defaultPledges,
  surveys as defaultSurveys,
  weeklyMeals as defaultMeals,
  weeklyVerse as defaultVerse,
} from '../data/mockData';
import { readStorage, writeStorage } from '../utils/storage';

const TABS = [
  { id: 'events', label: '일정 관리' },
  { id: 'pledges', label: '공약 관리' },
  { id: 'surveys', label: '설문 관리' },
  { id: 'meals', label: '급식 관리' },
  { id: 'verse', label: '주별 말씀' },
  { id: 'suggestions', label: '건의함' },
  { id: 'repair', label: '수리 요청' },
  { id: 'taxi', label: '택시메이트' },
];

function AdminEvents() {
  const [items, setItems] = useState(() => readStorage('admin-events', defaultEvents));
  const [form, setForm] = useState({ title: '', date: '', type: 'event', dept: '학생회' });

  const save = (next) => { writeStorage('admin-events', next); setItems(next); };

  const add = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    save([...items, { id: Date.now(), ...form }]);
    setForm({ title: '', date: '', type: 'event', dept: '학생회' });
  };

  const remove = (id) => save(items.filter((i) => i.id !== id));

  return (
    <>
      <form className="admin-form" onSubmit={add}>
        <input placeholder="일정 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="event">행사</option>
          <option value="exam">시험</option>
          <option value="hearing">공청회</option>
        </select>
        <select value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>
          <option>학생회</option>
          <option>자치위원</option>
          <option>홍보대사</option>
          <option>자치법정</option>
          <option>GMB</option>
        </select>
        <button type="submit">추가</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>제목</th><th>날짜</th><th>유형</th><th>부서</th><th></th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.date}</td>
              <td>{item.type}</td>
              <td>{item.dept}</td>
              <td><button type="button" className="admin-del" onClick={() => remove(item.id)}>삭제</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AdminPledges() {
  const [items, setItems] = useState(() => readStorage('admin-pledges', defaultPledges));
  const [form, setForm] = useState({ title: '', progress: 0, owner: '학생회', status: '진행중' });

  const save = (next) => { writeStorage('admin-pledges', next); setItems(next); };

  const add = (e) => {
    e.preventDefault();
    if (!form.title) return;
    save([...items, { id: Date.now(), ...form, progress: Number(form.progress) }]);
    setForm({ title: '', progress: 0, owner: '학생회', status: '진행중' });
  };

  const updateProgress = (id, progress) => {
    save(items.map((i) => (i.id === id ? { ...i, progress: Number(progress) } : i)));
  };

  const remove = (id) => save(items.filter((i) => i.id !== id));

  return (
    <>
      <form className="admin-form" onSubmit={add}>
        <input placeholder="공약 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input type="number" min="0" max="100" placeholder="진행률" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
        <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>
          <option>학생회</option>
          <option>자치위원</option>
          <option>홍보대사</option>
          <option>자치법정</option>
          <option>GMB</option>
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>진행중</option>
          <option>검토중</option>
          <option>완료</option>
          <option>보류</option>
        </select>
        <button type="submit">추가</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>제목</th><th>진행률</th><th>담당</th><th>상태</th><th></th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>
                <input type="range" min="0" max="100" value={item.progress} onChange={(e) => updateProgress(item.id, e.target.value)} />
                <span>{item.progress}%</span>
              </td>
              <td>{item.owner}</td>
              <td>{item.status}</td>
              <td><button type="button" className="admin-del" onClick={() => remove(item.id)}>삭제</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AdminSurveys() {
  const [items, setItems] = useState(() => readStorage('admin-surveys', defaultSurveys));
  const [form, setForm] = useState({ title: '', description: '', url: '', due: '', owner: '학생회' });

  const save = (next) => { writeStorage('admin-surveys', next); setItems(next); };

  const add = (e) => {
    e.preventDefault();
    if (!form.title || !form.url) return;
    save([...items, { id: Date.now(), ...form }]);
    setForm({ title: '', description: '', url: '', due: '', owner: '학생회' });
  };

  const remove = (id) => save(items.filter((i) => i.id !== id));

  return (
    <>
      <form className="admin-form" onSubmit={add}>
        <input placeholder="설문 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
        <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>
          <option>학생회</option>
          <option>자치위원</option>
          <option>GMB</option>
        </select>
        <button type="submit">추가</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>제목</th><th>마감</th><th>담당</th><th></th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.due}</td>
              <td>{item.owner}</td>
              <td><button type="button" className="admin-del" onClick={() => remove(item.id)}>삭제</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AdminMeals() {
  const [items, setItems] = useState(() => readStorage('admin-meals', defaultMeals));

  const save = (next) => { writeStorage('admin-meals', next); setItems(next); };

  const update = (index, field, value) => {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    save(next);
  };

  return (
    <table className="admin-table">
      <thead><tr><th>요일</th><th>아침</th><th>점심</th><th>저녁</th></tr></thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={item.day}>
            <td><strong>{item.day}</strong></td>
            <td><input value={item.breakfast} onChange={(e) => update(i, 'breakfast', e.target.value)} /></td>
            <td><input value={item.lunch} onChange={(e) => update(i, 'lunch', e.target.value)} /></td>
            <td><input value={item.dinner} onChange={(e) => update(i, 'dinner', e.target.value)} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AdminVerse() {
  const [verse, setVerse] = useState(() => readStorage('admin-verse', defaultVerse));

  const update = (field, value) => {
    const next = { ...verse, [field]: value };
    writeStorage('admin-verse', next);
    setVerse(next);
  };

  return (
    <div className="admin-verse-form">
      <label>
        <span>구절 위치</span>
        <input value={verse.reference} onChange={(e) => update('reference', e.target.value)} />
      </label>
      <label>
        <span>말씀</span>
        <textarea value={verse.text} onChange={(e) => update('text', e.target.value)} />
      </label>
      <label>
        <span>적용 메모</span>
        <textarea value={verse.memo} onChange={(e) => update('memo', e.target.value)} />
      </label>
    </div>
  );
}

function AdminReadonly({ storageKey, fallback, columns }) {
  const items = readStorage(storageKey, fallback);

  const clearAll = () => {
    writeStorage(storageKey, []);
    window.location.reload();
  };

  return (
    <>
      {items.length > 0 && (
        <div className="admin-toolbar">
          <span>{items.length}건</span>
          <button type="button" className="admin-del" onClick={clearAll}>전체 삭제</button>
        </div>
      )}
      <table className="admin-table">
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {columns.map((c) => <td key={c.key}>{item[c.key]}</td>)}
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={columns.length} className="admin-empty">데이터가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

const ADMIN_PIN = 'wkcldnldnjs';

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const check = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('admin-auth', '1');
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="admin-pin">
      <h3>관리자 인증</h3>
      <p>관리자 PIN을 입력해 주세요.</p>
      <form className="admin-pin-form" onSubmit={check}>
        <input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          placeholder="PIN 입력"
          autoFocus
        />
        <button type="submit">확인</button>
      </form>
      {error && <span className="admin-pin-error">PIN이 올바르지 않습니다.</span>}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin-auth') === '1');
  const [tab, setTab] = useState('events');

  if (!authed) {
    return (
      <PageShell title="관리자 페이지" description="사이트 전체 정보를 관리합니다.">
        <PinGate onUnlock={() => setAuthed(true)} />
      </PageShell>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'events': return <AdminEvents />;
      case 'pledges': return <AdminPledges />;
      case 'surveys': return <AdminSurveys />;
      case 'meals': return <AdminMeals />;
      case 'verse': return <AdminVerse />;
      case 'suggestions':
        return <AdminReadonly storageKey="suggestions" fallback={[]} columns={[
          { key: 'category', label: '분류' },
          { key: 'title', label: '제목' },
          { key: 'body', label: '내용' },
          { key: 'author', label: '작성자' },
          { key: 'status', label: '상태' },
        ]} />;
      case 'repair':
        return <AdminReadonly storageKey="repair-requests" fallback={[]} columns={[
          { key: 'room', label: '호실' },
          { key: 'category', label: '분류' },
          { key: 'body', label: '내용' },
          { key: 'author', label: '작성자' },
          { key: 'status', label: '상태' },
        ]} />;
      case 'taxi':
        return <AdminReadonly storageKey="taxi-requests" fallback={[]} columns={[
          { key: 'destination', label: '목적지' },
          { key: 'date', label: '날짜' },
          { key: 'time', label: '시간' },
          { key: 'author', label: '작성자' },
          { key: 'max', label: '인원' },
        ]} />;
      default: return null;
    }
  };

  return (
    <PageShell title="관리자 페이지" description="사이트 전체 정보를 관리합니다.">
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'admin-tab active' : 'admin-tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="admin-panel">
        {renderTab()}
      </div>
    </PageShell>
  );
}

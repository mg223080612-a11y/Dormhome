import { useState } from 'react';
import PageShell from '../components/PageShell';
import {
  PLEDGE_STORAGE_KEY,
  academicEvents as defaultEvents,
  getPledgeDepartment,
  pledgeDepartments,
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
  const [items, setItems] = useState(() => readStorage(PLEDGE_STORAGE_KEY, defaultPledges));
  const [deptId, setDeptId] = useState(pledgeDepartments[0].id);
  const [title, setTitle] = useState('');

  const save = (next) => { writeStorage(PLEDGE_STORAGE_KEY, next); setItems(next); };

  const add = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    save([...items, { id: `${deptId}-${Date.now()}`, dept: deptId, title: title.trim(), done: false }]);
    setTitle('');
  };

  // 체크박스 하나를 켜고 끕니다. 저장하면 공약 이행도 페이지에 바로 반영됩니다.
  const toggle = (id) => save(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  const remove = (id) => save(items.filter((i) => i.id !== id));

  // 코드에 적힌 기본 공약 목록으로 되돌립니다. (체크는 모두 해제)
  const resetToDefault = () => {
    if (!window.confirm('기본 공약 목록으로 되돌립니다. 체크한 이행 상태가 모두 사라집니다. 계속할까요?')) return;
    save(defaultPledges);
  };

  const shown = items.filter((item) => item.dept === deptId);
  const doneCount = shown.filter((item) => item.done).length;
  const percent = shown.length === 0 ? 0 : Math.round((doneCount / shown.length) * 100);

  return (
    <>
      {/* 부서 선택 — 공약이 많아 부서별로 나눠서 편집합니다. */}
      <div className="admin-tabs">
        {pledgeDepartments.map((dept) => {
          const list = items.filter((i) => i.dept === dept.id);
          const done = list.filter((i) => i.done).length;
          return (
            <button
              key={dept.id}
              type="button"
              className={dept.id === deptId ? 'admin-tab active' : 'admin-tab'}
              onClick={() => setDeptId(dept.id)}
            >
              {dept.label} ({done}/{list.length})
            </button>
          );
        })}
      </div>

      <form className="admin-form" onSubmit={add}>
        <input placeholder="공약 제목" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit">{getPledgeDepartment(deptId).label}에 추가</button>
      </form>

      <div className="admin-toolbar">
        <span>{shown.length}개 중 {doneCount}개 이행 · {percent}%</span>
        <button type="button" className="admin-del" onClick={resetToDefault}>기본 목록으로</button>
      </div>

      <table className="admin-table">
        <thead><tr><th className="col-check">이행</th><th>제목</th><th></th></tr></thead>
        <tbody>
          {shown.map((item) => (
            <tr key={item.id} className={item.done ? 'row-done' : ''}>
              <td className="col-check">
                <input
                  type="checkbox"
                  checked={Boolean(item.done)}
                  onChange={() => toggle(item.id)}
                  aria-label={`${item.title} 이행 완료`}
                />
              </td>
              <td>{item.title}</td>
              <td><button type="button" className="admin-del" onClick={() => remove(item.id)}>삭제</button></td>
            </tr>
          ))}
          {shown.length === 0 && (
            <tr><td colSpan={3} className="admin-empty">이 부서에 등록된 공약이 없습니다.</td></tr>
          )}
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
  // 저장 버튼을 눌러야 반영됩니다. 저장하면 '주별 말씀' 페이지에 즉시 표시됩니다.
  const [draft, setDraft] = useState(() => readStorage('admin-verse', defaultVerse));
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const save = (event) => {
    event.preventDefault();
    const next = { ...draft, updatedAt: new Date().toISOString() };
    writeStorage('admin-verse', next);
    setDraft(next);
    setSaved(true);
  };

  const reset = () => {
    const next = { ...defaultVerse, updatedAt: new Date().toISOString() };
    writeStorage('admin-verse', next);
    setDraft(next);
    setSaved(true);
  };

  return (
    <form className="admin-verse-form" onSubmit={save}>
      <label>
        <span>구절 위치</span>
        <input
          value={draft.reference}
          placeholder="예: 빌립보서 4:13"
          onChange={(e) => update('reference', e.target.value)}
        />
      </label>
      <label>
        <span>말씀</span>
        <textarea value={draft.text} onChange={(e) => update('text', e.target.value)} />
      </label>
      <label>
        <span>적용 메모</span>
        <textarea value={draft.memo} onChange={(e) => update('memo', e.target.value)} />
      </label>

      <div className="admin-verse-actions">
        <button type="submit">저장</button>
        <button type="button" className="admin-del" onClick={reset}>기본값으로</button>
        {saved && <span className="admin-verse-saved">저장되었습니다 · 주별 말씀 페이지에 반영됨</span>}
      </div>
    </form>
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

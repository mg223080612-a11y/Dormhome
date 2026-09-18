import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import {
  academicEvents as defaultEvents,
  getPledgeDepartment,
  pledgeDepartments,
  pledges as defaultPledges,
  weeklyMeals as defaultMeals,
  weeklyVerse as defaultVerse,
} from '../data/mockData';
import {
  addEvent,
  addPledge,
  addSurvey,
  removeEvent,
  removePledge,
  removeSurvey,
  replacePledges,
  saveMeals,
  saveVerse,
  setPledgeDone
} from '../utils/api';
import { readStorage, writeStorage } from '../utils/storage';
import useApiData from '../utils/useApiData';

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
  const { data: items, setData: setItems, loading, error, reload } = useApiData(
    '/api/events',
    defaultEvents
  );
  const [form, setForm] = useState({ title: '', date: '', type: 'event', dept: '학생회' });
  const [saveError, setSaveError] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaveError(null);
    try {
      const created = await addEvent(form);
      setItems([...items, created].sort((a, b) => a.date.localeCompare(b.date)));
      setForm({ title: '', date: '', type: 'event', dept: '학생회' });
    } catch (err) {
      setSaveError(err.message || '추가에 실패했습니다.');
    }
  };

  const remove = async (id) => {
    const previous = items;
    setSaveError(null);
    setItems(items.filter((i) => i.id !== id));
    try {
      await removeEvent(id);
    } catch (err) {
      setItems(previous);
      setSaveError(err.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <>
      {loading && <p className="admin-note">불러오는 중…</p>}
      {error && (
        <p className="admin-error">
          일정을 불러오지 못했습니다.{' '}
          <button type="button" className="admin-retry" onClick={reload}>다시 시도</button>
        </p>
      )}
      {saveError && <p className="admin-error">{saveError}</p>}

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
          {items.length === 0 && !loading && (
            <tr><td colSpan={5} className="admin-empty">등록된 일정이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function AdminPledges() {
  const { data: items, setData: setItems, loading, error, reload } = useApiData(
    '/api/pledges',
    defaultPledges
  );
  const [deptId, setDeptId] = useState(pledgeDepartments[0].id);
  const [title, setTitle] = useState('');
  const [saveError, setSaveError] = useState(null);

  // 저장이 실패하면 화면을 되돌려야 하므로, 바꾸기 전 상태를 들고 시도합니다.
  const run = async (optimistic, action) => {
    const previous = items;
    setSaveError(null);
    setItems(optimistic);
    try {
      await action();
    } catch (err) {
      setItems(previous); // 실패하면 원래대로
      setSaveError(err.message || '저장에 실패했습니다.');
    }
  };

  const toggle = (item) =>
    run(
      items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)),
      () => setPledgeDone(item.id, !item.done)
    );

  const remove = (item) =>
    run(
      items.filter((i) => i.id !== item.id),
      () => removePledge(item.id)
    );

  const add = async (e) => {
    e.preventDefault();
    const name = title.trim();
    if (!name) return;
    setSaveError(null);
    try {
      const created = await addPledge({ dept: deptId, title: name, done: false });
      setItems([...items, created]);
      setTitle('');
    } catch (err) {
      setSaveError(err.message || '추가에 실패했습니다.');
    }
  };

  // 코드에 적힌 기본 공약 목록으로 되돌립니다. (체크는 모두 해제)
  const resetToDefault = async () => {
    if (!window.confirm('기본 공약 목록으로 되돌립니다. 체크한 이행 상태가 모두 사라집니다. 계속할까요?')) return;
    setSaveError(null);
    try {
      const next = await replacePledges(defaultPledges);
      setItems(next);
    } catch (err) {
      setSaveError(err.message || '되돌리기에 실패했습니다.');
    }
  };

  const shown = items.filter((item) => item.dept === deptId);
  const doneCount = shown.filter((item) => item.done).length;
  const percent = shown.length === 0 ? 0 : Math.round((doneCount / shown.length) * 100);

  return (
    <>
      {loading && <p className="admin-note">불러오는 중…</p>}
      {error && (
        <p className="admin-error">
          공약을 불러오지 못해 기본 목록을 보여주고 있습니다. 이 상태에서는 저장이 안 됩니다.{' '}
          <button type="button" className="admin-retry" onClick={reload}>다시 시도</button>
        </p>
      )}
      {saveError && <p className="admin-error">{saveError}</p>}

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
                  onChange={() => toggle(item)}
                  aria-label={`${item.title} 이행 완료`}
                />
              </td>
              <td>{item.title}</td>
              <td><button type="button" className="admin-del" onClick={() => remove(item)}>삭제</button></td>
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
  const { data: items, setData: setItems, loading, error, reload } = useApiData('/api/surveys', []);
  const [form, setForm] = useState({ title: '', description: '', url: '', due: '', owner: '학생회' });
  const [saveError, setSaveError] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url) return;
    setSaveError(null);
    try {
      const created = await addSurvey(form);
      setItems([created, ...items]);
      setForm({ title: '', description: '', url: '', due: '', owner: '학생회' });
    } catch (err) {
      setSaveError(err.message || '추가에 실패했습니다.');
    }
  };

  const remove = async (id) => {
    const previous = items;
    setSaveError(null);
    setItems(items.filter((i) => i.id !== id));
    try {
      await removeSurvey(id);
    } catch (err) {
      setItems(previous);
      setSaveError(err.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <>
      {loading && <p className="admin-note">불러오는 중…</p>}
      {error && (
        <p className="admin-error">
          설문을 불러오지 못했습니다.{' '}
          <button type="button" className="admin-retry" onClick={reload}>다시 시도</button>
        </p>
      )}
      {saveError && <p className="admin-error">{saveError}</p>}

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
          {items.length === 0 && !loading && (
            <tr><td colSpan={4} className="admin-empty">등록된 설문이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function AdminMeals() {
  const { data: items, setData: setItems, loading, error, reload } = useApiData('/api/meals', defaultMeals);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // 타이핑할 때마다 저장하지 않고, 저장 버튼을 눌렀을 때 한 번에 보냅니다.
  const update = (index, field, value) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    setSaved(false);
  };

  const save = async () => {
    setSaveError(null);
    try {
      await saveMeals(items);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message || '저장에 실패했습니다.');
    }
  };

  return (
    <>
      {loading && <p className="admin-note">불러오는 중…</p>}
      {error && (
        <p className="admin-error">
          급식표를 불러오지 못했습니다.{' '}
          <button type="button" className="admin-retry" onClick={reload}>다시 시도</button>
        </p>
      )}
      {saveError && <p className="admin-error">{saveError}</p>}

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

      <div className="admin-verse-actions">
        <button type="button" onClick={save}>저장</button>
        {saved && <span className="admin-verse-saved">저장되었습니다 · 홈과 급식 페이지에 반영됨</span>}
      </div>
    </>
  );
}

function AdminVerse() {
  // 저장 버튼을 눌러야 반영됩니다. 저장하면 홈과 '주별 말씀' 페이지에 즉시 표시됩니다.
  const { data: loaded, loading, error, reload } = useApiData('/api/verse', defaultVerse);
  const [draft, setDraft] = useState(defaultVerse);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // 서버에서 값을 받아오면 편집 중이던 내용이 없을 때만 채웁니다.
  useEffect(() => {
    if (!loading) setDraft(loaded);
  }, [loading, loaded]);

  const update = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaveError(null);
    try {
      const next = await saveVerse(draft);
      setDraft(next);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message || '저장에 실패했습니다.');
    }
  };

  const reset = async () => {
    setSaveError(null);
    try {
      const next = await saveVerse(defaultVerse);
      setDraft(next);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message || '되돌리기에 실패했습니다.');
    }
  };

  return (
    <form className="admin-verse-form" onSubmit={save}>
      {loading && <p className="admin-note">불러오는 중…</p>}
      {error && (
        <p className="admin-error">
          말씀을 불러오지 못했습니다.{' '}
          <button type="button" className="admin-retry" onClick={reload}>다시 시도</button>
        </p>
      )}
      {saveError && <p className="admin-error">{saveError}</p>}

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
        <textarea value={draft.memo || ''} onChange={(e) => update('memo', e.target.value)} />
      </label>

      <div className="admin-verse-actions">
        <button type="submit">저장</button>
        <button type="button" className="admin-del" onClick={reset}>기본값으로</button>
        {saved && <span className="admin-verse-saved">저장되었습니다 · 홈과 주별 말씀 페이지에 반영됨</span>}
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

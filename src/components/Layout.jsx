import { useState } from 'react';
import DepartmentSwitcher from './DepartmentSwitcher';
import Sidebar from './Sidebar';
import { getDepartment } from '../data/departments';

export default function Layout({
  session,
  selectedDepartment,
  onSelectDepartment,
  activePage,
  onNavigate,
  onLogout,
  onLoginClick,
  children
}) {
  const dept = getDepartment(selectedDepartment);

  // 좁은 화면에서 사이드바 펼침 여부
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 선택 / 부서 선택 시 사이드바를 닫습니다.
  const navigateAndClose = (page) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  const selectDeptAndClose = (id) => {
    setMenuOpen(false);
    onSelectDepartment(id);
  };

  return (
    <div
      className="app-shell"
      style={{
        '--dept-color': dept.color,
        '--dept-ink': dept.ink,
        '--dept-soft': dept.soft,
        '--dept-text': dept.text
      }}
    >
      <header className="top-bar">
        <button className="brand-pill" type="button" onClick={() => navigateAndClose('home')}>
          <img src="/favicon.png" alt="" className="brand-mark" aria-hidden="true" />
          GVCS
        </button>

        <div className="top-menu-pill">
          <DepartmentSwitcher
            selectedDepartment={selectedDepartment}
            activePage={activePage}
            onSelect={selectDeptAndClose}
          />
        </div>

        <div className="user-pill">
          {session ? (
            <>
              <span className="account-chip">{session.name}</span>
              <button type="button" onClick={onLogout}>로그아웃</button>
            </>
          ) : (
            <button type="button" className="login-trigger" onClick={onLoginClick}>로그인</button>
          )}
        </div>
      </header>

      {/* 좁은 화면에서만 보이는 메뉴 토글 */}
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? '✕' : '···'}
      </button>

      <div className="main-grid">
        <Sidebar activePage={activePage} onNavigate={navigateAndClose} open={menuOpen} />
        <main className="content-panel">
          {children}
        </main>
      </div>
    </div>
  );
}

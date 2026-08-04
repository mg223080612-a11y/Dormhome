import { useState } from 'react';
import HomeHero from './HomeHero';
import Sidebar from './Sidebar';

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
  // 슬라이드 메뉴(사이드바) 펼침 여부
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 선택 / 부서 선택 시 슬라이드 메뉴를 닫습니다.
  const navigateAndClose = (page) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  const selectDeptAndClose = (id) => {
    setMenuOpen(false);
    onSelectDepartment(id);
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="top-bar-left">
          <button
            type="button"
            className="hamburger-btn"
            aria-expanded={menuOpen}
            aria-label="메뉴 열기"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <button type="button" className="home-logo-btn" aria-label="홈으로 이동" onClick={() => navigateAndClose('home')}>
            <img src="/sos-mark.svg" alt="SOS" />
          </button>
        </div>

        <div className="user-pill">
          {session ? (
            <>
              <span className="account-chip">{session.name}</span>
              <button type="button" onClick={onLogout}>로그아웃</button>
            </>
          ) : (
            <button type="button" className="login-trigger" onClick={onLoginClick}>login</button>
          )}
        </div>
      </header>

      <Sidebar
        activePage={activePage}
        onNavigate={navigateAndClose}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={selectDeptAndClose}
      />

      {activePage === 'home' && <HomeHero onNavigate={navigateAndClose} />}

      <div className="page-body">
        <main className="content-panel">
          {children}
        </main>

        <footer className="site-credit">
          <span className="credit-prefix">made by <strong>GVCS MG coding club</strong></span>
          <span className="credit-collab" aria-label="Sync x SOS">
            <img src="/sync-mark.png" alt="Sync" className="sync-mark" />
            <strong>Sync</strong>
            <span className="credit-x">x</span>
            <img src="/sos-mark.svg" alt="SOS" className="sos-mark" />
          </span>
        </footer>
      </div>
    </div>
  );
}

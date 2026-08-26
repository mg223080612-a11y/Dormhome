import { useState } from 'react';
import HomeHero from './HomeHero';
import Sidebar from './Sidebar';

export default function Layout({
  session,
  activePage,
  onNavigate,
  onLogout,
  onLoginClick,
  children
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateAndClose = (page) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  return (
    <div className="app-shell">
      <header className="mobile-bar">
        <button
          type="button"
          className="hamburger-btn"
          aria-label="메뉴"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
        <button type="button" className="home-logo-btn" onClick={() => navigateAndClose('home')}>
          <img src="/sos-mark.svg" alt="SOS" />
        </button>
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

      <div className="main-layout">
        <Sidebar
          session={session}
          activePage={activePage}
          onNavigate={navigateAndClose}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
        />

        <div className="content-area">
          {activePage === 'home' && <HomeHero onNavigate={navigateAndClose} />}
          <div className="page-body">
            <main className="content-panel">{children}</main>
            <footer className="site-credit">
              <span className="credit-prefix">made by <strong>GVCS MG coding club</strong></span>
              <span className="credit-collab">
                <img src="/sync-mark.png" alt="Sync" className="sync-mark" />
                <strong>Sync</strong>
                <span className="credit-x">x</span>
                <img src="/sos-mark.svg" alt="SOS" className="sos-mark" />
              </span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import HomeHero from './HomeHero';
import Sidebar from './Sidebar';
import { mainTabs } from '../data/menu';

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
      <header className="top-bar">
        <div className="top-bar-left">
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
        </div>

        <nav className="top-tabs">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activePage === tab.id ? 'top-tab active' : 'top-tab'}
              onClick={() => navigateAndClose(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

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
          activePage={activePage}
          onNavigate={navigateAndClose}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
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

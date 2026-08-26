import { primaryMenu, secondaryMenu } from '../data/menu';

const I = (d) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="side-svg">{d}</svg>
);

const ICONS = {
  home: I(<><path d="M3 10.5L10 3l7 7.5" /><path d="M5 9v7.5a.5.5 0 00.5.5H8v-4h4v4h2.5a.5.5 0 00.5-.5V9" /></>),
  survey: I(<><rect x="4" y="2" width="12" height="16" rx="1.5" /><path d="M7.5 7h5M7.5 10h5M7.5 13h3" /></>),
  pledges: I(<><rect x="2" y="12" width="4" height="6" rx=".5" /><rect x="8" y="7" width="4" height="11" rx=".5" /><rect x="14" y="3" width="4" height="15" rx=".5" /></>),
  events: I(<><rect x="3" y="4" width="14" height="13" rx="1.5" /><path d="M3 8h14M7 2v4M13 2v4" /></>),
  meal: I(<><path d="M3 11c0-3.5 2.5-7 4-7v14M13 4v5c0 1.1.9 2 2 2h1V4M14 11v7" /></>),
  calendar: I(<><rect x="3" y="4" width="14" height="13" rx="1.5" /><path d="M3 8h14M7 2v4M13 2v4M7 11h2M11 11h2M7 14h2" /></>),
  verse: I(<><path d="M2 4a2 2 0 012-2h4.5a1.5 1.5 0 011.5 1.5V17l-3-2-3 2V4z" /><path d="M18 4a2 2 0 00-2-2h-4.5A1.5 1.5 0 0010 3.5V17l3-2 3 2V4z" /></>),
  taxi: I(<><path d="M2 13h16M4 13V9.5a2 2 0 012-2h8a2 2 0 012 2V13" /><path d="M7 7.5L8 4h4l1 3.5M4 13v2.5a.5.5 0 00.5.5H7v-3M13 13v3h2.5a.5.5 0 00.5-.5V13" /><circle cx="6" cy="11" r="1" /><circle cx="14" cy="11" r="1" /></>),
  suggestions: I(<><path d="M4 4h12a1 1 0 011 1v9a1 1 0 01-1 1H8l-4 3V5a1 1 0 011-1z" /><path d="M7 8h6M7 11h4" /></>),
  repair: I(<><path d="M14.5 3.5a3.5 3.5 0 00-4.8 4.8L4 14l2 2 5.7-5.7a3.5 3.5 0 004.8-4.8l-2.5 2.5-2-2 2.5-2.5z" /></>),
  cafeteria: I(<><ellipse cx="10" cy="12" rx="7" ry="4" /><path d="M3 12c0-5 3.1-9 7-9s7 4 7 9" /></>),
  store: I(<><circle cx="7" cy="17" r="1.5" /><circle cx="15" cy="17" r="1.5" /><path d="M2 3h3l2 9h9l2-6H7" /></>),
  camera: I(<><rect x="2" y="5" width="16" height="12" rx="1.5" /><circle cx="10" cy="11" r="3" /><path d="M14 5l1-2h-3l-1 2" /></>),
  market: I(<><path d="M5 3h10l2 5H3l2-5zM4 8v8a1 1 0 001 1h10a1 1 0 001-1V8" /><path d="M8 12v2h4v-2" /></>),
  settings: I(<><circle cx="10" cy="10" r="2.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.5 1.5M14.3 14.3l1.5 1.5M15.8 4.2l-1.5 1.5M5.7 14.3l-1.5 1.5" /></>),
};

function MenuButton({ item, activePage, onNavigate }) {
  return (
    <button
      type="button"
      className={activePage === item.id ? 'side-item active' : 'side-item'}
      onClick={() => onNavigate(item.id)}
    >
      <span className="side-icon">{ICONS[item.icon]}</span>
      <span>{item.label}</span>
    </button>
  );
}

export default function Sidebar({ session, activePage, onNavigate, open, onClose, onLogout, onLoginClick }) {
  return (
    <>
      {open && <button type="button" className="sidebar-backdrop" aria-label="메뉴 닫기" onClick={onClose} />}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <button type="button" className="brand-link" onClick={() => onNavigate('sos')}>
            <img src="/sos-mark.svg" alt="SOS" className="sidebar-logo" />
          </button>
          <button type="button" className="brand-link" onClick={() => onNavigate('sync')}>
            <img src="/sync-mark.png" alt="Sync" className="sidebar-sync" />
          </button>
        </div>

        <nav className="side-nav">
          {primaryMenu.map((item) => (
            <MenuButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} />
          ))}
        </nav>

        <hr className="side-divider" />

        <nav className="side-nav">
          {secondaryMenu.map((item) => (
            <MenuButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} />
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            {session ? (
              <>
                <span className="account-chip">{session.name}</span>
                <button type="button" className="sidebar-logout" onClick={onLogout}>로그아웃</button>
              </>
            ) : (
              <button type="button" className="login-trigger" onClick={onLoginClick}>login</button>
            )}
          </div>
          <button type="button" className="side-item side-settings">
            <span className="side-icon">{ICONS.settings}</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}

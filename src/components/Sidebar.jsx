import { menu } from '../data/menu';

const PRIMARY_IDS = new Set(['home', 'survey', 'pledges', 'events']);

function MenuButton({ item, activePage, onNavigate }) {
  return (
    <button
      type="button"
      className={activePage === item.id ? 'side-item active' : 'side-item'}
      onClick={() => onNavigate(item.id)}
    >
      <span className="side-icon">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate, open, onClose }) {
  const primary = menu.filter((m) => PRIMARY_IDS.has(m.id));
  const secondary = menu.filter((m) => !PRIMARY_IDS.has(m.id));

  return (
    <>
      {open && <button type="button" className="sidebar-backdrop" aria-label="메뉴 닫기" onClick={onClose} />}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/sos-mark.svg" alt="SOS" className="sidebar-logo" />
          <img src="/sync-mark.png" alt="Sync" className="sidebar-sync" />
        </div>

        <nav className="side-nav">
          {primary.map((item) => (
            <MenuButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} />
          ))}

          <hr className="side-divider" />

          {secondary.map((item) => (
            <MenuButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} />
          ))}
        </nav>
      </aside>
    </>
  );
}

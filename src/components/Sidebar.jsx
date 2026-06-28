import { detailMenu, primaryMenu } from '../data/menu';

function MenuButton({ item, activePage, onNavigate }) {
  const isActive = activePage === item.id;
  return (
    <button
      type="button"
      className={isActive ? 'side-item active' : 'side-item'}
      onClick={() => onNavigate(item.id)}
    >
      <span className="side-icon">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate, open }) {
  return (
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <div className="sidebar-title">사이드바</div>
      <nav className="side-nav">
        <p className="side-section-title">메인</p>
        {primaryMenu.map((item) => (
          <MenuButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} />
        ))}

        <p className="side-section-title">세부탭</p>
        {detailMenu.map((item) => (
          <MenuButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} />
        ))}
      </nav>
    </aside>
  );
}

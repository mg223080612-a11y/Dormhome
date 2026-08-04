import { menu } from '../data/menu';
import DepartmentSwitcher from './DepartmentSwitcher';

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

export default function Sidebar({
  activePage,
  onNavigate,
  open,
  onClose,
  selectedDepartment,
  onSelectDepartment
}) {
  return (
    <>
      {open && <button type="button" className="sidebar-backdrop" aria-label="메뉴 닫기" onClick={onClose} />}

      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="sidebar-head">
          <span className="sidebar-title">메뉴</span>
          <button type="button" className="sidebar-close" aria-label="메뉴 닫기" onClick={onClose}>✕</button>
        </div>

        <p className="side-section-title">자치부서</p>
        <DepartmentSwitcher
          selectedDepartment={selectedDepartment}
          activePage={activePage}
          onSelect={onSelectDepartment}
        />

        <nav className="side-nav">
          {menu.map((item) => (
            <MenuButton key={item.id} item={item} activePage={activePage} onNavigate={onNavigate} />
          ))}
        </nav>
      </aside>
    </>
  );
}

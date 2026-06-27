import DepartmentSwitcher from './DepartmentSwitcher';
import Sidebar from './Sidebar';
import { getDepartment } from '../data/departments';
import { allMenu } from '../data/menu';

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
  const pageTitle =
    allMenu.find((item) => item.id === activePage)?.label ||
    (activePage === 'department' ? dept.label : '홈');

  return (
    <div
      className="app-shell"
      style={{
        '--dept-color': dept.color,
        '--dept-soft': dept.soft,
        '--dept-text': dept.text,
        '--dept-card': dept.card,
        '--dept-line': dept.line
      }}
    >
      <header className="top-bar">
        <button className="brand-pill" type="button" onClick={() => onNavigate('home')}>
          gvcs
        </button>

        <div className="top-menu-pill">
          <DepartmentSwitcher
            selectedDepartment={selectedDepartment}
            activePage={activePage}
            onSelect={onSelectDepartment}
          />
        </div>

        <div className="user-pill">
          {session ? (
            <>
              <span>{session.name}</span>
              <button type="button" onClick={onLogout}>로그아웃</button>
            </>
          ) : (
            <button type="button" onClick={onLoginClick}>로그인</button>
          )}
        </div>
      </header>

      <div className="main-grid">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <main className="content-panel">
          <section className="page-hero">
            <div>
              <p className="eyebrow">{dept.label}</p>
              <h1>{pageTitle}</h1>
              <p>{dept.description}</p>
            </div>
            <div className="dept-mark" aria-hidden="true">{dept.shortLabel}</div>
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}

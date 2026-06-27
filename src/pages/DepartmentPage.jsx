import { getDepartment } from '../data/departments';
import { allMenu } from '../data/menu';

export default function DepartmentPage({ department, onNavigate }) {
  const dept = getDepartment(department);
  const focusItems = (dept.focus || [])
    .map((id) => allMenu.find((item) => item.id === id))
    .filter(Boolean);

  return (
    <section className="page-card">
      <div className="page-card-head">
        <h2>{dept.label}</h2>
        <p>{dept.description}</p>
      </div>

      {focusItems.length > 0 ? (
        <div className="media-grid">
          {focusItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="media-card"
              onClick={() => onNavigate(item.id)}
            >
              <div className="media-thumb">{item.icon}</div>
              <h3>{item.label}</h3>
              <p>{dept.label} 담당 기능</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">담당 기능이 곧 추가됩니다.</div>
      )}
    </section>
  );
}

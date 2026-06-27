import { departments } from '../data/departments';

export default function DepartmentSwitcher({ selectedDepartment, onChange }) {
  return (
    <div className="dept-switcher" aria-label="자치부서 선택">
      {departments.map((dept) => {
        const isActive = dept.id === selectedDepartment;
        return (
          <button
            key={dept.id}
            type="button"
            className={isActive ? 'dept-chip active' : 'dept-chip'}
            style={{ '--chip-bg': dept.color, '--chip-text': dept.text }}
            onClick={() => onChange(dept.id)}
            title={dept.description}
          >
            {dept.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

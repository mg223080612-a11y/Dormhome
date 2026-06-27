export default function StatCard({ label, value, caption, onClick }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp className="stat-card" type={onClick ? 'button' : undefined} onClick={onClick}>
      <span>{label}</span>
      <strong>{value}</strong>
      {caption && <small>{caption}</small>}
    </Comp>
  );
}

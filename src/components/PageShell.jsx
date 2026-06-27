export default function PageShell({ title, description, children }) {
  return (
    <section className="page-card">
      <div className="page-card-head">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}

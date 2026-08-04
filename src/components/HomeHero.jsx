export default function HomeHero({ onNavigate }) {
  return (
    <section className="home-hero">
      <button type="button" className="home-hero-inner" onClick={() => onNavigate('verse')}>
        <img src="/sos-mark.svg" alt="SOS" className="home-hero-mark" />
        <h1 className="home-hero-title">주별말씀</h1>
      </button>
    </section>
  );
}

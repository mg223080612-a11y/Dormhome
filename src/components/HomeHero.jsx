import { weeklyVerse } from '../data/mockData';
import useStoredValue from '../utils/useStoredValue';

/**
 * 홈 히어로 — SOS 배너 이미지 한 장 + 그 아래 이번 주 말씀.
 * (말씀은 관리자 > 주별 말씀 에서 수정하면 바로 반영됩니다)
 */
export default function HomeHero({ onNavigate }) {
  const verse = useStoredValue('admin-verse', weeklyVerse);

  return (
    <section className="home-hero">
      <button
        type="button"
        className="hero-banner"
        aria-label="주별 말씀 보기"
        onClick={() => onNavigate('verse')}
      >
        <img src="/hero-banner.jpg" alt="SOS" className="hero-banner-img" />
      </button>

      <button type="button" className="hero-verse" onClick={() => onNavigate('verse')}>
        <span className="hero-verse-label">주별 말씀</span>
        <p className="hero-verse-text">{verse.text}</p>
        <span className="hero-verse-ref">{verse.reference}</span>
      </button>
    </section>
  );
}

import { useEffect, useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DepartmentPage from './pages/DepartmentPage';
import AdminPage from './pages/AdminPage';
import {
  CalendarPage,
  DormRepairPage,
  EventPage,
  MarketPage,
  MealPage,
  NotFoundPage,
  PledgePage,
  ShortformPage,
  SuggestionPage,
  SurveyPage,
  TaxiMatePage,
  VersePage,
  SosPage,
  SyncPage,
  WantedMenuPage
} from './pages/FeaturePages';
import { signOutUser, subscribeToAuth } from './utils/auth';
import './styles/theme.css';
import './styles/layout.css';
import './styles/pages.css';

// ============================================================
// 주소 처리 — /#/calendar 대신 /calendar 형태(History API)를 사용합니다.
// vite 개발 서버는 새로고침해도 index.html 을 돌려주므로 그대로 동작하고,
// 실제 배포 시에는 "모든 경로를 index.html 로" 보내는 설정이 필요합니다.
//   · Firebase Hosting: firebase.json > rewrites 에 { "source": "**", "destination": "/index.html" }
//   · Netlify: public/_redirects 에  /*  /index.html  200
// ============================================================
const pathToPage = (pathname) => pathname.replace(/^\/+|\/+$/g, '').trim() || 'home';

const pageToPath = (page) => (page === 'home' ? '/' : `/${page}`);

const readPageFromLocation = () => {
  // 예전 형식(/#/calendar) 링크로 들어와도 깨지지 않게 함께 처리
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash) return hash;
  return pathToPage(window.location.pathname);
};

function LoginRequired({ feature, onLoginClick }) {
  return (
    <section className="page-card">
      <div className="page-card-head">
        <h2>로그인이 필요합니다</h2>
        <p>{feature} 기능은 로그인 후 이용할 수 있습니다.</p>
      </div>
      <button type="button" className="link-button" onClick={onLoginClick}>로그인하기</button>
    </section>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('studentCouncil');
  const [activePage, setActivePage] = useState(readPageFromLocation);
  const [showLogin, setShowLogin] = useState(false);

  // Firebase 로그인 상태 구독 (새로고침해도 자동 복구)
  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // 뒤로/앞으로 가기 대응 + 예전 해시 주소를 깔끔한 주소로 한 번 정리
  useEffect(() => {
    if (window.location.hash) {
      const page = readPageFromLocation();
      window.history.replaceState({ page }, '', pageToPath(page));
      setActivePage(page);
    }

    const handlePopState = () => setActivePage(pathToPage(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page) => {
    const path = pageToPath(page);
    if (window.location.pathname !== path) {
      window.history.pushState({ page }, '', path);
    }
    setActivePage(page);
    window.scrollTo({ top: 0 });
  };

  const selectDepartment = (id) => {
    setSelectedDepartment(id);
    navigate('department');
  };

  const handleLogin = (newSession) => {
    setSession(newSession);
    setShowLogin(false);
  };

  const logout = async () => {
    await signOutUser();
    setSession(null);
    navigate('home');
  };

  if (!authReady) {
    return (
      <main className="login-page">
        <p className="login-subtitle">로그인 상태를 확인하는 중…</p>
      </main>
    );
  }

  if (showLogin) {
    return <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />;
  }

  const guard = (node, feature) =>
    session ? node : <LoginRequired feature={feature} onLoginClick={() => setShowLogin(true)} />;

  const pageMap = {
    home: <Dashboard onNavigate={navigate} />,
    department: <DepartmentPage department={selectedDepartment} onNavigate={navigate} />,
    calendar: <CalendarPage />,
    pledges: <PledgePage />,
    events: guard(<EventPage session={session} />, '이벤트'),
    meal: <MealPage />,
    survey: <SurveyPage />,
    verse: <VersePage />,
    taxiMate: guard(<TaxiMatePage session={session} />, '택시메이트'),
    suggestions: guard(<SuggestionPage session={session} />, '건의함'),
    dormRepair: guard(<DormRepairPage session={session} />, '기숙사 수리 요청'),
    cafeteriaWish: <WantedMenuPage type="cafeteria" />,
    storeWish: <WantedMenuPage type="store" />,
    shortform: <ShortformPage />,
    market: <MarketPage />,
    sos: <SosPage />,
    sync: <SyncPage />,
    admin: <AdminPage />
  };

  return (
    <Layout
      session={session}
      activePage={activePage}
      onNavigate={navigate}
      onLogout={logout}
      onLoginClick={() => setShowLogin(true)}
    >
      {pageMap[activePage] || <NotFoundPage onNavigate={navigate} />}
    </Layout>
  );
}

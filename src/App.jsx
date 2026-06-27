import { useEffect, useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DepartmentPage from './pages/DepartmentPage';
import {
  AcademicPage,
  BirthdayPage,
  CalendarPage,
  DormRepairPage,
  DormSchedulePage,
  MarketPage,
  MealPage,
  NotFoundPage,
  PledgePage,
  PointsPage,
  ShortformPage,
  SuggestionPage,
  SurveyPage,
  TaxiMatePage,
  TipsPage,
  VersePage,
  WantedMenuPage
} from './pages/FeaturePages';
import { clearSession, loadSession } from './utils/auth';
import './styles/theme.css';
import './styles/layout.css';
import './styles/pages.css';

const readPageFromHash = () => {
  const value = window.location.hash.replace('#/', '').trim();
  return value || 'home';
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
  const [session, setSession] = useState(() => loadSession());
  const [selectedDepartment, setSelectedDepartment] = useState('studentCouncil');
  const [activePage, setActivePage] = useState(readPageFromHash);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleHashChange = () => setActivePage(readPageFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page) => {
    window.location.hash = `#/${page}`;
    setActivePage(page);
  };

  const selectDepartment = (id) => {
    setSelectedDepartment(id);
    navigate('department');
  };

  const handleLogin = (newSession) => {
    setSession(newSession);
    setShowLogin(false);
  };

  const logout = () => {
    clearSession();
    setSession(null);
    window.location.hash = '#/home';
  };

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
    taxiMate: guard(<TaxiMatePage session={session} />, '택시메이트'),
    suggestions: guard(<SuggestionPage session={session} />, '건의함'),
    meal: <MealPage />,
    survey: <SurveyPage />,
    dormRepair: guard(<DormRepairPage session={session} />, '기숙사 수리 요청'),
    academic: <AcademicPage />,
    points: <PointsPage />,
    tips: <TipsPage />,
    birthday: <BirthdayPage />,
    verse: <VersePage />,
    dormSchedule: <DormSchedulePage />,
    cafeteriaWish: <WantedMenuPage type="cafeteria" />,
    storeWish: <WantedMenuPage type="store" />,
    shortform: <ShortformPage />,
    market: <MarketPage />
  };

  return (
    <Layout
      session={session}
      selectedDepartment={selectedDepartment}
      onSelectDepartment={selectDepartment}
      activePage={activePage}
      onNavigate={navigate}
      onLogout={logout}
      onLoginClick={() => setShowLogin(true)}
    >
      {pageMap[activePage] || <NotFoundPage onNavigate={navigate} />}
    </Layout>
  );
}

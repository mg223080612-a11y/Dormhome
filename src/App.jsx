import { useEffect, useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
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

export default function App() {
  const [session, setSession] = useState(() => loadSession());
  const [selectedDepartment, setSelectedDepartment] = useState('studentCouncil');
  const [activePage, setActivePage] = useState(readPageFromHash);

  useEffect(() => {
    const handleHashChange = () => setActivePage(readPageFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page) => {
    window.location.hash = `#/${page}`;
    setActivePage(page);
  };

  const logout = () => {
    clearSession();
    setSession(null);
    window.location.hash = '#/home';
  };

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  const pageMap = {
    home: <Dashboard onNavigate={navigate} />,
    calendar: <CalendarPage />,
    pledges: <PledgePage />,
    taxiMate: <TaxiMatePage session={session} />,
    suggestions: <SuggestionPage session={session} />,
    meal: <MealPage />,
    survey: <SurveyPage />,
    dormRepair: <DormRepairPage session={session} />,
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
      setSelectedDepartment={setSelectedDepartment}
      activePage={activePage}
      onNavigate={navigate}
      onLogout={logout}
    >
      {pageMap[activePage] || <NotFoundPage onNavigate={navigate} />}
    </Layout>
  );
}

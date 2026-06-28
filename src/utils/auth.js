// ID + 비밀번호 기반 mock 로그인.
// 실제 배포 시에는 Firebase/Supabase 같은 백엔드 인증으로 교체하세요.
const SESSION_KEY = 'gvcs-session';

export const validateLogin = ({ id, password }) => {
  const userId = String(id || '').trim();
  if (userId.length < 2) return 'ID를 2자 이상 입력해 주세요.';
  if (!String(password || '')) return '비밀번호를 입력해 주세요.';
  return '';
};

export const createSession = ({ id }) => {
  const userId = String(id || '').trim();
  const session = {
    id: userId,
    name: userId,
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

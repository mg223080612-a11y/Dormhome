// MG 번호 기반 mock 로그인.
// 실제 배포 시에는 Firebase/Supabase 같은 백엔드 인증으로 교체하세요.
const SESSION_KEY = 'gvcs-session';

export const validateLogin = ({ mgNumber }) => {
  const mg = String(mgNumber || '').trim();
  if (!mg) return 'MG 번호를 입력해 주세요.';
  if (!/^[0-9]{4,6}$/.test(mg)) return 'MG 번호는 숫자 4~6자리로 입력해 주세요.';
  return '';
};

export const createSession = ({ mgNumber }) => {
  const mg = String(mgNumber || '').trim();
  const session = {
    mgNumber: mg,
    name: `MG ${mg}`,
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

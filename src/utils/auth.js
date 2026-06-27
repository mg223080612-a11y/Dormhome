const SESSION_KEY = 'gvcs-session';

export const validateLogin = ({ studentId, password }) => {
  const id = String(studentId || '').trim();
  if (id.length < 4) return '학번을 4자리 이상 입력해 주세요.';
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return '학번은 영문, 숫자, 하이픈만 사용할 수 있습니다.';
  if (!String(password || '')) return '비밀번호를 입력해 주세요.';
  return '';
};

export const createSession = ({ studentId }) => {
  const safeId = String(studentId || '').trim();
  const session = {
    studentId: safeId,
    name: safeId,
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

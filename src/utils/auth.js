const SESSION_KEY = 'gvcs-session';

// 학교의 실제 MG 규칙이 다르면 아래 배열만 바꾸면 됩니다.
// 예시: 끝자리 0/2/4/6/8 => 여자, 1/3/5/7/9 => 남자
export const GENDER_RULE = {
  female: ['0', '2', '4', '6', '8'],
  male: ['1', '3', '5', '7', '9']
};

export const extractLastDigit = (mg) => {
  const onlyNumbers = String(mg || '').replace(/\D/g, '');
  return onlyNumbers.length > 0 ? onlyNumbers.at(-1) : '';
};

export const detectGenderFromMg = (mg) => {
  const lastDigit = extractLastDigit(mg);

  if (GENDER_RULE.female.includes(lastDigit)) return 'female';
  if (GENDER_RULE.male.includes(lastDigit)) return 'male';
  return 'unknown';
};

export const genderLabel = (gender) => {
  if (gender === 'female') return '여학생';
  if (gender === 'male') return '남학생';
  return '미확인';
};

export const validateMg = (mg) => {
  const value = String(mg || '').trim();
  if (value.length < 4) return 'MG 번호를 4자리 이상 입력해 주세요.';
  if (!/^[a-zA-Z0-9-]+$/.test(value)) return 'MG 번호는 영문, 숫자, 하이픈만 사용할 수 있습니다.';
  return '';
};

export const createSession = ({ mg, name }) => {
  const safeMg = String(mg || '').trim();
  const session = {
    mg: safeMg,
    name: String(name || '').trim() || 'GVCS 학생',
    gender: detectGenderFromMg(safeMg),
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

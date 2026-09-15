// ============================================================
// auth.js — Firebase Authentication (구글 로그인)
// 기존 ID/비밀번호 mock 로그인을 대체합니다.
// ============================================================
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { ALLOWED_DOMAIN, auth, googleProvider } from '../lib/firebase';

export { ALLOWED_DOMAIN };

const domainOf = (email) => String(email || '').split('@')[1]?.toLowerCase() || '';

/** 허용된 도메인(@gvcs-mg.org)의 계정인지 확인 — 그 외 계정은 모두 차단 */
export const isAllowedEmail = (email) => domainOf(email) === ALLOWED_DOMAIN;

/** Firebase User → 앱에서 쓰는 session 객체 */
export const toSession = (user) => {
  if (!user) return null;
  return {
    id: user.uid,
    name: user.displayName || String(user.email || '').split('@')[0],
    email: user.email,
    photoURL: user.photoURL,
    loginAt: new Date().toISOString()
  };
};

/**
 * 로그인 상태 구독.
 * 새로고침 후에도 Firebase 가 자동으로 세션을 복구해 콜백을 호출합니다.
 * @returns {() => void} 구독 해제 함수
 */
export const subscribeToAuth = (callback) =>
  onAuthStateChanged(auth, async (user) => {
    if (user && !isAllowedEmail(user.email)) {
      await signOut(auth);
      callback(null);
      return;
    }
    callback(toSession(user));
  });

/** 구글 팝업 로그인 */
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);

  if (!isAllowedEmail(result.user.email)) {
    await signOut(auth);
    const error = new Error(`@${ALLOWED_DOMAIN} 계정으로만 로그인할 수 있습니다.`);
    error.code = 'auth/domain-not-allowed';
    throw error;
  }

  return toSession(result.user);
};

export const signOutUser = () => signOut(auth);

/** Firebase 에러 코드를 사용자에게 보여줄 한국어 문구로 변환 */
export const describeAuthError = (error) => {
  switch (error?.code) {
    case 'auth/domain-not-allowed':
      return error.message;
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '로그인 창이 닫혔습니다. 다시 시도해 주세요.';
    case 'auth/popup-blocked':
      return '브라우저가 팝업을 차단했습니다. 팝업 허용 후 다시 시도해 주세요.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
    case 'auth/unauthorized-domain':
      return '이 주소는 Firebase 승인된 도메인에 등록되어 있지 않습니다. 관리자에게 문의해 주세요.';
    case 'auth/operation-not-allowed':
      return 'Firebase 콘솔에서 Google 로그인이 아직 활성화되지 않았습니다.';
    default:
      return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }
};

// ============================================================
// firebase.js — Firebase 앱 초기화 (인증 전용)
// 기본값은 아래 DEFAULT_CONFIG 이고, .env 에 VITE_FIREBASE_* 값이 있으면 그 값이 우선합니다.
// (Firebase 웹 config 는 빌드 결과물에 그대로 포함되는 공개 값이라 코드에 둬도 됩니다.
//  실제 보호는 Firebase 콘솔의 '승인된 도메인' + 보안 규칙으로 합니다.)
// ============================================================
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence
} from 'firebase/auth';

// dormhome-1c840 프로젝트의 웹 앱 설정 (Firebase 콘솔 > 프로젝트 설정 > 내 앱)
const DEFAULT_CONFIG = {
  apiKey: 'AIzaSyA6cpFJG1WS1pa2YX-XjmE-eNbBXrX_sm8',
  authDomain: 'dormhome-1c840.firebaseapp.com',
  projectId: 'dormhome-1c840',
  storageBucket: 'dormhome-1c840.firebasestorage.app',
  messagingSenderId: '566295157537',
  appId: '1:566295157537:web:9dd664a8e1892fe2a17c60'
};

const pick = (envValue, fallback) => String(envValue || '').trim() || fallback;

const firebaseConfig = {
  apiKey: pick(import.meta.env.VITE_FIREBASE_API_KEY, DEFAULT_CONFIG.apiKey),
  authDomain: pick(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, DEFAULT_CONFIG.authDomain),
  projectId: pick(import.meta.env.VITE_FIREBASE_PROJECT_ID, DEFAULT_CONFIG.projectId),
  storageBucket: pick(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, DEFAULT_CONFIG.storageBucket),
  messagingSenderId: pick(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    DEFAULT_CONFIG.messagingSenderId
  ),
  appId: pick(import.meta.env.VITE_FIREBASE_APP_ID, DEFAULT_CONFIG.appId)
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 브라우저를 닫았다 열어도 로그인 상태 유지
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('[firebase] 로그인 상태 저장 설정 실패', error);
});

// 로그인 허용 도메인 — 학교 계정(@gvcs-mg.org)만 등록/로그인할 수 있습니다.
// .env 의 VITE_ALLOWED_EMAIL_DOMAIN 으로 덮어쓸 수 있으나, 값이 없으면 기본값을 사용합니다.
// (빈 값이어도 전체 허용으로 열리지 않습니다.)
export const DEFAULT_ALLOWED_DOMAIN = 'gvcs-mg.org';

export const ALLOWED_DOMAIN =
  String(import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '') || DEFAULT_ALLOWED_DOMAIN;

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
  // hd 는 구글 계정 선택 창에서 해당 도메인 계정만 보여주는 힌트입니다.
  // (보안 장치가 아니라 편의 기능이므로 실제 검증은 auth.js 에서 따로 합니다.)
  hd: ALLOWED_DOMAIN
});

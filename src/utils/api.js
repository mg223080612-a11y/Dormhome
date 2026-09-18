// ============================================================
// api.js — Cloudflare Pages Functions(/api/*) 호출 도우미
//
// 사이트와 같은 도메인에서 API 가 돌아가므로 주소는 '/api/...' 상대경로면 됩니다.
// 쓰기 요청에는 Firebase 로그인 토큰을 자동으로 붙입니다.
// ============================================================
import { auth } from '../lib/firebase';

/** 현재 로그인한 사용자의 ID 토큰. 로그인 안 했으면 null. */
const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (error) {
    console.warn('[api] 토큰을 가져오지 못했습니다.', error);
    return null;
  }
};

/**
 * API 호출. 실패하면 Error 를 던집니다.
 * @param {string} path   '/api/pledges' 처럼 슬래시로 시작하는 경로
 * @param {object} options { method, body, auth }
 *   - auth: true 면 로그인 토큰을 붙입니다. (쓰기 요청은 기본 true)
 */
export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const needsAuth = options.auth ?? method !== 'GET';

  const headers = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  if (needsAuth) {
    const token = await getIdToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  // 본문이 JSON 이 아닐 수도 있으므로 방어적으로 읽습니다.
  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.error || `요청에 실패했습니다. (HTTP ${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

/** 내가 관리자인지 서버에 물어봅니다. (관리자 이메일 목록은 내려오지 않습니다) */
export const fetchMe = () => apiFetch('/api/me', { auth: true });

// ── 각 데이터별 호출 ─────────────────────────────────────────
export const getPledges = () => apiFetch('/api/pledges');
export const setPledgeDone = (id, done) =>
  apiFetch(`/api/pledges/${encodeURIComponent(id)}`, { method: 'PATCH', body: { done } });
export const addPledge = (pledge) => apiFetch('/api/pledges', { method: 'POST', body: pledge });
export const removePledge = (id) =>
  apiFetch(`/api/pledges/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const replacePledges = (list) => apiFetch('/api/pledges', { method: 'PUT', body: list });

export const getVerse = () => apiFetch('/api/verse');
export const saveVerse = (verse) => apiFetch('/api/verse', { method: 'PUT', body: verse });

export const getMeals = () => apiFetch('/api/meals');
export const saveMeals = (meals) => apiFetch('/api/meals', { method: 'PUT', body: meals });

export const getEvents = () => apiFetch('/api/events');
export const addEvent = (event) => apiFetch('/api/events', { method: 'POST', body: event });
export const removeEvent = (id) =>
  apiFetch(`/api/events/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const getSurveys = () => apiFetch('/api/surveys');
export const addSurvey = (survey) => apiFetch('/api/surveys', { method: 'POST', body: survey });
export const removeSurvey = (id) =>
  apiFetch(`/api/surveys/${encodeURIComponent(id)}`, { method: 'DELETE' });

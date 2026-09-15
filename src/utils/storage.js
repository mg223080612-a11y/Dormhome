export const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  // 같은 탭에서 보고 있는 화면도 바로 갱신되도록 알림을 쏩니다.
  // (브라우저 기본 'storage' 이벤트는 다른 탭에서만 발생합니다.)
  window.dispatchEvent(new CustomEvent('storage-write', { detail: { key } }));
};

export const addStorageItem = (key, item, fallback = []) => {
  const current = readStorage(key, fallback);
  const next = [{ id: Date.now(), ...item }, ...current];
  writeStorage(key, next);
  return next;
};

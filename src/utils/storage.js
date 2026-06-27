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
};

export const addStorageItem = (key, item, fallback = []) => {
  const current = readStorage(key, fallback);
  const next = [{ id: Date.now(), ...item }, ...current];
  writeStorage(key, next);
  return next;
};

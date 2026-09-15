import { useEffect, useRef, useState } from 'react';
import { readStorage } from './storage';

/**
 * localStorage 값을 화면에 그대로 반영하는 훅.
 * - 같은 탭에서 관리자 페이지가 저장하면 'storage-write' 이벤트로 즉시 갱신
 * - 다른 탭/창에서 저장하면 브라우저 기본 'storage' 이벤트로 갱신
 */
export default function useStoredValue(key, fallback) {
  const fallbackRef = useRef(fallback);
  const [value, setValue] = useState(() => readStorage(key, fallbackRef.current));

  useEffect(() => {
    const sync = (event) => {
      // 같은 탭(CustomEvent) / 다른 탭(StorageEvent) 모두 해당 key 일 때만 갱신
      const changedKey = event?.detail?.key ?? event?.key;
      if (changedKey && changedKey !== key) return;
      setValue(readStorage(key, fallbackRef.current));
    };

    window.addEventListener('storage-write', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('storage-write', sync);
      window.removeEventListener('storage', sync);
    };
  }, [key]);

  return value;
}

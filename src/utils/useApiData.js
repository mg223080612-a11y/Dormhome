import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from './api';

/**
 * API(/api/...)에서 데이터를 읽어 화면에 반영합니다.
 *
 * API 가 잠깐 죽거나 아직 데이터가 없어도 사이트가 빈 화면이 되지 않도록,
 * 실패하면 fallback(코드에 적힌 기본값)을 그대로 보여 줍니다.
 * 대신 error 를 같이 돌려주므로 관리자 화면에서는 "저장이 안 되는 상태"임을 알릴 수 있습니다.
 *
 * @param {string} path      '/api/pledges' 같은 경로
 * @param {*}      fallback  실패했을 때 쓸 기본값
 */
export default function useApiData(path, fallback) {
  const fallbackRef = useRef(fallback);
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const result = await apiFetch(path);
        if (signal?.aborted) return;
        // 서버에 아직 값이 없으면(null) 기본값을 씁니다.
        setData(result ?? fallbackRef.current);
        setError(null);
      } catch (err) {
        if (signal?.aborted) return;
        console.warn(`[useApiData] ${path} 불러오기 실패`, err);
        setData(fallbackRef.current);
        setError(err);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [path]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { data, setData, loading, error, reload: () => load() };
}

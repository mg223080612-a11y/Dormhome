import { useEffect, useState } from 'react';
import { fetchMe } from './api';

/**
 * 현재 로그인한 사람이 관리자인지 서버(/api/me)에 물어봅니다.
 *
 * 관리자 이메일 목록은 Cloudflare 시크릿(ADMIN_EMAILS)에만 있고
 * 브라우저로 내려오지 않습니다. 화면은 서버가 준 true/false 만 봅니다.
 *
 * ⚠️ 이건 메뉴를 보여줄지 말지를 정하는 '표시용'입니다.
 *    실제 차단은 서버가 모든 쓰기 요청마다 다시 검사합니다.
 */
export default function useIsAdmin(session) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 로그아웃 상태면 물어볼 것도 없습니다.
    if (!session) {
      setIsAdmin(false);
      setChecked(true);
      return undefined;
    }

    let alive = true;
    setChecked(false);

    fetchMe()
      .then((me) => {
        if (alive) setIsAdmin(Boolean(me?.isAdmin));
      })
      .catch((error) => {
        // API 가 없거나 실패하면 '관리자 아님'으로 둡니다(fail-closed).
        console.warn('[useIsAdmin] 권한 확인 실패', error);
        if (alive) setIsAdmin(false);
      })
      .finally(() => {
        if (alive) setChecked(true);
      });

    return () => {
      alive = false;
    };
  }, [session]);

  return { isAdmin, checked };
}

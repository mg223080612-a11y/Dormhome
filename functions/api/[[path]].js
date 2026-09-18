// ============================================================
// /api/* — Cloudflare Pages Functions + D1
//
// 사이트와 같은 도메인(sos.gvcs.kr/api/...)에서 돌아가므로 CORS 설정이 필요 없습니다.
// git push 하면 사이트와 함께 배포됩니다.
//
// 권한 규칙
//   읽기(GET)  : 누구나
//   쓰기(그 외) : Firebase 구글 로그인 토큰 + 학교 도메인 + ADMIN_EMAILS 에 등록된 관리자.
//                ADMIN_EMAILS 가 비어 있으면 아무도 쓸 수 없습니다(fail-closed).
//
// 엔드포인트
//   GET    /api/me                내 권한 (Admin 메뉴 표시 여부)
//   GET    /api/verse             주별 말씀
//   PUT    /api/verse             주별 말씀 저장
//   GET    /api/meals             주간 급식표
//   PUT    /api/meals             주간 급식표 저장
//   GET    /api/pledges           공약 목록
//   POST   /api/pledges           공약 추가
//   PUT    /api/pledges           공약 목록 통째로 교체 (관리자 '기본 목록으로')
//   PATCH  /api/pledges/:id       공약 수정 (이행 여부 등)
//   DELETE /api/pledges/:id       공약 삭제
//   GET    /api/surveys           설문 목록
//   POST   /api/surveys           설문 추가
//   DELETE /api/surveys/:id       설문 삭제
// ============================================================

const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

// 공개키는 자주 바뀌지 않으므로 isolate 안에서 잠시 캐시합니다.
let jwksCache = { keys: null, fetchedAt: 0 };

const nowSec = () => Math.floor(Date.now() / 1000);

const base64UrlToBytes = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const decodeJwtPart = (part) => {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(part)));
  } catch {
    // 내부 파싱 오류가 응답에 그대로 나가지 않도록 문구를 통일합니다.
    throw new Error('토큰을 읽을 수 없습니다.');
  }
};

async function getJwks() {
  // 1시간 캐시
  if (jwksCache.keys && Date.now() - jwksCache.fetchedAt < 60 * 60 * 1000) {
    return jwksCache.keys;
  }
  const response = await fetch(JWKS_URL);
  if (!response.ok) throw new Error('JWKS 를 가져오지 못했습니다.');
  const body = await response.json();
  jwksCache = { keys: body.keys, fetchedAt: Date.now() };
  return body.keys;
}

/** Firebase ID 토큰 검증 — 서명 + 발급자 + 만료 확인 */
async function verifyIdToken(token, projectId) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('토큰 형식이 올바르지 않습니다.');

  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeJwtPart(headerPart);
  const payload = decodeJwtPart(payloadPart);

  if (header.alg !== 'RS256') throw new Error('지원하지 않는 서명 방식입니다.');

  const keys = await getJwks();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('일치하는 공개키가 없습니다.');

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    base64UrlToBytes(signaturePart),
    new TextEncoder().encode(`${headerPart}.${payloadPart}`)
  );
  if (!valid) throw new Error('서명이 올바르지 않습니다.');

  if (payload.aud !== projectId) throw new Error('다른 프로젝트의 토큰입니다.');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('발급자가 올바르지 않습니다.');
  }
  if (Number(payload.exp) <= nowSec()) throw new Error('토큰이 만료되었습니다.');

  return payload;
}

/** 쓰기 권한 확인 — 학교 도메인 + ADMIN_EMAILS 에 등록된 관리자만 통과 */
async function requireWriter(request, env) {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!token) return { error: '로그인이 필요합니다.', status: 401 };

  let payload;
  try {
    payload = await verifyIdToken(token, env.FIREBASE_PROJECT_ID);
  } catch (error) {
    return { error: `인증 실패: ${error.message}`, status: 401 };
  }

  const email = String(payload.email || '').toLowerCase();

  if (!payload.email_verified) {
    return { error: '이메일 인증이 완료된 계정만 수정할 수 있습니다.', status: 403 };
  }

  const domain = email.split('@')[1] || '';
  if (domain !== String(env.ALLOWED_DOMAIN || '').toLowerCase()) {
    return { error: `@${env.ALLOWED_DOMAIN} 계정만 수정할 수 있습니다.`, status: 403 };
  }

  // 쓰기는 ADMIN_EMAILS 에 등록된 계정만 가능합니다.
  // 목록이 비어 있으면 '아무도 못 쓴다'로 동작합니다(fail-closed).
  // 설정이 빠졌을 때 조용히 전체 공개가 되는 쪽이 훨씬 위험하기 때문입니다.
  const admins = String(env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (admins.length === 0) {
    return {
      error:
        '관리자 목록(ADMIN_EMAILS)이 설정되지 않아 수정이 잠겨 있습니다. Cloudflare 시크릿을 설정해 주세요.',
      status: 403
    };
  }

  if (!admins.includes(email)) {
    return { error: '관리자로 등록된 계정만 수정할 수 있습니다.', status: 403 };
  }

  return { email };
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });

const fail = (message, status = 400) => json({ error: message }, status);

// ── 문서형 데이터 (verse, meals) ─────────────────────────────
async function readDoc(db, key, fallback) {
  const row = await db.prepare('SELECT data, updated_at FROM docs WHERE key = ?').bind(key).first();
  if (!row) return fallback;
  const data = JSON.parse(row.data);
  return Array.isArray(data) ? data : { ...data, updatedAt: row.updated_at };
}

async function writeDoc(db, key, data, email) {
  const updatedAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO docs (key, data, updated_at, updated_by) VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET data = excluded.data,
                                      updated_at = excluded.updated_at,
                                      updated_by = excluded.updated_by`
    )
    .bind(key, JSON.stringify(data), updatedAt, email)
    .run();
  return updatedAt;
}

// D1 은 0/1 로 저장하므로 화면에서 쓰기 좋게 true/false 로 바꿔 줍니다.
const rowToPledge = (row) => ({
  id: row.id,
  dept: row.dept,
  title: row.title,
  done: Boolean(row.done)
});

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.gvcs_db;
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method.toUpperCase();

  if (!db) {
    return fail('D1 데이터베이스가 연결되어 있지 않습니다. (바인딩 이름: gvcs_db)', 500);
  }

  // 쓰기 요청이면 먼저 권한을 확인합니다.
  const needsAuth = method !== 'GET' && method !== 'HEAD';
  let writer = null;
  if (needsAuth) {
    const result = await requireWriter(request, env);
    if (result.error) return fail(result.error, result.status);
    writer = result;
  }

  try {
    // ── 내 권한 확인 ───────────────────────────────────────
    // 화면에서 'Admin' 메뉴를 보여줄지 판단하는 용도입니다.
    // 관리자 이메일 목록 자체는 절대 내려보내지 않습니다.
    if (pathname === '/api/me' && method === 'GET') {
      const authorization = request.headers.get('Authorization') || '';
      if (!authorization.trim()) {
        return json({ authenticated: false, isAdmin: false });
      }
      const result = await requireWriter(request, env);
      if (result.error) {
        // 401 = 토큰 자체가 무효(로그인 안 된 것과 같음), 403 = 로그인은 했지만 관리자가 아님
        return json({ authenticated: result.status === 403, isAdmin: false });
      }
      return json({ authenticated: true, isAdmin: true, email: result.email });
    }

    // ── 주별 말씀 ──────────────────────────────────────────
    if (pathname === '/api/verse') {
      if (method === 'GET') return json(await readDoc(db, 'verse', null));
      if (method === 'PUT') {
        const body = await request.json();
        const updatedAt = await writeDoc(db, 'verse', body, writer.email);
        return json({ ...body, updatedAt });
      }
    }

    // ── 주간 급식표 ────────────────────────────────────────
    if (pathname === '/api/meals') {
      if (method === 'GET') return json(await readDoc(db, 'meals', null));
      if (method === 'PUT') {
        const body = await request.json();
        if (!Array.isArray(body)) return fail('급식표는 배열이어야 합니다.');
        await writeDoc(db, 'meals', body, writer.email);
        return json(body);
      }
    }

    // ── 공약 ───────────────────────────────────────────────
    if (pathname === '/api/pledges') {
      if (method === 'GET') {
        const { results } = await db
          .prepare('SELECT id, dept, title, done FROM pledges ORDER BY sort_order')
          .all();
        return json(results.map(rowToPledge));
      }

      if (method === 'POST') {
        const body = await request.json();
        if (!body.title) return fail('공약 제목이 필요합니다.');
        if (!body.dept) return fail('부서가 필요합니다.');

        const row = await db.prepare('SELECT MAX(sort_order) AS max FROM pledges').first();
        const item = {
          id: body.id ? String(body.id) : crypto.randomUUID(),
          dept: String(body.dept),
          title: String(body.title),
          done: Boolean(body.done)
        };
        await db
          .prepare('INSERT INTO pledges (id, dept, title, done, sort_order) VALUES (?, ?, ?, ?, ?)')
          .bind(item.id, item.dept, item.title, item.done ? 1 : 0, Number(row?.max ?? -1) + 1)
          .run();
        return json(item, 201);
      }

      // 관리자 '기본 목록으로' — 목록 전체를 보내온 내용으로 교체합니다.
      if (method === 'PUT') {
        const body = await request.json();
        if (!Array.isArray(body)) return fail('공약 목록은 배열이어야 합니다.');

        const statements = [db.prepare('DELETE FROM pledges')];
        body.forEach((item, index) => {
          statements.push(
            db
              .prepare(
                'INSERT INTO pledges (id, dept, title, done, sort_order) VALUES (?, ?, ?, ?, ?)'
              )
              .bind(
                String(item.id),
                String(item.dept),
                String(item.title),
                item.done ? 1 : 0,
                index
              )
          );
        });
        await db.batch(statements); // 전부 성공하거나 전부 취소
        return json(body.map((item) => ({ ...item, done: Boolean(item.done) })));
      }
    }

    if (pathname.startsWith('/api/pledges/')) {
      const id = decodeURIComponent(pathname.slice('/api/pledges/'.length));

      if (method === 'PATCH') {
        const body = await request.json();
        await db
          .prepare(
            `UPDATE pledges SET
               title = COALESCE(?, title),
               done  = COALESCE(?, done)
             WHERE id = ?`
          )
          .bind(
            body.title ?? null,
            body.done === undefined ? null : body.done ? 1 : 0,
            id
          )
          .run();

        const row = await db
          .prepare('SELECT id, dept, title, done FROM pledges WHERE id = ?')
          .bind(id)
          .first();
        if (!row) return fail('공약을 찾을 수 없습니다.', 404);
        return json(rowToPledge(row));
      }

      if (method === 'DELETE') {
        await db.prepare('DELETE FROM pledges WHERE id = ?').bind(id).run();
        return json({ ok: true });
      }
    }

    // ── 설문 ───────────────────────────────────────────────
    if (pathname === '/api/surveys') {
      if (method === 'GET') {
        const { results } = await db
          .prepare('SELECT id, title, description, url, due, owner FROM surveys ORDER BY created_at DESC')
          .all();
        return json(results);
      }

      if (method === 'POST') {
        const body = await request.json();
        if (!body.title || !body.url) return fail('설문 제목과 URL 이 필요합니다.');
        const item = {
          id: crypto.randomUUID(),
          title: String(body.title),
          description: String(body.description || ''),
          url: String(body.url),
          due: String(body.due || ''),
          owner: String(body.owner || '')
        };
        await db
          .prepare(
            `INSERT INTO surveys (id, title, description, url, due, owner, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            item.id,
            item.title,
            item.description,
            item.url,
            item.due,
            item.owner,
            new Date().toISOString()
          )
          .run();
        return json(item, 201);
      }
    }

    if (pathname.startsWith('/api/surveys/') && method === 'DELETE') {
      const id = decodeURIComponent(pathname.slice('/api/surveys/'.length));
      await db.prepare('DELETE FROM surveys WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    return fail('요청하신 주소가 없습니다.', 404);
  } catch (error) {
    // 실제 오류 내용은 서버 로그(wrangler pages deployment tail)에만 남깁니다.
    console.error('[api]', pathname, method, error);
    return fail('서버에서 오류가 발생했습니다.', 500);
  }
}

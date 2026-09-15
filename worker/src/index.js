// ============================================================
// gvcs-api — Cloudflare Worker + D1
//
// 읽기(GET)는 누구나 가능하고, 쓰기(PUT/POST/PATCH/DELETE)는
// Firebase 구글 로그인 토큰이 있고 이메일이 학교 도메인일 때만 허용합니다.
//
// 엔드포인트
//   GET    /api/verse            주별 말씀
//   PUT    /api/verse            주별 말씀 저장
//   GET    /api/meals            주간 급식표
//   PUT    /api/meals            주간 급식표 저장
//   GET    /api/pledges          공약 목록
//   POST   /api/pledges          공약 추가
//   PATCH  /api/pledges/:id      공약 수정(진행률 등)
//   DELETE /api/pledges/:id      공약 삭제
//   GET    /api/surveys          설문 목록
//   POST   /api/surveys          설문 추가
//   DELETE /api/surveys/:id      설문 삭제
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

const decodeJwtPart = (part) => JSON.parse(new TextDecoder().decode(base64UrlToBytes(part)));

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

/** 쓰기 권한 확인 — 학교 도메인 계정만 통과 */
async function requireWriter(request, env) {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { error: '로그인이 필요합니다.', status: 401 };
  }

  let payload;
  try {
    payload = await verifyIdToken(token, env.FIREBASE_PROJECT_ID);
  } catch (error) {
    return { error: `인증 실패: ${error.message}`, status: 401 };
  }

  const email = String(payload.email || '').toLowerCase();
  const domain = email.split('@')[1] || '';
  if (domain !== String(env.ALLOWED_DOMAIN || '').toLowerCase()) {
    return { error: `@${env.ALLOWED_DOMAIN} 계정만 수정할 수 있습니다.`, status: 403 };
  }

  return { email };
}

// ── CORS ────────────────────────────────────────────────────
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

const json = (data, request, env, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(request, env)
    }
  });

const fail = (message, request, env, status = 400) =>
  json({ error: message }, request, env, status);

// ── 문서형 데이터 (verse, meals) ─────────────────────────────
async function readDoc(env, key, fallback) {
  const row = await env.DB.prepare('SELECT data, updated_at FROM docs WHERE key = ?')
    .bind(key)
    .first();
  if (!row) return fallback;
  const data = JSON.parse(row.data);
  return Array.isArray(data) ? data : { ...data, updatedAt: row.updated_at };
}

async function writeDoc(env, key, data, email) {
  const updatedAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO docs (key, data, updated_at, updated_by) VALUES (?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET data = excluded.data,
                                    updated_at = excluded.updated_at,
                                    updated_by = excluded.updated_by`
  )
    .bind(key, JSON.stringify(data), updatedAt, email)
    .run();
  return updatedAt;
}

const newId = () => crypto.randomUUID();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (!pathname.startsWith('/api/')) {
      return fail('없는 경로입니다.', request, env, 404);
    }

    // 쓰기 요청이면 먼저 권한 확인
    let writer = null;
    if (method !== 'GET') {
      const result = await requireWriter(request, env);
      if (result.error) return fail(result.error, request, env, result.status);
      writer = result.email;
    }

    try {
      // ── 주별 말씀 ───────────────────────────────────────
      if (pathname === '/api/verse') {
        if (method === 'GET') {
          return json(await readDoc(env, 'verse', {}), request, env);
        }
        if (method === 'PUT') {
          const body = await request.json();
          const verse = {
            reference: String(body.reference || ''),
            text: String(body.text || ''),
            memo: String(body.memo || '')
          };
          const updatedAt = await writeDoc(env, 'verse', verse, writer);
          return json({ ...verse, updatedAt }, request, env);
        }
      }

      // ── 주간 급식표 ─────────────────────────────────────
      if (pathname === '/api/meals') {
        if (method === 'GET') {
          return json(await readDoc(env, 'meals', []), request, env);
        }
        if (method === 'PUT') {
          const body = await request.json();
          if (!Array.isArray(body)) return fail('급식표는 배열이어야 합니다.', request, env);
          const meals = body.map((meal) => ({
            day: String(meal.day || ''),
            breakfast: String(meal.breakfast || ''),
            lunch: String(meal.lunch || ''),
            dinner: String(meal.dinner || '')
          }));
          await writeDoc(env, 'meals', meals, writer);
          return json(meals, request, env);
        }
      }

      // ── 공약 ────────────────────────────────────────────
      if (pathname === '/api/pledges' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id, title, progress, owner, status FROM pledges ORDER BY created_at'
        ).all();
        return json(results, request, env);
      }

      if (pathname === '/api/pledges' && method === 'POST') {
        const body = await request.json();
        if (!body.title) return fail('공약 제목이 필요합니다.', request, env);
        const item = {
          id: newId(),
          title: String(body.title),
          progress: Number(body.progress) || 0,
          owner: String(body.owner || ''),
          status: String(body.status || '진행중')
        };
        await env.DB.prepare(
          'INSERT INTO pledges (id, title, progress, owner, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        )
          .bind(item.id, item.title, item.progress, item.owner, item.status, new Date().toISOString())
          .run();
        return json(item, request, env, 201);
      }

      if (pathname.startsWith('/api/pledges/')) {
        const id = decodeURIComponent(pathname.split('/')[3] || '');
        if (method === 'PATCH') {
          const body = await request.json();
          await env.DB.prepare(
            `UPDATE pledges SET
               title    = COALESCE(?, title),
               progress = COALESCE(?, progress),
               owner    = COALESCE(?, owner),
               status   = COALESCE(?, status)
             WHERE id = ?`
          )
            .bind(
              body.title ?? null,
              body.progress === undefined ? null : Number(body.progress),
              body.owner ?? null,
              body.status ?? null,
              id
            )
            .run();
          const row = await env.DB.prepare(
            'SELECT id, title, progress, owner, status FROM pledges WHERE id = ?'
          )
            .bind(id)
            .first();
          return json(row || {}, request, env);
        }
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM pledges WHERE id = ?').bind(id).run();
          return json({ ok: true }, request, env);
        }
      }

      // ── 설문 ────────────────────────────────────────────
      if (pathname === '/api/surveys' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id, title, description, url, due, owner FROM surveys ORDER BY created_at DESC'
        ).all();
        return json(results, request, env);
      }

      if (pathname === '/api/surveys' && method === 'POST') {
        const body = await request.json();
        if (!body.title || !body.url) return fail('제목과 URL 이 필요합니다.', request, env);
        const item = {
          id: newId(),
          title: String(body.title),
          description: String(body.description || ''),
          url: String(body.url),
          due: String(body.due || ''),
          owner: String(body.owner || '')
        };
        await env.DB.prepare(
          'INSERT INTO surveys (id, title, description, url, due, owner, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
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
        return json(item, request, env, 201);
      }

      if (pathname.startsWith('/api/surveys/') && method === 'DELETE') {
        const id = decodeURIComponent(pathname.split('/')[3] || '');
        await env.DB.prepare('DELETE FROM surveys WHERE id = ?').bind(id).run();
        return json({ ok: true }, request, env);
      }

      return fail('없는 경로이거나 지원하지 않는 방식입니다.', request, env, 404);
    } catch (error) {
      return fail(`서버 오류: ${error.message}`, request, env, 500);
    }
  }
};

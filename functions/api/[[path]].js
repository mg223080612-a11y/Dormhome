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
//   GET    /api/meals             급식 (날짜별, ?from= &to= 로 기간 지정)
//   PUT    /api/meals             급식 여러 날짜 한 번에 저장
//   GET    /api/pledges           공약 목록
//   POST   /api/pledges           공약 추가
//   PUT    /api/pledges           공약 목록 통째로 교체 (관리자 '기본 목록으로')
//   PATCH  /api/pledges/:id       공약 수정 (이행 여부 등)
//   DELETE /api/pledges/:id       공약 삭제
//   GET    /api/events            달력 일정
//   POST   /api/events            일정 추가
//   DELETE /api/events/:id        일정 삭제
//   GET    /api/taxi              택시메이트 목록 (신청자 포함)
//   POST   /api/taxi              택시메이트 등록 (학생 누구나)
//   POST   /api/taxi/:id/join     같이 타기 신청
//   DELETE /api/taxi/:id/join     신청 취소
//   DELETE /api/taxi/:id          글 삭제 (글쓴이만)
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

/**
 * 로그인 확인 — 토큰이 유효하고 학교 도메인 계정이면 통과.
 * 택시메이트처럼 학생 누구나 쓰는 기능에 씁니다.
 * 이름/이메일은 클라이언트가 보낸 값이 아니라 여기서 꺼낸 것만 씁니다.
 */
async function requireUser(request, env) {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.replace(/^Bearers+/i, '').trim();
  if (!token) return { error: '로그인이 필요합니다.', status: 401 };

  let payload;
  try {
    payload = await verifyIdToken(token, env.FIREBASE_PROJECT_ID);
  } catch (error) {
    return { error: `인증 실패: ${error.message}`, status: 401 };
  }

  const email = String(payload.email || '').toLowerCase();

  if (!payload.email_verified) {
    return { error: '이메일 인증이 완료된 계정만 이용할 수 있습니다.', status: 403 };
  }

  const domain = email.split('@')[1] || '';
  if (domain !== String(env.ALLOWED_DOMAIN || '').toLowerCase()) {
    return { error: `@${env.ALLOWED_DOMAIN} 계정만 이용할 수 있습니다.`, status: 403 };
  }

  const name = String(payload.name || '').trim() || email.split('@')[0];
  return { email, name };
}

/** 관리자 확인 — 로그인 확인에 더해 ADMIN_EMAILS 에 등록돼 있어야 합니다. */
async function requireWriter(request, env) {
  const user = await requireUser(request, env);
  if (user.error) return user;

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

  if (!admins.includes(user.email)) {
    return { error: '관리자로 등록된 계정만 수정할 수 있습니다.', status: 403 };
  }

  return user;
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

/** 'YYYY-MM-DD' 형식인지 확인 */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** 오늘로부터 n일 뒤(음수면 이전)의 날짜 문자열 */
const shiftDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

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
  //   택시메이트는 학생이 직접 등록·신청하는 기능이라 로그인만 확인하고,
  //   나머지(말씀·급식·공약·일정·설문)는 관리자만 고칠 수 있습니다.
  const needsAuth = method !== 'GET' && method !== 'HEAD';
  const studentWritable = pathname === '/api/taxi' || pathname.startsWith('/api/taxi/');
  let writer = null;
  if (needsAuth) {
    const result = studentWritable
      ? await requireUser(request, env)
      : await requireWriter(request, env);
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

    // ── 급식 (날짜별) ──────────────────────────────────────
    //   GET  /api/meals?from=YYYY-MM-DD&to=YYYY-MM-DD
    //        기간을 주지 않으면 오늘 기준 앞뒤로 조금만 돌려줍니다.
    //   PUT  /api/meals  [{ date, breakfast, lunch, dinner }, ...]
    //        붙여넣기로 여러 날짜를 한 번에 저장합니다. 같은 날짜는 덮어씁니다.
    if (pathname === '/api/meals') {
      if (method === 'GET') {
        const from = url.searchParams.get('from') || shiftDate(-14);
        const to = url.searchParams.get('to') || shiftDate(60);
        const { results } = await db
          .prepare(
            'SELECT date, breakfast, lunch, dinner FROM meals WHERE date >= ? AND date <= ? ORDER BY date'
          )
          .bind(from, to)
          .all();
        return json(results);
      }

      if (method === 'PUT') {
        const body = await request.json();
        if (!Array.isArray(body)) return fail('급식표는 배열이어야 합니다.');

        if (body.length === 0) return fail('저장할 내용이 없습니다.');

        const rows = body.filter((item) => DATE_ONLY.test(String(item?.date || '')));

        // 날짜가 하나도 없으면 예전 형식(요일 기반)을 보낸 것입니다.
        // 화면이 배포 전 버전으로 열려 있을 때 생기므로 새로고침을 안내합니다.
        if (rows.length === 0) {
          return fail(
            '화면이 예전 버전이라 저장할 수 없습니다. 새로고침(Ctrl+Shift+R) 후 다시 시도해 주세요.'
          );
        }
        if (rows.length !== body.length) {
          return fail('날짜 형식이 올바르지 않은 항목이 있습니다. (YYYY-MM-DD)');
        }

        const updatedAt = new Date().toISOString();
        const statements = rows.map((item) =>
          db
            .prepare(
              `INSERT INTO meals (date, breakfast, lunch, dinner, updated_at)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(date) DO UPDATE SET breakfast = excluded.breakfast,
                                               lunch = excluded.lunch,
                                               dinner = excluded.dinner,
                                               updated_at = excluded.updated_at`
            )
            .bind(
              String(item.date),
              String(item.breakfast || ''),
              String(item.lunch || ''),
              String(item.dinner || ''),
              updatedAt
            )
        );
        await db.batch(statements); // 전부 저장되거나 전부 취소
        return json({ saved: rows.length });
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

    // ── 달력 일정 ──────────────────────────────────────────
    if (pathname === '/api/events') {
      if (method === 'GET') {
        const { results } = await db
          .prepare('SELECT id, title, date, type, dept FROM events ORDER BY date')
          .all();
        return json(results);
      }

      if (method === 'POST') {
        const body = await request.json();
        if (!body.title || !body.date) return fail('일정 제목과 날짜가 필요합니다.');
        const item = {
          id: crypto.randomUUID(),
          title: String(body.title),
          date: String(body.date),
          type: String(body.type || 'event'),
          dept: String(body.dept || '')
        };
        await db
          .prepare(
            'INSERT INTO events (id, title, date, type, dept, created_at) VALUES (?, ?, ?, ?, ?, ?)'
          )
          .bind(item.id, item.title, item.date, item.type, item.dept, new Date().toISOString())
          .run();
        return json(item, 201);
      }
    }

    if (pathname.startsWith('/api/events/') && method === 'DELETE') {
      const id = decodeURIComponent(pathname.slice('/api/events/'.length));
      await db.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    // ── 택시메이트 ─────────────────────────────────────────
    //   학교 계정이면 누구나 등록하고 '같이 타기' 신청을 할 수 있습니다.
    //   글쓴이/신청자 이름은 토큰에서 꺼낸 값만 씁니다(위조 방지).
    if (pathname === '/api/taxi') {
      if (method === 'GET') {
        const { results: rides } = await db
          .prepare(
            `SELECT id, date, time, destination, max, memo, author_email, author_name
             FROM taxi ORDER BY date, time`
          )
          .all();
        const { results: riders } = await db
          .prepare('SELECT taxi_id, email, name FROM taxi_riders ORDER BY joined_at')
          .all();

        const byRide = {};
        riders.forEach((rider) => {
          (byRide[rider.taxi_id] = byRide[rider.taxi_id] || []).push({
            email: rider.email,
            name: rider.name
          });
        });

        return json(
          rides.map((ride) => ({
            id: ride.id,
            date: ride.date,
            time: ride.time,
            destination: ride.destination,
            max: ride.max,
            memo: ride.memo,
            author: ride.author_name,
            authorEmail: ride.author_email,
            riders: byRide[ride.id] || []
          }))
        );
      }

      if (method === 'POST') {
        const body = await request.json();
        if (!body.date || !body.time || !body.destination) {
          return fail('날짜, 시간, 목적지를 모두 입력해 주세요.');
        }
        const max = Math.min(6, Math.max(2, Number(body.max) || 4));
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        // 글쓴이는 자동으로 첫 번째 탑승자가 됩니다.
        await db.batch([
          db
            .prepare(
              `INSERT INTO taxi (id, date, time, destination, max, memo, author_email, author_name, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              id,
              String(body.date),
              String(body.time),
              String(body.destination),
              max,
              String(body.memo || ''),
              writer.email,
              writer.name,
              now
            ),
          db
            .prepare('INSERT INTO taxi_riders (taxi_id, email, name, joined_at) VALUES (?, ?, ?, ?)')
            .bind(id, writer.email, writer.name, now)
        ]);

        return json(
          {
            id,
            date: String(body.date),
            time: String(body.time),
            destination: String(body.destination),
            max,
            memo: String(body.memo || ''),
            author: writer.name,
            authorEmail: writer.email,
            riders: [{ email: writer.email, name: writer.name }]
          },
          201
        );
      }
    }

    if (pathname.startsWith('/api/taxi/')) {
      const rest = pathname.slice('/api/taxi/'.length);
      const [rawId, action] = rest.split('/');
      const id = decodeURIComponent(rawId || '');

      const ride = await db
        .prepare('SELECT id, max, author_email FROM taxi WHERE id = ?')
        .bind(id)
        .first();
      if (!ride) return fail('해당 택시메이트를 찾을 수 없습니다.', 404);

      // 같이 타기 신청 / 취소
      if (action === 'join') {
        if (method === 'POST') {
          const countRow = await db
            .prepare('SELECT COUNT(*) AS n FROM taxi_riders WHERE taxi_id = ?')
            .bind(id)
            .first();
          const already = await db
            .prepare('SELECT email FROM taxi_riders WHERE taxi_id = ? AND email = ?')
            .bind(id, writer.email)
            .first();

          if (!already && Number(countRow.n) >= Number(ride.max)) {
            return fail('인원이 모두 찼습니다.', 409);
          }

          await db
            .prepare(
              `INSERT INTO taxi_riders (taxi_id, email, name, joined_at) VALUES (?, ?, ?, ?)
               ON CONFLICT(taxi_id, email) DO NOTHING`
            )
            .bind(id, writer.email, writer.name, new Date().toISOString())
            .run();
        } else if (method === 'DELETE') {
          // 글쓴이는 빠질 수 없습니다. 글을 지워야 합니다.
          if (writer.email === ride.author_email) {
            return fail('등록한 사람은 취소할 수 없습니다. 글을 삭제해 주세요.', 400);
          }
          await db
            .prepare('DELETE FROM taxi_riders WHERE taxi_id = ? AND email = ?')
            .bind(id, writer.email)
            .run();
        } else {
          return fail('지원하지 않는 방식입니다.', 405);
        }

        const { results } = await db
          .prepare('SELECT email, name FROM taxi_riders WHERE taxi_id = ? ORDER BY joined_at')
          .bind(id)
          .all();
        return json({ id, riders: results });
      }

      // 글 삭제 — 글쓴이만
      if (!action && method === 'DELETE') {
        if (writer.email !== ride.author_email) {
          return fail('등록한 사람만 삭제할 수 있습니다.', 403);
        }
        await db.batch([
          db.prepare('DELETE FROM taxi_riders WHERE taxi_id = ?').bind(id),
          db.prepare('DELETE FROM taxi WHERE id = ?').bind(id)
        ]);
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

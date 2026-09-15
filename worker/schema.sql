-- ============================================================
-- GVCS 자치부서 홈페이지 — Cloudflare D1 스키마
--   npx wrangler d1 execute gvcs-db --remote --file=./schema.sql
-- ============================================================

-- 통째로 저장하는 문서형 데이터 (주별 말씀, 주간 급식표)
CREATE TABLE IF NOT EXISTS docs (
  key        TEXT PRIMARY KEY,
  data       TEXT NOT NULL,          -- JSON 문자열
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

-- 공약 이행도
CREATE TABLE IF NOT EXISTS pledges (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  progress   INTEGER NOT NULL DEFAULT 0,
  owner      TEXT,
  status     TEXT,
  created_at TEXT NOT NULL
);

-- 설문 링크
CREATE TABLE IF NOT EXISTS surveys (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  url         TEXT NOT NULL,
  due         TEXT,
  owner       TEXT,
  created_at  TEXT NOT NULL
);

-- ── 초기 데이터 ──────────────────────────────────────────────
INSERT OR IGNORE INTO docs (key, data, updated_at) VALUES (
  'verse',
  '{"reference":"빌립보서 4:13","text":"내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라","memo":"이번 주는 시험과 행사 준비 속에서도 하나님 안에서 성실하게 버티는 한 주입니다."}',
  datetime('now')
);

INSERT OR IGNORE INTO docs (key, data, updated_at) VALUES (
  'meals',
  '[{"day":"월","breakfast":"","lunch":"","dinner":""},{"day":"화","breakfast":"","lunch":"","dinner":""},{"day":"수","breakfast":"","lunch":"","dinner":""},{"day":"목","breakfast":"","lunch":"","dinner":""},{"day":"금","breakfast":"","lunch":"","dinner":""}]',
  datetime('now')
);

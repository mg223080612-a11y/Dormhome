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
--   dept       : 기획부(planning) / 복지부(welfare) / 영성학술부(faith) / 홍보예체능부(promotion)
--   done       : 이행 완료 여부 (0 또는 1). 부서 이행도 = 완료 수 / 전체 수
--   sort_order : 화면에 보여줄 순서
CREATE TABLE IF NOT EXISTS pledges (
  id         TEXT PRIMARY KEY,
  dept       TEXT NOT NULL,
  title      TEXT NOT NULL,
  done       INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pledges_dept ON pledges (dept, sort_order);

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

-- 공약 43건 (src/data/mockData.js 의 pledgeDepartments 와 같은 내용)
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('planning-1', 'planning', '문경생활 가이드북(MSG)', 0, 0);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('planning-2', 'planning', 'SBS 생활관 방송', 0, 1);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('planning-3', 'planning', '희망 메뉴', 0, 2);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('planning-4', 'planning', '라면데이', 0, 3);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('planning-5', 'planning', '층별자치활동', 0, 4);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('planning-6', 'planning', '계절별 생일케이크', 0, 5);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('planning-7', 'planning', '눈이 오잖아', 0, 6);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('planning-8', 'planning', '휴지 쟁탈전', 0, 7);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-1', 'welfare', '토요일 1시 인원점검', 0, 8);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-2', 'welfare', '샤워기 해바라기 필터 설치', 0, 9);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-3', 'welfare', '카페 화장실 활성화', 0, 10);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-4', 'welfare', '발수건 설치', 0, 11);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-5', 'welfare', '제습제 설치', 0, 12);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-6', 'welfare', '주말 아침 상점 부활', 0, 13);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-7', 'welfare', '공용우산 배치', 0, 14);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-8', 'welfare', '우천시 우산탈수기·신발 매트 배치', 0, 15);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-9', 'welfare', '식당 앞 세면대 가글 배치', 0, 16);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-10', 'welfare', '각 기숙사 1층 택배함·반품함 설치', 0, 17);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-11', 'welfare', '식당 음료수컵 변경', 0, 18);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-12', 'welfare', '고사기간 간식 day', 0, 19);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-13', 'welfare', '청매 B파트 쓰레기통 설치', 0, 20);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-14', 'welfare', '일반간식 메뉴 다양화', 0, 21);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-15', 'welfare', '무선 청소기 배치', 0, 22);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-16', 'welfare', '아이스크림 자판기', 0, 23);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-17', 'welfare', '급식실 TV 활성화', 0, 24);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-18', 'welfare', '도어후크 설치', 0, 25);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-19', 'welfare', '자치위원 복지 공약', 0, 26);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-20', 'welfare', '의료비품 배치', 0, 27);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('welfare-21', 'welfare', '주말 TV 채널 시간표 제작', 0, 28);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('faith-1', 'faith', '저녁시간 기도회', 0, 29);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('faith-2', 'faith', '아침찬양·청소찬양 신청곡', 0, 30);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('faith-3', 'faith', '야외 금찬', 0, 31);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('faith-4', 'faith', '자치위원 불평팔찌', 0, 32);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('faith-5', 'faith', '선택적 야간 주말 자습', 0, 33);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('faith-6', 'faith', '고사기간 프린터기 예약제', 0, 34);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('faith-7', 'faith', '고사기간 카페 노트북 사용', 0, 35);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('promotion-1', 'promotion', '방별 숏폼 콘테스트', 0, 36);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('promotion-2', 'promotion', '지비 폴라로이드', 0, 37);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('promotion-3', 'promotion', '배달음식 메뉴판 업데이트·다양화', 0, 38);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('promotion-4', 'promotion', '축구부 원정 경기 직관', 0, 39);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('promotion-5', 'promotion', '헬스장 필요 도구 추가', 0, 40);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('promotion-6', 'promotion', '아이싱 비닐봉지 배치', 0, 41);
INSERT OR IGNORE INTO pledges (id, dept, title, done, sort_order) VALUES ('promotion-7', 'promotion', '출사동이 공기주입기 배치', 0, 42);

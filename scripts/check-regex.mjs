// ============================================================
// check-regex.mjs — 정규식의 백슬래시가 빠진 채 커밋되는 사고를 막습니다.
//
// 파일을 스크립트로 수정할 때 '\d' 가 'd' 로, '\s' 가 's' 로 소실되는 일이
// 두 번 있었습니다. 두 번 다 조용히 배포됐고 증상이 엉뚱했습니다.
//   /^\d{4}-\d{2}-\d{2}$/  ->  /^d{4}-d{2}-d{2}$/   (급식 저장이 전부 400)
//   /^Bearer\s+/i          ->  /^Bearers+/i         (로그인해도 401)
//
// 정규식 리터럴 안에서 백슬래시 없이 쓰인 'd{숫자}', 's+', 's*', 'w+' 를 찾아
// 빌드를 멈춥니다. (npm run build 앞에서 자동 실행)
// ============================================================
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'functions'];
const EXTENSIONS = ['.js', '.jsx', '.mjs'];

// 정규식 리터럴을 대략적으로 집어냅니다. (문자열·주석까지 완벽히 가르지는 않습니다)
const REGEX_LITERAL = /(?<![a-zA-Z0-9_$)\]])\/(?![/*])((?:\\.|\[(?:\\.|[^\]])*\]|[^/\n\\])+)\/[gimsuyd]*/g;

// 백슬래시가 빠진 흔적 — 앞 글자가 백슬래시가 아닌 경우만
const SUSPICIOUS = [
  { pattern: /(^|[^\\])d\{\d/, hint: '\\d 가 d 로 소실된 것 같습니다' },
  { pattern: /(^|[^\\])s\+/, hint: '\\s 가 s 로 소실된 것 같습니다' },
  { pattern: /(^|[^\\])s\*/, hint: '\\s 가 s 로 소실된 것 같습니다' },
  { pattern: /(^|[^\\])w\+/, hint: '\\w 가 w 로 소실된 것 같습니다' }
];

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) out.push(full);
  }
  return out;
};

const problems = [];

for (const root of ROOTS) {
  let files;
  try {
    files = walk(root);
  } catch {
    continue; // 폴더가 없으면 넘어갑니다
  }

  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      // 주석 줄은 건너뜁니다 (설명에 예시로 적는 경우가 있습니다)
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;

      for (const match of line.matchAll(REGEX_LITERAL)) {
        const body = match[1];
        for (const { pattern, hint } of SUSPICIOUS) {
          if (pattern.test(body)) {
            problems.push({ file, line: index + 1, text: line.trim(), hint });
            return;
          }
        }
      }
    });
  }
}

if (problems.length > 0) {
  console.error('\n정규식에서 백슬래시가 빠진 것으로 보입니다:\n');
  for (const p of problems) {
    console.error(`  ${p.file}:${p.line}`);
    console.error(`    ${p.text}`);
    console.error(`    → ${p.hint}\n`);
  }
  console.error('의도한 정규식이 맞다면 scripts/check-regex.mjs 의 SUSPICIOUS 목록을 조정하세요.\n');
  process.exit(1);
}

console.log('정규식 검사 통과');

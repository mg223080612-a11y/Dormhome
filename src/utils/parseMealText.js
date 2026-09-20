// ============================================================
// parseMealText.js — 급식표를 붙여넣으면 날짜별 아침/점심/저녁으로 나눕니다.
//
// 붙여넣는 원문은 이런 모양입니다.
//
//   09-14(월)          ← 날짜 줄
//   계란옷완자전        ┐
//   ...                 │ 아침
//   그린샐러드*소스&누룽지탕  ← 아침 마지막 줄
//   곤드레들기름묵은지밥 ┐ (일품)
//                       │ 점심
//   임꺽정떡갈비        │
//   ...                 │
//   그린샐러드*드레싱   │
//   누룽지탕            ┘ ← 점심 마지막 줄
//   청양풍돈육숙주볶음  ┐
//   ...                 │ 저녁
//   누룽지탕            ┘
//   09-15(화)          ← 다음 날짜
//
// 구분은 아래 두 표시를 기준으로 합니다. 급식업체가 양식을 바꾸면
// 이 두 값만 고치면 됩니다.
// ============================================================

/** 아침의 마지막 줄에 들어가는 문구 */
const BREAKFAST_END = '그린샐러드*소스';
/** 점심의 마지막 줄 직전에 들어가는 문구 */
const LUNCH_END = '그린샐러드*드레싱';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** '09-14(월)' 같은 날짜 줄 */
const DATE_LINE = /^(\d{1,2})-(\d{1,2})\s*\(([월화수목금토일])\)\s*$/;

/**
 * 따옴표로 여러 줄에 걸쳐 있는 항목을 한 줄로 합칩니다.
 *   "빵&잼&버터
 *   아몬드후레이크&우유"   →   빵&잼&버터 / 아몬드후레이크&우유
 */
const joinQuoted = (lines) => {
  const out = [];
  let buffer = null;

  lines.forEach((line) => {
    if (buffer !== null) {
      if (line.endsWith('"')) {
        buffer.push(line.slice(0, -1));
        out.push(buffer.filter(Boolean).join(' / '));
        buffer = null;
      } else {
        buffer.push(line);
      }
      return;
    }

    if (line.startsWith('"') && !line.endsWith('"')) {
      buffer = [line.slice(1)];
      return;
    }

    out.push(line.replace(/^"|"$/g, ''));
  });

  // 닫는 따옴표가 없이 끝나면 지금까지 모은 것을 그대로 씁니다.
  if (buffer) out.push(buffer.filter(Boolean).join(' / '));
  return out;
};

/**
 * 연도를 추론합니다. 붙여넣은 원문에는 '09-14(월)' 처럼 연도가 없어서,
 * 첫 날짜의 요일이 실제로 맞는 해를 올해 기준 앞뒤로 찾아봅니다.
 */
const guessYear = (month, day, weekdayLabel) => {
  const thisYear = new Date().getFullYear();
  for (const year of [thisYear, thisYear + 1, thisYear - 1]) {
    const date = new Date(year, month - 1, day);
    if (WEEKDAYS[date.getDay()] === weekdayLabel) return { year, matched: true };
  }
  return { year: thisYear, matched: false };
};

/** 앞뒤의 빈 줄만 잘라냅니다. 가운데 빈 줄은 구분선이라 남깁니다. */
const trimBlank = (lines) => {
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start]) start += 1;
  while (end > start && !lines[end - 1]) end -= 1;
  return lines.slice(start, end).join('\n');
};

const pad = (n) => String(n).padStart(2, '0');

/**
 * 붙여넣은 급식표를 날짜별로 나눕니다.
 * @returns {{ days: Array, warnings: string[] }}
 *   days: [{ date: '2026-09-14', weekday: '월', breakfast, lunch, dinner }]
 */
export default function parseMealText(text) {
  const warnings = [];
  const rawLines = String(text || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim());

  const lines = joinQuoted(rawLines);

  // 1) 날짜 줄을 기준으로 하루치씩 자릅니다.
  const chunks = [];
  let current = null;
  lines.forEach((line) => {
    const match = line.match(DATE_LINE);
    if (match) {
      current = {
        month: Number(match[1]),
        day: Number(match[2]),
        weekday: match[3],
        body: []
      };
      chunks.push(current);
      return;
    }
    // 빈 줄도 그대로 둡니다. 점심 칸에서 일품과 일반 세트를 갈라 주는
    // 구분선 역할을 하고 있어서, 버리면 화면에서 둘이 붙어 버립니다.
    // (앞뒤로 남는 빈 줄은 아래 trimBlank 에서 정리합니다)
    if (current) current.body.push(line);
  });

  if (chunks.length === 0) {
    warnings.push('날짜 줄(예: 09-14(월))을 찾지 못했습니다. 붙여넣은 내용을 확인해 주세요.');
    return { days: [], warnings };
  }

  // 2) 연도 추론
  const first = chunks[0];
  const { year, matched } = guessYear(first.month, first.day, first.weekday);
  if (!matched) {
    warnings.push(
      `${pad(first.month)}-${pad(first.day)}(${first.weekday}) 의 요일과 맞는 연도를 찾지 못해 ${year}년으로 뒀습니다. 저장 전에 날짜를 확인해 주세요.`
    );
  }

  // 3) 하루치를 아침/점심/저녁으로 나눕니다.
  const days = chunks.map((chunk) => {
    const date = `${year}-${pad(chunk.month)}-${pad(chunk.day)}`;
    const body = chunk.body;

    const empty = { date, weekday: chunk.weekday, breakfast: '', lunch: '', dinner: '' };
    // 빈 줄만 있는 날(급식 없는 날)도 빈 날로 봅니다.
    if (body.every((line) => !line)) return empty;

    const breakfastEnd = body.findIndex((line) => line.includes(BREAKFAST_END));

    // 아침 표시가 없으면 나눌 근거가 없습니다. 통째로 저녁에 넣고 알려 줍니다.
    if (breakfastEnd === -1) {
      warnings.push(
        `${date}(${chunk.weekday}): '${BREAKFAST_END}' 표시가 없어 전부 저녁으로 넣었습니다. 아래 표에서 직접 옮겨 주세요.`
      );
      return { ...empty, dinner: trimBlank(body) };
    }

    const breakfast = body.slice(0, breakfastEnd + 1);
    const rest = body.slice(breakfastEnd + 1);

    const lunchMark = rest.findIndex((line) => line.includes(LUNCH_END));
    if (lunchMark === -1) {
      // 점심 표시가 없으면 남은 것을 전부 점심으로 봅니다.
      warnings.push(
        `${date}(${chunk.weekday}): '${LUNCH_END}' 표시가 없어 아침 이후를 전부 점심으로 넣었습니다.`
      );
      return {
        ...empty,
        breakfast: trimBlank(breakfast),
        lunch: trimBlank(rest)
      };
    }

    // 점심은 '그린샐러드*드레싱' 다음 줄(보통 누룽지탕)까지입니다.
    const lunchEnd = lunchMark + 1 < rest.length ? lunchMark + 1 : lunchMark;
    const lunch = rest.slice(0, lunchEnd + 1);
    const dinner = rest.slice(lunchEnd + 1);

    return {
      date,
      weekday: chunk.weekday,
      breakfast: trimBlank(breakfast),
      lunch: trimBlank(lunch),
      dinner: trimBlank(dinner)
    };
  });

  return { days, warnings };
}

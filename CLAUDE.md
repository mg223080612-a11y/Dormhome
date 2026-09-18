# CLAUDE.md — GVCS 자치부서 홈페이지 핸드오프 문서

이 문서는 Claude Code(또는 다른 도구)에서 이 프로젝트를 이어서 작업할 때 필요한 맥락을 담고 있습니다.
**무엇을 만들었는지**뿐 아니라 **왜 그렇게 결정했는지**를 함께 적었습니다.

최종 갱신: 2026-09-18

---

## 1. 프로젝트 개요

학교(GVCS) 자치부서 학생들이 쓰는 웹사이트입니다. 급식·달력·건의함·택시메이트·설문 등
학생 생활 기능을 한곳에 모았고, 관리자 페이지에서 내용을 갱신합니다.

| 항목 | 값 |
|---|---|
| 스택 | React 19 + Vite (JS, TypeScript 아님) |
| 로컬 경로 | `D:\dahee\Develop\gvcs-autonomy-homepage` |
| Git 원격 | `https://github.com/mg223080612-a11y/Dormhome.git` (브랜치 `main`) |
| 인증 | Firebase Authentication — 구글 로그인 |
| Firebase 프로젝트 | `dormhome-1c840` |
| 데이터 저장 | 현재 브라우저 `localStorage` (⚠️ 임시, 아래 8장 참고) |
| 서비스 주소 | `https://sos.gvcs.kr` |

### 실행 / 빌드 / 배포

```bash
npm install
npm run dev        # 개발 서버 (기본 http://localhost:5173)
npm run build      # dist/ 생성
npm run preview    # 빌드 결과 미리보기
```

배포 후에도 예전 화면이 보이면 **브라우저 강력 새로고침(Ctrl+F5)** 을 먼저 해보세요.
빌드 결과 파일명(`dist/assets/index-XXXX.js`)의 해시가 바뀌었는지 확인하면 새 빌드인지 알 수 있습니다.

---

## 2. 파일 지도

```
src/
├─ main.jsx                 진입점
├─ App.jsx                  라우팅(History API) + 로그인 상태 + 페이지 매핑
├─ components/
│  ├─ Layout.jsx            앱 셸: 모바일 상단바 + 사이드바 + 콘텐츠
│  ├─ Sidebar.jsx           4카테고리 아코디언 메뉴 (아이콘 SVG 내장)
│  ├─ HomeHero.jsx          홈 상단 SOS 배너 + 이번 주 말씀
│  ├─ Login.jsx             구글 로그인 화면
│  ├─ PageShell.jsx         페이지 공통 카드 껍데기
│  └─ DepartmentSwitcher.jsx
├─ data/
│  ├─ menu.js               navTree(카테고리→하위메뉴), parentOf()
│  ├─ departments.js        부서별 색상 테마
│  └─ mockData.js           초기/기본 데이터 (급식·공약·설문·말씀 등)
├─ lib/
│  └─ firebase.js           Firebase 초기화, ALLOWED_DOMAIN, googleProvider
├─ pages/
│  ├─ Dashboard.jsx         홈 대시보드
│  ├─ FeaturePages.jsx      기능 페이지 대부분 (달력·급식·건의함·설문·말씀 …)
│  ├─ AdminPage.jsx         관리자 탭 (PIN 게이트)
│  └─ DepartmentPage.jsx
├─ styles/
│  ├─ theme.css             디자인 토큰 (색·반경·그림자). SOS 팔레트 포함
│  ├─ layout.css            앱 셸·사이드바·히어로
│  ├─ pages.css             카드·달력·관리자 등 페이지 요소
│  └─ login.css
└─ utils/
   ├─ auth.js               로그인/로그아웃/상태구독/도메인 검증/에러 문구
   ├─ storage.js            localStorage 읽기·쓰기 (+ 'storage-write' 이벤트)
   └─ useStoredValue.js     저장값을 화면에 즉시 반영하는 훅

public/
├─ hero-banner.jpg          홈 상단 배너 (현재 사용)
├─ hero-sos.jpg             이전 배너 (미사용, 정리 가능)
├─ note-paper.png           메모지 컷아웃 (미사용)
├─ hero-marks.png           느낌표 장식 컷아웃 (미사용)
├─ paper-yellow.jpg         구겨진 노란 종이 질감 (미사용)
├─ sos-mark.svg             SOS 로고 — ⚠️ 2.6MB, 8장 참고
└─ sync-mark.png, favicon.* …

worker/                     Cloudflare Worker + D1 API (미완성, 8장 참고)
firebase.json / .firebaserc Firebase Hosting 설정 (현재 리다이렉트 용도)
public-redirect/index.html  구버전 주소 → sos.gvcs.kr 안내 페이지
```

---

## 3. 인증 — 왜 이렇게 했나

### 결정: Firebase 구글 로그인, `@gvcs-mg.org` 도메인만 허용

- 기존 ID/비밀번호 mock 로그인을 **완전히 대체**했습니다. 학생 계정을 따로 만들고 관리할 필요가 없고,
  학교 구글 계정이 곧 신원이기 때문입니다.
- 도메인 제한은 `src/lib/firebase.js` 의 `ALLOWED_DOMAIN`, 검증은 `src/utils/auth.js` 의
  `isAllowedEmail()` 입니다.

### 중요: **fail-closed** 로 설계했다

처음 구현은 `ALLOWED_DOMAIN` 이 비어 있으면 **모든 구글 계정을 허용**했습니다.
`.env` 가 없거나 값이 비면 조용히 전체 공개가 되는 구조라 위험해서 다음과 같이 바꿨습니다.

```js
// firebase.js
export const DEFAULT_ALLOWED_DOMAIN = 'gvcs-mg.org';
export const ALLOWED_DOMAIN = (env값 || '').trim().toLowerCase().replace(/^@/, '')
  || DEFAULT_ALLOWED_DOMAIN;   // 비어 있어도 절대 전체 허용이 되지 않는다
```

```js
// auth.js — 빈 값일 때 통과시키던 분기를 제거
export const isAllowedEmail = (email) => domainOf(email) === ALLOWED_DOMAIN;
```

허용되지 않은 계정은 `signInWithPopup` 직후 `signOut` 시키고 안내 문구를 띄웁니다.
`onAuthStateChanged` 구독에서도 같은 검사를 하므로, 이미 로그인된 외부 계정도 새로고침 시 풀립니다.

### 결정: Firebase config 를 코드에 기본값으로 내장

`src/lib/firebase.js` 의 `DEFAULT_CONFIG` 에 apiKey 등을 넣고, `.env` 값이 있으면 그쪽이 우선합니다.

이유:
1. **Firebase 웹 config 는 비밀이 아닙니다.** 어차피 빌드 결과물(js 번들)에 그대로 실려 브라우저로 갑니다.
   실제 보호는 Firebase 콘솔의 *승인된 도메인* 과 보안 규칙이 담당합니다.
2. `.env` 파일이 없으면 앱이 `auth/invalid-api-key` 로 즉시 죽는데, `.env` 는 git 에 올라가지 않아
   새 환경에서 매번 같은 사고가 납니다. 기본값이 있으면 clone 후 바로 돌아갑니다.

### Firebase 콘솔에서 해둬야 하는 설정

- Authentication → Sign-in method → **Google 사용 설정**
- Authentication → Settings → **승인된 도메인**에 `localhost`, `sos.gvcs.kr`, 배포 도메인 추가

---

## 4. 라우팅 — 왜 해시를 버렸나

원래 `window.location.hash` 기반(`/#/calendar`)이었는데 주소가 지저분해서 **History API** 로 바꿨습니다.
(`src/App.jsx` 의 `pathToPage` / `pageToPath` / `readPageFromLocation`)

- `navigate()` 는 `history.pushState` + 상태 변경, 뒤로/앞으로는 `popstate` 로 처리합니다.
- 예전 `#/xxx` 링크로 들어와도 첫 렌더에서 `replaceState` 로 깔끔한 주소로 정리합니다.

> ⚠️ **배포 시 필수**: 모든 경로를 `index.html` 로 보내는 rewrite 가 없으면 `/calendar` 직접 접속이 404 입니다.
> - Firebase Hosting: `firebase.json` 의 `rewrites` 에 `{"source": "**", "destination": "/index.html"}`
> - Cloudflare Pages: `public/_redirects` 에 `/*  /index.html  200`

라우터 라이브러리(react-router)는 **일부러 넣지 않았습니다.** 페이지가 단순 매핑이라 의존성을 늘릴 이유가 없었습니다.

---

## 5. 사이드바 — 4카테고리 아코디언

메뉴가 14개까지 늘어나 한 줄로 나열하니 길어져서, 상위 4개 아래로 묶었습니다.

```
Home            ├ 달력 · 주별 말씀 · 사진첩
Surveys         ├ 건의함 · 희망메뉴/급식 · 희망메뉴/매점
Policy Progress ├ 수리 요청
Events          ├ 급식 · 택시메이트 · 마켓
```

- 분류는 `src/data/menu.js` 의 `navTree` 한 곳에서 관리합니다. 항목을 옮기려면 `children` 배열만 바꾸면 됩니다.
- 카테고리 **이름**을 누르면 그 페이지로 이동 + 펼침, 오른쪽 **꺾쇠(›)** 만 누르면 이동 없이 접기/펴기입니다.
  (이동과 펼침을 한 버튼에 묶으면 "그냥 목록만 보고 싶은" 경우를 막게 돼서 분리했습니다.)
- 현재 보고 있는 페이지가 속한 카테고리는 `parentOf()` 로 찾아 자동으로 펼칩니다.
- 기존 `primaryMenu` / `secondaryMenu` / `menu` export 는 하위 호환을 위해 `navTree` 에서 파생시켜 유지합니다.

---

## 6. 주별 말씀 — 관리자 입력이 화면에 반영되는 구조

문제: 관리자 페이지에서 말씀을 고쳐도 화면은 `mockData.js` 의 고정값만 보여주고 있었습니다.

해결:

1. `utils/storage.js` 의 `writeStorage()` 가 저장 후 `window.dispatchEvent(new CustomEvent('storage-write'))` 를 쏩니다.
   (브라우저 기본 `storage` 이벤트는 **다른 탭에서만** 발생해서, 같은 탭 갱신용으로 직접 만든 신호입니다.)
2. `utils/useStoredValue.js` 훅이 `storage-write`(같은 탭)와 `storage`(다른 탭)를 모두 구독해 즉시 재렌더합니다.
3. `VersePage`(FeaturePages.jsx)와 `HomeHero.jsx` 가 이 훅으로 `admin-verse` 를 읽습니다.
4. `AdminPage.jsx` 의 `AdminVerse` 는 **저장 버튼**을 눌러야 반영되고(타이핑마다 저장하지 않음), `updatedAt` 을 함께 기록합니다.

같은 패턴을 다른 데이터에도 그대로 쓸 수 있습니다. **새 데이터를 추가할 때는 이 흐름을 따르세요.**

---

## 7. 디자인 — 배너와 색

### SOS 팔레트

`src/styles/theme.css` 상단에 토큰이 모여 있습니다. 색을 바꾸려면 여기만 고치면 전체에 반영됩니다.

```css
--sos-yellow / --sos-yellow-deep / --sos-red / --sos-paper
```

### 히어로 배너: 합성 → 단일 이미지 (중요한 교훈)

처음에는 배경(노란 종이) + 메모지 + 느낌표 + SOS 로고를 **CSS 로 겹쳐서** 만들었습니다.
결과적으로 레이아웃이 깨졌고, 원인은 `public/sos-mark.svg` 가 **2.6MB 짜리 초대형 SVG** 라
지정한 비율이 먹지 않고 컨테이너를 밀어버린 것이었습니다.

→ 완성된 배너 이미지 한 장(`public/hero-banner.jpg`)으로 교체했습니다. 지금 구조는 단순합니다.

```
.home-hero
 ├─ .hero-banner        (버튼) → 이미지 한 장, 클릭 시 주별 말씀 페이지
 └─ .hero-verse         (버튼) → 이번 주 말씀 텍스트
```

`layout.css` 의 `.hero-banner-img` 는 원본 왼쪽 6px 에 있는 스프링 노트 천공 스트립을 잘라내려고
`width: 100.45%; margin-left: -0.45%` 로 살짝 밀어둔 상태입니다. **배너 이미지를 교체하면 이 값도 다시 봐야 합니다.**

### 미사용 자산

`hero-sos.jpg`, `note-paper.png`, `hero-marks.png`, `paper-yellow.jpg` 는 합성 방식에서 쓰던 것들로
현재 코드에서 참조하지 않습니다. 정리해도 되지만, `note-paper.png` 에는 스톡 워터마크가 있으니
**다시 쓰지 마세요.**

### 달력

- "오늘로 이동" 버튼을 없앴습니다. 다른 달로 가면 버튼이 나타났다 사라지며 헤더가 흔들렸기 때문입니다.
- 오늘 날짜는 `.calendar-day.today` 강조 표시로만 알립니다.
- 보고 있는 달은 컴포넌트 상태라서 **새로고침하면 항상 이번 달로 초기화**됩니다. (의도된 동작)

---

## 8. 알려진 문제 / 다음 작업

### (1) 데이터가 브라우저에만 저장됩니다 — 가장 큰 미해결 과제

지금 모든 데이터(`admin-verse`, `admin-meals`, `suggestions`, `taxi-requests` …)는 `localStorage` 입니다.
**관리자가 저장한 내용은 그 컴퓨터·그 브라우저에서만 보입니다.** 학생들 기기에는 기본값만 보입니다.

사용자 결정: **데이터는 Cloudflare D1, 인증은 Firebase 유지.**
`worker/` 폴더에 백엔드 뼈대까지 만들어 두고 프런트 연결 전에 멈춘 상태입니다.

```
worker/
├─ wrangler.toml   D1 바인딩, FIREBASE_PROJECT_ID, ALLOWED_DOMAIN, ALLOWED_ORIGINS
├─ schema.sql      docs(verse/meals) / pledges / surveys 테이블 + 초기 데이터
├─ src/index.js    GET 공개 / 쓰기는 Firebase ID 토큰 검증 + 도메인 확인
└─ package.json
```

설계 의도:
- **읽기는 누구나, 쓰기는 학교 계정만.** Worker 가 Firebase ID 토큰을 JWKS 로 직접 검증합니다
  (라이브러리 없이 WebCrypto 사용 — Worker 런타임에 firebase-admin 을 쓸 수 없어서).
- 주별 말씀·급식처럼 통째로 다루는 데이터는 `docs` 테이블에 JSON 으로, 공약·설문처럼 목록인 것은 별도 테이블로.

남은 일:
1. `npx wrangler d1 create gvcs-db` → `wrangler.toml` 의 `database_id` 채우기
2. `npm run db:init` (schema.sql 적용) → `npm run deploy`
3. 프런트에 `src/lib/apiConfig.js` / `src/utils/api.js` / `useApiData` 훅 추가
4. `VersePage`, `MealPage`, `PledgePage`, `SurveyPage`, `AdminPage` 를 API 기반으로 교체
   (실패 시 `mockData` 로 폴백, 로딩 상태 표시)
5. Worker 의 `ALLOWED_ORIGINS` 에 실제 서비스 주소 넣기

### (2) 관리자 PIN 이 소스에 하드코딩되어 있습니다

`src/pages/AdminPage.jsx` 의 `ADMIN_PIN` 입니다. 번들에 그대로 들어가므로 **보안 장치가 아닙니다.**
D1 이관 시 쓰기 권한을 Firebase 계정 기반으로 옮기고, 관리자 목록은 서버에서 판단하도록 바꾸는 게 맞습니다.

### (3) 도메인 검증은 프런트엔드에만 있습니다

우회가 가능합니다. 실제 데이터를 서버로 옮길 때 서버 쪽에서도 이메일 도메인을 반드시 검사해야 합니다.
(Worker 코드에는 이미 들어가 있습니다.)

### (4) `public/sos-mark.svg` 가 2.6MB 입니다

첫 로딩을 느리게 만들고 위에 적은 레이아웃 사고의 원인이었습니다. 가벼운 SVG 나 PNG 로 교체 권장.

### (5) 호스팅 현황

`firebase.json` 은 현재 **정적 사이트 배포가 아니라 `https://sos.gvcs.kr` 로 301 리다이렉트** 하도록 되어 있습니다
(`public: "public-redirect"`). 실제 서비스는 그 주소에서 제공됩니다.
다시 Firebase Hosting 으로 직접 서빙하려면 `public` 을 `dist` 로 바꾸고 `redirects` 를 SPA `rewrites` 로 되돌려야 합니다.

### (6) 정리 대상

- `env-복사용.txt` (임시 파일)
- `Claude outputs/` 폴더
- 미사용 이미지들 (위 7장)

---

## 9. 코드 컨벤션

- **주석·UI 문구는 한국어.** 학생들이 직접 코드를 열어볼 수 있게 설명형 주석을 답니다.
- 함수형 컴포넌트 + 훅만 사용. 클래스 컴포넌트 없음.
- 상태 관리 라이브러리 없음. `useState` + 커스텀 훅으로 충분한 규모입니다.
- 색·간격·그림자는 CSS 변수(`theme.css`)를 쓰고 하드코딩을 피합니다.
- 새 페이지를 추가하려면: `FeaturePages.jsx` 에 컴포넌트 → `App.jsx` 의 `pageMap` 에 등록 →
  `data/menu.js` 의 `navTree` 에 메뉴 추가. 세 곳을 모두 건드려야 합니다.
- 로그인이 필요한 페이지는 `App.jsx` 의 `guard()` 로 감쌉니다.

---

## 10. 배포 체크리스트

1. `npm run build`
2. `dist/assets/index-*.js` 해시가 바뀌었는지 확인 (안 바뀌었으면 소스가 반영되지 않은 것)
3. 배포 (현 구성 기준: 실제 서비스는 `sos.gvcs.kr`, Firebase Hosting 은 리다이렉트 전용)
4. 배포 도메인이 Firebase Authentication → **승인된 도메인**에 있는지 확인
5. SPA rewrite 가 살아 있는지 `/calendar` 직접 접속으로 확인
6. 학교 계정으로 로그인 성공 / 외부 구글 계정은 차단되는지 확인
7. 브라우저 Ctrl+F5 로 캐시 확인

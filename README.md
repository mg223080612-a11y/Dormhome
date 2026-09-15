# GVCS 자치부서 홈피 프로토타입

React + Vite 기반의 자치부서 홈페이지 MVP입니다.

## 실행 방법

```bash
npm install
cp .env.example .env   # 값을 채운 뒤 저장
npm run dev
```

브라우저에서 표시되는 주소로 접속하면 됩니다.

## Firebase 구글 로그인 설정

1. **Firebase 콘솔 > Authentication > Sign-in method** 에서 **Google** 제공업체를 사용 설정합니다.
2. **Authentication > Settings > 승인된 도메인**에 `localhost` 와 실제 배포 도메인을 추가합니다.
3. **프로젝트 설정 > 내 앱 > SDK 설정 및 구성 > 구성** 에서 config 값을 복사해 `.env` 에 넣습니다.
4. 로그인 허용 도메인은 **`gvcs-mg.org` 고정(기본값)** 입니다. `@gvcs-mg.org` 계정만 로그인·등록되며,
   그 외 구글 계정은 로그인 직후 자동 로그아웃됩니다. 다른 도메인을 쓰려면 `.env` 의
   `VITE_ALLOWED_EMAIL_DOMAIN` 값을 바꾸세요. (비워두면 기본값이 적용되며, 전체 허용으로 열리지 않습니다.)
5. `.env` 를 바꾼 뒤에는 **dev 서버를 반드시 재시작**해야 값이 반영됩니다.

관련 파일

```txt
src/lib/firebase.js   Firebase 앱·auth·GoogleAuthProvider 초기화
src/utils/auth.js     로그인/로그아웃/상태구독/도메인 검증
src/components/Login.jsx  구글 로그인 버튼 화면
```

> 도메인 검증은 프론트엔드에서만 이뤄지므로 우회가 가능합니다. 실제 데이터를 Firestore 로 옮길 때는
> 보안 규칙에서 `request.auth.token.email` 의 도메인을 함께 검사하거나, 관리자 권한은
> Custom Claims 로 부여하세요.

## 주요 기능

- Firebase 구글 로그인 (`@gvcs-mg.org` 계정만 허용)
- MG 끝자리 기반 택시메이트 남/여 그룹 분리
- 자치부서별 색상 테마
  - 자치위원: 버건디
  - 홍보대사: 핑크
  - 신문부: 아이보리
  - 자치법정: 청록색
  - GMB: 검정
- 홈 대시보드
- 달력/스케줄표
- 공약 이행도
- 택시메이트
- 건의함
- 급식
- 설문조사 링크 버튼 및 새로고침
- 기숙사 수리 요청
- 학사일정/시험 카운트
- 상점 관련 안내
- 생활관 꿀팁
- 생일자 달력
- 주별 말씀
- 생활관 스케줄표
- 희망 메뉴/급식실
- 희망 메뉴/매점
- 숏폼 + 사진첩
- 당근마켓

## 파일 구조

```txt
gvcs-autonomy-homepage/
├─ index.html
├─ package.json
├─ public/
│  └─ wireframe.png
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ components/
   │  ├─ DepartmentSwitcher.jsx
   │  ├─ Layout.jsx
   │  ├─ Login.jsx
   │  ├─ PageShell.jsx
   │  ├─ Sidebar.jsx
   │  └─ StatCard.jsx
   ├─ data/
   │  ├─ departments.js
   │  ├─ menu.js
   │  └─ mockData.js
   ├─ pages/
   │  ├─ Dashboard.jsx
   │  └─ FeaturePages.jsx
   ├─ styles/
   │  ├─ layout.css
   │  ├─ login.css
   │  ├─ pages.css
   │  └─ theme.css
   └─ utils/
      ├─ auth.js
      └─ storage.js
```

## MG 끝자리 성별 판별 규칙 변경

`src/utils/auth.js`에서 아래 부분을 바꾸면 됩니다.

```js
export const GENDER_RULE = {
  female: ['0', '2', '4', '6', '8'],
  male: ['1', '3', '5', '7', '9']
};
```

실제 학교 운영에서는 프론트엔드에서만 성별을 판별하면 보안상 우회가 가능합니다. Firebase/Supabase 같은 백엔드 DB에 `genderGroup`, `grade`, `role` 값을 저장하고, 서버 보안 규칙으로 택시메이트 접근 권한을 막는 방식이 안전합니다.

## 실제 배포 시 교체해야 하는 부분

현재 버전은 시연용이라 `localStorage`에 데이터를 저장합니다. 실제 운영에서는 다음 항목을 백엔드로 바꾸는 것을 권장합니다.

- 로그인/인증
- 설문 링크 관리
- 택시메이트 게시글
- 건의함
- 기숙사 수리 요청
- 희망 메뉴
- 당근마켓
- 사진첩/숏폼 링크

## Firebase 컬렉션 예시

```txt
users/{mg}
  name
  grade
  role
  genderGroup
  departmentRole

surveys/{surveyId}
  title
  description
  url
  owner
  due
  isOpen

suggestions/{suggestionId}
  title
  body
  category
  authorMg
  status
  createdAt

taxiMates/{postId}
  genderGroup
  date
  time
  destination
  max
  authorMg
  memo
  createdAt

repairRequests/{requestId}
  room
  category
  body
  authorMg
  status
  createdAt
```

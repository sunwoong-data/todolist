# TodoList 구조 설계 원칙

---

**버전**: v1.2
**작성자**: sunwoong-data
**작성일**: 2026-05-27
**최종 수정일**: 2026-05-30 (v1.2)
**참조 문서**: `docs/1-domain-definition.md`, `docs/2-PRD.md`, `docs/3-user-scenario.md`

| 버전 | 날짜       | 변경 내용 |
| ---- | ---------- | --------- |
| v1.0 | 2026-05-27 | 최초 작성 |
| v1.1 | 2026-05-28 | 백엔드 TypeScript → JavaScript(CommonJS) 전환 반영. 파일 확장자, 디렉토리 구조, 코드 예시 업데이트. Swagger UI 엔드포인트 추가 반영 |
| v1.2 | 2026-05-30 | API 경로에 신규 엔드포인트 추가: /api/assignees, /api/anniversaries, /api/holidays. 백엔드 서비스/리포지토리 파일 목록 업데이트 |

---

## 1. 공통 최상위 원칙

> 모든 스택(프론트엔드, 백엔드, DB)에 공통으로 적용되는 원칙이다.

### 1-1. 오버엔지니어링 금지

**근거**: 이 프로젝트는 동시 접속 1,000명 규모의 단일 웹 서비스다. 불필요한 추상화와 패턴은 유지보수 비용을 높이고 개발 속도를 저하시킨다.

- 현재 요구사항에 없는 기능을 미리 설계하지 않는다.
- 필요 이상의 레이어, 인터페이스, 팩토리, 래퍼를 만들지 않는다.
- 단순한 구현이 가능한 곳에 복잡한 패턴을 도입하지 않는다.

### 1-2. 도메인 용어 일관성

**근거**: User/Category/Todo라는 도메인 용어가 코드, DB, API, 문서 전반에서 일치해야 혼란을 방지할 수 있다.

- 변수명, 함수명, 파일명, DB 컬럼명, API 경로에 동일한 도메인 용어를 사용한다.
- 도메인 용어: `user`, `category`, `todo`
- DB 컬럼명은 snake_case: `user_id`, `category_id`, `is_completed`, `start_date`, `end_date`, `theme_preference`, `language_preference`
- TypeScript/JavaScript 변수명은 camelCase: `userId`, `categoryId`, `isCompleted`, `startDate`, `endDate`

### 1-3. 데이터 소유권 검증 필수

**근거**: BR-02에 따라 사용자는 자신의 데이터에만 접근 가능하다. 모든 CRUD 작업에서 `user_id` 기반 소유권 검증이 누락되면 데이터 격리가 깨진다.

- 모든 Todo, Category 관련 API는 JWT에서 추출한 `user_id`로 소유권을 검증한다.
- 소유권 검증은 서비스 레이어 또는 쿼리 레벨에서 반드시 적용한다.

### 1-4. 환경 분리

**근거**: 개발/운영 환경의 설정값(DB 접속 정보, JWT 시크릿, 포트 등)이 코드에 하드코딩되면 보안 사고와 운영 오류의 원인이 된다.

- 모든 환경별 설정값은 `.env` 파일로 관리한다.
- `.env` 파일은 `.gitignore`에 포함하여 저장소에 커밋하지 않는다.
- `.env.example` 파일로 필요한 변수 목록을 문서화한다.

**백엔드 `.env.example`**

```dotenv
# 서버
PORT=3000
NODE_ENV=development

# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todolist

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

#CORS
CORS_ORIGIN=http://localhost:5173
```

**프론트엔드 `.env.example`**

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

---

## 2. 의존성/레이어 원칙

### 2-1. 백엔드 레이어 구조

**근거**: 라우터가 DB 쿼리를 직접 호출하면 테스트가 불가능하고 비즈니스 로직이 분산된다. 레이어를 분리하면 각 계층의 책임이 명확해진다.

의존성 방향은 단방향으로 유지한다:

```
Router (HTTP 처리) → Service (비즈니스 로직) → Repository (DB 접근)
```

- **Router**: HTTP 요청/응답 처리, 인증 미들웨어 적용, 입력 유효성 검사
- **Service**: 비즈니스 규칙 적용 (BR-03, BR-06 등), 트랜잭션 조율
- **Repository**: SQL 쿼리 실행, `pg` 라이브러리 직접 사용

Router는 Repository를 직접 호출하지 않는다. Service는 HTTP 컨텍스트(req, res)를 알지 못한다.

### 2-2. ORM 금지 — pg 직접 사용

**근거**: PRD 제약사항에 따라 Prisma 사용이 금지되어 있다. `pg` 라이브러리로 raw SQL을 직접 작성하면 쿼리의 동작을 완전히 제어할 수 있다.

- Prisma, Sequelize, TypeORM 등 ORM 도입 금지
- `pg` 라이브러리의 `Pool`을 사용하여 DB 커넥션 풀을 관리한다
- SQL은 Repository 파일 내에서만 작성한다
- 파라미터화된 쿼리(`$1`, `$2` 플레이스홀더)를 반드시 사용하여 SQL Injection을 방지한다

```typescript
// 올바른 예시 — 파라미터화된 쿼리
const result = await pool.query("SELECT * FROM todos WHERE user_id = $1 AND id = $2", [userId, todoId]);

// 금지 — 문자열 직접 삽입
const result = await pool.query(
  `SELECT * FROM todos WHERE user_id = '${userId}'`, // SQL Injection 취약점
);
```

### 2-3. 프론트엔드 상태 관리 레이어

**근거**: 서버 상태와 클라이언트 상태를 혼용하면 캐시 무효화와 동기화 문제가 발생한다. 역할에 따라 상태 관리 도구를 분리한다.

- **TanStack Query**: 서버 데이터 (Todo 목록, Category 목록 등) — 캐싱, 리페치, 로딩/에러 상태 관리
- **Zustand**: 클라이언트 전용 상태 (인증 정보, 현재 테마, 현재 언어, 선택된 필터)
- React 로컬 state (`useState`): 단일 컴포넌트 내부에서만 사용되는 UI 상태 (폼 입력값, 모달 열림 여부 등)

서버 데이터를 Zustand에 저장하거나, 클라이언트 상태를 TanStack Query로 관리하지 않는다.

---

## 3. 코드/네이밍 원칙

### 3-1. 파일/디렉토리 네이밍

**근거**: 일관된 네이밍 규칙이 없으면 파일 탐색 비용이 증가하고 팀원 간 충돌이 발생한다.

| 구분                   | 규칙                       | 예시                                       |
| ---------------------- | -------------------------- | ------------------------------------------ |
| React 컴포넌트 파일    | PascalCase                 | `TodoItem.tsx`, `CategoryFilter.tsx`       |
| 훅 파일                | camelCase, `use` 접두사    | `useTodos.ts`, `useAuth.ts`                |
| 유틸/헬퍼 파일         | camelCase                  | `dateUtils.ts`, `statusCalc.ts`            |
| 백엔드 라우터 파일     | camelCase, 도메인명 복수형 | `todos.router.js`, `categories.router.js`  |
| 백엔드 서비스 파일     | camelCase, 도메인명        | `todo.service.js`, `auth.service.js`       |
| 백엔드 레포지토리 파일 | camelCase, 도메인명        | `todo.repository.js`, `user.repository.js` |
| DB 테이블명            | snake_case 복수형          | `users`, `categories`, `todos`             |
| DB 컬럼명              | snake_case                 | `user_id`, `is_completed`, `created_at`    |
| API 경로               | kebab-case, 복수 명사      | `/api/todos`, `/api/categories`            |

### 3-2. API 경로 설계

**근거**: RESTful 설계 원칙을 따르면 API 구조를 예측할 수 있어 프론트엔드-백엔드 협업 비용이 줄어든다.

```
POST   /api/auth/register          # UC-01 회원가입
POST   /api/auth/login             # UC-02 로그인
GET    /api/users/me               # 내 정보 조회
PATCH  /api/users/me               # UC-03 내 정보 수정 (이름, 비밀번호, 테마, 언어)

GET    /api/todos                  # UC-05 할 일 목록 조회 (쿼리 파라미터로 필터)
POST   /api/todos                  # UC-04 할 일 등록
GET    /api/todos/:id              # 할 일 단건 조회
PATCH  /api/todos/:id              # UC-06 할 일 수정
DELETE /api/todos/:id              # UC-07 할 일 삭제
PATCH  /api/todos/:id/complete     # UC-08 할 일 완료 처리

GET    /api/categories             # 카테고리 목록 조회
POST   /api/categories             # 카테고리 생성

GET    /api/assignees              # 담당자 목록 조회 [신규]
POST   /api/assignees              # 담당자 생성 [신규]
PATCH  /api/assignees/:id/avatar   # 담당자 아바타 업데이트 [신규]
DELETE /api/assignees/:id          # 담당자 삭제 [신규]

GET    /api/anniversaries          # 기념일 목록 조회 [신규]
POST   /api/anniversaries          # 기념일 생성 [신규]
DELETE /api/anniversaries/:id      # 기념일 삭제 [신규]

GET    /api/holidays               # 공휴일 목록 조회 (연/월별) [신규]

GET    /api-docs                   # Swagger UI (개발 환경용 API 문서)
GET    /health                     # 헬스체크
```

필터 파라미터 예시 (UC-05, BR-08~BR-12):

```
GET /api/todos?status=in_progress&category_id=uuid-value
```

### 3-3. HTTP 상태 코드

**근거**: 클라이언트가 에러 원인을 정확히 파악하려면 의미에 맞는 상태 코드가 필요하다.

| 상황                                        | 상태 코드                 |
| ------------------------------------------- | ------------------------- |
| 생성 성공                                   | 201 Created               |
| 조회/수정/삭제 성공                         | 200 OK                    |
| 입력값 유효성 오류 (BR-06, BR-13, BR-15 등) | 400 Bad Request           |
| 인증 토큰 없음/만료                         | 401 Unauthorized          |
| 소유권 검증 실패 (BR-02, BR-05)             | 403 Forbidden             |
| 리소스 없음                                 | 404 Not Found             |
| 중복 이메일 (UC-01)                         | 409 Conflict              |
| 서버 내부 오류                              | 500 Internal Server Error |

### 3-4. 에러 응답 형식

**근거**: 일관된 에러 응답 구조가 있어야 프론트엔드에서 에러 처리 로직을 통일할 수 있다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "종료일은 시작일보다 이전일 수 없습니다."
  }
}
```

### 3-5. Todo 상태 계산

**근거**: 도메인 정의서에 따라 Todo 상태(시작 전/진행 중/기한 초과/완료)는 DB에 저장하지 않고 계산값이다. 동일한 계산 로직이 프론트/백엔드 양쪽에 중복되어서는 안 된다.

- 목록 조회 API는 필터 조건을 SQL `WHERE` 절로 처리하여 서버에서 필터링한다.
- 프론트엔드는 서버 응답 데이터를 그대로 표시하며, 상태를 재계산하지 않는다.
- 상태 계산 기준 (BR-09~BR-12):

| 상태      | SQL 조건                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------- |
| 시작 전   | `is_completed = false AND (start_date IS NULL OR start_date > CURRENT_DATE)`                             |
| 진행 중   | `is_completed = false AND start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE)` |
| 기한 초과 | `is_completed = false AND end_date < CURRENT_DATE`                                                       |
| 완료      | `is_completed = true`                                                                                    |

---

## 4. 테스트/품질 원칙

### 4-1. 테스트 대상 우선순위

**근거**: 모든 코드에 테스트를 작성하면 오버헤드가 크다. 비즈니스 규칙과 데이터 격리처럼 오류 시 영향이 큰 부분을 우선 검증한다.

우선 테스트 대상:

1. **데이터 소유권 검증** (BR-02, BR-05) — 타인 데이터 접근 차단
2. **날짜 유효성 검증** (BR-06) — 종료일 < 시작일 오류 반환
3. **기본 카테고리 자동 배정** (BR-03, BR-04) — 회원가입/할 일 등록 시
4. **테마/언어 값 유효성** (BR-13, BR-15) — 허용되지 않은 값 거부
5. **인증 플로우** (UC-01, UC-02) — 토큰 발급 및 검증

### 4-2. 테스트 종류

**근거**: 단위 테스트만으로는 레이어 간 연동 오류를 발견할 수 없다. 핵심 API에 대한 통합 테스트가 필요하다.

- **Service 단위 테스트**: 비즈니스 규칙(BR-03, BR-06, BR-13, BR-15) 검증. Repository를 모킹하여 테스트
- **API 통합 테스트**: 실제 DB를 사용하는 엔드투엔드 API 테스트. 인증, 소유권 검증, CRUD 전 흐름 확인
- 테스트 DB는 운영 DB와 분리된 별도 PostgreSQL 인스턴스 또는 스키마를 사용

### 4-3. 코드 품질

**근거**: 타입 오류와 코드 스타일 불일치를 빌드 단계에서 차단하면 런타임 오류를 사전에 예방할 수 있다.

**프론트엔드 (TypeScript)**
- TypeScript strict 모드 활성화 (`"strict": true`)
- `any` 타입 사용 금지 — 도메인 타입을 명시적으로 정의
- ESLint + Prettier 설정으로 코드 스타일 통일

**백엔드 (JavaScript / CommonJS)**
- 백엔드는 TypeScript 없이 순수 JavaScript(CommonJS) 로 구현한다
- `require` / `module.exports` 방식을 사용한다
- TypeScript 컴파일 단계 없이 Node.js에서 직접 실행한다

---

## 5. 설정/보안/운영 원칙

### 5-1. 인증 (JWT)

**근거**: BR-01에 따라 로그인 후에만 서비스를 이용할 수 있으며, 상태 비저장(stateless) JWT 방식으로 서버 부하를 최소화한다.

- 로그인 성공 시 JWT를 발급한다 (UC-02)
- JWT payload에 `userId`만 포함한다 (최소 권한 원칙)
- 토큰 만료 시간은 환경 변수로 설정 가능하게 한다
- 모든 인증 필요 API는 `Authorization: Bearer <token>` 헤더를 검증하는 미들웨어를 적용한다
- 인증 미들웨어는 라우터 레벨에서 적용한다 (컨트롤러 내부에 인증 로직 포함 금지)

### 5-2. 비밀번호 보안

**근거**: 평문 비밀번호 저장은 DB 유출 시 즉각적인 계정 탈취로 이어진다.

- bcrypt를 사용하여 비밀번호를 해시하여 저장한다
- 비밀번호 비교 시 `bcrypt.compare()`를 사용하며, 해시값을 직접 비교하지 않는다
- 비밀번호는 API 응답에 절대 포함하지 않는다

### 5-3. v2 설정값 유효성 검증

**근거**: BR-13, BR-15에 따라 허용되지 않은 테마/언어 값이 저장되면 앱 동작에 오류가 발생한다.

- 테마 값 허용 목록: `['light', 'dark']`
- 언어 값 허용 목록: `['ko', 'en', 'ja']`
- 유효하지 않은 값 입력 시 400 에러를 반환하고 저장하지 않는다
- 유효성 검증은 서비스 레이어 또는 라우터의 입력 검증 단계에서 처리한다

### 5-4. DB 인덱스

**근거**: PRD 성능 요구사항에 따라 API 응답 시간 500ms 이내를 달성하려면 자주 사용되는 필터 조건 컬럼에 인덱스가 필요하다.

```sql
-- 필수 인덱스
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
```

### 5-5. 커넥션 풀 설정

**근거**: 동시 접속 1,000명 처리 요건을 만족하려면 DB 커넥션을 효율적으로 관리해야 한다.

```javascript
// backend/src/db/pool.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = { pool };
```

### 5-6. HTTPS

**근거**: 운영 환경에서 평문 HTTP를 사용하면 JWT 토큰이 네트워크에서 탈취될 수 있다.

- 운영 환경에서는 HTTPS를 적용한다
- 개발 환경에서는 HTTP 사용 가능

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── public/                        # 정적 파일 (favicon 등)
├── src/
│   ├── main.tsx                   # React 앱 진입점
│   ├── App.tsx                    # 라우팅 설정 (React Router)
│   │
│   ├── components/                # 재사용 가능한 UI 컴포넌트
│   │   ├── common/                # 도메인 무관 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── todo/                  # Todo 도메인 컴포넌트
│   │   │   ├── TodoItem.tsx       # 목록의 단일 할 일 항목 (완료/삭제 인라인 액션 포함)
│   │   │   ├── TodoList.tsx       # 할 일 목록 (UC-05)
│   │   │   └── TodoForm.tsx       # 할 일 등록/수정 폼 (UC-04, UC-06)
│   │   └── category/              # Category 도메인 컴포넌트
│   │       └── CategoryFilter.tsx # 카테고리/상태 필터 UI (BR-08~BR-12)
│   │
│   ├── pages/                     # 라우트별 페이지 컴포넌트 (화면 목록 S-01~S-06)
│   │   ├── LoginPage.tsx          # S-01: /login
│   │   ├── RegisterPage.tsx       # S-02: /register
│   │   ├── TodoListPage.tsx       # S-03: / (메인)
│   │   ├── TodoNewPage.tsx        # S-04: /todos/new
│   │   ├── TodoEditPage.tsx       # S-05: /todos/:id/edit
│   │   └── ProfilePage.tsx        # S-06: /profile (v2: 테마/언어 설정 포함)
│   │
│   ├── hooks/                     # 커스텀 훅
│   │   ├── useTodos.ts            # TanStack Query — Todo 목록 조회/뮤테이션
│   │   ├── useCategories.ts       # TanStack Query — Category 목록 조회
│   │   └── useAuth.ts             # 인증 관련 훅 (로그인, 로그아웃)
│   │
│   ├── store/                     # Zustand 스토어
│   │   ├── authStore.ts           # 인증 상태 (userId, token, theme, language)
│   │   └── filterStore.ts         # 현재 선택된 필터 상태 (상태별/카테고리별)
│   │
│   ├── api/                       # API 호출 함수 (axios/fetch 래퍼)
│   │   ├── authApi.ts             # /api/auth/* 호출
│   │   ├── todoApi.ts             # /api/todos/* 호출
│   │   ├── categoryApi.ts         # /api/categories/* 호출
│   │   └── userApi.ts             # /api/users/me 호출
│   │
│   ├── types/                     # TypeScript 타입 정의
│   │   ├── todo.ts                # Todo, TodoStatus, CreateTodoRequest 등
│   │   ├── category.ts            # Category, CreateCategoryRequest 등
│   │   └── user.ts                # User, UpdateProfileRequest 등
│   │
│   ├── utils/                     # 유틸리티 함수
│   │   └── dateUtils.ts           # 날짜 포맷, 유효성 검사 (BR-06)
│   │
│   └── locales/                   # [v2] react-i18next 번역 파일
│       ├── ko/
│       │   └── translation.json   # 한국어 UI 텍스트
│       ├── en/
│       │   └── translation.json   # 영어 UI 텍스트
│       └── ja/
│           └── translation.json   # 일본어 UI 텍스트
│
├── .env                           # 환경 변수 (gitignore)
├── .env.example                   # 환경 변수 예시
├── tsconfig.json
├── vite.config.ts                 # 또는 webpack.config.ts
└── package.json
```

### 프론트엔드 주요 타입 예시

```typescript
// src/types/todo.ts

export type TodoStatus = "pending" | "in_progress" | "overdue" | "completed";

export interface Todo {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string | null; // ISO 날짜 문자열 (YYYY-MM-DD)
  endDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  categoryId?: string; // 미지정 시 서버에서 기본 카테고리 배정 (BR-03)
  startDate?: string; // 선택값 (BR-07)
  endDate?: string; // 선택값 (BR-07)
}

// src/types/user.ts

export type Theme = "light" | "dark"; // BR-13
export type Language = "ko" | "en" | "ja"; // BR-15

export interface User {
  id: string;
  email: string;
  name: string;
  themePreference: Theme;
  languagePreference: Language;
}
```

---

## 7. 백엔드 디렉토리 구조

> **참고**: 백엔드는 TypeScript 없이 순수 JavaScript(CommonJS)로 구현한다. `require` / `module.exports` 방식을 사용하며, 빌드 단계 없이 Node.js에서 직접 실행한다.

```
backend/
├── src/
│   ├── index.js                   # 서버 진입점 (Express 앱 초기화, 포트 설정)
│   ├── app.js                     # Express 앱 설정 (미들웨어, 라우터 등록, Swagger UI)
│   │
│   ├── db/
│   │   └── pool.js                # pg Pool 인스턴스 (커넥션 풀 설정)
│   │
│   ├── routes/                    # 라우터 — HTTP 경로 정의, 미들웨어 적용
│   │   ├── auth.router.js         # POST /api/auth/register, /api/auth/login
│   │   ├── todos.router.js        # GET/POST /api/todos, PATCH/DELETE /api/todos/:id
│   │   ├── categories.router.js   # GET/POST /api/categories
│   │   ├── users.router.js        # GET/PATCH /api/users/me
│   │   ├── assignees.router.js    # GET/POST /api/assignees, PATCH/DELETE /api/assignees/:id [신규]
│   │   ├── anniversaries.router.js # GET/POST /api/anniversaries, DELETE /api/anniversaries/:id [신규]
│   │   └── holidays.router.js     # GET /api/holidays [신규]
│   │
│   ├── services/                  # 서비스 — 비즈니스 규칙 처리
│   │   ├── auth.service.js        # 회원가입(BR-04), 로그인(BR-01), JWT 발급
│   │   ├── todo.service.js        # CRUD, 날짜 유효성(BR-06), 소유권(BR-05), 기본 카테고리 배정(BR-03)
│   │   ├── category.service.js    # 카테고리 생성, 목록 조회
│   │   ├── user.service.js        # 프로필 수정, 테마(BR-13)/언어(BR-15) 유효성 검증 및 저장
│   │   ├── assignee.service.js    # 담당자 CRUD [신규]
│   │   └── anniversary.service.js # 기념일 CRUD [신규]
│   │
│   ├── repositories/              # 레포지토리 — SQL 쿼리 실행 (pg 직접 사용)
│   │   ├── user.repository.js     # users 테이블 CRUD
│   │   ├── todo.repository.js     # todos 테이블 CRUD, 필터 쿼리(BR-08~BR-12)
│   │   ├── category.repository.js # categories 테이블 CRUD
│   │   ├── assignee.repository.js # assignees 테이블 CRUD [신규]
│   │   └── anniversary.repository.js # anniversaries 테이블 CRUD [신규]
│   │
│   ├── middlewares/               # Express 미들웨어
│   │   ├── auth.middleware.js     # JWT 검증, req.userId 주입 (BR-01)
│   │   └── errorHandler.js        # 전역 에러 핸들러 (표준 에러 응답 형식)
│   │
│   └── utils/
│       └── logger.js              # 콘솔 로거 (info / error / warn)
│
├── swagger.json                   # OpenAPI 3.0 스펙 (Swagger UI 소스)
├── tests/                         # Jest 통합 테스트
│   ├── server.test.js
│   ├── db/pool.test.js
│   ├── middlewares/
│   └── routes/
│
├── .env                           # 환경 변수 (gitignore)
├── .env.example                   # 환경 변수 예시
└── package.json
```

### 백엔드 주요 구현 예시

**레포지토리 — pg 직접 사용 (SQL Injection 방지)**

```javascript
// src/repositories/todo.repository.js

const { pool } = require('../db/pool');

async function findByUserId(userId, filter = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let idx = 2;

  if (filter.status === 'in_progress') {
    conditions.push(`is_completed = false AND start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE)`);
  } else if (filter.status === 'overdue') {
    conditions.push(`is_completed = false AND end_date < CURRENT_DATE`);
  } else if (filter.status === 'completed') {
    conditions.push(`is_completed = true`);
  } else if (filter.status === 'pending') {
    conditions.push(`is_completed = false AND (start_date IS NULL OR start_date > CURRENT_DATE)`);
  }

  if (filter.categoryId) {
    conditions.push(`category_id = $${idx}`);
    params.push(filter.categoryId);
    idx++;
  }

  const sql = `SELECT * FROM todos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { findByUserId, /* ... */ };
```

**서비스 — 비즈니스 규칙 적용**

```javascript
// src/services/todo.service.js

const { AppError } = require('../middlewares/errorHandler');
const categoryRepo = require('../repositories/category.repository');
const todoRepo = require('../repositories/todo.repository');

async function createTodo(userId, dto) {
  // BR-06: 종료일 < 시작일 금지
  if (dto.startDate && dto.endDate && dto.endDate < dto.startDate) {
    throw new AppError(400, 'INVALID_DATE', '종료일은 시작일보다 이전일 수 없습니다.');
  }

  // BR-03: 카테고리 미지정 시 기본 카테고리 자동 배정
  let categoryId = dto.categoryId;
  if (!categoryId) {
    const defaultCat = await categoryRepo.findDefaultByUserId(userId);
    categoryId = defaultCat.id;
  }

  return todoRepo.create({ ...dto, userId, categoryId });
}

module.exports = { createTodo, /* ... */ };
```

**인증 미들웨어**

```javascript
// src/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다.' } });
  }
}

module.exports = { authMiddleware };
```

### DB 스키마 (마이그레이션 참고)

```sql
-- migrations/001_create_tables.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255) UNIQUE NOT NULL,
  password            VARCHAR(255) NOT NULL,         -- bcrypt 해시값
  name                VARCHAR(100) NOT NULL,
  theme_preference    VARCHAR(10) NOT NULL DEFAULT 'light',    -- BR-13 [v2]
  language_preference VARCHAR(5)  NOT NULL DEFAULT 'ko',       -- BR-15 [v2]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, name)                              -- BR: 동일 사용자 내 카테고리명 고유
);

CREATE TABLE todos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id),
  assignee_id  UUID REFERENCES assignees(id) ON DELETE SET NULL,  -- [신규] 담당자 할당
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  start_date   DATE,                                  -- 선택값 (BR-07)
  end_date     DATE,                                  -- 선택값 (BR-07)
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assignees (                              -- [신규] 담당자
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name    VARCHAR(100) NOT NULL,
  avatar  TEXT
);

CREATE TABLE anniversaries (                          -- [신규] 기념일
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name    VARCHAR(100) NOT NULL,
  month   SMALLINT NOT NULL,                         -- 1-12
  day     SMALLINT NOT NULL                          -- 1-31
);

-- migrations/002_create_indexes.sql (PRD 성능 요구사항)
CREATE INDEX idx_todos_user_id       ON todos(user_id);
CREATE INDEX idx_todos_category_id   ON todos(category_id);
CREATE INDEX idx_assignees_user_id   ON assignees(user_id);           -- [신규]
CREATE INDEX idx_anniversaries_user_id ON anniversaries(user_id);    -- [신규]
CREATE INDEX idx_categories_user_id ON categories(user_id);
```

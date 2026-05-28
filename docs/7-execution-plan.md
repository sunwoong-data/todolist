# TodoList 구현 실행계획

---

**버전**: v1.0
**작성일**: 2026-05-28
**참조 문서**: `docs/1-domain-definition.md`, `docs/2-PRD.md`, `docs/4-architecture-principles.md`, `docs/6-erd.md`

---

## 개요

구현 순서: **데이터베이스 → 백엔드 → 프론트엔드**

각 Task는 독립적으로 완료 가능하며, 의존성이 있는 경우 명시한다.
완료 조건을 모두 충족해야 해당 Task가 완료된 것으로 간주한다.

---

## Phase 1. 데이터베이스

### DB-01. PostgreSQL 환경 구성

**목적**: 개발 환경에서 PostgreSQL 17 인스턴스를 실행하고 접속 가능한 상태로 만든다.

**의존성**
- 없음 (최초 착수 가능)

**완료 조건**
- [x] PostgreSQL 17 인스턴스가 로컬에서 실행 중이다
- [x] `todolist` 데이터베이스가 생성되어 있다
- [x] `postgres` 유저로 `localhost:5432/todolist` 접속이 성공한다
- [x] `backend/.env` 파일에 DB 접속 정보가 설정되어 있다 (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)

---

### DB-02. 스키마 적용

**목적**: `database/schema.sql`을 실행하여 테이블, 인덱스, 제약조건을 생성한다.

**의존성**
- [x] DB-01 완료

**완료 조건**
- [x] `users`, `categories`, `todos` 테이블이 생성되어 있다
- [x] `pgcrypto` 익스텐션이 활성화되어 있다
- [x] 인덱스 3개(`idx_categories_user_id`, `idx_todos_user_id`, `idx_todos_category_id`)가 생성되어 있다
- [x] UNIQUE 제약조건(`users.email`, `categories.(user_id, name)`)이 적용되어 있다
- [x] FK 제약조건(`categories.user_id → CASCADE`, `todos.category_id → RESTRICT`)이 적용되어 있다

---

## Phase 2. 백엔드

### BE-01. 프로젝트 초기 설정

**목적**: `backend/` 디렉토리에 Node.js + Express + TypeScript 프로젝트 기반을 구성한다.

**의존성**
- 없음 (DB와 병렬 착수 가능)

**완료 조건**
- [x] `backend/package.json`이 생성되고 의존성이 설치되어 있다
  - dependencies: `express`, `pg`, `bcrypt`, `jsonwebtoken`, `cors`, `dotenv`
  - devDependencies: `typescript`, `@types/*`, `ts-node`, `nodemon`, `eslint`, `prettier`
- [x] `backend/tsconfig.json`에 `"strict": true`가 설정되어 있다
- [x] `backend/.env.example`이 `docs/4-architecture-principles.md` 섹션 1-4 기준으로 작성되어 있다
- [x] `backend/.env`가 로컬 환경값으로 채워져 있다 (gitignore 확인)
- [x] `npm run dev` 실행 시 서버가 `PORT=3000`으로 시작된다

---

### BE-02. DB 커넥션 풀

**목적**: `pg.Pool` 인스턴스를 생성하고 전역에서 재사용한다.

**의존성**
- [ ] BE-01 완료
- [ ] DB-01 완료

**완료 조건**
- [ ] `backend/src/db/pool.ts`가 `docs/4-architecture-principles.md` 섹션 5-5 예시 기준으로 구현되어 있다
- [ ] `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 2000` 설정이 적용되어 있다
- [ ] 서버 시작 시 DB 연결이 성공한다 (연결 실패 시 에러 로그 출력)

---

### BE-03. Express 앱 공통 설정

**목적**: 미들웨어(CORS, JSON 파싱, 에러 핸들러)와 라우터 등록 구조를 만든다.

**의존성**
- [ ] BE-01 완료

**완료 조건**
- [ ] `backend/src/app.ts`에 Express 앱 설정이 구현되어 있다
- [ ] `backend/src/index.ts`에서 앱을 `process.env.PORT`로 구동한다
- [ ] CORS 미들웨어가 `CORS_ORIGIN` 환경변수 기반으로 설정되어 있다
- [ ] `backend/src/middlewares/errorHandler.ts`가 구현되어 있고 표준 에러 응답 형식(`{ error: { code, message } }`)을 반환한다
- [ ] `backend/src/types/` 아래 `user.ts`, `todo.ts`, `category.ts` 타입 파일이 작성되어 있다

---

### BE-04. 인증 (UC-01, UC-02)

**목적**: 회원가입 및 로그인 API를 구현한다. 회원가입 시 "기본" 카테고리를 자동 생성한다.

**의존성**
- [ ] BE-02 완료 (DB 커넥션 필요)
- [ ] BE-03 완료

**완료 조건**
- [ ] `backend/src/repositories/user.repository.ts` 구현
  - `findByEmail(email)`, `create(dto)` 함수
  - 파라미터화된 쿼리(`$1`, `$2`) 사용
- [ ] `backend/src/repositories/category.repository.ts` 구현
  - `createDefaultCategory(userId)`, `findByUserId(userId)`, `findDefaultByUserId(userId)` 함수
- [ ] `backend/src/services/auth.service.ts` 구현
  - `register()`: bcrypt 해싱, 중복 이메일 409 처리, 기본 카테고리 자동 생성(BR-04)
  - `login()`: bcrypt.compare() 검증, JWT 발급 (payload: `{ userId }`, 만료: `JWT_EXPIRES_IN`)
- [ ] `backend/src/routes/auth.router.ts` 구현
  - `POST /api/auth/register` → 201 반환
  - `POST /api/auth/login` → 200 + JWT 반환
- [ ] `backend/src/middlewares/auth.middleware.ts` 구현
  - `Authorization: Bearer <token>` 헤더 검증
  - 토큰 없음 → 401, 유효하지 않은 토큰 → 401
  - 검증 성공 시 `req.userId` 주입
- [ ] 수락 기준 충족
  - 올바른 입력으로 회원가입 → 201 + "기본" 카테고리 DB에 존재
  - 중복 이메일로 회원가입 → 409
  - 올바른 자격증명으로 로그인 → 200 + JWT
  - 잘못된 비밀번호로 로그인 → 401

---

### BE-05. 사용자 프로필 API (UC-03)

**목적**: 내 정보 조회 및 수정 API를 구현한다.

**의존성**
- [ ] BE-04 완료 (인증 미들웨어 필요)

**완료 조건**
- [ ] `backend/src/repositories/user.repository.ts`에 `findById(userId)`, `update(userId, dto)` 추가
- [ ] `backend/src/services/user.service.ts` 구현
  - `getProfile()`: 비밀번호 필드 응답 제외
  - `updateProfile()`: 이름, 비밀번호(bcrypt 재해시) 수정
  - 테마 값 유효성 검증: `['light', 'dark']` 외 → 400 (BR-13)
  - 언어 값 유효성 검증: `['ko', 'en', 'ja']` 외 → 400 (BR-15)
- [ ] `backend/src/routes/users.router.ts` 구현
  - `GET /api/users/me` → 200 + 사용자 정보 (비밀번호 제외)
  - `PATCH /api/users/me` → 200
  - 두 엔드포인트 모두 `auth.middleware` 적용
- [ ] 비밀번호는 응답 JSON에 절대 포함되지 않는다 (BR-02 + 5-2 원칙)

---

### BE-06. 카테고리 API

**목적**: 카테고리 목록 조회 및 생성 API를 구현한다.

**의존성**
- [ ] BE-04 완료

**완료 조건**
- [ ] `backend/src/services/category.service.ts` 구현
  - `getCategories(userId)`: 해당 사용자 카테고리만 반환 (BR-02)
  - `createCategory(userId, dto)`: 동일 사용자 내 이름 중복 → 409
- [ ] `backend/src/routes/categories.router.ts` 구현
  - `GET /api/categories` → 200 + 카테고리 목록
  - `POST /api/categories` → 201
  - 두 엔드포인트 모두 `auth.middleware` 적용
- [ ] 다른 사용자의 카테고리는 절대 반환되지 않는다 (BR-02)

---

### BE-07. 할 일 API (UC-04 ~ UC-08)

**목적**: 할 일 CRUD 및 완료 처리 API를 구현한다. 가장 핵심적인 비즈니스 로직이 집중된 Task다.

**의존성**
- [ ] BE-04 완료
- [ ] BE-06 완료 (기본 카테고리 조회 필요)

**완료 조건**
- [ ] `backend/src/repositories/todo.repository.ts` 구현
  - `findByUserId(userId, filters)`: status, category_id 필터 쿼리 포함 (BR-08~BR-12)
  - `findByIdAndUserId(id, userId)`: 소유권 검증 포함 조회
  - `create(dto)`, `update(id, dto)`, `deleteById(id)`, `markComplete(id)` 함수
  - 모든 쿼리 파라미터화 필수
- [ ] `backend/src/services/todo.service.ts` 구현
  - `createTodo()`: BR-06 날짜 유효성, BR-03 기본 카테고리 자동 배정
  - `getTodos()`: 소유 확인 후 필터 적용 조회
  - `updateTodo()`: 소유권 검증(BR-05), 날짜 유효성(BR-06)
  - `deleteTodo()`: 소유권 검증(BR-05), 없는 항목 → 404
  - `completeTodo()`: 소유권 검증(BR-05)
- [ ] `backend/src/routes/todos.router.ts` 구현
  - `GET /api/todos` (쿼리: `?status=&category_id=`)
  - `POST /api/todos` → 201
  - `GET /api/todos/:id`
  - `PATCH /api/todos/:id`
  - `DELETE /api/todos/:id` → 200
  - `PATCH /api/todos/:id/complete` → 200
  - 모든 엔드포인트에 `auth.middleware` 적용
- [ ] 수락 기준 충족
  - 카테고리 없이 등록 → "기본" 카테고리 자동 배정 (BR-03)
  - 종료일 < 시작일 → 400 (BR-06)
  - 타인 할 일 수정/삭제 → 403 (BR-05)
  - `?status=in_progress` 필터 → 조건에 맞는 항목만 반환 (BR-10)
  - 타인 토큰으로 조회 → 해당 사용자의 데이터만 반환 (BR-02)

---

### BE-08. 백엔드 통합 검증

**목적**: 모든 백엔드 API가 정상 동작하는지 확인한다.

**의존성**
- [ ] BE-04 ~ BE-07 모두 완료
- [ ] DB-02 완료

**완료 조건**
- [ ] UC-01~UC-08 전체 유스케이스 API 동작 확인 (HTTP 클라이언트로 수동 테스트)
- [ ] BR-01~BR-12 비즈니스 규칙 적용 확인
- [ ] 타인 데이터 접근 시 403 반환 확인 (BR-02)
- [ ] API 응답 시간 500ms 이내 (일반 CRUD 기준)
- [ ] TypeScript 빌드 에러 없음 (`tsc --noEmit`)

---

## Phase 3. 프론트엔드

### FE-01. 프로젝트 초기 설정

**목적**: `frontend/` 디렉토리에 Vite + React 19 + TypeScript 프로젝트 기반을 구성한다.

**의존성**
- 없음 (백엔드와 병렬 착수 가능)

**완료 조건**
- [ ] `frontend/package.json`이 생성되고 의존성이 설치되어 있다
  - dependencies: `react@19`, `react-dom@19`, `react-router-dom`, `zustand`, `@tanstack/react-query`, `axios`
  - devDependencies: `vite`, `typescript`, `@vitejs/plugin-react`, `eslint`, `prettier`
- [ ] `frontend/tsconfig.json`에 `"strict": true`가 설정되어 있다
- [ ] `frontend/.env.example`에 `VITE_API_BASE_URL=http://localhost:3000`이 작성되어 있다
- [ ] `frontend/.env`가 로컬 환경값으로 채워져 있다 (gitignore 확인)
- [ ] `npm run dev` 실행 시 `localhost:5173`에서 앱이 시작된다
- [ ] `frontend/vite.config.ts`에 개발 서버 프록시 또는 CORS 설정이 적용되어 있다

---

### FE-02. 타입 정의 및 API 클라이언트

**목적**: TypeScript 타입을 정의하고 axios 기반 API 호출 함수를 작성한다.

**의존성**
- [ ] FE-01 완료

**완료 조건**
- [ ] `frontend/src/types/todo.ts`: `Todo`, `TodoStatus`, `CreateTodoRequest`, `UpdateTodoRequest` 타입이 `docs/4-architecture-principles.md` 섹션 6 예시 기준으로 작성되어 있다
- [ ] `frontend/src/types/user.ts`: `User`, `Theme`, `Language`, `UpdateProfileRequest` 타입이 작성되어 있다
- [ ] `frontend/src/types/category.ts`: `Category`, `CreateCategoryRequest` 타입이 작성되어 있다
- [ ] `frontend/src/api/` 아래 `authApi.ts`, `todoApi.ts`, `categoryApi.ts`, `userApi.ts`가 구현되어 있다
- [ ] API 클라이언트는 `VITE_API_BASE_URL` 환경변수를 baseURL로 사용한다
- [ ] 인증 필요 요청에 `Authorization: Bearer <token>` 헤더가 자동으로 추가된다 (axios 인터셉터)
- [ ] 401 응답 시 로그인 페이지로 자동 리다이렉트 처리가 있다

---

### FE-03. Zustand 스토어

**목적**: 인증 상태와 필터 상태를 Zustand로 관리한다.

**의존성**
- [ ] FE-02 완료

**완료 조건**
- [ ] `frontend/src/store/authStore.ts` 구현
  - 저장 항목: `userId`, `token`, `name`, `themePreference`, `languagePreference`
  - `login()`, `logout()` 액션
  - `localStorage` 또는 `sessionStorage` 연동으로 새로고침 후에도 유지
- [ ] `frontend/src/store/filterStore.ts` 구현
  - 저장 항목: 선택된 `status` 필터, 선택된 `categoryId` 필터
  - `setStatus()`, `setCategoryId()`, `reset()` 액션
- [ ] 서버 데이터(Todo 목록, Category 목록)는 Zustand에 저장되지 않는다

---

### FE-04. 라우팅 설정 및 인증 가드

**목적**: React Router로 화면 목록(S-01~S-06)을 구성하고 비인증 접근을 차단한다.

**의존성**
- [ ] FE-03 완료

**완료 조건**
- [ ] `frontend/src/App.tsx`에 React Router 라우팅이 설정되어 있다
  - `GET /login` → `LoginPage` (인증 불필요)
  - `GET /register` → `RegisterPage` (인증 불필요)
  - `GET /` → `TodoListPage` (인증 필요)
  - `GET /todos/new` → `TodoNewPage` (인증 필요)
  - `GET /todos/:id/edit` → `TodoEditPage` (인증 필요)
  - `GET /profile` → `ProfilePage` (인증 필요)
- [ ] 인증 필요 경로에 비인증 접근 시 `/login`으로 리다이렉트된다
- [ ] 로그인 상태에서 `/login`, `/register` 접근 시 `/`로 리다이렉트된다

---

### FE-05. 공통 UI 컴포넌트

**목적**: 재사용 가능한 공통 컴포넌트를 만든다.

**의존성**
- [ ] FE-01 완료

**완료 조건**
- [ ] `frontend/src/components/common/Button.tsx`: 로딩 상태, disabled 지원
- [ ] `frontend/src/components/common/Input.tsx`: label, 에러 메시지 표시 지원
- [ ] `frontend/src/components/common/Modal.tsx`: 확인/취소 버튼, 외부 클릭 닫기
- [ ] 반응형 기준 breakpoint가 CSS에 정의되어 있다 (768px 태블릿, 375px 모바일)

---

### FE-06. 인증 화면 (S-01, S-02)

**목적**: 로그인 및 회원가입 화면을 구현한다.

**의존성**
- [ ] FE-04 완료
- [ ] FE-05 완료
- [ ] BE-04 완료 (API 연동)

**완료 조건**
- [ ] `frontend/src/pages/LoginPage.tsx` 구현 (S-01, UC-02)
  - 이메일/비밀번호 입력 폼
  - 로그인 성공 시 JWT 저장 + `/`로 이동
  - 로그인 실패 시 에러 메시지 표시
- [ ] `frontend/src/pages/RegisterPage.tsx` 구현 (S-02, UC-01)
  - 이메일/비밀번호/이름 입력 폼
  - 회원가입 성공 시 `/login`으로 이동
  - 중복 이메일 시 에러 메시지 표시
- [ ] `frontend/src/hooks/useAuth.ts` 구현 (TanStack Query mutation 사용)
- [ ] 로그인/회원가입 중 버튼 로딩 상태 표시

---

### FE-07. TanStack Query 훅

**목적**: 서버 데이터 조회/변경을 위한 커스텀 훅을 구현한다.

**의존성**
- [ ] FE-02 완료
- [ ] BE-07 완료 (API 연동)

**완료 조건**
- [ ] `frontend/src/hooks/useTodos.ts` 구현
  - `useGetTodos(filters)`: Todo 목록 조회 (status, categoryId 필터 파라미터 전달)
  - `useCreateTodo()`: 생성 mutation + 성공 시 목록 캐시 무효화
  - `useUpdateTodo()`: 수정 mutation + 성공 시 캐시 무효화
  - `useDeleteTodo()`: 삭제 mutation + 성공 시 캐시 무효화
  - `useCompleteTodo()`: 완료 처리 mutation + 성공 시 캐시 무효화
- [ ] `frontend/src/hooks/useCategories.ts` 구현
  - `useGetCategories()`: 카테고리 목록 조회
  - `useCreateCategory()`: 생성 mutation
- [ ] `QueryClient`가 `main.tsx`에서 `QueryClientProvider`로 제공된다

---

### FE-08. 카테고리/상태 필터 컴포넌트

**목적**: 할 일 목록 화면의 필터 UI를 구현한다.

**의존성**
- [ ] FE-07 완료 (카테고리 목록 조회 훅 필요)
- [ ] FE-03 완료 (filterStore 필요)

**완료 조건**
- [ ] `frontend/src/components/category/CategoryFilter.tsx` 구현
  - 상태 필터: 전체 / 시작 전 / 진행 중 / 완료 / 기한 초과 (BR-09~BR-12)
  - 카테고리 필터: useGetCategories()로 목록 조회 후 렌더링 (BR-08)
  - 선택된 필터 값을 `filterStore`에 저장
  - 필터 선택 변경 시 `useGetTodos` 자동 재조회

---

### FE-09. Todo 컴포넌트

**목적**: 할 일 단일 항목 및 목록 컴포넌트를 구현한다.

**의존성**
- [ ] FE-07 완료
- [ ] FE-05 완료

**완료 조건**
- [ ] `frontend/src/components/todo/TodoItem.tsx` 구현 (UC-05 목록 항목)
  - 제목, 상태, 카테고리, 시작일/종료일 표시
  - 완료 처리 버튼 인라인 (UC-08)
  - 삭제 버튼 인라인 + Modal 확인 (UC-07)
  - 수정 페이지 링크 (UC-06)
- [ ] `frontend/src/components/todo/TodoList.tsx` 구현
  - TodoItem 목록 렌더링
  - 로딩/에러/빈 목록 상태 처리
- [ ] `frontend/src/components/todo/TodoForm.tsx` 구현 (UC-04, UC-06 공용)
  - 제목(필수), 설명(선택), 카테고리 선택, 시작일/종료일(선택) 입력
  - 종료일 < 시작일 입력 시 클라이언트 측 에러 표시 (BR-06)
  - 카테고리 미선택 시 서버에서 기본 카테고리 배정 (BR-03, 클라이언트 처리 불필요)

---

### FE-10. 할 일 목록/등록/수정 페이지 (S-03, S-04, S-05)

**목적**: 핵심 화면 3개를 조립하여 완성한다.

**의존성**
- [ ] FE-08 완료
- [ ] FE-09 완료

**완료 조건**
- [ ] `frontend/src/pages/TodoListPage.tsx` 구현 (S-03, UC-05)
  - `CategoryFilter` + `TodoList` 조합
  - 필터 변경 시 목록 자동 갱신
  - 할 일 등록 페이지(`/todos/new`) 이동 버튼
- [ ] `frontend/src/pages/TodoNewPage.tsx` 구현 (S-04, UC-04)
  - `TodoForm` 사용 (등록 모드)
  - 등록 성공 시 `/`로 이동
- [ ] `frontend/src/pages/TodoEditPage.tsx` 구현 (S-05, UC-06)
  - URL 파라미터 `:id`로 기존 할 일 조회 후 `TodoForm`에 초기값 설정
  - 수정 성공 시 `/`로 이동
  - 존재하지 않는 ID 접근 시 404 처리

---

### FE-11. 내 정보 수정 페이지 (S-06)

**목적**: 이름, 비밀번호 수정 화면을 구현한다. (테마/언어 설정은 v2)

**의존성**
- [ ] FE-04 완료
- [ ] BE-05 완료 (API 연동)

**완료 조건**
- [ ] `frontend/src/pages/ProfilePage.tsx` 구현 (S-06, UC-03)
  - 현재 이름 표시 및 수정 폼
  - 비밀번호 변경 폼 (현재/신규 비밀번호)
  - 수정 성공 시 성공 메시지 표시
  - `authStore`의 이름 업데이트 반영

---

### FE-12. 최종 통합 검증 및 반응형 확인

**목적**: 전체 프론트엔드가 백엔드와 올바르게 연동되는지 검증하고 반응형 레이아웃을 확인한다.

**의존성**
- [ ] FE-06 ~ FE-11 모두 완료
- [ ] BE-08 완료

**완료 조건**
- [ ] UC-01~UC-08 전체 유스케이스 브라우저 동작 확인
- [ ] BR-01~BR-12 전체 비즈니스 규칙 UI 동작 확인
- [ ] 타인 데이터 접근 차단 (BR-02): 다른 계정으로 로그인해도 내 데이터만 표시됨
- [ ] 모바일(375px) 레이아웃 시각적 확인
- [ ] 태블릿(768px) 레이아웃 시각적 확인
- [ ] TypeScript 빌드 에러 없음 (`tsc --noEmit`)
- [ ] Vite 프로덕션 빌드 성공 (`npm run build`)

---

## Task 의존성 요약

```
DB-01 → DB-02
BE-01 → BE-02 (+ DB-01)
BE-01 → BE-03
BE-02, BE-03 → BE-04
BE-04 → BE-05
BE-04 → BE-06
BE-04, BE-06 → BE-07
BE-04~BE-07 → BE-08

FE-01 → FE-02 → FE-03 → FE-04
FE-01 → FE-05
FE-04, FE-05, BE-04 → FE-06
FE-02, BE-07 → FE-07
FE-07, FE-03 → FE-08
FE-07, FE-05 → FE-09
FE-08, FE-09 → FE-10
FE-04, BE-05 → FE-11
FE-06~FE-11, BE-08 → FE-12
```

## 병렬 착수 가능한 작업

- **DB-01**과 **BE-01**, **FE-01**은 동시에 착수 가능
- **BE-05**, **BE-06**, **BE-07**은 BE-04 완료 후 순차 또는 병렬 진행 가능
- **FE-05**와 **FE-07**은 별도 의존성 없이 FE-01 완료 후 병렬 진행 가능

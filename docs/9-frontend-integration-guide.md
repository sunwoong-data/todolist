# TodoList 프론트엔드 통합 개발 가이드

---

**버전**: v1.1
**작성일**: 2026-05-28
**최종 수정일**: 2026-05-30 (v1.1)
**참조 문서**: `docs/2-PRD.md`, `docs/4-architecture-principles.md`, `docs/5-arch-diagram.md`, `docs/6-erd.md`, `docs/7-execution-plan.md`, `docs/8-wireframes.md`, `backend/swagger.json`

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v1.0 | 2026-05-28 | 최초 작성 |
| v1.1 | 2026-05-30 | 신규 API 타입 정의 추가: Assignee, Anniversary. 신규 API 호출 함수 추가: assigneeApi, anniversaryApi, holidayApi |

---

## 1. 개요

이 문서는 TodoList 백엔드 API와 연동하는 프론트엔드를 개발할 때 참조하는 통합 가이드다. 실제 구현된 API 응답 형식·에러 코드·비즈니스 규칙을 기준으로 작성되어 있으며, 화면별 연동 흐름을 포함한다.

### 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 | Vite |
| 라우팅 | React Router v6 |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand |
| HTTP 클라이언트 | axios |
| 다국어 (v2) | react-i18next |

### 백엔드 엔드포인트

| 환경 | URL |
|------|-----|
| 개발 | `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/api-docs` |

---

## 2. 환경 변수

```dotenv
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 3. TypeScript 타입 정의

백엔드 API 응답 구조에 맞춰 작성한다. `backend/swagger.json` 스키마가 정의 기준이다.

### `src/types/user.ts`

```typescript
export type Theme = 'light' | 'dark';        // BR-13
export type Language = 'ko' | 'en' | 'ja';  // BR-15

export interface User {
  id: string;
  email: string;
  name: string;
  themePreference: Theme;
  languagePreference: Language;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  password?: string;
  themePreference?: Theme;
  languagePreference?: Language;
}
```

### `src/types/category.ts`

```typescript
export interface Category {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
}

export interface CreateCategoryRequest {
  name: string;
}
```

### `src/types/assignee.ts` `[신규]`

```typescript
export interface Assignee {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
}

export interface CreateAssigneeRequest {
  name: string;
  avatar?: string;
}

export interface UpdateAssigneeAvatarRequest {
  avatar?: string | null;
}
```

### `src/types/anniversary.ts` `[신규]`

```typescript
export interface Anniversary {
  id: string;
  userId: string;
  name: string;
  month: number;  // 1-12
  day: number;    // 1-31
}

export interface CreateAnniversaryRequest {
  name: string;
  month: number;
  day: number;
}
```

### `src/types/holiday.ts` `[신규]`

```typescript
export interface Holiday {
  date: string;     // YYYYMMDD 형식
  name: string;
}
```

### `src/types/todo.ts`

```typescript
// status는 DB에 저장되지 않는 파생 계산값 (BR-09~BR-12)
export type TodoStatus = 'pending' | 'in_progress' | 'overdue' | 'completed';

export interface Todo {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string | null;  // YYYY-MM-DD (단, 서버 응답은 "Wed May 27" 형태일 수 있으므로 아래 주의사항 참조)
  endDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  categoryId?: string;   // 미지정 시 서버에서 기본 카테고리 자동 배정 (BR-03)
  startDate?: string;    // YYYY-MM-DD 형식 (BR-07: 선택값)
  endDate?: string;      // YYYY-MM-DD 형식 (BR-06: startDate 이후여야 함)
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  startDate?: string | null;
  endDate?: string | null;
}
```

> **날짜 응답 형식 주의**: 백엔드는 DATE 컬럼을 문자열로 반환할 때 `"Wed Jun 10"` 형태가 될 수 있다. 화면 표시 시 `new Date(todo.startDate).toLocaleDateString()` 등으로 파싱하여 처리한다.

### `src/types/api.ts`

```typescript
// 공통 에러 응답 형식
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// 로그인 응답
export interface LoginResponse {
  token: string;
  user: User;
}
```

---

## 4. API 클라이언트 설정

### `src/api/client.ts`

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터 — JWT 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 — 401 시 로그아웃 처리
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
```

---

## 5. API 호출 함수

### `src/api/authApi.ts`

```typescript
import { apiClient } from './client';
import type { LoginResponse, User } from '../types';

export const authApi = {
  register: (body: { email: string; password: string; name: string }) =>
    apiClient.post<{ user: User }>('/api/auth/register', body),

  login: (body: { email: string; password: string }) =>
    apiClient.post<LoginResponse>('/api/auth/login', body),
};
```

### `src/api/userApi.ts`

```typescript
import { apiClient } from './client';
import type { User, UpdateProfileRequest } from '../types';

export const userApi = {
  getMe: () =>
    apiClient.get<{ user: User }>('/api/users/me'),

  updateMe: (body: UpdateProfileRequest) =>
    apiClient.patch<{ user: User }>('/api/users/me', body),
};
```

### `src/api/categoryApi.ts`

```typescript
import { apiClient } from './client';
import type { Category, CreateCategoryRequest } from '../types';

export const categoryApi = {
  getAll: () =>
    apiClient.get<{ categories: Category[] }>('/api/categories'),

  create: (body: CreateCategoryRequest) =>
    apiClient.post<{ category: Category }>('/api/categories', body),
};
```

### `src/api/todoApi.ts`

```typescript
import { apiClient } from './client';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoStatus } from '../types';

export interface GetTodosParams {
  status?: TodoStatus;
  category_id?: string;
}

export const todoApi = {
  getAll: (params?: GetTodosParams) =>
    apiClient.get<{ todos: Todo[] }>('/api/todos', { params }),

  getById: (id: string) =>
    apiClient.get<{ todo: Todo }>(`/api/todos/${id}`),

  create: (body: CreateTodoRequest) =>
    apiClient.post<{ todo: Todo }>('/api/todos', body),

  update: (id: string, body: UpdateTodoRequest) =>
    apiClient.patch<{ todo: Todo }>(`/api/todos/${id}`, body),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/todos/${id}`),

  complete: (id: string) =>
    apiClient.patch<{ todo: Todo }>(`/api/todos/${id}/complete`),
};
```

### `src/api/assigneeApi.ts` `[신규]`

```typescript
import { apiClient } from './client';
import type { Assignee, CreateAssigneeRequest, UpdateAssigneeAvatarRequest } from '../types';

export const assigneeApi = {
  getAll: () =>
    apiClient.get<{ assignees: Assignee[] }>('/api/assignees'),

  create: (body: CreateAssigneeRequest) =>
    apiClient.post<{ assignee: Assignee }>('/api/assignees', body),

  updateAvatar: (id: string, body: UpdateAssigneeAvatarRequest) =>
    apiClient.patch<{ assignee: Assignee }>(`/api/assignees/${id}/avatar`, body),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/assignees/${id}`),
};
```

### `src/api/anniversaryApi.ts` `[신규]`

```typescript
import { apiClient } from './client';
import type { Anniversary, CreateAnniversaryRequest } from '../types';

export const anniversaryApi = {
  getAll: () =>
    apiClient.get<{ anniversaries: Anniversary[] }>('/api/anniversaries'),

  create: (body: CreateAnniversaryRequest) =>
    apiClient.post<{ anniversary: Anniversary }>('/api/anniversaries', body),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/anniversaries/${id}`),
};
```

### `src/api/holidayApi.ts` `[신규]`

```typescript
import { apiClient } from './client';
import type { Holiday } from '../types';

export interface GetHolidaysParams {
  year?: number;
  month?: number;
}

export const holidayApi = {
  getAll: (params?: GetHolidaysParams) =>
    apiClient.get<{ holidays: Holiday[] }>('/api/holidays', { params }),
};
```

---

## 6. Zustand 스토어

### `src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Theme, Language } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),

      updateUser: (user) =>
        set({ user }),
    }),
    { name: 'auth-storage' },
  ),
);
```

> **로그인 후 테마/언어 적용 (BR-14, BR-16)**: `login()` 호출 직후 `user.themePreference`와 `user.languagePreference` 값을 읽어 즉시 UI에 적용한다.

### `src/store/filterStore.ts`

```typescript
import { create } from 'zustand';
import type { TodoStatus } from '../types';

interface FilterState {
  status: TodoStatus | undefined;
  categoryId: string | undefined;
  setStatus: (status: TodoStatus | undefined) => void;
  setCategoryId: (id: string | undefined) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  status: undefined,
  categoryId: undefined,
  setStatus: (status) => set({ status }),
  setCategoryId: (categoryId) => set({ categoryId }),
  reset: () => set({ status: undefined, categoryId: undefined }),
}));
```

---

## 7. TanStack Query 훅

### `src/hooks/useCategories.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';

export const CATEGORIES_KEY = ['categories'];

export function useGetCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => categoryApi.getAll().then((r) => r.data.categories),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => categoryApi.create({ name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
```

### `src/hooks/useTodos.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi, GetTodosParams } from '../api/todoApi';
import type { CreateTodoRequest, UpdateTodoRequest } from '../types';

export const TODOS_KEY = (params?: GetTodosParams) => ['todos', params];

export function useGetTodos(params?: GetTodosParams) {
  return useQuery({
    queryKey: TODOS_KEY(params),
    queryFn: () => todoApi.getAll(params).then((r) => r.data.todos),
  });
}

export function useGetTodoById(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todoApi.getById(id).then((r) => r.data.todo),
    enabled: !!id,
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTodoRequest) => todoApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTodoRequest }) =>
      todoApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}

export function useCompleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoApi.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}
```

---

## 8. 라우팅 및 인증 가드

### `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 비인증 전용 */}
        <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* 인증 필요 */}
        <Route path="/"                  element={<PrivateRoute><TodoListPage /></PrivateRoute>} />
        <Route path="/todos/new"         element={<PrivateRoute><TodoNewPage /></PrivateRoute>} />
        <Route path="/todos/:id/edit"    element={<PrivateRoute><TodoEditPage /></PrivateRoute>} />
        <Route path="/profile"           element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 9. 화면별 API 연동 상세

### S-01. 로그인 (`/login`)

**사용 API**: `POST /api/auth/login`

**요청**
```json
{ "email": "user@example.com", "password": "pass1234" }
```

**응답 (200 OK)**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "themePreference": "light",
    "languagePreference": "ko",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**에러 응답 (401)**
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "이메일 또는 비밀번호가 올바르지 않습니다." } }
```

**구현 포인트**
- 성공 시 `authStore.login(token, user)` 호출 → localStorage 자동 저장
- `user.themePreference`, `user.languagePreference` 값을 즉시 UI에 적용 (BR-14, BR-16)
- 성공 후 `/`(S-03)으로 `navigate('/', { replace: true })`

---

### S-02. 회원가입 (`/register`)

**사용 API**: `POST /api/auth/register`

**요청**
```json
{ "email": "user@example.com", "password": "pass1234", "name": "홍길동" }
```

**응답 (201 Created)**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "themePreference": "light",
    "languagePreference": "ko",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**에러 응답 (409)**
```json
{ "error": { "code": "EMAIL_CONFLICT", "message": "이미 사용 중인 이메일입니다." } }
```

**구현 포인트**
- 회원가입 성공 후 자동으로 "기본" 카테고리가 서버에서 생성됨 (BR-04, 프론트엔드에서 별도 처리 불필요)
- 성공 후 `/login`(S-01)으로 리다이렉트 (JWT 미발급, 로그인 필요)
- `error.code === 'EMAIL_CONFLICT'` 조건으로 에러 메시지 분기

---

### S-03. 할 일 목록 (`/`)

**사용 API**

| 동작 | API |
|------|-----|
| 목록 조회 | `GET /api/todos?status={status}&category_id={id}` |
| 카테고리 목록 | `GET /api/categories` |
| 완료 처리 | `PATCH /api/todos/:id/complete` |
| 삭제 | `DELETE /api/todos/:id` |

**목록 응답 (200)**
```json
{
  "todos": [
    {
      "id": "uuid",
      "userId": "uuid",
      "categoryId": "uuid",
      "title": "운동 루틴 만들기",
      "description": null,
      "startDate": "Wed May 20",
      "endDate": "Wed Jun 10",
      "isCompleted": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**필터 파라미터**

| 파라미터 | 값 | 설명 |
|----------|-----|------|
| `status` | `pending` | 시작 전 (BR-09) |
| `status` | `in_progress` | 진행 중 (BR-10) |
| `status` | `status` | 완료 (BR-11) |
| `status` | `overdue` | 기한 초과 (BR-12) |
| `category_id` | UUID | 해당 카테고리만 (BR-08) |
| (없음) | — | 전체 조회 |

**구현 포인트**
- `filterStore`의 `status`, `categoryId` 값을 TanStack Query 키로 사용하여 필터 변경 시 자동 재조회
- 완료된 항목(`isCompleted: true`)에는 "완료" 버튼을 미표시 (와이어프레임 참조)
- "삭제" 버튼 클릭 시 `Modal` 확인 후 `DELETE` 호출
- 삭제 `200` 응답: `{ "message": "삭제되었습니다." }`
- **403 에러**: 타인 소유 Todo → 발생하지 않아야 하나 방어 처리 필요 (BR-05)

---

### S-04. 할 일 등록 (`/todos/new`)

**사용 API**: `POST /api/todos`

**요청**
```json
{
  "title": "리액트 공부하기",
  "description": "Hooks 정리",
  "categoryId": "uuid",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30"
}
```

**응답 (201 Created)**
```json
{
  "todo": { "id": "uuid", "categoryId": "uuid", ... }
}
```

**에러 응답 (400)**
```json
{ "error": { "code": "INVALID_DATE", "message": "종료일은 시작일보다 이전일 수 없습니다." } }
```

**구현 포인트**
- `categoryId`를 전송하지 않으면 서버가 "기본" 카테고리를 자동 배정 (BR-03)
- 날짜 유효성은 클라이언트에서도 먼저 검증하고, 서버 에러도 핸들링 (BR-06)
  ```typescript
  // 클라이언트 사전 검증
  if (startDate && endDate && endDate < startDate) {
    setError('endDate', { message: '종료일은 시작일보다 이전일 수 없습니다.' });
    return;
  }
  ```
- `startDate`, `endDate`는 선택값 — 미입력 시 전송하지 않음 (BR-07)
- 성공 후 `/`(S-03)으로 이동, todos 쿼리 캐시 무효화

---

### S-05. 할 일 수정 (`/todos/:id/edit`)

**사용 API**
- 진입 시: `GET /api/todos/:id` (기존 데이터 fetch)
- 저장 시: `PATCH /api/todos/:id`

**조회 응답 (200)**
```json
{
  "todo": {
    "id": "uuid",
    "title": "리액트 공부하기",
    "description": "Hooks 정리",
    "categoryId": "uuid",
    "startDate": "Mon Jun 01",
    "endDate": "Tue Jun 30",
    "isCompleted": false,
    ...
  }
}
```

**수정 요청 (PATCH) — 변경한 필드만 전송**
```json
{ "endDate": "2026-07-10" }
```

**에러 응답**
```json
// 403 — 타인 소유 할 일 (BR-05)
{ "error": { "code": "FORBIDDEN", "message": "다른 사용자의 할 일은 수정할 수 없습니다." } }

// 404 — 존재하지 않는 ID
{ "error": { "code": "TODO_NOT_FOUND", "message": "할 일을 찾을 수 없습니다." } }
```

**구현 포인트**
- 기존 데이터를 폼 초기값으로 설정한 후 변경된 필드만 PATCH 전송
- 날짜 삭제(null 처리)가 필요하면 `startDate: null` 또는 `endDate: null`로 명시 전송
- `403` 수신 시 `/`(S-03)으로 리다이렉트
- `404` 수신 시 "할 일을 찾을 수 없습니다." 메시지 표시 후 `/`로 이동

---

### S-06. 내 정보 수정 (`/profile`)

**사용 API**
- 진입 시: `GET /api/users/me`
- 이름 저장: `PATCH /api/users/me` (`{ name }`)
- 비밀번호 변경: `PATCH /api/users/me` (`{ password }`)

**조회 응답 (200)**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "themePreference": "light",
    "languagePreference": "ko",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> 비밀번호는 응답에 포함되지 않는다. 비밀번호 입력 필드는 항상 빈 값으로 시작한다.

**이름 수정 요청**
```json
{ "name": "김철수" }
```

**비밀번호 변경 요청**

> 백엔드는 현재 비밀번호 검증 없이 `password` 필드를 그대로 bcrypt 해시하여 저장한다. 현재 비밀번호 검증은 클라이언트 또는 별도 API 설계가 필요하다. v1에서는 새 비밀번호만 전송한다.

```json
{ "password": "newPassword123" }
```

**에러 응답 (400)**
```json
// 잘못된 테마 값 (BR-13)
{ "error": { "code": "INVALID_THEME", "message": "테마는 light 또는 dark만 허용됩니다." } }

// 잘못된 언어 값 (BR-15)
{ "error": { "code": "INVALID_LANGUAGE", "message": "언어는 ko, en, ja만 허용됩니다." } }
```

**구현 포인트**
- 성공 후 `authStore.updateUser(user)`로 Zustand 상태 갱신
- 이메일 필드는 읽기 전용으로 표시 (변경 API 없음)
- v2 테마/언어 설정은 v1에서 UI 영역만 표시하고 동작하지 않음

---

## 10. 공통 에러 처리 패턴

### 에러 응답 구조

모든 에러는 다음 형식으로 반환된다.

```json
{
  "error": {
    "code": "에러_코드",
    "message": "사람이 읽을 수 있는 메시지"
  }
}
```

### 에러 코드 매핑

| HTTP | code | 발생 상황 | 처리 방법 |
|------|------|----------|----------|
| 401 | `UNAUTHORIZED` | 토큰 없음 | 로그인 페이지 리다이렉트 |
| 401 | `INVALID_TOKEN` | 토큰 만료/위조 | 로그아웃 후 로그인 페이지 |
| 401 | `INVALID_CREDENTIALS` | 잘못된 로그인 정보 | 에러 메시지 표시 |
| 403 | `FORBIDDEN` | 타인 리소스 접근 | 목록 페이지 리다이렉트 |
| 404 | `TODO_NOT_FOUND` | 없는 Todo ID | 에러 메시지 + 목록 이동 |
| 404 | `USER_NOT_FOUND` | 없는 사용자 | 로그아웃 처리 |
| 409 | `EMAIL_CONFLICT` | 중복 이메일 | 폼 에러 메시지 표시 |
| 409 | `CATEGORY_CONFLICT` | 중복 카테고리명 | 폼 에러 메시지 표시 |
| 400 | `INVALID_DATE` | 종료일 < 시작일 | 날짜 필드 에러 표시 |
| 400 | `INVALID_THEME` | 잘못된 테마값 | 폼 에러 메시지 |
| 400 | `INVALID_LANGUAGE` | 잘못된 언어값 | 폼 에러 메시지 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 오류 | 공통 에러 토스트 |

### axios 에러 추출 유틸

```typescript
// src/utils/apiError.ts
import type { ApiError } from '../types/api';

export function getApiErrorCode(err: unknown): string | null {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as any).response?.data?.error?.code
  ) {
    return (err as any).response.data.error.code;
  }
  return null;
}

export function getApiErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as any).response?.data?.error?.message
  ) {
    return (err as any).response.data.error.message;
  }
  return '오류가 발생했습니다. 다시 시도해주세요.';
}
```

---

## 11. 비즈니스 규칙 클라이언트 처리 요약

| 규칙 | 처리 위치 | 구현 방법 |
|------|----------|----------|
| BR-01 인증 필요 | 라우터 가드 | `PrivateRoute` 컴포넌트로 미인증 차단 |
| BR-02 데이터 격리 | 서버 처리 | 클라이언트에서 별도 처리 불필요 |
| BR-03 기본 카테고리 자동 배정 | 서버 처리 | `categoryId` 미전송 시 자동 처리 |
| BR-04 가입 시 기본 카테고리 생성 | 서버 처리 | 회원가입 성공 후 별도 처리 불필요 |
| BR-05 소유권 검증 | 서버 처리 | 403 에러 처리 구현 |
| BR-06 날짜 유효성 | 클라이언트 + 서버 | 폼 제출 전 `endDate < startDate` 검증 |
| BR-07 날짜 선택 선택값 | 클라이언트 | 날짜 미입력 허용, 미전송 처리 |
| BR-08~12 상태 필터 | 서버 처리 | `status` 쿼리 파라미터 전송 |
| BR-13 테마 유효성 | 서버 처리 | `['light', 'dark']` 외 서버 400 반환 |
| BR-14 로그인 시 테마 복원 | 클라이언트 | 로그인 응답 `themePreference` 즉시 적용 |
| BR-15 언어 유효성 | 서버 처리 | `['ko', 'en', 'ja']` 외 서버 400 반환 |
| BR-16 로그인 시 언어 복원 | 클라이언트 | 로그인 응답 `languagePreference` 즉시 적용 |

---

## 12. 인증 흐름 상세

```
1. 회원가입 (POST /api/auth/register)
   → 201 응답: { user } (token 없음)
   → /login 으로 이동

2. 로그인 (POST /api/auth/login)
   → 200 응답: { token, user }
   → authStore.login(token, user) 저장
   → user.themePreference / languagePreference 즉시 UI 적용
   → / 으로 이동

3. 인증 필요 API 요청
   → axios interceptor가 Authorization: Bearer {token} 자동 주입

4. 토큰 만료 (401 응답)
   → axios interceptor가 authStore.logout() 호출
   → /login 으로 리다이렉트

5. 로그아웃
   → authStore.logout() 호출 (localStorage 제거)
   → /login 으로 이동
```

---

## 13. 화면 라우트 맵

| 화면 ID | 경로 | 컴포넌트 | 인증 | 참조 UC |
|---------|------|---------|------|---------|
| S-01 | `/login` | `LoginPage` | 불필요 | UC-02 |
| S-02 | `/register` | `RegisterPage` | 불필요 | UC-01 |
| S-03 | `/` | `TodoListPage` | 필요 | UC-05, UC-07, UC-08 |
| S-04 | `/todos/new` | `TodoNewPage` | 필요 | UC-04 |
| S-05 | `/todos/:id/edit` | `TodoEditPage` | 필요 | UC-06 |
| S-06 | `/profile` | `ProfilePage` | 필요 | UC-03 |

---

## 14. 컴포넌트 구조 (권장)

```
frontend/src/
├── api/
│   ├── client.ts          # axios 인스턴스 + interceptors
│   ├── authApi.ts
│   ├── userApi.ts
│   ├── categoryApi.ts
│   └── todoApi.ts
│
├── store/
│   ├── authStore.ts       # token, user (persist)
│   └── filterStore.ts     # status, categoryId
│
├── hooks/
│   ├── useAuth.ts         # login/register mutation
│   ├── useCategories.ts   # TanStack Query
│   └── useTodos.ts        # TanStack Query
│
├── components/
│   ├── common/
│   │   ├── Button.tsx     # loading, disabled 지원
│   │   ├── Input.tsx      # label, 에러 메시지
│   │   └── Modal.tsx      # 삭제 확인 다이얼로그
│   ├── todo/
│   │   ├── TodoItem.tsx   # 완료/수정/삭제 인라인 액션
│   │   ├── TodoList.tsx   # 로딩/에러/빈 목록 처리
│   │   └── TodoForm.tsx   # 등록/수정 공용 폼
│   └── category/
│       └── CategoryFilter.tsx  # 상태 + 카테고리 필터
│
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── TodoListPage.tsx
│   ├── TodoNewPage.tsx
│   ├── TodoEditPage.tsx
│   └── ProfilePage.tsx
│
├── types/
│   ├── user.ts
│   ├── category.ts
│   ├── todo.ts
│   └── api.ts
│
└── utils/
    ├── apiError.ts        # 에러 코드 추출 유틸
    └── dateUtils.ts       # 날짜 파싱/포맷
```

---

## 15. 반응형 브레이크포인트

```css
/* 데스크톱 우선 설계 */
/* 태블릿 */
@media (max-width: 768px) { ... }
/* 모바일 */
@media (max-width: 375px) { ... }
```

모바일(375px)에서는 S-03의 상태 필터가 가로 스크롤 탭 형태로, 카테고리 필터가 드롭다운으로 변경된다. (와이어프레임 `docs/8-wireframes.md` S-03 모바일 레이아웃 참조)

---

## 16. 개발 참조 링크

| 문서 | 경로 |
|------|------|
| PRD (기능 요구사항) | `docs/2-PRD.md` |
| 아키텍처 원칙 | `docs/4-architecture-principles.md` |
| 아키텍처 다이어그램 | `docs/5-arch-diagram.md` |
| ERD | `docs/6-erd.md` |
| 와이어프레임 | `docs/8-wireframes.md` |
| 실행 계획 | `docs/7-execution-plan.md` |
| API 스펙 (Swagger UI) | `http://localhost:3000/api-docs` |
| OpenAPI JSON | `backend/swagger.json` |

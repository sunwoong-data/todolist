# TodoList 프론트엔드 스타일 가이드

---

**버전**: v1.0
**작성일**: 2026-05-28
**참조 이미지**: Shopify Supply 에디토리얼 디자인 레퍼런스
**적용 범위**: `frontend/src/` 전체 UI

---

## 1. 디자인 방향성

### 컨셉

**"다크 에디토리얼 프로덕티비티"**

딥 차콜 배경 위에 크림 화이트 텍스트와 브라이트 옐로우 액센트를 배치하는 고대비 에디토리얼 스타일. 모노스페이스 라벨과 볼드 타이포그래피가 기능적인 생산성 앱에 강한 아이덴티티를 부여한다.

### 핵심 원칙

1. **다크 모드 퍼스트** — 기본 테마는 다크. 라이트 모드는 v2에서 대응
2. **고대비** — WCAG AA 기준 이상의 텍스트-배경 대비
3. **타이포 중심** — 아이콘보다 명확한 텍스트 레이블 우선
4. **미니멀 레이아웃** — 불필요한 장식 배제, 콘텐츠에 집중

---

## 2. 색상 시스템

### 팔레트 정의

```css
:root {
  /* ── Background ── */
  --color-bg-base:      #0f0f0f;  /* 최하단 배경 */
  --color-bg-surface:   #1a1a1a;  /* 카드, 패널 */
  --color-bg-elevated:  #242424;  /* 호버, 포커스된 표면 */
  --color-bg-overlay:   #2e2e2e;  /* 모달, 드롭다운 */

  /* ── Text ── */
  --color-text-primary:   #f0ebe3;  /* 주요 텍스트 (크림 화이트) */
  --color-text-secondary: #8a8580;  /* 보조 텍스트 */
  --color-text-disabled:  #4a4a4a;  /* 비활성 */
  --color-text-inverse:   #0f0f0f;  /* 옐로우 배경 위 텍스트 */

  /* ── Border ── */
  --color-border-default: #2a2a2a;
  --color-border-strong:  #3d3d3d;
  --color-border-focus:   #f0ebe3;  /* 포커스 링 */

  /* ── Accent (브라이트 옐로우) ── */
  --color-accent:          #f5d61a;  /* Primary CTA, 강조 액션 */
  --color-accent-hover:    #f0ca00;
  --color-accent-pressed:  #d4b000;

  /* ── Semantic ── */
  --color-success:  #2fd87a;  /* 완료 상태 */
  --color-warning:  #f5a623;  /* 기한 임박 */
  --color-error:    #ff4d4d;  /* 에러, 기한 초과 */
  --color-info:     #4da6ff;  /* 진행 중 상태 */

  /* ── Status Badge ── */
  --color-status-pending:     #6b6b6b;  /* 시작 전 */
  --color-status-in-progress: #4da6ff;  /* 진행 중 */
  --color-status-overdue:     #ff4d4d;  /* 기한 초과 */
  --color-status-completed:   #2fd87a;  /* 완료 */
}
```

### 색상 사용 원칙

| 요소 | 사용 색상 |
|------|----------|
| 페이지 배경 | `--color-bg-base` |
| 카드 / 입력 필드 배경 | `--color-bg-surface` |
| 호버된 카드 | `--color-bg-elevated` |
| 모달 오버레이 | `rgba(0, 0, 0, 0.7)` |
| 주요 텍스트 | `--color-text-primary` |
| 날짜, 카테고리 등 메타 | `--color-text-secondary` |
| Primary 버튼 | `--color-accent` 배경 + `--color-text-inverse` 텍스트 |
| Secondary 버튼 | 투명 배경 + `--color-text-primary` 텍스트 + `--color-border-strong` 테두리 |
| 위험 버튼 (삭제) | `--color-error` 텍스트 또는 배경 |

---

## 3. 타이포그래피

### 폰트 패밀리

```css
/* Google Fonts 또는 로컬 폰트 */

/* 디스플레이 — 대형 섹션 타이틀, 빈 화면 메시지 */
--font-display: 'Barlow Condensed', 'Anton', sans-serif;

/* UI 라벨 — 상태 뱃지, 카테고리, 메타 정보 (모노스페이스 대문자 느낌) */
--font-mono:    'JetBrains Mono', 'Space Mono', 'Courier New', monospace;

/* 본문 — 일반 텍스트, 폼, 버튼 */
--font-body:    'Inter', 'Pretendard', system-ui, -apple-system, sans-serif;
```

### 타입 스케일

```css
/* ── 디스플레이 ── */
.text-display-xl {
  font-family: var(--font-display);
  font-size: 4rem;       /* 64px */
  font-weight: 900;
  font-style: italic;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.text-display-lg {
  font-family: var(--font-display);
  font-size: 2.5rem;     /* 40px */
  font-weight: 800;
  font-style: italic;
  line-height: 1;
  text-transform: uppercase;
}

/* ── 헤딩 ── */
.text-heading-lg {
  font-family: var(--font-body);
  font-size: 1.5rem;     /* 24px */
  font-weight: 700;
  line-height: 1.2;
}

.text-heading-md {
  font-family: var(--font-body);
  font-size: 1.125rem;   /* 18px */
  font-weight: 600;
  line-height: 1.3;
}

/* ── 라벨 (모노스페이스, 대문자) ── */
.text-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;  /* 11px */
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── 본문 ── */
.text-body-md {
  font-family: var(--font-body);
  font-size: 0.9375rem;  /* 15px */
  font-weight: 400;
  line-height: 1.6;
}

.text-body-sm {
  font-family: var(--font-body);
  font-size: 0.8125rem;  /* 13px */
  font-weight: 400;
  line-height: 1.5;
}

/* ── 에러/메타 ── */
.text-caption {
  font-family: var(--font-body);
  font-size: 0.75rem;    /* 12px */
  font-weight: 400;
  line-height: 1.4;
}
```

---

## 4. 간격 (Spacing)

8px 베이스 그리드를 사용한다.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## 5. 레이아웃

### 컨테이너

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* 태블릿 */
@media (max-width: 768px) {
  .container { padding: 0 var(--space-4); }
}

/* 모바일 */
@media (max-width: 375px) {
  .container { padding: 0 var(--space-3); }
}
```

### 할 일 목록 페이지 그리드 (S-03 데스크톱)

```css
.todo-page-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-6);
  min-height: calc(100vh - 56px);  /* navBar 높이 제외 */
}

/* 태블릿 이하 — 필터 접기 */
@media (max-width: 768px) {
  .todo-page-layout {
    grid-template-columns: 1fr;
  }
}
```

### 인증 화면 레이아웃 (S-01, S-02)

```css
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-bg-base);
  /* 대각선 그리드 패턴 (선택적) */
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 40px,
    rgba(255, 255, 255, 0.02) 40px,
    rgba(255, 255, 255, 0.02) 41px
  );
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  padding: var(--space-10) var(--space-8);
}
```

---

## 6. 컴포넌트 스타일

### 6-1. Button

```css
/* ── Base ── */
.btn {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: var(--space-3) var(--space-6);
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

/* ── Primary (옐로우 CTA) ── */
.btn-primary {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.btn-primary:hover   { background-color: var(--color-accent-hover); }
.btn-primary:active  { background-color: var(--color-accent-pressed); }

/* ── Secondary (외곽선) ── */
.btn-secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}
.btn-secondary:hover { background-color: var(--color-bg-elevated); }

/* ── Ghost (텍스트만) ── */
.btn-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}
.btn-ghost:hover { color: var(--color-text-primary); }

/* ── Danger (삭제) ── */
.btn-danger {
  background-color: transparent;
  color: var(--color-error);
  border-color: var(--color-error);
}
.btn-danger:hover { background-color: rgba(255, 77, 77, 0.1); }

/* ── 상태 ── */
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-loading {
  position: relative;
  color: transparent;  /* 로딩 중 텍스트 숨김 */
}
.btn-loading::after {
  content: '';
  position: absolute;
  width: 14px; height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ── 크기 ── */
.btn-sm { padding: var(--space-2) var(--space-4); font-size: 0.6875rem; }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: 0.875rem; }
```

### 6-2. Input / Textarea

```css
.input {
  width: 100%;
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.15s;
}

.input::placeholder { color: var(--color-text-disabled); }

.input:hover  { border-color: var(--color-border-strong); }
.input:focus  { border-color: var(--color-border-focus); }

/* 에러 상태 */
.input-error  { border-color: var(--color-error); }
.input-error:focus { border-color: var(--color-error); }

/* 읽기 전용 (이메일 필드) */
.input:read-only {
  color: var(--color-text-disabled);
  cursor: default;
}

/* 레이블 */
.input-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
  display: block;
}

/* 에러 메시지 */
.input-error-msg {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: var(--space-1);
}
```

### 6-3. TodoItem 카드

```css
.todo-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: border-color 0.15s, background-color 0.15s;
}

.todo-card:hover {
  border-color: var(--color-border-strong);
  background-color: var(--color-bg-elevated);
}

/* 완료 상태 — 흐릿하게 */
.todo-card-completed {
  opacity: 0.5;
}

/* 카드 제목 */
.todo-card-title {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.todo-card-completed .todo-card-title {
  text-decoration: line-through;
}

/* 메타 정보 (카테고리, 날짜) */
.todo-card-meta {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* 액션 버튼 영역 */
.todo-card-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
```

### 6-4. 상태 뱃지 (Status Badge)

```css
.badge {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px var(--space-2);
  display: inline-block;
  border: 1px solid currentColor;
}

.badge-pending     { color: var(--color-status-pending); }
.badge-in-progress { color: var(--color-status-in-progress); }
.badge-overdue     { color: var(--color-status-overdue); }
.badge-completed   { color: var(--color-status-completed); }
```

### 6-5. 네비게이션 바

```css
.navbar {
  height: 56px;
  background-color: #000000;        /* 완전한 검정 — 이미지 레퍼런스 */
  border-bottom: 1px solid var(--color-border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.navbar-user {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.navbar-user:hover { color: var(--color-text-primary); }
```

### 6-6. 필터 패널 (S-03 사이드바)

```css
.filter-panel {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  padding: var(--space-5);
}

.filter-section-title {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.filter-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.1s;
}

.filter-option:hover       { color: var(--color-text-primary); }
.filter-option-active      { color: var(--color-accent); font-weight: 600; }
.filter-option input[type="radio"] { accent-color: var(--color-accent); }
```

### 6-7. Modal (삭제 확인)

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background-color: var(--color-bg-overlay);
  border: 1px solid var(--color-border-strong);
  padding: var(--space-8);
  width: 100%;
  max-width: 400px;
}

.modal-title {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.modal-body {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
```

---

## 7. 아이콘

기본 아이콘 라이브러리는 **Lucide React**를 사용한다. 아이콘은 텍스트 레이블과 함께 표시하며 단독 사용을 최소화한다.

```typescript
import { Plus, Trash2, Pencil, Check, LogOut, User } from 'lucide-react';

// 아이콘 크기
// 인라인 텍스트: 14px
// 버튼 내: 16px
// 네비게이션: 20px
```

---

## 8. 애니메이션 / 트랜지션

빠르고 기능적인 트랜지션만 사용한다. 과도한 애니메이션은 지양한다.

```css
/* 표준 트랜지션 */
--transition-fast:   0.1s ease;
--transition-normal: 0.15s ease;
--transition-slow:   0.25s ease;

/* 버튼, 인풋 hover/focus */
transition: var(--transition-normal);

/* 모달 진입 */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}
.modal { animation: fadeIn 0.15s ease; }

/* 로딩 스피너 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 9. 반응형

```css
/* ── 브레이크포인트 ── */
/* 데스크톱 (기본) : 769px 이상 */
/* 태블릿           : 768px 이하 */
/* 모바일           : 375px 이하 */

/* S-03 모바일: 상태 필터를 가로 스크롤 탭으로 변환 */
@media (max-width: 768px) {
  .status-filter-tabs {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: var(--space-2);
  }
  .status-filter-tabs::-webkit-scrollbar { display: none; }

  .status-tab {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border-default);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
  }
  .status-tab-active {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
}
```

---

## 10. 배경 텍스처 (선택적 장식)

레퍼런스 이미지의 대각선 그리드 패턴을 인증 화면과 빈 상태 화면에 적용한다.

```css
.diagonal-grid-bg {
  background-image:
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 60px,
      rgba(255, 255, 255, 0.015) 60px,
      rgba(255, 255, 255, 0.015) 61px
    );
}
```

---

## 11. 빈 상태 / 로딩

### 빈 목록 (Empty State)

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
  text-align: center;
}

.empty-state-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  color: var(--color-text-disabled);
  margin-bottom: var(--space-4);
}

.empty-state-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}
```

### 로딩 스켈레톤

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-surface)   25%,
    var(--color-bg-elevated)  50%,
    var(--color-bg-surface)   75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

.skeleton-card {
  height: 80px;
  width: 100%;
  margin-bottom: var(--space-3);
}
```

---

## 12. CSS 변수 전체 참조 (globals.css)

```css
/* frontend/src/styles/globals.css */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Color */
  --color-bg-base:      #0f0f0f;
  --color-bg-surface:   #1a1a1a;
  --color-bg-elevated:  #242424;
  --color-bg-overlay:   #2e2e2e;

  --color-text-primary:   #f0ebe3;
  --color-text-secondary: #8a8580;
  --color-text-disabled:  #4a4a4a;
  --color-text-inverse:   #0f0f0f;

  --color-border-default: #2a2a2a;
  --color-border-strong:  #3d3d3d;
  --color-border-focus:   #f0ebe3;

  --color-accent:         #f5d61a;
  --color-accent-hover:   #f0ca00;
  --color-accent-pressed: #d4b000;

  --color-success: #2fd87a;
  --color-warning: #f5a623;
  --color-error:   #ff4d4d;
  --color-info:    #4da6ff;

  --color-status-pending:     #6b6b6b;
  --color-status-in-progress: #4da6ff;
  --color-status-overdue:     #ff4d4d;
  --color-status-completed:   #2fd87a;

  /* Font */
  --font-display: 'Barlow Condensed', 'Anton', sans-serif;
  --font-mono:    'JetBrains Mono', 'Space Mono', monospace;
  --font-body:    'Inter', 'Pretendard', system-ui, sans-serif;

  /* Spacing */
  --space-1:  4px;   --space-2:  8px;   --space-3:  12px;
  --space-4:  16px;  --space-5:  20px;  --space-6:  24px;
  --space-8:  32px;  --space-10: 40px;  --space-12: 48px;
  --space-16: 64px;

  /* Transition */
  --transition-fast:   0.1s ease;
  --transition-normal: 0.15s ease;
  --transition-slow:   0.25s ease;
}

html, body {
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* 스크롤바 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg-surface); }
::-webkit-scrollbar-thumb { background: var(--color-border-strong); }

/* 선택 영역 */
::selection {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
}

/* 링크 */
a {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
a:hover { color: var(--color-accent); }
```

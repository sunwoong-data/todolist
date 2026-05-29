# TodoList 프론트엔드 스타일 가이드

---

**버전**: v2.0
**작성일**: 2026-05-29
**참조 이미지**: Slack 다크 UI — 딥 오버진 퍼플 사이드바 + 에디토리얼 옐로우 액센트
**적용 범위**: `frontend/src/` 전체 UI

---

## 1. 디자인 방향성

### 컨셉

**"다크 오버진 에디토리얼"**

Slack의 딥 오버진(짙은 보라-자주) 사이드바에서 영감을 받은 어두운 퍼플 배경 시스템. 크림이 아닌 보라 틴트 화이트 텍스트를 사용하며, 브라이트 옐로우 액센트가 퍼플 배경 위에서 강한 에디토리얼 대비를 만든다. 사이드바는 Slack의 시그니처 오버진 계열로 차별화된 레이어를 형성한다.

### 핵심 원칙

1. **퍼플 레이어 시스템** — 배경·표면·사이드바가 각각 다른 보라 농도를 가진다
2. **옐로우-온-퍼플 대비** — 노란 액센트가 퍼플 배경 위에서 최대 가시성 확보
3. **오버진 사이드바** — 네비게이션·필터 패널은 Slack 스타일 딥 퍼플로 구분
4. **타이포 중심** — 모노스페이스 라벨 + 볼드 헤딩으로 에디토리얼 아이덴티티 유지

---

## 2. 색상 시스템

### 팔레트 정의

```css
:root {
  /* ── Background (퍼플 레이어) ── */
  --color-bg-base:           #0C0810;  /* 최하단 배경 — 블랙에 보라 undertone */
  --color-bg-surface:        #17112A;  /* 카드, 패널 */
  --color-bg-elevated:       #1F1836;  /* 호버, 포커스된 표면 */
  --color-bg-overlay:        #2A2245;  /* 모달, 드롭다운 */

  /* ── Sidebar (Slack 오버진 계열) ── */
  --color-bg-sidebar:        #3D1150;  /* 사이드바 / NavBar — Slack 오버진 */
  --color-bg-sidebar-hover:  #4D1A64;  /* 사이드바 항목 호버 */
  --color-bg-sidebar-active: rgba(255, 255, 255, 0.12);  /* 사이드바 활성 항목 */

  /* ── Text ── */
  --color-text-primary:   #EDE8F5;  /* 주요 텍스트 — 보라 틴트 화이트 */
  --color-text-secondary: #9882B0;  /* 보조 텍스트 */
  --color-text-disabled:  #4C3A5E;  /* 비활성 */
  --color-text-inverse:   #0C0810;  /* 옐로우 배경 위 텍스트 */
  --color-text-sidebar:   #C8B8DC;  /* 사이드바 텍스트 */

  /* ── Border ── */
  --color-border-default: #25163A;
  --color-border-strong:  #362150;
  --color-border-focus:   #F5D61A;  /* 포커스 링 — 옐로우로 퍼플 배경 위 강조 */

  /* ── Accent (브라이트 옐로우 — 퍼플 위 최대 대비) ── */
  --color-accent:          #F5D61A;
  --color-accent-hover:    #F0CA00;
  --color-accent-pressed:  #D4B000;

  /* ── Semantic ── */
  --color-success:  #2FD87A;
  --color-warning:  #F5A623;
  --color-error:    #FF4D4D;
  --color-info:     #818CF8;  /* 인디고 계열 — 퍼플 테마와 조화 */

  /* ── Status Badge ── */
  --color-status-pending:     #6B5E7E;  /* 시작 전 — 퍼플 그레이 */
  --color-status-in-progress: #818CF8;  /* 진행 중 — 인디고 */
  --color-status-overdue:     #FF4D4D;  /* 기한 초과 */
  --color-status-completed:   #2FD87A;  /* 완료 */
}
```

### 색상 사용 원칙

| 요소 | 사용 색상 |
|------|----------|
| 페이지 배경 | `--color-bg-base` |
| 카드 / 입력 필드 배경 | `--color-bg-surface` |
| 호버된 카드 | `--color-bg-elevated` |
| 모달 배경 | `--color-bg-overlay` |
| NavBar 배경 | `--color-bg-sidebar` (오버진) |
| 사이드바 필터 패널 | `--color-bg-sidebar` (오버진) |
| 사이드바 텍스트 | `--color-text-sidebar` |
| 사이드바 활성 항목 | `--color-bg-sidebar-active` |
| 주요 텍스트 | `--color-text-primary` |
| 날짜, 카테고리 등 메타 | `--color-text-secondary` |
| Primary 버튼 | `--color-accent` 배경 + `--color-text-inverse` 텍스트 |
| Secondary 버튼 | 투명 배경 + `--color-text-primary` + `--color-border-strong` 테두리 |
| 위험 버튼 (삭제) | `--color-error` 텍스트 또는 배경 |

### 라이트 모드 오버라이드

```css
[data-theme="light"] {
  --color-bg-base:           #F5F3F8;
  --color-bg-surface:        #FFFFFF;
  --color-bg-elevated:       #EDE8F5;
  --color-bg-overlay:        #FFFFFF;
  --color-bg-sidebar:        #3D1150;  /* 사이드바는 라이트/다크 공통 오버진 유지 */
  --color-bg-sidebar-hover:  #4D1A64;
  --color-bg-sidebar-active: rgba(255, 255, 255, 0.15);
  --color-text-primary:      #1A0F2E;
  --color-text-secondary:    #5A4875;
  --color-text-disabled:     #B8A8CC;
  --color-border-default:    #D8CCE8;
  --color-border-strong:     #B89CCC;
}
```

---

## 3. 타이포그래피

### 폰트 패밀리

```css
/* 디스플레이 — 대형 섹션 타이틀, 빈 화면 메시지 */
--font-display: 'Barlow Condensed', 'Anton', sans-serif;

/* UI 라벨 — 상태 뱃지, 카테고리, 메타 정보 */
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

@media (max-width: 768px) {
  .container { padding: 0 var(--space-4); }
}

@media (max-width: 375px) {
  .container { padding: 0 var(--space-3); }
}
```

### 할 일 목록 페이지 그리드

```css
.todo-page-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 0;  /* 사이드바와 콘텐츠 사이 경계선으로 구분 */
  min-height: calc(100vh - 56px);
}

@media (max-width: 768px) {
  .todo-page-layout {
    grid-template-columns: 1fr;
  }
}
```

### 인증 화면 레이아웃

```css
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-bg-base);
  /* 보라 안개 효과 */
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(61, 17, 80, 0.3) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(61, 17, 80, 0.2) 0%, transparent 60%);
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

/* ── Primary (옐로우 CTA — 퍼플 배경 위 최대 대비) ── */
.btn-primary {
  background-color: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.btn-primary:hover  { background-color: var(--color-accent-hover); }
.btn-primary:active { background-color: var(--color-accent-pressed); }

/* ── Secondary (외곽선) ── */
.btn-secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}
.btn-secondary:hover { background-color: var(--color-bg-elevated); }

/* ── Ghost ── */
.btn-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}
.btn-ghost:hover { color: var(--color-text-primary); }

/* ── Danger ── */
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
  color: transparent;
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
.input:focus  { border-color: var(--color-border-focus); }  /* 옐로우 포커스 링 */

.input-error       { border-color: var(--color-error); }
.input-error:focus { border-color: var(--color-error); }

.input:read-only {
  color: var(--color-text-disabled);
  cursor: default;
}

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
  border-left: 3px solid transparent;  /* 상태 컬러 인디케이터 */
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

/* 상태별 왼쪽 인디케이터 */
.todo-card[data-status="in_progress"] { border-left-color: var(--color-status-in-progress); }
.todo-card[data-status="overdue"]     { border-left-color: var(--color-status-overdue); }
.todo-card[data-status="completed"]   { border-left-color: var(--color-status-completed); }

/* 완료 상태 */
.todo-card-completed { opacity: 0.5; }

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

.todo-card-meta {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

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

### 6-5. 네비게이션 바 (Slack 오버진)

```css
.navbar {
  height: 56px;
  background-color: var(--color-bg-sidebar);  /* Slack 오버진 — 라이트 모드에서도 유지 */
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
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
  color: #FFFFFF;  /* 오버진 위 항상 흰색 */
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
  color: var(--color-text-sidebar);
  cursor: pointer;
  transition: color var(--transition-fast);
}
.navbar-user:hover { color: #FFFFFF; }
```

### 6-6. 필터 패널 (Slack 오버진 사이드바)

```css
.filter-panel {
  background-color: var(--color-bg-sidebar);  /* 오버진 — NavBar와 연결된 느낌 */
  border-right: 1px solid rgba(0, 0, 0, 0.3);
  padding: var(--space-6) var(--space-5);
  min-height: 100%;
}

.filter-section-title {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(200, 184, 220, 0.6);  /* 사이드바 텍스트 투명도 낮춤 */
  margin-bottom: var(--space-3);
}

.filter-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-sidebar);
  cursor: pointer;
  transition: background-color 0.1s, color 0.1s;
}

.filter-option:hover {
  background-color: var(--color-bg-sidebar-hover);
  color: #FFFFFF;
}

.filter-option-active {
  background-color: var(--color-bg-sidebar-active);
  color: #FFFFFF;
  font-weight: 600;
}
```

### 6-7. Modal (삭제 확인)

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(12, 8, 16, 0.85);  /* 퍼플 틴트 오버레이 */
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
  animation: fadeIn 0.15s ease;
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

### 6-8. 캘린더

```css
.calendar-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.calendar-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.calendar-nav-btn {
  background: none;
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-3);
  cursor: pointer;
  font-family: var(--font-mono);
  transition: border-color 0.1s, color 0.1s;
}
.calendar-nav-btn:hover {
  border-color: var(--color-border-focus);
  color: var(--color-text-primary);
}

.calendar-day-header {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  text-align: center;
  padding: var(--space-2);
}

.calendar-cell {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  min-height: 80px;
  padding: var(--space-2);
  vertical-align: top;
  transition: background-color 0.1s;
}
.calendar-cell:hover { background-color: var(--color-bg-elevated); }

.calendar-cell-today {
  border-color: var(--color-accent);
  background-color: rgba(245, 214, 26, 0.05);  /* 옐로우 미세 틴트 */
}

/* 공휴일 날짜 */
.calendar-cell-holiday {
  background-color: rgba(255, 77, 77, 0.08);
}
.calendar-cell-holiday .calendar-date-number { color: var(--color-error); }

.calendar-date-number {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
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

// 사이드바 아이콘: color = var(--color-text-sidebar)
// 사이드바 아이콘 hover: color = #FFFFFF
```

---

## 8. 애니메이션 / 트랜지션

```css
--transition-fast:   0.1s ease;
--transition-normal: 0.15s ease;
--transition-slow:   0.25s ease;

/* 모달 진입 */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}

/* 로딩 스피너 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 9. 반응형

```css
/* 데스크톱 (기본) : 769px 이상 */
/* 태블릿           : 768px 이하 */
/* 모바일           : 375px 이하 */

/* 태블릿 이하 — 필터 사이드바 접기 */
@media (max-width: 768px) {
  .filter-panel {
    display: none;  /* 모바일에서는 하단 시트 또는 숨김 처리 */
  }

  /* 상태 필터를 상단 가로 스크롤 탭으로 대체 */
  .status-filter-tabs {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: var(--space-2);
    background-color: var(--color-bg-sidebar);
    padding: var(--space-3) var(--space-4);
  }
  .status-filter-tabs::-webkit-scrollbar { display: none; }

  .status-tab {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-4);
    border: 1px solid rgba(200, 184, 220, 0.3);
    color: var(--color-text-sidebar);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
    background: none;
    border-radius: 4px;
  }
  .status-tab-active {
    border-color: var(--color-accent);
    color: var(--color-accent);
    background-color: rgba(245, 214, 26, 0.1);
  }
}
```

---

## 10. 빈 상태 / 로딩

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
    var(--color-bg-surface)  25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-surface)  75%
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

## 11. CSS 변수 전체 참조 (globals.css)

```css
/* frontend/src/styles/globals.css */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Color — 다크 오버진 테마 */
  --color-bg-base:           #0C0810;
  --color-bg-surface:        #17112A;
  --color-bg-elevated:       #1F1836;
  --color-bg-overlay:        #2A2245;
  --color-bg-sidebar:        #3D1150;
  --color-bg-sidebar-hover:  #4D1A64;
  --color-bg-sidebar-active: rgba(255, 255, 255, 0.12);

  --color-text-primary:   #EDE8F5;
  --color-text-secondary: #9882B0;
  --color-text-disabled:  #4C3A5E;
  --color-text-inverse:   #0C0810;
  --color-text-sidebar:   #C8B8DC;

  --color-border-default: #25163A;
  --color-border-strong:  #362150;
  --color-border-focus:   #F5D61A;

  --color-accent:          #F5D61A;
  --color-accent-hover:    #F0CA00;
  --color-accent-pressed:  #D4B000;

  --color-success: #2FD87A;
  --color-warning: #F5A623;
  --color-error:   #FF4D4D;
  --color-info:    #818CF8;

  --color-status-pending:     #6B5E7E;
  --color-status-in-progress: #818CF8;
  --color-status-overdue:     #FF4D4D;
  --color-status-completed:   #2FD87A;

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

/* 스크롤바 — 퍼플 틴트 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg-surface); }
::-webkit-scrollbar-thumb { background: var(--color-border-strong); border-radius: 3px; }

/* 선택 영역 — 옐로우 액센트 유지 */
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

---

## 12. v1 → v2 변경 요약

| 항목 | v1 (다크 에디토리얼) | v2 (다크 오버진 에디토리얼) |
|------|---------------------|---------------------------|
| 배경 베이스 | `#0f0f0f` (순수 검정) | `#0C0810` (보라 언더톤 검정) |
| 표면 | `#1a1a1a` (뉴트럴 다크) | `#17112A` (딥 퍼플) |
| NavBar | `#000000` (검정) | `#3D1150` (Slack 오버진) |
| 사이드바 | 콘텐츠와 동일 배경 | `#3D1150` (오버진 — NavBar 연속성) |
| 주요 텍스트 | `#f0ebe3` (크림 화이트) | `#EDE8F5` (보라 틴트 화이트) |
| 보조 텍스트 | `#8a8580` (뉴트럴) | `#9882B0` (보라 틴트) |
| 액센트 | `#f5d61a` (옐로우) | `#F5D61A` (옐로우 — 유지) |
| 포커스 링 | `#f0ebe3` (크림) | `#F5D61A` (옐로우 — 퍼플 위 더 강한 대비) |
| info 색상 | `#4da6ff` (블루) | `#818CF8` (인디고 — 퍼플 조화) |
| 진행 중 배지 | `#4da6ff` (블루) | `#818CF8` (인디고) |
| 사이드바 호버 | 없음 | `#4D1A64` (밝은 오버진) |
| 카드 인디케이터 | 없음 | 왼쪽 3px 상태 컬러 보더 |
| 인증 배경 | 대각선 그리드 | 방사형 퍼플 안개 그라디언트 |

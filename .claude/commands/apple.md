# iOS HIG 디자인 핵심 규칙

> Apple Human Interface Guidelines — 디자인 파트 요약

---

## 1. 레이아웃 & 안전 영역 `Critical`

|     | 규칙                                                  |
| --- | ----------------------------------------------------- |
| ✅  | 터치 타겟 최소 **44×44pt** 유지                       |
| ❌  | 상태바·Dynamic Island·홈 인디케이터 영역 침범         |
| ✅  | 주요 액션은 화면 **하단**(엄지존)에 배치              |
| ❌  | 고정 너비 사용 — iPhone SE~Pro Max 대응 불가          |
| ✅  | 간격은 **8pt 그리드** (8, 16, 24, 32…)                |
| ✅  | `.ignoresSafeArea()`는 배경 이미지·장식 요소에만 사용 |

```swift
// ✅ 올바른 예
Button("Save") { save() }
    .frame(minWidth: 44, minHeight: 44)

// ❌ 잘못된 예 — 터치 타겟 너무 작음
Button(action: save) {
    Image(systemName: "checkmark")
        .font(.system(size: 20))
}
```

---

## 2. 내비게이션 `Critical`

|     | 규칙                                                 |
| --- | ---------------------------------------------------- |
| ✅  | 최상위 섹션 3~5개는 **탭 바** (화면 하단)            |
| ❌  | 햄버거 메뉴 사용 — 탐색 불가 문제                    |
| ✅  | 최상위 뷰: `.navigationBarTitleDisplayMode(.large)`  |
| ❌  | 왼쪽 엣지 스와이프(뒤로가기) 제스처 차단             |
| ✅  | 탭 전환·내비게이션 이후 **상태 복원**                |
| ✅  | `NavigationStack` 사용 (`NavigationView` deprecated) |

```swift
// ✅ 올바른 예
TabView {
    HomeView()
        .tabItem { Label("Home", systemImage: "house") }
    SearchView()
        .tabItem { Label("Search", systemImage: "magnifyingglass") }
    ProfileView()
        .tabItem { Label("Profile", systemImage: "person") }
}
```

---

## 3. 타이포그래피 `High`

|     | 규칙                                                         |
| --- | ------------------------------------------------------------ |
| ✅  | 시멘틱 텍스트 스타일 사용 (`.headline`, `.body`, `.caption`) |
| ❌  | 고정 폰트 크기 — Dynamic Type 미지원                         |
| ✅  | 접근성 최대 크기(~200%)에서 레이아웃 리플로우                |
| ✅  | 커스텀 폰트: `Font.custom(_:size:relativeTo:)`               |
| ❌  | 텍스트 최소 크기 **11pt 미만** 사용                          |
| ✅  | 계층은 폰트 굵기·크기로 표현 (색상만으로 구분 금지)          |

```swift
// ✅ 올바른 예 — Dynamic Type 자동 대응
VStack(alignment: .leading, spacing: 4) {
    Text("섹션 제목").font(.headline)
    Text("본문 내용").font(.body)
    Text("2시간 전").font(.caption).foregroundStyle(.secondary)
}

// ❌ 잘못된 예 — Dynamic Type 미작동
Text("섹션 제목").font(.system(size: 17, weight: .semibold))
```

---

## 4. 색상 & 다크 모드 `High`

|     | 규칙                                                      |
| --- | --------------------------------------------------------- |
| ✅  | 시스템 시멘틱 컬러 (`.primary`, `.systemBackground`)      |
| ❌  | 하드코딩 색상 (`.black`, `.white`) — 다크 모드 불가       |
| ❌  | 색상만으로 정보 전달 (색맹 사용자 약 8%)                  |
| ✅  | 일반 텍스트 대비비 **4.5:1** 이상 (WCAG AA)               |
| ✅  | 인터랙티브 요소에 **단일 액센트 컬러**                    |
| ✅  | 커스텀 컬러는 에셋 카탈로그에서 Light/Dark 변형 모두 정의 |

```swift
// ✅ 올바른 예
Text("주요 텍스트").foregroundStyle(.primary)
VStack { }.background(Color(.systemBackground))

// ❌ 잘못된 예
Text("주요 텍스트").foregroundColor(.black) // 다크 모드에서 보이지 않음
```

### 배경 계층

| 레벨 | 토큰                        | 용도              |
| ---- | --------------------------- | ----------------- |
| 1    | `systemBackground`          | 기본 화면         |
| 2    | `secondarySystemBackground` | 그룹 콘텐츠, 카드 |
| 3    | `tertiarySystemBackground`  | 그룹 내 요소      |

---

## 5. 접근성 `Critical`

|     | 규칙                                           |
| --- | ---------------------------------------------- |
| ✅  | 모든 버튼·컨트롤에 `.accessibilityLabel`       |
| ✅  | Bold Text 설정 반영 (`\.legibilityWeight`)     |
| ✅  | Reduce Motion: 장식 애니메이션 비활성화        |
| ✅  | Switch Control·키보드 완전 지원                |
| ❌  | 커스텀 제스처만 제공 — 대체 탭 인터랙션 미지원 |

```swift
// ✅ 올바른 예
Button(action: addToCart) {
    Image(systemName: "cart.badge.plus")
}
.accessibilityLabel("장바구니에 추가")

// Reduce Motion 대응
@Environment(\.accessibilityReduceMotion) var reduceMotion
CardView().animation(reduceMotion ? nil : .spring(), value: isExpanded)
```

---

## 6. 컴포넌트 `High`

### 버튼 스타일

| 스타일               | 용도               |
| -------------------- | ------------------ |
| `.borderedProminent` | 주요 CTA           |
| `.bordered`          | 보조 액션          |
| `.borderless`        | 3차·인라인 액션    |
| `role: .destructive` | 삭제·제거 (빨간색) |

### 컴포넌트 빠른 참조

| 목적               | 컴포넌트                     | 비고                            |
| ------------------ | ---------------------------- | ------------------------------- |
| 최상위 섹션 (3~5)  | `TabView`                    | 하단 탭 바, SF Symbols          |
| 계층형 드릴다운    | `NavigationStack`            | 루트: Large title, 하위: Inline |
| 독립 작업          | `.sheet`                     | 스와이프 해제, 취소/완료 버튼   |
| 중요 결정          | `.alert`                     | 버튼 2개 권장, 최대 3개         |
| 보조 액션          | `.contextMenu`               | 롱프레스 + 다른 접근 경로 필수  |
| 스크롤 목록        | `List + .insetGrouped`       | 스와이프 액션, 행 높이 44pt+    |
| 검색               | `.searchable`                | 추천 검색어, 최근 검색 지원     |
| 진행 상태 (확정)   | `ProgressView(value:total:)` | % 또는 남은 시간 표시           |
| 진행 상태 (미확정) | `ProgressView()`             | 인라인, 전체 화면 차단 금지     |
| 파괴적 액션        | `Button(role: .destructive)` | 빨간색, Alert으로 확인          |
| 햅틱 피드백        | `UIImpactFeedbackGenerator`  | `.light` / `.medium` / `.heavy` |
| 콘텐츠 공유        | `ShareLink`                  | 시스템 공유 시트                |

### Alert 사용 규칙

```swift
// ✅ 중요 결정에만 Alert 사용
.alert("사진을 삭제할까요?", isPresented: $showAlert) {
    Button("삭제", role: .destructive) { deletePhoto() }
    Button("취소", role: .cancel) { }
} message: {
    Text("이 사진은 영구적으로 삭제됩니다.")
}

// ❌ 팁·안내에 Alert 사용 금지 — 배너나 인라인 메시지로 대체
```

---

## 7. 프라이버시 & 권한 `High`

|     | 규칙                                            |
| --- | ----------------------------------------------- |
| ❌  | 앱 실행 시 권한 일괄 요청                       |
| ✅  | 사용 시점에 권한 요청 (맥락 내)                 |
| ✅  | 시스템 다이얼로그 전 커스텀 설명 화면 제공      |
| ✅  | 타사 로그인 시 **Sign in with Apple** 필수 제공 |
| ❌  | 기본 기능에 계정 생성 강제                      |

---

## 8. UX 패턴 `Medium`

|     | 규칙                                                  |
| --- | ----------------------------------------------------- |
| ✅  | 온보딩 **최대 3페이지**, 건너뛰기 옵션 필수           |
| ❌  | 전체 화면 스피너 — 스켈레톤 뷰(`.redacted`) 사용      |
| ✅  | 런치 스크린 = 첫 화면과 동일하게 (로고 스플래시 금지) |
| ❌  | 모달 위에 모달 중첩                                   |
| ✅  | 모든 액션에 시각 + 햅틱 피드백 즉시 제공              |

```swift
// ✅ 스켈레톤 뷰
if isLoading {
    ForEach(0..<5) { _ in
        SkeletonRow().redacted(reason: .placeholder)
    }
} else {
    ForEach(items) { item in ItemRow(item: item) }
}
```

---

## 절대 하지 말아야 할 것들

1. **햄버거 메뉴** — 탭 바를 사용할 것. 메뉴 가시성 50% 이상 감소.
2. **스와이프-백 제스처 차단** — `NavigationStack`에서 엣지 스와이프 항상 허용.
3. **전체 화면 차단 스피너** — 앱이 멈춘 것처럼 느껴짐.
4. **로고 스플래시 스크린** — 런치 스크린은 첫 화면과 동일해야 함.
5. **실행 시 권한 일괄 요청** — 카메라·위치·알림을 동시에 요청하면 대부분 거부됨.
6. **고정 폰트 크기** — Dynamic Type 무시, 수백만 사용자에게 앱이 망가짐.
7. **색상만으로 상태 표시** — 아이콘·텍스트와 반드시 함께 사용.
8. **중요하지 않은 정보에 Alert** — 배너·토스트·인라인 메시지 사용.
9. **내비게이션 중 탭 바 숨김** — 사용자 방향 감각 상실.
10. **닫을 수 없는 모달** — 모든 모달에 닫기 경로 필수.
11. **대체 수단 없는 커스텀 제스처** — 버튼이나 메뉴로 동일 기능 제공.
12. **작은 터치 타겟** — 44pt 미만은 오터치 유발.

---

## 체크리스트

### 레이아웃

- [ ] 모든 터치 타겟 44×44pt 이상
- [ ] 상태바·Dynamic Island·홈 인디케이터 미침범
- [ ] 주요 액션 화면 하단 배치
- [ ] iPhone SE~Pro Max 레이아웃 정상
- [ ] 8pt 그리드 정렬

### 내비게이션

- [ ] 탭 바로 최상위 섹션 구성
- [ ] 햄버거 메뉴 없음
- [ ] 최상위 뷰 Large title 사용
- [ ] 스와이프-백 정상 동작
- [ ] 탭 전환 시 상태 복원

### 타이포그래피

- [ ] 시멘틱 텍스트 스타일 또는 Dynamic Type 연동 커스텀 폰트
- [ ] 접근성 최대 크기에서 레이아웃 깨지지 않음
- [ ] 최소 폰트 크기 11pt 이상

### 색상 & 다크 모드

- [ ] 시스템 시멘틱 컬러 또는 Light/Dark 에셋 변형 제공
- [ ] 다크 모드 의도적으로 디자인됨
- [ ] 색상만으로 정보 전달 없음
- [ ] 텍스트 대비비 4.5:1 이상

### 접근성

- [ ] VoiceOver 모든 화면 정상 읽힘
- [ ] Bold Text 반영됨
- [ ] Reduce Motion 장식 애니메이션 비활성화
- [ ] 모든 제스처에 대체 접근 경로 존재

### 컴포넌트

- [ ] Alert은 중요 결정에만 사용
- [ ] Sheet에 닫기 경로 존재
- [ ] 리스트 행 높이 44pt 이상
- [ ] 내비게이션 중 탭 바 유지
- [ ] 파괴적 버튼 `.destructive` role 사용

### 프라이버시

- [ ] 권한은 사용 시점에 요청
- [ ] 시스템 권한 다이얼로그 전 설명 화면 제공
- [ ] 타사 로그인 시 Sign in with Apple 제공
- [ ] 기본 기능은 계정 없이 사용 가능

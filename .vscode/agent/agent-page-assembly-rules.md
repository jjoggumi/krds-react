# PAGE_ASSEMBLY_RULES

역할: Figma MCP(@figma-desktop)를 통해 선택된 피그마 디자인을 읽고,  
디자인 시스템(토큰 + 공통 UI)을 최우선으로 사용하여 React 페이지를 조립한다.

> ⭕ 목적: 디자인 시스템을 100% 활용하여 페이지를 조립하는 것  
> ❌ 목적이 아닌 것: Figma를 단순히 그대로 HTML로 옮기는 것

---

## 0. 구현 우선순위 체인 (절대 고정 ❗ 순서 변경 불가)

```
피그마 구조 및 노드 분석
     ↓
① 공통 UI 컴포넌트 매핑 가능? (hc2/src/components/uiux)
     YES → 컴포넌트 소스(.tsx) 읽어 Props 인터페이스 확인 후 변환 적용
     NO  ↓
② themes.css에 @theme 기반 유틸리티 클래스가 존재하는가?
     YES → bg-bg-primary-base, text-text-default 등 시맨틱 클래스 사용
     NO  ↓
③ CSS 변수 강제 주입 (최후의 수단)
     bg-[var(--color-bg-primary-base)] 형태로만 사용
     ※ tailwind.config.js를 가정한 구형 문법 사용 금지 (현 프로젝트는 @theme 디렉티브 사용)

❌ 언제나 금지: bg-gray-100, #efefef 등 raw value 및 primitive token 직접 사용
```

---

## 1. 선행 조건 및 중단 규칙

작업 시작 전 아래 조건을 순서대로 확인한다. 조건 미충족 시 즉시 중단하고 아래 형식으로 보고한다.

| 중단 조건 | 보고 내용 |
|---|---|
| Figma MCP 미연결 | 현재 상태 / 영향 범위 / MCP 연결 요청 |
| 노드 읽기 실패 또는 Auto Layout 구조 이상 | 실패 사유 또는 이상 영역 명시 / node-id 또는 링크 제공 요청 |
| 선택 노드가 페이지·최상위 프레임이 아님 | 노드 타입 명시 / 올바른 프레임 선택 요청 |
| 해상도·뷰포트 기준 불명확 | 기준 해상도 확인 요청 (모바일 390 / 태블릿 768 / 데스크톱 1280) |
| 공통 UI Props로 표현 불가능한 구조 발생 | 불가 사유 명시 / 컴포넌트 확장 또는 커스텀 구현 여부 확인 요청 |

---

## 2. 구현 원칙

1. 피그마 페이지/프레임을 먼저 읽고, 레이아웃 구조(컬럼/행/폭/높이/gap)를 확정한 뒤 코드를 작성한다.
2. 피그마 라이브러리의 Variables 사용 여부를 먼저 확인한다. 기존 토큰 매핑이 있으면 재사용하고, 불명확한 경우에만 신규 매핑을 판단한다.
3. 공통 UI 컴포넌트를 사용할 때 **반드시 해당 컴포넌트의 소스 코드(.tsx) 또는 타입 정의 파일을 먼저 읽고 Props 구조를 파악**한다. 임의로 Props를 추측하지 않는다.
4. 공통 UI(`hc2/src/components/uiux`)는 `Hi`로 시작하는 컴포넌트를 우선 사용하되, 없으면 유사 컴포넌트를 사용한다.  
   → 이미 존재하는 공통 UI는 절대 새로 만들지 않는다.
5. **임의 디자인 금지.** 반드시 피그마 디자인을 참조한다.
6. 반응형·접근성 요구사항을 구현 단계에서 함께 만족시킨다.

### CSS Source of Truth (토큰 계층 및 참조 순서)

```
tokens.css   →  primitive (색상·수치 원본값, 직접 사용 금지)
vars.css     →  semantic base (역할 기반 변수 정의)
themes.css   →  semantic alias (@theme 유틸리티 클래스 매핑)
components.css → 조합 타이포 유틸리티 (.text-leading-*)
```

| 파일 | 경로 | 역할 |
|---|---|---|
| `vars.css` | `hc2/src/assets/css/common/vars.css` | 원본 변수 (컬러·폰트·간격 등) |
| `themes.css` | `hc2/src/assets/css/common/themes.css` | 시맨틱 토큰 매핑 (`--color-*`, `--text-*`, `--border-*`) |
| `components.css` | `hc2/src/assets/css/common/components.css` | 조합 타이포 유틸리티 (`.text-leading-*`) |

---

## 3. 작성 순서 (고정)

1. **구조** — 페이지 골격 / 섹션 / 컬럼 배치 (flex/grid 및 gap 토큰 사용)
2. **컴포넌트 분석** — 사용할 공통 UI의 소스 코드 확인 및 Props 구조 파악
3. **공통 UI 조립** — 피그마 속성 → Props 변환 및 반영
4. **스타일** — 토큰 기반 색상·간격·보더·배경·타이포 정합
5. **인터랙션·상태** — hover·active·focus·disabled·error·loading·empty 조건부 UI
6. **접근성** — aria·포커스·키보드 지원
7. **검토** — 피그마 대비 시각·구조 diff 점검

---

## 4. 디자인 매핑 규칙

### 색상
- `@theme` 기반 유틸리티 클래스 최우선 (예: `bg-bg-primary-base`, `text-text-default`).
- 해당 클래스가 없을 때만 CSS 변수 강제 주입 (예: `bg-[var(--color-bg-primary-base)]`).
- primitive color(hex/rgb) 및 raw Tailwind 컬러(`bg-gray-100`) 직접 사용 **절대 금지.**

### 타이포그래피

`components.css`의 조합 클래스를 우선 사용한다. 개별 `text-*` / `leading-*`를 따로 쓰는 것보다 세트 클래스 하나로 처리한다.

| 클래스 | 적용 대상 |
|---|---|
| `text-leading-t1` ~ `text-leading-t3` | 타이틀 (28px ~ 23px) |
| `text-leading-h1` ~ `text-leading-h4` | 헤딩 (22px ~ 17px) |
| `text-leading-b1` ~ `text-leading-b3` | 본문 (16px ~ 14px) |
| `text-leading-d1` ~ `text-leading-d3` | 보조/캡션 (13px ~ 11px) |

- 세트 클래스로 표현 불가한 경우에만 `themes.css`의 `text-*` + `leading-*` 토큰을 개별 적용.
- `text-[14px]`·`leading-[20px]` 등 arbitrary 클래스 **금지.** 예외 필요 시 근거 명시.

### 컨트롤 사이즈 (버튼·인풋·셀렉트 직접 구현 시)

공통 UI 컴포넌트가 아닌 커스텀 마크업으로 컨트롤 요소(버튼·인풋·셀렉트 등)를 구현할 때는 반드시 `components.css`의 `control-*` 클래스를 사용한다. 높이·폰트·border-radius를 임의로 지정하지 않는다.

| 클래스 | 높이 | 폰트 클래스 | radius |
|---|---|---|---|
| `control-xxs` | 24px | `text-d2 leading-d2` | 4px |
| `control-xs` | 32px | `text-b3 leading-b3` | 4px |
| `control-sm` | 36px | `text-b3 leading-b3` | 4px |
| `control-md` | 40px | `text-b3 leading-b3` | 4px |
| `control-lg` | 44px | `text-b2 leading-b2` | 4px |
| `control-xl` | 48px | `text-b1 leading-b1` | 8px |
| `control-2xl` | 56px | `text-b1 leading-b1` | 8px |

### 간격·사이징
- 패딩/마진: `p-padding-md`, `mt-gap-sm` 등 토큰 클래스 사용. 임의 숫자(`p-4`) **금지.**
- border-radius: `rounded-radius-md` 등 프로젝트 정의값(`--radius-*`)만 사용.

### Border·선
- `border-border-*` 계열 시맨틱 토큰 우선 사용.

### 레이아웃
- `flex`/`grid` 우선.
- `position: absolute/relative`는 불가피한 경우에만 최소 범위 사용.

---

## 5. 공통 UI 매핑 및 피그마 속성 → Props 변환 규칙

### 매핑 판단 기준 (아래 중 2개 이상 해당 시 공통 UI 강제 사용)
- 역할 일치 (Button, Input, Card 등)
- 인터랙션 존재 (click, input 등)
- 구조 유사 (icon + text 등)

### 커스텀 구현 허용 조건 (보고 필수)
- Props로 표현 불가능한 구조인 경우
- UI 시스템 확장이 필요한 경우

### 변환 규칙

| 피그마 속성 패턴 | 변환 규칙 | 예시 |
|---|---|---|
| Variant property | `variant` prop (값은 소문자 변환) | `Type=Primary` → `variant="primary"` |
| Size property | `size` prop | `Size=Medium` → `size="md"` |
| Boolean property | boolean prop | `Disabled=True` → `disabled` |
| State=Hover/Active | CSS 인터랙션 처리, props 없으면 wrapper 조정 | — |
| State=Error | `error` prop | `State=Error` → `error` |
| Text override | `children` 또는 `label` prop | `Label=확인` → `>확인<` |
| Icon 위치 | `iconLeft` / `iconRight` | `Icon=Left` → `iconLeft={<Search />}` |
| 복합 Variant (A+B) | 각각의 prop으로 분리 | `Type=Primary, Size=Large` → `variant="primary" size="lg"` |
| 매핑 불가 속성 | 즉시 보고 후 wrapper에서 조정 | — |

### 준수 사항
- 실제 Props interface를 확인하고 사용. 임의 Props 추가 금지.
- 컴포넌트 내부 스타일 변경 금지. 필요 시 wrapper에서 조정.
- 불가능한 조합은 즉시 보고하고 variant 추가 여부 판단.

---

## 6. 컴포넌트 네이밍 및 Props 매핑 규칙

### 기본 규칙 (대부분의 컴포넌트에 적용)

피그마 컴포넌트명과 hc2 공통 UI는 아래 규칙으로 1:1 대응된다.

- **컴포넌트명**: 피그마 컴포넌트명 앞에 `Hi` 접두사를 붙인다.  
  예) `Button` → `HiButton`, `Input` → `HiInput`, `Card` → `HiCard`
- **Props명**: 피그마 Property명과 동일하게 사용한다.  
  예) 피그마 `variant=primary` → `variant="primary"`, `size=sm` → `size="sm"`

### 예외 컴포넌트 매핑표

아래 컴포넌트는 기본 규칙이 적용되지 않으므로 반드시 이 표를 우선 참조한다.

| 피그마 컴포넌트명 | 실제 컴포넌트명 | 특이사항 |
|---|---|---|
| DateTimePicker | `DatetimePicker` | `Hi` 접두사 없음 |

> 예외 컴포넌트는 발견 시 지속적으로 이 표에 추가한다.

---

## 7. 피그마 Variables → CSS 토큰 네이밍 변환 규칙

피그마 Variables와 CSS 토큰은 1:1 싱크되어 있다. 피그마에서 변수명을 읽으면 아래 규칙으로 CSS 토큰명을 즉시 추론할 수 있다.

### 변환 규칙

```
피그마 Variables:  color/bg/primary-base
CSS 토큰:          --color-bg-primary-base

변환 규칙:
① 슬래시(/) → 하이픈(-)으로 치환
② 앞에 -- 추가
```

### 예시

| 피그마 Variables | CSS 토큰 |
|---|---|
| `color/bg/primary-base` | `--color-bg-primary-base` |
| `color/text/default` | `--color-text-default` |
| `color/border/neutral-subtle` | `--color-border-neutral-subtle` |
| `color/action/primary-base` | `--color-action-primary-base` |

---

## 8. @theme 유틸리티 클래스 사용 규칙

### 판단 기준

`themes.css`의 `@theme { }` 블록 **안에 정의된 변수**는 Tailwind 유틸리티 클래스로 사용 가능하다.  
`@theme { }` **밖에 있는 변수**는 클래스로 사용 불가 → CSS 변수 강제 주입만 가능.

### 클래스 변환 규칙

`@theme` 안의 변수명에서 접두사를 제거하고 용도에 맞는 Tailwind prefix를 붙인다.

| 변수 패턴 | 사용 가능한 클래스 형태 | 예시 |
|---|---|---|
| `--color-bg-*` | `bg-bg-*` | `--color-bg-primary-base` → `bg-bg-primary-base` |
| `--color-text-*` | `text-text-*` | `--color-text-default` → `text-text-default` |
| `--color-border-*` | `border-border-*` | `--color-border-neutral-subtle` → `border-border-neutral-subtle` |
| `--color-action-*` | `bg-action-*` / `text-action-*` | 용도에 따라 prefix 선택 |
| `--text-*` | `text-*` | `--text-b1` → `text-b1` |
| `--leading-*` | `leading-*` | `--leading-b1` → `leading-b1` |
| `--font-weight-*` | `font-weight-*` | `--font-weight-bold` → `font-weight-bold` |

### 폴백 순서 (반드시 준수)

```
① @theme 기반 유틸리티 클래스  →  bg-bg-primary-base
② 클래스 없을 때만 CSS 변수 강제 주입  →  bg-[var(--color-bg-primary-base)]
③ 언제나 금지  →  bg-gray-100, #efefef 등 raw value
```

---

## 8. 상태(State) 및 방어적 UI 규칙

데이터가 관여하는 모든 영역은 아래 상태를 반드시 대비한다.

| 상태 | 처리 방식 |
|---|---|
| hover / active / focus | CSS 인터랙션으로 처리 |
| disabled | `disabled` prop 또는 `aria-disabled` |
| error | `error` prop 또는 에러 메시지 영역 확보 |
| loading | 스켈레톤 또는 스피너 UI 영역을 토큰 규칙에 맞춰 구성 |
| empty | 리스트·테이블 영역에 Empty State 컴포넌트 또는 마크업 반드시 대비 |

---

## 9. 아이콘 규칙

아이콘이 없는 경우 이 섹션 스킵.

1. **Lucide 아이콘 우선 사용.** 피그마 아이콘 이름과 기능적·시각적으로 가장 일치하는 아이콘 선택.
2. Lucide에 동일/유사 아이콘 없을 때만 `HiIcon` fallback 사용.
3. 선택 우선순위: 기능 의미 일치 → 형태 유사성 → 사이즈·두께 일관성.
4. 아이콘 단독 인터랙션 요소는 반드시 `aria-label` 추가.

---

## 10. 접근성 체크리스트

- 의미 있는 영역·버튼에 `aria-label` 또는 `aria-describedby` 추가.
- 키보드 네비게이션 보장 (`tabIndex`, focusable).
- 포커스 스타일 제거 금지.
- 시맨틱 태그(`button`/`form`/`section`/`nav` 등) 우선 사용.

---

## 11. 파일·코드 규칙

- 페이지 파일명: `Page.tsx` 규칙 준수 (예: `TextSend.tsx`).
- 상수·타입은 파일 상단 또는 별도 파일로 분리.
- 상태·로직은 필요 시 custom hook으로 분리.
- import 순서: `React` → 외부 라이브러리 → 공통 UI → 페이지 로직.

---

## 12. 예외 처리 보고 의무

아래 경우 반드시 작업을 중단하고 보고한 뒤 진행 방향을 확인한다.

- 공통 UI로 표현 불가능한 구조 발생
- 토큰 매핑이 불가능한 색상·수치 발생
- 피그마 디자인과 디자인 시스템 간 불일치 발생
- 컴포넌트 Props 인터페이스와 피그마 속성이 충돌하는 경우

---

## 13. 구현 전후 검증 항목

### 구현 전 확정
- [ ] 전체 레이아웃 구조 (컬럼/행/주요 폭/높이/gap)
- [ ] 섹션 순서 (상단 → 본문 → 보조영역)
- [ ] 공통 UI 매핑 목록 및 피그마 속성 → Props 변환 목록
- [ ] 사용할 공통 UI 컴포넌트 소스 파악 완료 여부
- [ ] 핵심 시맨틱 토큰명 확정 (색상·보더·배경)
- [ ] 뷰포트·해상도 기준 확정

### 구현 후 검증
- [ ] Tailwind 클래스가 `@theme` 기반으로만 출력되었는가 (예: `bg-bg-primary-base`)
- [ ] CSS 변수 강제 주입은 `@theme` 클래스 부재 시에만 사용되었는가
- [ ] primitive color / raw Tailwind 컬러 / arbitrary 수치 미사용 여부
- [ ] arbitrary 타이포 클래스(`text-[*]`, `leading-[*]`) 미사용 여부
- [ ] 공통 UI Props가 실제 인터페이스와 일치하는가
- [ ] loading / empty 상태 UI가 구성되었는가
- [ ] 필수 섹션 누락 여부
- [ ] 핵심 색상·보더·배경·레이아웃 수치 피그마와 일치 여부
- [ ] `position` 의존 레이아웃 최소 사용 여부
- [ ] 아이콘 정책 준수 여부
- [ ] 접근성 체크리스트 충족 여부

---

## 14. 사용자 요청 템플릿 (권장)

```
타겟 노드: [현재 선택 프레임 전체 또는 node-id]
뷰포트 기준: [모바일 390px / 태블릿 768px / 데스크톱 1280px]
필수 고정 요소: [반드시 포함할 섹션/패널/컴포넌트]
공통 UI 강제 목록: [반드시 사용할 공통 UI 컴포넌트]
아이콘 규칙: Lucide 우선, 없으면 HiIcon
허용 범위: [공통 UI 외 커스텀 마크업 허용/재사용 금지 범위]
```
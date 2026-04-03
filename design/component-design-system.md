# BikerMap Component Design System

## Design Principles

- 모든 공통 컴포넌트는 토큰 기반으로 설계한다.
- 컴포넌트는 색상보다 상태와 역할을 먼저 드러내야 한다.
- 다크 차콜/건메탈 배경 위에서 면적, 경계, 깊이 차이로 계층을 만든다.
- 오렌지 포인트는 CTA, 포커스, 활성 상태에만 제한적으로 쓴다.
- 웹과 앱은 같은 의미의 컴포넌트를 쓰되, 표현 방식은 플랫폼에 맞게 다듬는다.
- 임의 SVG 파일은 사용하지 않고, 플랫폼별 아이콘 라이브러리를 사용한다.

## Token Source

- Color tokens: `package-shared/src/constants/theme.ts`
- Web theme bridge: `web/shared/theme/web-theme.ts`
- Web CSS variables: `--app-color-*` -> `--color-*`로 연결되는 구조를 유지한다.
- Shadow tokens: `panel`, `accent`만 우선 공통화한다.

## Recommended Semantic Tokens

- Surface: `bg`, `panel`, `panelSolid`, `panelSoft`
- Text: `text`, `muted`
- Border: `border`
- Accent states: `accent`, `accentStrong`, `active`
- Feedback: `warning`, `danger`, `info`
- Input-specific 추천 토큰 네이밍: `fieldBg`, `fieldBgHover`, `fieldBgFilled`, `fieldBorder`, `fieldBorderHover`, `fieldBorderFocus`, `fieldBorderError`, `fieldText`, `fieldPlaceholder`, `fieldHelper`, `fieldShadowFocus`

## Typography Palette

### Core Rules

- 기본 폰트는 `Pretendard`다.
- 같은 위계는 웹과 앱에서 동일한 의미를 유지한다.
- 제목은 짧고 강하게, 본문은 읽기 우선, 보조 텍스트는 밀도를 낮춘다.
- 숫자, 지도 정보, 메타 정보는 line-height를 넉넉하게 잡는다.
- 모든 레벨에서 letter-spacing은 과하게 벌리지 말고, 큰 제목에만 약한 음수 트래킹을 허용한다.

### Scale

| Role         |  Size |  Weight | Line-height | Letter-spacing | Usage                            |
| ------------ | ----: | ------: | ----------: | -------------: | -------------------------------- |
| `display`    | 48-56 |     700 |   1.02-1.08 |        -0.04em | 랜딩 히어로, 매우 큰 섹션 타이틀 |
| `heading-xl` | 40-44 |     700 |    1.05-1.1 |        -0.04em | 페이지 상단 강한 타이틀          |
| `heading-lg` | 32-36 |     700 |         1.1 |        -0.03em | 주요 섹션 제목                   |
| `heading-md` | 24-28 | 600-700 |        1.15 |       -0.025em | 패널 제목, 다이얼로그 타이틀     |
| `title`      | 18-20 |     600 |        1.25 |        -0.02em | 리스트 아이템 제목, 카드 제목    |
| `body-lg`    |    16 | 400-500 |     1.7-1.8 |            0em | 본문, 설명문, 긴 카피            |
| `body-md`    |    14 | 400-500 |     1.6-1.7 |            0em | 일반 UI 텍스트, 입력 값          |
| `label`      |    13 |     600 |    1.2-1.35 |         0.01em | 폼 라벨, 배지, 작은 액션         |
| `caption`    |    12 | 500-600 |     1.4-1.5 |         0.01em | helper text, 시간, 메타 정보     |
| `overline`   |    11 |     600 |         1.2 |         0.08em | 섹션 eyebrow, uppercase 마커     |

### Practical Mapping

- 페이지 제목: `heading-xl` 또는 `display`
- 패널/다이얼로그 제목: `heading-md`
- 리스트 항목 제목: `title`
- 설명 문단: `body-lg`
- 입력값 및 일반 라벨: `body-md` + `label`
- helper text, timestamp, metadata: `caption`
- eyebrow/section marker: `overline`

### Implementation Notes

- 제목은 `tracking-[-0.03em]` 전후로 시작하고, 32px 이상에서만 더 강한 트래킹을 검토한다.
- 본문은 `leading-7` 계열을 기본으로 두고, 14px 이하에서만 더 촘촘하게 조정한다.
- form label은 본문보다 더 굵게 보여야 하지만, heading처럼 과도하게 두껍지 않아야 한다.
- 입력 필드 내부 텍스트와 외부 label의 위계를 분명히 분리한다.

### PageWrapper / Surface

- `PageWrapper`는 페이지 전체 레이아웃 래퍼 역할로 유지한다.
- `Surface`는 공통 panel container 역할로 유지한다.
- 둘 다 공통 radius, border, shadow 토큰을 공유해야 한다.
- 앞으로 카드, 패널, 인라인 섹션도 이 규칙을 따른다.

## Button System

### Variants

- `primary`
- `secondary`
- `ghost`
- `danger`
- `underline`

### Sizes

- `sm`
- `md`
- `lg`
- `icon`

### States

- `default`
- `hover`
- `selected`
- `disabled`
- `loading`

### Rules

- `primary`는 가장 중요한 CTA에만 사용한다.
- `secondary`는 보조 액션에 사용한다.
- `ghost`는 헤더, 패널 내 보조 버튼, 아이콘 버튼에 사용한다.
- `danger`는 삭제, 탈퇴, 되돌릴 수 없는 작업에만 사용한다.
- `underline`는 텍스트+ 언더라인 조합에 사용한다.
- 버튼은 모두 `cn`으로 클래스 조합을 관리하고, 인라인 스타일을 쓰지 않는다.

### Visual Guidance

- 기본 배경은 `panelSolid` 또는 `panelSoft` 계열.
- 포커스 링은 `accent` 또는 `active` 기반의 얇은 링.
- pressed는 약한 translate-down 또는 shadow 감소로 표현한다.
- disabled는 opacity 감소와 pointer-events 차단으로 표현한다.

## Tab System

### Types

- `default tab`
- `segmented control`

### Rules

- `default tab`은 페이지 상단 섹션 전환용이다.
- `segmented control`은 2~3개 상태 전환에만 사용한다.
- 활성 상태는 배경색과 border를 동시에 변화시켜 인지도를 높인다.
- 비활성 상태는 panel 계열 배경과 border만 유지한다.

### MainNav

- 현재 pill navigation은 공통 `tab / segmented control`보다 상위 내비게이션으로 유지한다.
- active 상태, hover 상태, focus 상태를 공통 버튼 규칙으로 흡수한다.
- 앞으로는 pill nav도 `segmented control`과 동일한 토큰 스케일을 공유할 수 있다.

### NotificationBell

- bell 버튼은 `icon button + badge` 패턴으로 고정한다.
- unread dot은 accent 계열로 통일한다.
- 알림 패널은 `dropdown` 또는 `sheet` 패턴으로 분리한다.

## Modal / Dropdown / Sheet

### Usage Rules

- `modal`은 확인/취소가 필요한 강한 중단 지점에 사용한다.
- `dropdown`은 짧은 선택지와 빠른 action에 사용한다.
- `sheet`는 모바일에서 알림, 필터, quick actions에 우선 사용한다.
- 웹은 dropdown과 modal을 우선한다.
- 앱은 sheet를 우선하고, 정보 밀도가 높을 때만 modal을 쓴다.

### Shared Visual Rules

- 배경은 `panel` 또는 `panelSolid`.
- 가장자리는 둥글고 단단해야 하며, 과한 blur는 피한다.
- 상단 title, body, action 영역이 명확히 나뉘어야 한다.
- 닫기 버튼은 항상 같은 위치와 같은 아이콘 규칙을 가져야 한다.

## Input System

### Covered Components

- `text input`
- `search input`
- `textarea`
- `select-like input`

### Shared Anatomy

- `label`
- `field container`
- `leading icon` optional
- `input control`
- `trailing affordance` optional
- `helper / error text`

### Shared Structure Rules

- 기본 label은 필드 위 4px 간격으로 배치한다.
- helper text와 error text는 필드 아래 6px 간격으로 배치한다.
- placeholder는 label을 대체하지 않는다.
- value가 있으면 `filled` 상태로 보고, placeholder 의존도를 낮춘다.
- icon은 장식이 아니라 입력 의도를 돕는 역할일 때만 넣는다.
- search input만 leading search icon을 기본 허용하고, text input은 선택적으로만 사용한다.
- select-like input은 trailing chevron을 기본 허용하고, disabled 상태에서도 affordance가 남아 있어야 한다.

### Sizes

- `sm`: height 36, horizontal padding 12, text 14, radius 12
- `md`: height 44, horizontal padding 14, text 14~15, radius 14
- `lg`: height 52, horizontal padding 16, text 16, radius 16
- textarea는 height 고정 대신 min-height 120부터 시작하고 vertical resize만 허용한다.

### States

#### Default

- 배경은 `panel` 또는 `panelSolid`.
- 경계는 `border`.
- 텍스트는 `text`, placeholder는 `muted`.
- 그림자는 거의 없거나 `panel` 수준의 아주 약한 레이어만 허용한다.

#### Hover

- 웹에서만 적극 사용한다.
- 배경은 `panelSolid` 또는 `panelSoft`로 1단계만 밝힌다.
- 경계는 `accent` 방향으로 살짝 이동한다.
- 레이아웃 이동이나 크기 변화는 금지한다.

#### Focus

- 키보드 접근성 기준으로 반드시 있어야 한다.
- outline 대신 2px ring + 1px offset을 쓴다.
- 포커스 컬러는 기본적으로 `accent`, 보조 대체는 `active`.
- 그림자는 포커스 가시성을 보조하는 수준만 허용한다.

#### Filled

- 값이 들어간 상태는 시각적으로 안정되어 보여야 한다.
- 배경은 default와 같아도 되지만, border는 더 명확하게 읽혀야 한다.
- label은 고정된 위치를 유지하고, placeholder는 사라진다.

#### Error

- border, label, helper text를 `danger`로 통일한다.
- focus도 `danger` ring으로 덮어쓴다.
- error 상태에서는 hover 강조를 줄이고, 경고 의미를 우선한다.

#### Disabled

- 배경은 더 어둡게, 텍스트와 border는 명확히 약화한다.
- opacity만으로 끝내지 말고 cursor, pointer-events, focus 가능 여부를 함께 정리한다.
- disabled에는 hover와 focus 스타일이 남아 있으면 안 된다.

### Icon Rules

- leading icon은 폼의 의미를 즉시 이해시키는 경우에만 사용한다.
- search input: search icon 기본 허용.
- text input: icon은 선택적이며, 아이콘이 있으면 텍스트 시작 위치를 일관되게 맞춘다.
- select-like input: chevron-down icon 기본 허용.
- clear action이 있으면 trailing icon 버튼으로 분리한다.
- icon 크기는 16px 기준으로 통일하고, 텍스트와 시각적 중심선을 맞춘다.

### Dark Tone Rules

- pure black은 쓰지 않고, 차콜/건메탈 계열만 유지한다.
- 경계선은 밝게 튀지 않게 하고, `border` + 낮은 대비 배경 차이로 구분한다.
- shadow는 넓고 부드럽게, 대신 불투명도를 낮게 유지한다.
- accent는 면 전체 채움보다 border, focus ring, active hint에 우선 적용한다.
- 입력 필드가 주변 패널보다 너무 떠 보이면 과한 blur나 강한 shadow를 줄인다.

### Developer Contract

- 공통 input 컴포넌트는 `label`, `helperText`, `errorText`, `leftIcon`, `rightIcon`, `size`, `disabled`, `readOnly`, `value`, `defaultValue`, `onChange`를 우선 지원한다.
- `search input`은 text input 위에 얇은 semantic layer만 얹고, 별도 스타일 분기를 크게 만들지 않는다.
- `textarea`는 같은 토큰과 같은 상태 규칙을 공유해야 한다.
- `select-like input`은 실제 `<select>` 또는 button-trigger menu 중 하나로 구현하되, 시각 규칙은 동일하게 유지한다.

## Hover / Focus / Pressed / Disabled

### Hover

- 웹에서만 적극적으로 사용한다.
- `border`가 `accent` 쪽으로 이동하거나, shadow가 약간 강화되는 정도로 충분하다.
- hover는 레이아웃 이동을 만들지 않는다.

### Focus

- 키보드 접근성 기준으로 반드시 있어야 한다.
- outline 대신 얇은 ring과 offset으로 표현한다.
- focus는 `accent` 또는 `active` 둘 중 하나로 통일한다.

### Pressed

- 눌림은 `translate-y-[1px]` 정도의 미세한 변화만 허용한다.
- 색상은 hover보다 더 강해지되, 본문 가독성을 해치면 안 된다.

### Disabled

- 불가 상태는 opacity와 pointer-events로 표현한다.
- disabled가 되었을 때 hover/focus 스타일이 남아 있으면 안 된다.

## Icon Rules

- 웹: `lucide-react`
- 앱: 플랫폼에 맞는 네이티브 아이콘 라이브러리 사용
- 아이콘은 장식이 아니라 상태와 행동을 구분하는 요소다.
- 임의 SVG 파일을 만들지 않는다.
- 동일한 의미의 아이콘은 웹과 앱에서 같은 semantic role을 가져야 한다.

## Shared Token Rules

- 색상은 `package-shared`의 토큰만 사용한다.
- 웹은 `web/shared/theme/web-theme.ts` 를 통해 CSS 변수로 연결한다.
- 앱도 동일한 토큰 이름 체계를 유지한다.
- 컴포넌트 레벨에서는 색상 이름이 아니라 역할 이름을 먼저 생각한다.

## Current Repo Mapping

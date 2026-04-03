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

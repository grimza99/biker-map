# Mobile NativeCSS 가이드

## 목적

모바일 UI는 이제 `StyleSheet`보다 `NativeWind` / `react-native-css` 기반의 `className` 사용을 기본값으로 본다.

- 공용 레이아웃, 간격, 배경, 텍스트 색상, 보더는 가능한 한 `className`으로 작성한다.
- 플랫폼별 세밀한 제어가 필요할 때만 `StyleSheet` 또는 inline `style`을 사용한다.

## 현재 방향

지금은 웹과 앱이 각자 토큰 주입 방식을 따로 사용한다.

- 웹: `body`에 theme var를 주입한다.
- 앱: 루트 layout에서 `VariableContextProvider`로 var를 주입한다.

이 구조는 임시 분리 상태다. 이후에는 웹/앱 공통 theme var 선언 방식을 루트 기준으로 끌어올릴 예정이다.

## var 선언 위치

앱에서 사용하는 색상 var의 source of truth는 `package-shared`의 `bikerMapTheme`이다.

선언 흐름은 아래와 같다.

1. `mobile/shared/constants/theme.ts`

```ts
import { bikerMapTheme } from "@package-shared/constants";

export const THEME_VARS = {
  "--app-color-bg": bikerMapTheme.colors.bg,
  "--app-color-panel": bikerMapTheme.colors.panel,
  "--app-color-panel-solid": bikerMapTheme.colors.panelSolid,
  "--app-color-panel-soft": bikerMapTheme.colors.panelSoft,
  "--app-color-text": bikerMapTheme.colors.text,
  "--app-color-muted": bikerMapTheme.colors.muted,
  "--app-color-border": bikerMapTheme.colors.border,
  "--app-color-accent": bikerMapTheme.colors.accent,
  "--app-color-accent-strong": bikerMapTheme.colors.accentStrong,
  "--app-color-accent-light": bikerMapTheme.colors.accentLight,
  "--app-color-active": bikerMapTheme.colors.active,
  "--app-color-warning": bikerMapTheme.colors.warning,
  "--app-color-info": bikerMapTheme.colors.info,
  "--app-color-danger": bikerMapTheme.colors.danger,
} as const;
```

2. `mobile/app/_layout.tsx`

```tsx
<VariableContextProvider value={THEME_VARS}>
  <SessionProvider>
    <Stack screenOptions={{ headerShown: false }} />
  </SessionProvider>
</VariableContextProvider>
```

3. `mobile/global.css`

```css
@theme inline {
  --color-bg: var(--app-color-bg);
  --color-panel: var(--app-color-panel);
  --color-panel-solid: var(--app-color-panel-solid);
  --color-panel-soft: var(--app-color-panel-soft);
  --color-text: var(--app-color-text);
  --color-muted: var(--app-color-muted);
  --color-border: var(--app-color-border);
  --color-accent: var(--app-color-accent);
  --color-accent-strong: var(--app-color-accent-strong);
  --color-accent-light: var(--app-color-accent-light);
  --color-active: var(--app-color-active);
  --color-warning: var(--app-color-warning);
  --color-info: var(--app-color-info);
  --color-danger: var(--app-color-danger);
}
```

이 매핑 덕분에 컴포넌트에서는 아래처럼 semantic class를 사용할 수 있다.

```tsx
<View className="bg-panel border border-border" />
<Text className="text-text" />
<View className="bg-accent" />
```

## 작성 원칙

- 새 모바일 공용 컴포넌트는 가능한 한 `className` 기반으로 작성한다.
- `gap`, `flex`, `rounded`, `border`, `text-*`, `bg-*`는 `className` 우선이다.
- theme 색상은 raw hex를 직접 쓰지 말고 `text-text`, `bg-panel`, `border-border`, `bg-accent`처럼 semantic token을 사용한다.
- 아이콘처럼 `color` prop이 필요한 경우에는 `bikerMapTheme.colors.*`를 직접 써도 된다.

## 예외적으로 StyleSheet를 허용하는 경우

- 애니메이션 계산값처럼 runtime number가 필요한 경우
- `Pressable` state callback에서 style 배열이 더 단순한 경우
- 외부 라이브러리 컴포넌트가 `className`을 안정적으로 받지 않는 경우

이 경우에도 가능한 한 theme 색상 원천은 `package-shared`를 따른다.

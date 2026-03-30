import { bikerMapTheme } from "@package-shared/constants/theme";

export const webThemeVars = {
  "--color-bg": bikerMapTheme.colors.bg,
  "--color-panel": bikerMapTheme.colors.panel,
  "--color-panel-solid": bikerMapTheme.colors.panelSolid,
  "--color-panel-soft": bikerMapTheme.colors.panelSoft,
  "--color-text": bikerMapTheme.colors.text,
  "--color-muted": bikerMapTheme.colors.muted,
  "--color-border": bikerMapTheme.colors.border,
  "--color-accent": bikerMapTheme.colors.accent,
  "--color-accent-strong": bikerMapTheme.colors.accentStrong,
  "--color-active": bikerMapTheme.colors.active,
  "--color-warning": bikerMapTheme.colors.warning,
  "--color-info": bikerMapTheme.colors.info,
  "--color-danger": bikerMapTheme.colors.danger,
  "--shadow": bikerMapTheme.shadows.panel,
  "--shadow-accent": bikerMapTheme.shadows.accent
} as const;

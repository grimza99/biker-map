import { bikerMapTheme } from "@package-shared/constants/theme";

export const webThemeVars = {
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
  "--shadow": bikerMapTheme.shadows.panel,
  "--shadow-accent": bikerMapTheme.shadows.accent,
} as const;

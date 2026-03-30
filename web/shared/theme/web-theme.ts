import { bikerMapTheme } from "@package-shared/constants/theme";

export const webThemeVars = {
  "--bg": bikerMapTheme.colors.bg,
  "--panel": bikerMapTheme.colors.panel,
  "--panel-solid": bikerMapTheme.colors.panelSolid,
  "--panel-soft": bikerMapTheme.colors.panelSoft,
  "--text": bikerMapTheme.colors.text,
  "--muted": bikerMapTheme.colors.muted,
  "--border": bikerMapTheme.colors.border,
  "--accent": bikerMapTheme.colors.accent,
  "--accent-strong": bikerMapTheme.colors.accentStrong,
  "--active": bikerMapTheme.colors.active,
  "--warning": bikerMapTheme.colors.warning,
  "--info": bikerMapTheme.colors.info,
  "--danger": bikerMapTheme.colors.danger,
  "--shadow": bikerMapTheme.shadows.panel,
  "--shadow-accent": bikerMapTheme.shadows.accent
} as const;

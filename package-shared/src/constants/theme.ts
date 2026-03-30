export const colorTokens = {
  bg: "#111315",
  panel: "#171A1E",
  panelSolid: "#1D2228",
  panelSoft: "#232A31",
  text: "#F5F7FA",
  muted: "#A1ABB6",
  border: "#303841",
  accent: "#E5572F",
  accentStrong: "#C94A24",
  active: "#00C2A8",
  warning: "#FFC857",
  danger: "#D85B4E",
  info: "#4DA3FF",
} as const;

export const shadowTokens = {
  panel: "0 18px 50px rgba(5, 6, 7, 0.34)",
  accent: "0 10px 24px rgba(229, 87, 47, 0.28)",
} as const;

export const bikerMapTheme = {
  colors: colorTokens,
  shadows: shadowTokens,
} as const;

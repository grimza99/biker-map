import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "../shared/styles/globals.css";
import { AppProviders } from "@shared/providers";
import { AppShell } from "@widgets/app-shell";
import { webThemeVars } from "@shared/theme/web-theme";
import { getInitialSession } from "@features/session/model/get-initial-session";

const bodyThemeVars = webThemeVars as CSSProperties;

export const metadata: Metadata = {
  title: "Biker Map",
  description: "Biker map web shell"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const initialSession = await getInitialSession();

  return (
    <html lang="ko">
      <body style={bodyThemeVars}>
        <AppProviders initialSession={initialSession}>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

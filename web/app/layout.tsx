import { getInitialSession } from "@features/session/model/get-initial-session";
import { AppProviders } from "@shared/providers";
import { webThemeVars } from "@shared/theme/web-theme";
import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "../shared/styles/globals.css";

const bodyThemeVars = webThemeVars as CSSProperties;

export const metadata: Metadata = {
  title: "Biker Map",
  description: "Biker map web shell",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const initialSession = await getInitialSession();

  return (
    <html lang="ko">
      <body style={bodyThemeVars} className="w-screen h-screen">
        <AppProviders initialSession={initialSession}>{children}</AppProviders>
      </body>
    </html>
  );
}

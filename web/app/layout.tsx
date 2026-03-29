import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "@web/components/providers/app-providers";
import { AppShell } from "@web/components/shell/app-shell";

export const metadata: Metadata = {
  title: "Biker Map",
  description: "Biker map web shell"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

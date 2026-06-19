import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import { AppShell } from "@widgets/app-shell";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "바이커 전용 지도, 커뮤니티 |Biker Map",
  description: "Biker map app shell",
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppShell>
      <main>{children}</main>
    </AppShell>
  );
}

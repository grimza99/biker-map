import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "바이커 전용 장소, 경로 |Biker Map",
  description: "Biker map app shell full width map",
};

export default async function FullWidthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="h-full w-screen">{children}</div>;
}

import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "바이커 전용 커뮤니티 |Biker Map",
  description: "Biker map app shell community",
};

export default async function StandardWidthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="mx-auto w-[min(1120px,calc(100%-32px))] py-6 pb-14">
      {children}
    </div>
  );
}

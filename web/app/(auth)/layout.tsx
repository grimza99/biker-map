import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "회원가입,로그인 | Biker Map",
  description: "Biker map web shell",
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      {children}
    </div>
  );
}

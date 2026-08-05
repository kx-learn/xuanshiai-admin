import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "寻爱管理后台",
  description: "寻爱会员与运营管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}

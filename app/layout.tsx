import type { Metadata } from "next";
import "./globals.css";   // ← これを追加！！

export const metadata: Metadata = {
  title: "re!RACK",
  description: "卒業式までのカウントダウンと宿題・連絡事項の共有アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}

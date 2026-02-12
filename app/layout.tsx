// app/layout.tsx
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
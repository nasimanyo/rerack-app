// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "re!RACK",
  description: "宿題・連絡・予定を管理するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>
        <main style={{ minHeight: "100vh" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

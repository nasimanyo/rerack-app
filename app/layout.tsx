// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import AdSidebar from "@/components/AdSidebar";

export const metadata: Metadata = {
  title: "re!RACK | 卒業カウントダウン",
  description: "卒業までの宿題と予定を管理するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {/* メイン（常に中央） */}
        <main className="min-h-screen flex justify-center p-6">
          <div className="w-full max-w-3xl">
            {children}
          </div>
        </main>

        {/* 右側固定広告 */}
        <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2">
          <AdSidebar />
        </div>
      </body>
    </html>
  );
}
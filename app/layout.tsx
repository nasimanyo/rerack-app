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
        <div className="flex min-h-screen">
          {/* メインコンテンツ */}
          <main className="flex-1 p-6">
            {children}
          </main>

          {/* 右広告バー（PCのみ表示） */}
          <aside className="w-[320px] hidden lg:flex border-l bg-gray-50 p-4 justify-center">
            <AdSidebar />
          </aside>
        </div>
      </body>
    </html>
  );
}
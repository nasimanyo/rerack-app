"use client";

import React from "react";

export default function ContactPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">お問い合わせ</h1>

      <p className="mb-4">以下のフォームからお問い合わせください。</p>

      <div style={{ width: "100%", minHeight: 300 }} className="flex flex-col items-start justify-center gap-4">
        <p>
          このフォームはre!RACKのお問い合わせ用のフォームです。
          こちらからお問い合わせや機能の要望、バグの報告、広告掲載の申請などが行えます。
        </p>

        <p className="text-sm text-gray-600">
          ※埋め込み表示がブラウザで拒否される場合があるため、下のボタンで新しいタブで開きます。
        </p>

        <a
          href="https://forms.gle/QxENVhxVKftcMffdA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          フォームを開く
        </a>
      </div>
    </main>
  );
}

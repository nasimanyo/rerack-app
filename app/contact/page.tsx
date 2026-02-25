"use client";

import React from "react";

export default function ContactPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">お問い合わせ</h1>

      <p className="mb-4">以下のフォームからお問い合わせください。</p>

      <div style={{ width: "100%", minHeight: 300 }} className="flex flex-col items-start justify-center gap-4">
        <p>
          このフォームは re!RACK のお問い合わせ用です。お問い合わせ、機能の要望、バグ報告、
          広告掲載の申請などはこちらから受け付けています。
        </p>

        <ol>
  　　　　　　<li>本サービスでは、画面の一部に画像形式の広告を表示する場合があります。</li>
 　　　　　　 <li>本サービスは商業広告媒体ではありません。</li>
 　　　　　　 <li>企業・法人・営利団体からの広告掲載依頼や営業連絡は受け付けておりません。</li>
　　　　</ol>

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

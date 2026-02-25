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

        <p>
          ご記入の際は、できるだけ詳しく内容をお知らせいただけると助かります。特にバグ報告の場合は、再現手順などがあると問題の解決がスムーズになります。
          広告申請の場合は審査がございます。まず審査の前にre!RACKの広告掲載に関するガイドラインをお読みください。
          1. 画像形式はpngかjpgで、サイズは300*600pxであること。
          2. 広告の内容がre!RACKの景観を損ねないこと。
          3. 広告の内容がre!RACKの利用規約に違反しないこと。
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

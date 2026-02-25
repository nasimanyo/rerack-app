"use client";

import React from "react";

export default function ContactPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">お問い合わせ</h1>

      <p className="mb-4">以下のフォームからお問い合わせください。</p>

      <div style={{ width: "100%", minHeight: 600 }}>
        <iframe
          src="https://form.run/@nasiman-rerack"
          title="re!RACK お問い合わせフォーム"
          style={{ width: "100%", height: "800px", border: 0 }}
          loading="lazy"
        />
      </div>

      <p className="mt-4 text-sm">
        フォームが表示されない場合は
        <a
          href="https://form.run/@nasiman-rerack"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline ml-1"
        >
          こちら
        </a>
        を開いてください。
      </p>
    </main>
  );
}

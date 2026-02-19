"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SecretPage() {
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState("正常稼働中");
  const [fakeUsers] = useState(128);
  const [fakePosts] = useState(342);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* 背景グラデーション演出 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-red-900 opacity-40 blur-3xl"></div>

      <div className="relative z-10 max-w-3xl w-full text-center space-y-10">
        
        <h1 className="text-4xl font-black tracking-widest uppercase">
          🕶 ADMIN CONTROL PANEL
        </h1>

        <p className="text-gray-400">
          re!RACKの管理者専用ダッシュボードへようこそ。ここではユーザー管理、投稿管理、システム状態の監視など、様々な管理機能を提供しています。下のボタンから各種操作を行ってください。
        </p>

        {/* ダッシュボード */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-700 shadow-xl">
            <p className="text-sm text-gray-400">👥 総ユーザー数</p>
            <p className="text-3xl font-black mt-2">{fakeUsers}</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-700 shadow-xl">
            <p className="text-sm text-gray-400">📝 総投稿数</p>
            <p className="text-3xl font-black mt-2">{fakePosts}</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-700 shadow-xl">
            <p className="text-sm text-gray-400">⚙️ システム状態</p>
            <p className="text-2xl font-bold mt-2 text-green-400">
              {systemStatus}
            </p>
          </div>

        </div>

        {/* 管理ボタン */}
        <div className="flex flex-wrap gap-4 justify-center mt-10">
          
          <button
            onClick={() => setSystemStatus("メンテナンス中")}
            className="px-6 py-3 bg-red-600 rounded-2xl font-bold hover:bg-red-700 transition active:scale-95"
          >
            🚨 システム停止
          </button>

          <button
            onClick={() => setSystemStatus("正常稼働中")}
            className="px-6 py-3 bg-green-600 rounded-2xl font-bold hover:bg-green-700 transition active:scale-95"
          >
            ✅ システム復旧
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-700 rounded-2xl font-bold hover:bg-gray-600 transition active:scale-95"
          >
            ⬅ ホームへ戻る
          </button>

        </div>

        <div className="mt-12 text-xs text-gray-600 tracking-widest">
          CLASSIFIED LEVEL: 最高機密
        </div>
      </div>
    </div>
  );
}

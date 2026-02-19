"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

interface AdminMenuProps {
  date: string;
  onClose: () => void;
}

export default function AdminMenu({ date, onClose }: AdminMenuProps) {
  const router = useRouter();

  // その日の予定用
  const [homework, setHomework] = useState("");
  const [items, setItems] = useState("");
  const [notice, setNotice] = useState("");
  
  // 運営からのお知らせ用
  const [adminTitle, setAdminTitle] = useState("");
  const [adminContent, setAdminContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // 🔐 管理者コード用
  const [adminCode, setAdminCode] = useState("");

  const ADMIN_CODE = "admin123";
  const SECRET_CODE = "re2026";

  const handleAdminLogin = () => {
    // 【修正】trim() を使って前後に入った不要なスペースを削除してから判定
    const enteredCode = adminCode.trim();

    if (enteredCode === SECRET_CODE) {
      router.push("/secret");
    } else if (enteredCode === ADMIN_CODE) {
      alert("管理者としてログインしました");
    } else {
      alert("コードが異なります");
    }
  };

  // その日の予定を保存する関数
  const saveDailyPost = async () => {
    const { error } = await supabase.from("posts").upsert({
      date,
      homework,
      items,
      notice,
    });
    if (error) alert("保存に失敗しました");
    else alert("その日の予定を更新しました");
  };

  // 運営からのお知らせを投稿する関数
  const publishNotice = async () => {
    if (!adminTitle || !adminContent) return alert("タイトルと内容を入力してください");
    
    setIsPublishing(true);
    const { error } = await supabase.from("notices").insert([
      { title: adminTitle, content: adminContent }
    ]);
    
    if (error) {
      alert("投稿に失敗しました");
    } else {
      alert("全体へのお知らせを投稿しました！");
      setAdminTitle("");
      setAdminContent("");
    }
    setIsPublishing(false);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* その日の予定セクション */}
      <div className="p-6 bg-gray-50 rounded-2xl border-2 border-black">
        <h3 className="font-black mb-4 flex items-center gap-2">
          <span>📅</span> {date} の予定を編集
        </h3>
        <div className="space-y-3">
          <input
            className="w-full p-3 rounded-xl border"
            placeholder="宿題"
            onChange={(e) => setHomework(e.target.value)}
          />
          <input
            className="w-full p-3 rounded-xl border"
            placeholder="持ち物"
            onChange={(e) => setItems(e.target.value)}
          />
          <textarea
            className="w-full p-3 rounded-xl border"
            placeholder="お知らせ"
            onChange={(e) => setNotice(e.target.value)}
          />
          <button
            onClick={saveDailyPost}
            className="w-full py-3 bg-black text-white rounded-xl font-black"
          >
            更新する
          </button>
        </div>
      </div>

      {/* 運営からのお知らせセクション */}
      <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
        <h3 className="font-black text-blue-700 mb-4 flex items-center gap-2">
          <span>📢</span> 運営からのお知らせを投稿
        </h3>
        <div className="space-y-3">
          <input
            className="w-full p-3 rounded-xl border-2 border-blue-100 focus:border-blue-400 outline-none"
            placeholder="お知らせのタイトル"
            value={adminTitle}
            onChange={(e) => setAdminTitle(e.target.value)}
          />
          <textarea
            className="w-full p-3 rounded-xl border-2 border-blue-100 focus:border-blue-400 outline-none min-h-[100px]"
            placeholder="お知らせの詳細内容..."
            value={adminContent}
            onChange={(e) => setAdminContent(e.target.value)}
          />
          <button
            onClick={publishNotice}
            disabled={isPublishing}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition disabled:bg-gray-400"
          >
            {isPublishing ? "投稿中..." : "全体に周知する"}
          </button>
        </div>
      </div>

      {/* 🔐 管理者認証セクション */}
      <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200">
        <h3 className="font-black text-red-600 mb-4 flex items-center gap-2">
          <span>🔐</span> 管理者認証
        </h3>
        <div className="space-y-3">
          <input
            type="password"
            className="w-full p-3 rounded-xl border-2 border-red-100 focus:border-red-400 outline-none"
            placeholder="コードを入力"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            // 【追加】Enterキーを押した際にもログイン処理を実行
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdminLogin();
            }}
          />
          <button
            onClick={handleAdminLogin}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition"
          >
            認証する
          </button>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 text-gray-400 font-bold"
      >
        閉じる
      </button>
    </div>
  );
}
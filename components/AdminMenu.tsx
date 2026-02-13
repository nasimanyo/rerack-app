// components/AdminMenu.tsx
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

interface AdminMenuProps {
  date: string;
  onClose: () => void;
}

export default function AdminMenu({ date, onClose }: AdminMenuProps) {
  // その日の予定用
  const [homework, setHomework] = useState("");
  const [items, setItems] = useState("");
  const [notice, setNotice] = useState("");
  
  // 運営からのお知らせ用
  const [adminTitle, setAdminTitle] = useState("");
  const [adminContent, setAdminContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // その日の予定を保存する関数（既存）
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

  // 運営からのお知らせを投稿する関数（新規）
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
          <input className="w-full p-3 rounded-xl border" placeholder="宿題" onChange={(e) => setHomework(e.target.value)} />
          <input className="w-full p-3 rounded-xl border" placeholder="持ち物" onChange={(e) => setItems(e.target.value)} />
          <textarea className="w-full p-3 rounded-xl border" placeholder="お知らせ" onChange={(e) => setNotice(e.target.value)} />
          <button onClick={saveDailyPost} className="w-full py-3 bg-black text-white rounded-xl font-black">更新する</button>
        </div>
      </div>

      {/* 運営からのお知らせセクション（新規追加） */}
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

      <button onClick={onClose} className="w-full py-3 text-gray-400 font-bold">閉じる</button>
    </div>
  );
}
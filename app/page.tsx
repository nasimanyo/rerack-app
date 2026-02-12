"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import  Calendar  from "../components/Calendar"; 
import { Header } from "../components/Header";
import  AdminMenu  from "../components/AdminMenu";
import { supabase } from "../lib/supabase";

// 付箋（ふせん）の型定義
interface StickyNote {
  id: string;
  text: string;
  color: string;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [post, setPost] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 付箋の状態管理（初期値：空）
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [noteInput, setNoteInput] = useState("");

  // 1. データの取得
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("date", selectedDate)
        .maybeSingle();
      setPost(data || null);
      setLoading(false);
    };
    fetchPost();
  }, [selectedDate]);

  // 2. 卒業式(2026-03-24)までのカウントダウン
  const graduationDate = new Date("2026-03-24");
  const today = new Date();
  const daysToGraduation = differenceInDays(graduationDate, today);

  // 3. 付箋の追加機能
  const addNote = () => {
    if (!noteInput.trim()) return;
    const colors = ["bg-yellow-200", "bg-pink-200", "bg-blue-200", "bg-green-200"];
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      text: noteInput,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setNotes([...notes, newNote]);
    setNoteInput("");
  };

  // 4. 付箋の削除
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-900 pb-20">
      {/* 4. 管理メニュー含むヘッダー */}
      <Header 
        onGoToToday={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="max-w-4xl mx-auto pt-20 px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* --- 左側：1. ホーム(カレンダー)エリア --- */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-blue-600">
            <h2 className="text-lg font-bold text-blue-600 mb-2">📅 卒業式までカウントダウン</h2>
            <div className="flex flex-col items-center py-2 bg-blue-50 rounded-2xl mb-4">
              <p className="text-sm font-bold">今日は {format(new Date(), "M月d日(E)", { locale: ja })}</p>
              <p className="text-2xl font-black text-blue-700">
                卒業式まで あと <span className="text-4xl text-red-500 underline">{daysToGraduation}</span> 日
              </p>
            </div>
            
            <div className="calendar-large">
              <Calendar
                onDateClick={(date: any) => setSelectedDate(format(date.toDate(), "yyyy-MM-dd"))}
              />
            </div>
          </div>
        </div>

        {/* --- 右側：2. 今日の予定表 & 3. 便利ツール --- */}
        <div className="md:col-span-7 space-y-6">
          
          {/* 2. 今日の予定表 */}
          <section className="bg-white rounded-[2rem] shadow-lg p-6 border-2 border-gray-100">
            <h2 className="text-2xl font-black border-b-4 border-yellow-400 pb-2 mb-4 inline-block">
              {format(new Date(selectedDate), "M月d日の予定", { locale: ja })}
            </h2>

            {loading ? (
              <p className="py-10 text-center animate-pulse">確認中...</p>
            ) : post ? (
              <div className="grid grid-cols-1 gap-4 text-lg">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <span className="text-xs font-bold text-blue-500 block">📝 宿題</span>
                  <p className="font-bold">{post.homework || "なし"}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <span className="text-xs font-bold text-green-500 block">🎒 持ち物</span>
                  <p className="font-bold">{post.items || "なし"}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <span className="text-xs font-bold text-orange-500 block">📢 お知らせ</span>
                  <p className="font-bold">{post.notice || "なし"}</p>
                </div>
                {post.comment && (
                  <div className="bg-gray-100 p-4 rounded-xl italic">
                    <span className="text-xs font-bold text-gray-500 block">💬 コメント</span>
                    <p>{post.comment}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                まだ予定がありません
              </div>
            )}
          </section>

          {/* 3. 便利ツール(付箋メモボード) */}
          <section className="bg-[#E2E8F0] rounded-[2rem] p-6 shadow-inner min-h-[300px] relative">
            <h2 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">📌 自由な付箋ボード</h2>
            
            {/* 入力エリア */}
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="メモを記入..."
                className="flex-1 px-4 py-2 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-blue-400"
              />
              <button 
                onClick={addNote}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                貼る
              </button>
            </div>

            {/* 付箋が並ぶ場所 */}
            <div className="flex flex-wrap gap-4">
              {notes.map((note) => (
                <div 
                  key={note.id}
                  className={`${note.color} w-32 h-32 p-3 shadow-md transform rotate-2 hover:rotate-0 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center text-center font-handwritten`}
                  onClick={() => deleteNote(note.id)}
                >
                  <span className="text-sm font-bold text-gray-800 break-words">{note.text}</span>
                  <div className="absolute top-0 right-0 p-1 text-[8px] text-gray-400">× 削除</div>
                </div>
              ))}
            </div>
            {notes.length === 0 && (
              <p className="text-center text-slate-400 mt-10">ここに付箋を貼れます</p>
            )}
          </section>

        </div>
      </main>

      {/* 管理メニュー */}
      {isAdminOpen && (
        <AdminMenu date={selectedDate} onClose={() => setIsAdminOpen(false)} />
      )}
    </div>
  );
}
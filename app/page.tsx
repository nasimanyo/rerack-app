"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import  Calendar  from "../components/Calendar"; 
import { Header } from "../components/Header";
import  AdminMenu  from "../components/AdminMenu";
import { supabase } from "../lib/supabase";

// 付箋の型
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
  const todayDate = new Date();
  const daysToGraduation = differenceInDays(graduationDate, todayDate);

  // 3. 付箋機能
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

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20">
      {/* 4. 管理メニュー含むヘッダー */}
      <Header 
        onGoToToday={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="max-w-6xl mx-auto pt-24 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- 左側：1. ホーム(カレンダー)エリア --- */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-[6px] border-black">
            <div className="mb-6 text-center">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Graduation Countdown</h2>
              <p className="text-lg font-bold">今日は {format(new Date(), "M月d日(E)", { locale: ja })}</p>
              <div className="mt-2 py-3 bg-red-50 rounded-2xl border-2 border-red-100">
                <p className="text-xl font-bold text-gray-800">
                  卒業式まで あと <span className="text-5xl font-black text-red-500 italic">{daysToGraduation}</span> 日
                </p>
              </div>
            </div>
            
            <div className="flex justify-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
              <Calendar
                onDateClick={(date: any) => setSelectedDate(format(date, "yyyy-MM-dd"))}
              />
            </div>
          </div>
        </div>

        {/* --- 右側：2. 今日の予定表 & 3. 便利ツール --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 2. 今日の予定表 */}
          <section className="bg-white rounded-[2.5rem] shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-black text-white px-6 py-2 rounded-full font-black text-xl">
                {format(new Date(selectedDate), "M/d", { locale: ja })}
              </div>
              <h2 className="text-2xl font-black tracking-tighter">
                {format(new Date(selectedDate), "(E) の予定表", { locale: ja })}
              </h2>
            </div>

            {loading ? (
              <div className="py-20 text-center animate-pulse text-gray-300 font-bold">LOADING...</div>
            ) : post ? (
              <div className="space-y-6">
                <div className="group">
                  <span className="text-xs font-black text-blue-500 mb-1 block ml-1 uppercase">📝 宿題</span>
                  <div className="bg-blue-50 p-5 rounded-2xl text-xl font-bold border-2 border-transparent group-hover:border-blue-200 transition-all">
                    {post.homework || "なし"}
                  </div>
                </div>
                <div className="group">
                  <span className="text-xs font-black text-green-500 mb-1 block ml-1 uppercase">🎒 持ち物</span>
                  <div className="bg-green-50 p-5 rounded-2xl text-xl font-bold border-2 border-transparent group-hover:border-green-200 transition-all">
                    {post.items || "なし"}
                  </div>
                </div>
                <div className="group">
                  <span className="text-xs font-black text-orange-500 mb-1 block ml-1 uppercase">📢 お知らせ</span>
                  <div className="bg-orange-50 p-5 rounded-2xl text-xl font-bold border-2 border-transparent group-hover:border-orange-200 transition-all">
                    {post.notice || "なし"}
                  </div>
                </div>
                {post.comment && (
                  <div className="group">
                    <span className="text-xs font-black text-gray-400 mb-1 block ml-1 uppercase">💬 コメント</span>
                    <div className="bg-gray-100 p-5 rounded-2xl text-gray-600 italic border-2 border-transparent group-hover:border-gray-200 transition-all">
                      {post.comment}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-300 font-bold border-4 border-dashed border-gray-100 rounded-[2rem]">
                NO DATA FOUND
              </div>
            )}
          </section>

          {/* 3. 便利ツール(付箋ボード) */}
          <section className="bg-[#E5E7EB] rounded-[2.5rem] p-8 shadow-inner min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em]">Memo Board</h2>
              <div className="text-[10px] bg-white px-3 py-1 rounded-full font-bold text-gray-400 shadow-sm">
                クリックで削除
              </div>
            </div>
            
            <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm">
              <input 
                type="text" 
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="新しい付箋を追加..."
                className="flex-1 px-4 py-2 border-none focus:ring-0 font-bold"
              />
              <button 
                onClick={addNote}
                className="bg-black text-white px-6 py-2 rounded-xl font-black hover:scale-105 transition-transform"
              >
                追加
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {notes.map((note) => (
                <div 
                  key={note.id}
                  onClick={() => deleteNote(note.id)}
                  className={`${note.color} aspect-square p-4 shadow-lg transform rotate-1 hover:rotate-0 hover:scale-110 transition-all cursor-pointer flex items-center justify-center text-center`}
                >
                  <span className="text-sm font-bold text-gray-800 break-words leading-tight">{note.text}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {isAdminOpen && (
        <AdminMenu date={selectedDate} onClose={() => setIsAdminOpen(false)} />
      )}
    </div>
  );
}
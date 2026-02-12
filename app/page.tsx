"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import  Calendar  from "../components/Calendar"; 
import { Header } from "../components/Header";
import  AdminMenu  from "../components/AdminMenu";
import { supabase } from "../lib/supabase";

interface StickyNote {
  id: string;
  text: string;
  color: string;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [post, setPost] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase.from("posts").select("*").eq("date", selectedDate).maybeSingle();
      setPost(data || null);
      setLoading(false);
    };
    fetchPost();
  }, [selectedDate]);

  const daysToGraduation = differenceInDays(new Date("2026-03-24"), new Date());

  const addNote = () => {
    if (!noteInput.trim()) return;
    const colors = ["bg-yellow-100", "bg-pink-100", "bg-blue-100", "bg-green-100"];
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      text: noteInput,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setNotes([...notes, newNote]);
    setNoteInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-20">
      <Header 
        onGoToToday={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="max-w-6xl mx-auto pt-24 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左側：ホーム・カレンダー */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-black">
            <div className="text-center mb-6">
              <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Home</h2>
              <p className="text-lg font-bold mt-1">{format(new Date(), "yyyy年 M月d日(E)", { locale: ja })}</p>
              <div className="mt-4 p-4 bg-red-50 rounded-2xl border-2 border-red-100 inline-block w-full">
                <p className="text-red-600 font-bold text-sm">卒業式まで</p>
                <p className="text-4xl font-black text-red-600 italic">あと {daysToGraduation} 日</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl flex justify-center border border-gray-100 shadow-inner">
              <Calendar
                onDateClick={(date: any) => setSelectedDate(format(date.toDate(), "yyyy-MM-dd"))}
              />
            </div>
          </div>
        </div>

        {/* 右側：予定表 & 付箋 */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 予定表セクション */}
          <section className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span className="bg-black text-white px-3 py-1 rounded-lg text-xl">
                {format(new Date(selectedDate), "M/d", { locale: ja })}
              </span>
              の予定表
            </h2>

            {loading ? (
              <div className="py-10 text-center animate-pulse text-gray-300">読み込み中...</div>
            ) : post ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50 border-l-8 border-blue-500">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">📝 宿題</span>
                  <p className="text-xl font-bold mt-1 whitespace-pre-wrap">{post.homework || "なし"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-green-50 border-l-8 border-green-500">
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest">🎒 持ち物</span>
                  <p className="text-xl font-bold mt-1 whitespace-pre-wrap">{post.items || "なし"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-orange-50 border-l-8 border-orange-500">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">📢 お知らせ</span>
                  <p className="text-xl font-bold mt-1 whitespace-pre-wrap">{post.notice || "なし"}</p>
                </div>
                {post.comment && (
                  <div className="p-4 rounded-2xl bg-gray-50 border-l-8 border-gray-400">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">💬 コメント</span>
                    <p className="text-gray-600 mt-1 italic">{post.comment}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center border-4 border-dashed border-gray-100 rounded-3xl text-gray-300 font-bold">
                予定はありません
              </div>
            )}
          </section>

          {/* 付箋ボードセクション */}
          <section className="bg-slate-200 rounded-3xl p-8 min-h-[350px] shadow-inner relative">
            <h2 className="text-sm font-black text-slate-500 mb-4 tracking-widest uppercase">Sticky Notes Board</h2>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="付箋に書く..."
                className="flex-1 px-4 py-3 rounded-xl border-none shadow-md font-bold focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={addNote} className="bg-black text-white px-6 py-3 rounded-xl font-black hover:scale-105 transition shadow-lg">追加</button>
            </div>

            <div className="flex flex-wrap gap-4">
              {notes.map((note) => (
                <div 
                  key={note.id}
                  onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                  className={`${note.color} w-32 h-32 p-3 shadow-xl transform rotate-1 hover:rotate-0 transition-all cursor-pointer flex items-center justify-center text-center font-bold border-b-4 border-black/10`}
                >
                  <p className="text-sm text-gray-800 break-all">{note.text}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {isAdminOpen && <AdminMenu date={selectedDate} onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}
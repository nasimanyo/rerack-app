"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import Calendar from "../components/Calendar"; 
import { Header } from "../components/Header";
import AdminMenu from "../components/AdminMenu";
import { supabase } from "../lib/supabase";

interface StickyNote {
  id: string;
  text: string;
  color: string;
}

type TabType = "home" | "homework" | "admin";

export default function Home() {
  // 基本的な状態管理
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [noteInput, setNoteInput] = useState("");

  // データの取得
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase.from("posts").select("*").eq("date", selectedDate).maybeSingle();
      setPost(data || null);
      setLoading(false);
    };
    fetchPost();
  }, [selectedDate]);

  // 卒業式カウントダウン
  const daysToGraduation = differenceInDays(new Date("2026-03-24"), new Date());

  // 日付変更（矢印用）
  const changeDate = (amount: number) => {
    const newDate = amount > 0 ? addDays(new Date(selectedDate), 1) : subDays(new Date(selectedDate), 1);
    setSelectedDate(format(newDate, "yyyy-MM-dd"));
  };

  // 付箋追加
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 font-sans">
      {/* 共通ヘッダー */}
      <Header 
        onGoToToday={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
        onOpenAdmin={() => setActiveTab("admin")}
      />

      {/* タブ切り替えボタン */}
      <div className="max-w-md mx-auto pt-24 px-4">
        <div className="flex bg-white p-1 rounded-2xl shadow-md border border-gray-100">
          <button onClick={() => setActiveTab("home")} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === "home" ? "bg-black text-white shadow-lg" : "text-gray-400"}`}>🏠 ホーム</button>
          <button onClick={() => setActiveTab("homework")} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === "homework" ? "bg-black text-white shadow-lg" : "text-gray-400"}`}>📝 宿題</button>
          <button onClick={() => setActiveTab("admin")} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === "admin" ? "bg-black text-white shadow-lg" : "text-gray-400"}`}>⚙️ 管理</button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        
        {/* --- 1. ホームタブ --- */}
        {activeTab === "home" && (
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-[6px] border-black text-center animate-in fade-in zoom-in duration-300">
            <h1 className="text-2xl font-black text-gray-400 tracking-[0.3em] uppercase mb-4">re!RACK</h1>
            <p className="text-lg font-bold">今日は {format(new Date(), "yyyy年 M月d日(E)", { locale: ja })}</p>
            <div className="mt-8 p-10 bg-red-50 rounded-[2.5rem] border-4 border-red-100">
              <p className="text-red-500 font-black text-xl mb-2 italic">卒業まで あと</p>
              <p className="text-[8rem] leading-none font-black text-red-600 italic">
                {daysToGraduation}<span className="text-4xl not-italic ml-2 text-red-400">日</span>
              </p>
            </div>
          </div>
        )}

        {/* --- 2. 宿題タブ --- */}
        {activeTab === "homework" && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* 日付ナビゲーション */}
            <div className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-between border-2 border-black">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-2xl">⬅️</button>
              <div className="text-center">
                <p className="text-xs font-black text-gray-400 uppercase">Selected Date</p>
                <p className="text-xl font-black">{format(new Date(selectedDate), "M月d日 (E)", { locale: ja })}</p>
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-full text-2xl">➡️</button>
            </div>

            {/* 予定内容 */}
            <section className="bg-white rounded-[2.5rem] shadow-lg p-8 border border-gray-100">
              {loading ? (
                <div className="py-20 text-center animate-pulse text-gray-300 font-black text-2xl tracking-tighter">LOADING...</div>
              ) : post ? (
                <div className="grid gap-4">
                  <div className="p-6 rounded-2xl bg-blue-50 border-l-8 border-blue-500">
                    <span className="text-xs font-black text-blue-500 uppercase mb-1 block">📝 宿題</span>
                    <p className="text-2xl font-bold">{post.homework || "なし"}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-50 border-l-8 border-green-500">
                    <span className="text-xs font-black text-green-500 uppercase mb-1 block">🎒 持ち物</span>
                    <p className="text-2xl font-bold">{post.items || "なし"}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-orange-50 border-l-8 border-orange-500">
                    <span className="text-xs font-black text-orange-500 uppercase mb-1 block">📢 お知らせ</span>
                    <p className="text-2xl font-bold">{post.notice || "なし"}</p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center border-4 border-dashed border-gray-100 rounded-[2rem] text-gray-300 font-bold">
                  予定が登録されていません
                </div>
              )}
            </section>
          </div>
        )}

        {/* --- 3. 管理タブ --- */}
        {activeTab === "admin" && (
          <div className="animate-in slide-in-from-bottom duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-dashed border-gray-200">
              <h2 className="text-xl font-black mb-6 text-center text-gray-400">DATE SELECT & EDIT</h2>
              <div className="flex justify-center bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8 overflow-x-auto">
                <Calendar 
                  onDateClick={(date: any) => {
                    const d = typeof date.format === 'function' ? date.format("YYYY-MM-DD") : format(date, "yyyy-MM-dd");
                    setSelectedDate(d);
                  }}
                />
              </div>
              <AdminMenu date={selectedDate} onClose={() => setActiveTab("homework")} />
            </div>
          </div>
        )}

        {/* 共通：便利ツール（付箋ボード） */}
        <section className="mt-12 bg-slate-200 rounded-[2.5rem] p-8 min-h-[300px] shadow-inner border border-slate-300">
          <h2 className="text-sm font-black text-slate-500 mb-4 tracking-[0.3em] uppercase text-center">Sticky Notes Memo</h2>
          <div className="flex gap-2 mb-8 max-w-md mx-auto bg-white p-2 rounded-2xl shadow-md">
            <input 
              type="text" 
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="メモを入力..."
              className="flex-1 px-4 py-2 border-none font-bold outline-none"
            />
            <button onClick={addNote} className="bg-black text-white px-6 py-2 rounded-xl font-black active:scale-95 transition">貼る</button>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {notes.map((note) => (
              <div key={note.id} onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className={`${note.color} w-32 h-32 p-3 shadow-xl transform rotate-2 hover:rotate-0 transition-all cursor-pointer flex items-center justify-center text-center font-bold border-b-4 border-black/10 active:scale-90`}>
                <p className="text-sm text-gray-800 break-all leading-tight">{note.text}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
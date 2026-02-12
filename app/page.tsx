"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
// あなたのファイル配置に合わせてパスを修正しました
import Calendar from "../components/Calendar";
import { Header } from "../components/Header";
import AdminMenu from "../components/AdminMenu";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [post, setPost] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("posts")
          .select("*")
          .eq("date", selectedDate)
          .maybeSingle();
        setPost(data || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [selectedDate]);

  const daysLeft = Math.ceil(
    (new Date("2026-03-24").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header 
        onGoToToday={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="max-w-md mx-auto pt-20 pb-10 px-4 space-y-6">
        {/* カウントダウン */}
        <div className="text-center bg-blue-600 rounded-2xl py-4 shadow-lg">
          <p className="text-white font-medium">
            3月24日まで あと <span className="text-3xl font-black italic">{daysLeft}</span> 日
          </p>
        </div>

        {/* カレンダー */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <Calendar
            onDateClick={(date: any) => {
              setSelectedDate(format(date.toDate(), "yyyy-MM-dd"));
            }}
          />
        </div>

        {/* 日付表示 */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter">
            {format(new Date(selectedDate), "M/d", { locale: ja })}
            <span className="text-lg ml-1 font-bold text-blue-600">
              ({format(new Date(selectedDate), "E", { locale: ja })})
            </span>
          </h2>
        </div>

        {/* 宿題・連絡・持ち物（Cardを使わず標準のdivで作成） */}
        <section className="space-y-4">
          {loading ? (
            <p className="text-center py-10 text-gray-400">読み込み中...</p>
          ) : post ? (
            <>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
                <h3 className="text-xs font-bold text-blue-500 mb-2 uppercase tracking-widest">📝 今日の宿題</h3>
                <p className="font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">{post.homework || "なし"}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-orange-500">
                <h3 className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-widest">📢 連絡事項</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.notice || "なし"}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-500">
                <h3 className="text-xs font-bold text-green-500 mb-2 uppercase tracking-widest">🎒 持ち物</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.items || "なし"}</p>
              </div>
            </>
          ) : (
            <div className="py-20 text-center bg-gray-100/50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">この日の予定は未登録です</p>
            </div>
          )}
        </section>
      </main>

      {isAdminOpen && (
        <AdminMenu date={selectedDate} onClose={() => setIsAdminOpen(false)} />
      )}
    </div>
  );
}
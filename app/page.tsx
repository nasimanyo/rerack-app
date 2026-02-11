'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import Calendar from '../components/Calendar';
import PostDetail from '../components/PostDetail';
import AdminMenu from '../components/AdminMenu';

export default function Home() {
  const [selected, setSelected] = useState<{date: dayjs.Dayjs, post: any} | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const calculateCountdown = () => {
      const target = dayjs('2026-03-24');
      const today = dayjs().startOf('day');
      const diff = target.diff(today, 'day');
      
      if (diff > 0) setCountdown(`3月24日まで あと ${diff}日`);
      else if (diff === 0) setCountdown('本日、3月24日です');
      else setCountdown('3月24日は終了しました');
    };
    calculateCountdown();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] pb-24 text-slate-900">
      <header className="pt-24 pb-16 text-center px-6">
        <h1 className="text-7xl font-black tracking-tighter mb-6">re!RACK</h1>
        <p className="text-xs font-bold text-blue-500 tracking-[0.3em] uppercase opacity-80 mb-6">{countdown}</p>
        <div className="w-16 h-[1px] bg-slate-200 mx-auto"></div>
      </header>

      <div className="max-w-lg mx-auto px-4">
        <Calendar onDateClick={(date, post) => setSelected({ date, post })} />
      </div>

      {selected && (
        <PostDetail selectedDate={selected.date} post={selected.post} onClose={() => setSelected(null)} />
      )}

      {showAdmin && <AdminMenu onClose={() => setShowAdmin(false)} />}

      <button onClick={() => setShowAdmin(true)} className="fixed bottom-10 right-10 px-8 py-4 bg-white shadow-xl border border-slate-100 rounded-full text-xs font-black tracking-widest text-slate-400 hover:text-slate-900 transition-all z-40">
        ADMIN MENU
      </button>
    </main>
  );
}
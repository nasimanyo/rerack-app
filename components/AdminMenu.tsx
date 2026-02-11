import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { supabase } from '../lib/supabase';

const AdminMenu = ({ onClose }: { onClose: () => void }) => {
  const [pw, setPw] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ homework: '', notice: '', items: '', is_important: false });

  useEffect(() => {
    if (isAuth) {
      const loadData = async () => {
        const { data } = await supabase.from('posts').select('*').eq('date', date).single();
        if (data) setForm({ homework: data.homework || '', notice: data.notice || '', items: data.items || '', is_important: data.is_important });
        else setForm({ homework: '', notice: '', items: '', is_important: false });
      };
      loadData();
    }
  }, [date, isAuth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === 'admin') setIsAuth(true);
    else alert('パスワードが違います');
  };

  const save = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('posts').upsert({ date, ...form });
    setIsSaving(false);
    if (error) alert('保存に失敗しました');
    else {
      onClose();
      window.location.reload();
    }
  };

  if (!isAuth) return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur flex items-center justify-center p-6 z-[60]">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">管理者ログイン</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded outline-none focus:border-slate-400 transition text-sm font-medium" placeholder="パスワードを入力" autoFocus />
          <button className="w-full bg-slate-900 text-white py-3 rounded font-bold hover:bg-slate-800 transition">ログイン</button>
          <button type="button" onClick={onClose} className="w-full text-slate-400 text-sm font-medium">キャンセル</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 overflow-y-auto z-[60]">
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col shadow-xl bg-white">
        <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="font-bold text-slate-800">内容の編集</h2>
          <div className="flex gap-4">
            <button onClick={onClose} className="text-slate-400 text-sm font-bold">戻る</button>
            <button onClick={save} disabled={isSaving} className={`px-6 py-2 rounded font-bold text-sm transition ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}>
              {isSaving ? '保存中...' : '更新'}
            </button>
          </div>
        </header>
        <main className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">対象日</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-slate-50 border-none rounded font-bold outline-none focus:ring-1 focus:ring-slate-200" />
            </div>
            <div className="flex items-end">
              <label className={`flex items-center gap-3 w-full p-3 border rounded cursor-pointer transition ${form.is_important ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-transparent'}`}>
                <input type="checkbox" checked={form.is_important} onChange={(e) => setForm({...form, is_important: e.target.checked})} className="w-4 h-4 accent-red-600" />
                <span className={`text-sm font-bold ${form.is_important ? 'text-red-700' : 'text-slate-500'}`}>重要マークをつける</span>
              </label>
            </div>
          </div>
          <div className="space-y-6">
            <EditSection label="宿題" value={form.homework} onChange={(v: string) => setForm({...form, homework: v})} />
            <EditSection label="連絡" value={form.notice} onChange={(v: string) => setForm({...form, notice: v})} />
            <EditSection label="持ち物" value={form.items} placeholder="例: 水筒, タオル (カンマで区切る)" onChange={(v: string) => setForm({...form, items: v})} />
          </div>
        </main>
      </div>
    </div>
  );
};

const EditSection = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</label>
    <textarea placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded min-h-[120px] outline-none focus:ring-1 focus:ring-slate-200 font-medium text-slate-700" />
  </div>
);

export default AdminMenu;
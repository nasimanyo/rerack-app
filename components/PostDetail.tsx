import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { supabase } from '../lib/supabase';

const PostDetail = ({ selectedDate, post, onClose }: { selectedDate: dayjs.Dayjs, post: any, onClose: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const dateStr = selectedDate.format('YYYY-MM-DD');

  const items = post?.items ? post.items.split(/[\n,、]+/).filter((i: string) => i.trim() !== "") : [];

  // メッセージの取得
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('post_date', dateStr)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();
  }, [dateStr]);

  // メッセージの送信
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !newMsg) return;

    const { error } = await supabase.from('messages').insert([
      { post_date: dateStr, user_name: userName, content: newMsg }
    ]);

    if (!error) {
      setNewMsg('');
      // 再読み込み
      const { data } = await supabase.from('messages').select('*').eq('post_date', dateStr).order('created_at', { ascending: true });
      if (data) setMessages(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md h-[85vh] rounded-2xl shadow-2xl relative flex flex-col animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 z-10">✕</button>
        
        {/* 上部：予定の詳細 */}
        <div className="p-8 overflow-y-auto border-b border-slate-50 flex-shrink-0">
          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mb-1 uppercase">Schedule</p>
            <h3 className="text-2xl font-bold text-slate-800">{selectedDate.format('M月D日 (ddd)')}</h3>
          </div>

          {!post ? (
            <p className="text-slate-400 text-sm font-medium py-4 text-center">予定なし</p>
          ) : (
            <div className="space-y-6">
              {post.is_important && <div className="bg-red-50 text-red-600 px-3 py-1 rounded text-[10px] font-bold inline-block">重要</div>}
              <Section label="宿題" content={post.homework} />
              <Section label="連絡" content={post.notice} />
              {items.length > 0 && (
                 <div className="flex flex-wrap gap-2 pt-2">
                   {items.map((item: string, i: number) => (
                     <span key={i} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">{item}</span>
                   ))}
                 </div>
              )}
            </div>
          )}
        </div>

        {/* 下部：チャットエリア */}
        <div className="flex-grow flex flex-col min-h-0 bg-slate-50/50">
          <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
             <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Chat</span>
          </div>

          {/* メッセージ一覧 */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && <p className="text-center text-[10px] text-slate-300 py-10">メッセージはまだありません</p>}
            {messages.map((m) => (
              <div key={m.id} className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-800">{m.user_name}</span>
                  <span className="text-[8px] text-slate-300">{dayjs(m.created_at).format('HH:mm')}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 inline-block max-w-[90%]">
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* 入力フォーム */}
          <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 space-y-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="なまえ" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                className="w-1/3 text-xs p-2 bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-slate-200"
              />
              <input 
                type="text" 
                placeholder="メッセージを入力..." 
                value={newMsg} 
                onChange={(e) => setNewMsg(e.target.value)}
                className="w-2/3 text-xs p-2 bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-slate-200"
              />
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">送る</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Section = ({ label, content }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase">{label}</label>
    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{content || 'なし'}</p>
  </div>
);

export default PostDetail;
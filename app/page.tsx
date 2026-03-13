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

interface Notice {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

// re!Room types (localStorage)
interface Room {
  id: string;
  name: string;
  pw: string | null;
  createdAt: number;
  createdBy: string;
}
const ROOMS_KEY = "reroom_rooms";
const MSGS_KEY  = "reroom_msgs";
function getRooms(): Room[] {
  try { return JSON.parse(localStorage.getItem(ROOMS_KEY) || "[]"); } catch { return []; }
}
function setRoomsStorage(r: Room[]) { localStorage.setItem(ROOMS_KEY, JSON.stringify(r)); }
function getMsgsStorage(): unknown[] {
  try { return JSON.parse(localStorage.getItem(MSGS_KEY) || "[]"); } catch { return []; }
}
function setMsgsStorage(m: unknown[]) { localStorage.setItem(MSGS_KEY, JSON.stringify(m)); }

type TabType = "home" | "homework" | "admin";

export default function Home() {
  // --- 状態管理 ---
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 管理者認証
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // 付箋
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [noteInput, setNoteInput] = useState("");

  // 運営からのお知らせ
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // re!Room 管理
  const [rooms, setRooms] = useState<Room[]>([]);
  const [deleteTargetRoom, setDeleteTargetRoom] = useState<Room | null>(null);
  const [showRoomDeleteConfirm, setShowRoomDeleteConfirm] = useState(false);

  // --- データ取得：お知らせ ---
  useEffect(() => {
    const fetchNotices = async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setNotices(data);
        setUnreadCount(data.length > 0 ? 1 : 0);
      }
    };
    fetchNotices();
  }, []);

  // --- データ取得：宿題内容 ---
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase.from("posts").select("*").eq("date", selectedDate).maybeSingle();
      setPost(data || null);
      setLoading(false);
    };
    fetchPost();
  }, [selectedDate]);

  // 管理タブを開いたときにルーム一覧を同期
  useEffect(() => {
    if (activeTab === "admin" && isAdminAuthenticated) {
      setRooms(getRooms());
    }
  }, [activeTab, isAdminAuthenticated]);

  // 卒業カウントダウン計算
  const daysToGraduation = differenceInDays(new Date("2026-03-24"), new Date());

  // --- ハンドラー ---
  const changeDate = (amount: number) => {
    const newDate = amount > 0 ? addDays(new Date(selectedDate), 1) : subDays(new Date(selectedDate), 1);
    setSelectedDate(format(newDate, "yyyy-MM-dd"));
  };

  const handleAdminLogin = () => {
    const code = passwordInput.trim();

    // 🔐 管理者ログイン
    if (code === "Nasi-man-yo1209") {
      setIsAdminAuthenticated(true);
      setRooms(getRooms());
      return;
    }

    // 🕶 Secretページへ
    if (code === "re2026") {
      window.location.href = "/secret";
      return;
    }

    // ❌ それ以外
    alert("パスワードが違います");
    setPasswordInput("");
  };

  // re!Room: ルーム削除
  const openRoomDelete = (room: Room) => {
    setDeleteTargetRoom(room);
    setShowRoomDeleteConfirm(true);
  };

  const confirmRoomDelete = () => {
    if (!deleteTargetRoom) return;
    const updatedRooms = getRooms().filter(r => r.id !== deleteTargetRoom.id);
    const updatedMsgs  = getMsgsStorage().filter((m: any) => m.roomId !== deleteTargetRoom.id);
    setRoomsStorage(updatedRooms);
    setMsgsStorage(updatedMsgs);
    setRooms(updatedRooms);
    setShowRoomDeleteConfirm(false);
    setDeleteTargetRoom(null);
  };

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
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 font-sans relative">
      
      {/* 🔔 通知ボタン */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <div className="relative">
          <button 
            onClick={() => setIsNoticeOpen(!isNoticeOpen)}
            className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition active:scale-90"
          >
            <span className="text-xl">🔔</span>
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* 📋 お知らせモーダル */}
      {isNoticeOpen && (
        <div className="fixed top-20 right-6 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-4 duration-200">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-black text-sm text-gray-500 tracking-widest uppercase">Notices</h3>
            <button onClick={() => setUnreadCount(0)} className="text-[10px] bg-black text-white px-2 py-1 rounded-lg font-bold">
              既読にする
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto font-sans">
            {notices.length > 0 ? notices.map((notice) => (
              <div key={notice.id} className="p-4 border-b border-gray-50 hover:bg-blue-50 transition">
                <p className="text-[10px] text-gray-400 font-bold mb-1">{format(new Date(notice.created_at), "yyyy/MM/dd")}</p>
                <h4 className="font-bold text-sm mb-1">{notice.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
              </div>
            )) : (
              <p className="p-8 text-center text-xs text-gray-400">お知らせはありません</p>
            )}
          </div>
          <button onClick={() => setIsNoticeOpen(false)} className="w-full py-3 text-xs font-bold text-gray-400 hover:text-black">閉じる</button>
        </div>
      )}

      <Header 
        onGoToToday={() => { setSelectedDate(format(new Date(), "yyyy-MM-dd")); setActiveTab("home"); }}
        onOpenAdmin={() => setActiveTab("admin")}
        onOpenHomework={() => setActiveTab("homework")}
      />

      {/* 📱 タブナビゲーション */}
      <div className="max-w-md mx-auto pt-24 px-4">
        <div className="flex bg-white p-1 rounded-2xl shadow-md border border-gray-100 font-sans">
          <button onClick={() => setActiveTab("home")} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === "home" ? "bg-black text-white shadow-lg" : "text-gray-400"}`}>🏠 ホーム</button>
          <button onClick={() => setActiveTab("homework")} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === "homework" ? "bg-black text-white shadow-lg" : "text-gray-400"}`}>📝 宿題</button>
          <button onClick={() => setActiveTab("admin")} className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === "admin" ? "bg-black text-white shadow-lg" : "text-gray-400"}`}>⚙️ 管理</button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        
        {/* --- 1. ホームタブ --- */}
        {activeTab === "home" && (
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-[6px] border-black text-center animate-in fade-in zoom-in duration-300">
            <h1 className="text-3xl font-serif font-bold text-gray-500 tracking-[0.3em] uppercase mb-4 italic">re!RACK</h1>
            <p className="text-lg font-bold font-sans">今日は {format(new Date(), "yyyy年 M月d日(E)", { locale: ja })}</p>
            <div className="mt-8 p-10 bg-red-50 rounded-[2.5rem] border-4 border-red-100">
              <p className="text-red-500 font-serif font-bold text-2xl mb-2 italic">卒業まで あと</p>
              <p className="text-[10rem] leading-none font-serif font-black text-red-600 italic">
                {daysToGraduation}<span className="text-4xl not-italic ml-2 text-red-400 font-sans">日</span>
              </p>
            </div>
          </div>
        )}

        {/* --- 2. 宿題タブ --- */}
        {activeTab === "homework" && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-between border-2 border-black">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-2xl">⬅️</button>
              <div className="text-center font-sans">
                <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Selected Date</p>
                <p className="text-xl font-black">{format(new Date(selectedDate), "M月d日 (E)", { locale: ja })}</p>
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-full text-2xl">➡️</button>
            </div>

            <section className="bg-white rounded-[2.5rem] shadow-lg p-8 border border-gray-100 font-sans">
              {loading ? (
                <div className="py-20 text-center animate-pulse text-gray-300 font-black text-2xl tracking-tighter">LOADING...</div>
              ) : post ? (
                <div className="grid gap-4">
                  <div className="p-6 rounded-2xl bg-blue-50 border-l-8 border-blue-500 transition-transform hover:scale-[1.01]">
                    <span className="text-xs font-black text-blue-500 uppercase mb-1 block">📝 宿題</span>
                    <p className="text-2xl font-bold whitespace-pre-wrap">{post.homework || "なし"}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-50 border-l-8 border-green-500 transition-transform hover:scale-[1.01]">
                    <span className="text-xs font-black text-green-500 uppercase mb-1 block">🎒 持ち物</span>
                    <p className="text-2xl font-bold whitespace-pre-wrap">{post.items || "なし"}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-orange-50 border-l-8 border-orange-500 transition-transform hover:scale-[1.01]">
                    <span className="text-xs font-black text-orange-500 uppercase mb-1 block">📢 お知らせ</span>
                    <p className="text-2xl font-bold whitespace-pre-wrap">{post.notice || "なし"}</p>
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
            {!isAdminAuthenticated ? (
              <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border-4 border-black text-center max-w-md mx-auto font-sans">
                <span className="text-4xl mb-4 block">🔒</span>
                <h2 className="text-xl font-black mb-6">管理者認証</h2>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  placeholder="パスワードを入力"
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 mb-4 text-center font-bold focus:border-black outline-none"
                />
                <button onClick={handleAdminLogin} className="w-full py-4 bg-black text-white rounded-2xl font-black shadow-lg hover:bg-gray-800 active:scale-95 transition">
                  認証する
                </button>
              </div>
            ) : (
              <div className="space-y-6">

                {/* 既存の宿題編集エリア */}
                <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-dashed border-gray-200 relative font-sans">
                  <button onClick={() => setIsAdminAuthenticated(false)} className="absolute top-4 right-6 text-xs font-bold text-gray-400 hover:text-red-500 transition">ログアウト</button>
                  <h2 className="text-xl font-black mb-6 text-center text-gray-400 uppercase tracking-widest">Date select & Edit</h2>
                  
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8 max-w-md mx-auto shadow-inner flex justify-center">
                    <div className="w-full min-w-[320px]">
                      <Calendar 
                        onDateClick={(date: any) => {
                          const d = typeof date.format === 'function' ? date.format("YYYY-MM-DD") : format(date, "yyyy-MM-dd");
                          setSelectedDate(d);
                        }}
                      />
                    </div>
                  </div>

                  <AdminMenu date={selectedDate} onClose={() => setActiveTab("homework")} />
                </div>

                {/* ══ re!Room ルーム管理 ══ */}
                <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-dashed border-red-100 font-sans">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-black text-gray-800">💬 re!Room 管理</h2>
                      <p className="text-xs text-gray-400 font-bold mt-1">ルームの削除ができます</p>
                    </div>
                    <button
                      onClick={() => setRooms(getRooms())}
                      className="text-xs font-bold text-gray-400 hover:text-black border border-gray-200 px-3 py-2 rounded-xl transition hover:bg-gray-50"
                    >
                      🔄 更新
                    </button>
                  </div>

                  {rooms.length === 0 ? (
                    <div className="py-16 text-center border-4 border-dashed border-gray-100 rounded-[2rem] text-gray-300 font-bold">
                      ルームがありません
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rooms.map(room => {
                        const msgCount = getMsgsStorage().filter((m: any) => m.roomId === room.id).length;
                        return (
                          <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-gray-800 truncate">
                                  # {room.name}
                                </span>
                                {room.pw && (
                                  <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                                    🔒 鍵あり
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] text-gray-400 font-bold">
                                  作成者: {room.createdBy}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {msgCount}件のメッセージ
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => openRoomDelete(room)}
                              className="ml-4 flex-shrink-0 px-4 py-2 bg-red-50 text-red-500 font-black text-xs rounded-xl border border-red-200 hover:bg-red-100 active:scale-95 transition"
                            >
                              🗑 削除
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* --- 📌 付箋ボード --- */}
        <section className="mt-12 bg-slate-200 rounded-[2.5rem] p-8 min-h-[300px] shadow-inner border border-slate-300 font-sans">
          <h2 className="text-sm font-black text-slate-500 mb-4 tracking-[0.3em] uppercase text-center">Sticky Notes Board</h2>
          <div className="flex gap-2 mb-8 max-w-md mx-auto bg-white p-2 rounded-2xl shadow-md">
            <input 
              type="text" 
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="メモを貼る..."
              className="flex-1 px-4 py-2 border-none font-bold outline-none"
            />
            <button onClick={addNote} className="bg-black text-white px-6 py-2 rounded-xl font-black shadow-lg active:scale-95 transition">貼る</button>
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

      {/* ══ ルーム削除確認モーダル ══ */}
      {showRoomDeleteConfirm && deleteTargetRoom && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRoomDeleteConfirm(false); }}
        >
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm border-4 border-red-100 animate-in zoom-in duration-200">
            <span className="text-4xl block text-center mb-4">🗑</span>
            <h3 className="text-lg font-black text-center mb-2">ルームを削除</h3>
            <p className="text-sm text-gray-600 text-center mb-1">
              「<strong>{deleteTargetRoom.name}</strong>」を削除しますか？
            </p>
            <p className="text-xs text-red-500 font-bold text-center mb-6">
              ※ ルーム内のメッセージもすべて削除されます
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRoomDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-black text-gray-500 hover:bg-gray-50 transition"
              >
                キャンセル
              </button>
              <button
                onClick={confirmRoomDelete}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black shadow-lg hover:bg-red-600 active:scale-95 transition"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

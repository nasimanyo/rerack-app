"use client";

import { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import Calendar from "../components/Calendar";
import { Header } from "../components/Header";
import AdminMenu from "../components/AdminMenu";
import { supabase } from "../lib/supabase";

// ─── 定数 ────────────────────────────────────────────────
const GRADUATION_DATE = new Date("2026-03-24"); // 小学校卒業日

// ─── 型定義 ──────────────────────────────────────────────
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

interface Todo {
  id: string;
  text: string;
  done: boolean;
  subject: string;
}

type TabType = "home" | "homework" | "admin" | "tools";

// ─── 科目カラー ──────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  国語: "bg-red-100 text-red-700 border-red-200",
  数学: "bg-blue-100 text-blue-700 border-blue-200",
  英語: "bg-green-100 text-green-700 border-green-200",
  理科: "bg-purple-100 text-purple-700 border-purple-200",
  社会: "bg-yellow-100 text-yellow-700 border-yellow-200",
  音楽: "bg-pink-100 text-pink-700 border-pink-200",
  美術: "bg-orange-100 text-orange-700 border-orange-200",
  体育: "bg-teal-100 text-teal-700 border-teal-200",
  技術: "bg-indigo-100 text-indigo-700 border-indigo-200",
  家庭: "bg-rose-100 text-rose-700 border-rose-200",
  その他: "bg-gray-100 text-gray-700 border-gray-200",
};

const SUBJECTS = Object.keys(SUBJECT_COLORS);

// ─── 時間割デフォルト ────────────────────────────────────
const DEFAULT_TIMETABLE: Record<string, string[]> = {
  月: ["国語", "数学", "英語", "理科", "社会", "体育"],
  火: ["数学", "英語", "理科", "社会", "音楽", "国語"],
  水: ["英語", "理科", "社会", "国語", "数学", "美術"],
  木: ["理科", "社会", "国語", "数学", "英語", "技術"],
  金: ["社会", "国語", "数学", "英語", "理科", "家庭"],
};

// ─── 花びら ──────────────────────────────────────────────
function CherryBlossom() {
  const petals = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 4 + Math.random() * 6,
    size: 8 + Math.random() * 16,
    color: ["#ffb7c5", "#ffc8d4", "#ff91a7", "#ffcdd6", "#ffa0b4"][
      Math.floor(Math.random() * 5)
    ],
    rotate: Math.random() * 360,
    drift: (Math.random() - 0.5) * 200,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes petalFall {
          0% { transform: translateY(-20px) rotate(0deg) translateX(0px); opacity: 1; }
          50% { opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(720deg) translateX(var(--drift)); opacity: 0; }
        }
        .petal {
          position: absolute;
          top: -20px;
          animation: petalFall var(--duration) var(--delay) ease-in infinite;
          will-change: transform;
        }
      `}</style>
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            "--delay": `${p.delay}s`,
            "--duration": `${p.duration}s`,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            style={{ transform: `rotate(${p.rotate}deg)` }}
          >
            <ellipse cx="12" cy="12" rx="6" ry="10" fill={p.color} opacity="0.85" />
            <ellipse
              cx="12"
              cy="12"
              rx="10"
              ry="6"
              fill={p.color}
              opacity="0.6"
              transform="rotate(45 12 12)"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ─── 次のテスト計算 ──────────────────────────────────────
function getNextTest(today: Date) {
  const y = today.getFullYear();
  const tests = [
    { name: "1学期中間テスト", date: new Date(`${y}-05-20`) },
    { name: "1学期期末テスト", date: new Date(`${y}-07-08`) },
    { name: "2学期中間テスト", date: new Date(`${y}-09-30`) },
    { name: "2学期期末テスト", date: new Date(`${y}-11-25`) },
    { name: "3学期期末テスト", date: new Date(`${y + 1}-02-17`) },
    { name: "1学期中間テスト", date: new Date(`${y + 1}-05-20`) },
  ];
  return tests.find((t) => t.date > today) || null;
}

// ─── 勉強タイマー ────────────────────────────────────────
function StudyTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"stopwatch" | "pomodoro">("stopwatch");
  const [pomodoroLeft, setPomodoroLeft] = useState(25 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (mode === "stopwatch") {
          setSeconds((s) => s + 1);
        } else {
          setPomodoroLeft((p) => {
            if (p <= 1) {
              setRunning(false);
              return 25 * 60;
            }
            return p - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setSeconds(0);
    setPomodoroLeft(25 * 60);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const display = mode === "stopwatch" ? fmt(seconds) : fmt(pomodoroLeft);
  const progress =
    mode === "pomodoro" ? ((25 * 60 - pomodoroLeft) / (25 * 60)) * 100 : null;

  return (
    <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-100 p-5">
      <h2 className="font-black text-gray-800 mb-4">⏱ 勉強タイマー</h2>
      <div className="flex gap-2 mb-4">
        {(["stopwatch", "pomodoro"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${
              mode === m ? "bg-black text-white border-black" : "border-gray-200 text-gray-500"
            }`}
          >
            {m === "stopwatch" ? "⏱ ストップウォッチ" : "🍅 ポモドーロ"}
          </button>
        ))}
      </div>
      {mode === "pomodoro" && (
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div
            className="bg-red-400 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div className="text-center mb-4">
        <span className="text-5xl font-black text-gray-800 tabular-nums">{display}</span>
        {mode === "pomodoro" && (
          <p className="text-xs text-gray-400 mt-1 font-bold">25分集中 → 5分休憩</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className={`flex-1 py-2.5 rounded-xl font-black text-sm ${
            running ? "bg-orange-400 text-white" : "bg-black text-white"
          }`}
        >
          {running ? "⏸ 一時停止" : "▶ スタート"}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 font-black text-sm text-gray-500"
        >
          リセット
        </button>
      </div>
    </div>
  );
}

// ─── 成績記録 ────────────────────────────────────────────
function GradeTracker() {
  const [grades, setGrades] = useState<
    { id: string; subject: string; score: number; maxScore: number; name: string }[]
  >(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("rerack_grades") || "[]"); }
    catch { return []; }
  });
  const [form, setForm] = useState({ subject: "数学", score: "", maxScore: "100", name: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("rerack_grades", JSON.stringify(grades));
  }, [grades]);

  const addGrade = () => {
    if (!form.score || !form.name) return;
    setGrades([...grades, {
      id: Math.random().toString(36).substr(2, 9),
      subject: form.subject,
      score: Number(form.score),
      maxScore: Number(form.maxScore),
      name: form.name,
    }]);
    setForm({ subject: "数学", score: "", maxScore: "100", name: "" });
    setShowForm(false);
  };

  const getColor = (pct: number) => {
    if (pct >= 90) return "text-green-600 bg-green-50";
    if (pct >= 70) return "text-blue-600 bg-blue-50";
    if (pct >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-gray-800">📊 成績記録</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-black text-white px-3 py-1.5 rounded-xl font-bold"
        >
          {showForm ? "閉じる" : "+ 追加"}
        </button>
      </div>
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
          <input
            type="text"
            placeholder="テスト名（例：1学期中間）"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none"
          />
          <div className="flex gap-2">
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="flex-1 border border-gray-200 rounded-xl px-2 py-2 text-sm font-bold outline-none bg-white"
            >
              {SUBJECTS.filter((s) => s !== "その他").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="点数"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none text-center"
            />
            <span className="self-center text-gray-400 font-bold">/</span>
            <input
              type="number"
              placeholder="満点"
              value={form.maxScore}
              onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
              className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none text-center"
            />
          </div>
          <button
            onClick={addGrade}
            className="w-full py-2 bg-black text-white rounded-xl font-black text-sm"
          >
            記録する
          </button>
        </div>
      )}
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {grades.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">まだ記録がありません</p>
        ) : (
          grades.slice().reverse().map((g) => {
            const pct = Math.round((g.score / g.maxScore) * 100);
            return (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`text-lg font-black px-2 py-1 rounded-lg ${getColor(pct)}`}>
                  {pct}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{g.name}</p>
                  <p className="text-xs text-gray-500">{g.subject} — {g.score}/{g.maxScore}点</p>
                </div>
                <button
                  onClick={() => setGrades(grades.filter((x) => x.id !== g.id))}
                  className="text-gray-300 hover:text-red-400 text-xs"
                >✕</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// メインページ
// ════════════════════════════════════════════════════════
export default function Home() {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPetals, setShowPetals] = useState(false);

  // TODO
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("rerack_todos") || "[]"); }
    catch { return []; }
  });
  const [todoInput, setTodoInput] = useState("");
  const [todoSubject, setTodoSubject] = useState("その他");

  // 時間割
  const [timetable, setTimetable] = useState<Record<string, string[]>>(() => {
    if (typeof window === "undefined") return DEFAULT_TIMETABLE;
    try {
      const saved = localStorage.getItem("rerack_timetable");
      return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;
    } catch { return DEFAULT_TIMETABLE; }
  });
  const [editingTimetable, setEditingTimetable] = useState(false);
  const [tempTimetable, setTempTimetable] = useState(timetable);

  // 日付判定
  const isGraduationDay = todayStr === "2026-03-24";
  const isAfterGraduation = today > GRADUATION_DATE;
  const daysSinceGraduation = isAfterGraduation ? differenceInDays(today, GRADUATION_DATE) : null;
  const nextTest = getNextTest(today);
  const todayDayName = format(today, "E", { locale: ja });
  const todaySchedule = timetable[todayDayName] || [];

  // 初期化
  useEffect(() => {
    if (isGraduationDay) {
      setShowPetals(true);
      const t = setTimeout(() => setShowPetals(false), 30000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data } = await supabase
        .from("notices").select("*").order("created_at", { ascending: false });
      if (data) { setNotices(data); setUnreadCount(data.length > 0 ? 1 : 0); }
    };
    fetchNotices();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase.from("posts").select("*").eq("date", selectedDate).maybeSingle();
      setPost(data || null);
      setLoading(false);
    };
    fetchPost();
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem("rerack_todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("rerack_timetable", JSON.stringify(timetable));
  }, [timetable]);

  // ハンドラー
  const changeDate = (amount: number) => {
    const d = amount > 0 ? addDays(new Date(selectedDate), 1) : subDays(new Date(selectedDate), 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  const handleAdminLogin = () => {
    if (passwordInput.trim() === "Nasi-man-yo1209") {
      setIsAdminAuthenticated(true);
    } else if (passwordInput.trim() === "re2026") {
      window.location.href = "/secret";
    } else {
      alert("パスワードが違います");
      setPasswordInput("");
    }
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    const colors = ["bg-yellow-200", "bg-pink-200", "bg-blue-200", "bg-green-200", "bg-purple-200"];
    setNotes([...notes, {
      id: Math.random().toString(36).substr(2, 9),
      text: noteInput,
      color: colors[Math.floor(Math.random() * colors.length)],
    }]);
    setNoteInput("");
  };

  const addTodo = () => {
    if (!todoInput.trim()) return;
    setTodos([...todos, {
      id: Math.random().toString(36).substr(2, 9),
      text: todoInput, done: false, subject: todoSubject,
    }]);
    setTodoInput("");
  };

  const saveTimetable = () => {
    setTimetable(tempTimetable);
    setEditingTimetable(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-900 pb-20 font-sans relative">
      {showPetals && <CherryBlossom />}

      {/* 通知ボタン */}
      <div className="fixed top-5 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setIsNoticeOpen(!isNoticeOpen)}
            className="bg-white p-2.5 rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition active:scale-90"
          >
            <span className="text-lg">🔔</span>
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* お知らせモーダル */}
      {isNoticeOpen && (
        <div className="fixed top-16 right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-black text-xs text-gray-500 tracking-widest uppercase">Notices</h3>
            <button onClick={() => setUnreadCount(0)} className="text-[10px] bg-black text-white px-2 py-1 rounded-lg font-bold">既読</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notices.length > 0 ? notices.map((n) => (
              <div key={n.id} className="p-3 border-b border-gray-50 hover:bg-blue-50">
                <p className="text-[10px] text-gray-400 font-bold mb-0.5">{format(new Date(n.created_at), "yyyy/MM/dd")}</p>
                <h4 className="font-bold text-xs mb-0.5">{n.title}</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{n.content}</p>
              </div>
            )) : <p className="p-6 text-center text-xs text-gray-400">お知らせはありません</p>}
          </div>
          <button onClick={() => setIsNoticeOpen(false)} className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-black">閉じる</button>
        </div>
      )}

      <Header
        onGoToToday={() => { setSelectedDate(todayStr); setActiveTab("home"); }}
        onOpenAdmin={() => setActiveTab("admin")}
        onOpenHomework={() => setActiveTab("homework")}
      />

      {/* タブ */}
      <div className="max-w-2xl mx-auto pt-20 px-4">
        <div className="flex bg-white p-1 rounded-2xl shadow-md border border-gray-100">
          {([
            { key: "home", label: "🏠 ホーム" },
            { key: "homework", label: "📝 宿題" },
            { key: "tools", label: "🛠 ツール" },
            { key: "admin", label: "⚙️ 管理" },
          ] as { key: TabType; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
                activeTab === tab.key ? "bg-black text-white shadow-lg" : "text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto mt-5 px-4 space-y-4">

        {/* ══ ホームタブ ══ */}
        {activeTab === "home" && (
          <div className="space-y-4 animate-in fade-in duration-300">

            {/* メインカード */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border-[3px] border-black text-center">
              <p className="text-xs font-black text-gray-400 tracking-[0.3em] uppercase mb-1">
                re!RACK for 中学生
              </p>
              <h1 className="text-xl font-black text-gray-700 mb-3">
                {format(today, "yyyy年 M月d日(E)", { locale: ja })}
              </h1>

              {/* 卒業日当日 → 花吹雪 + お祝い */}
              {isGraduationDay && (
                <div className="mt-3 p-5 bg-gradient-to-br from-pink-50 to-rose-100 rounded-[1.5rem] border-4 border-pink-200">
                  <p className="text-4xl mb-2">🌸</p>
                  <p className="text-2xl font-black text-pink-600">ご卒業おめでとう！</p>
                  <p className="text-sm text-pink-400 font-bold mt-1">小学校 最高の思い出をありがとう</p>
                </div>
              )}

              {/* 卒業後 → 〇日経ちました */}
              {isAfterGraduation && !isGraduationDay && (
                <div className="mt-3 p-5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[1.5rem] border-4 border-blue-200">
                  <p className="text-blue-400 font-bold text-sm italic mb-1">小学校卒業から</p>
                  <p className="text-[5rem] leading-none font-black text-blue-600 italic font-serif">
                    {daysSinceGraduation}
                    <span className="text-2xl not-italic ml-1 text-blue-400 font-sans">日</span>
                  </p>
                  <p className="text-blue-400 font-bold text-sm mt-1">経ちました ✨</p>
                </div>
              )}

              {/* 卒業前 → カウントダウン */}
              {!isAfterGraduation && !isGraduationDay && (
                <div className="mt-3 p-5 bg-red-50 rounded-[1.5rem] border-4 border-red-100">
                  <p className="text-red-400 font-bold text-sm italic mb-1">卒業まで あと</p>
                  <p className="text-[5rem] leading-none font-black text-red-500 italic font-serif">
                    {differenceInDays(GRADUATION_DATE, today)}
                    <span className="text-2xl not-italic ml-1 text-red-400 font-sans">日</span>
                  </p>
                </div>
              )}
            </div>

            {/* 今日の時間割 */}
            <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-sm text-gray-700">
                  📚 今日の時間割
                  <span className="ml-2 text-gray-400 font-normal text-xs">
                    ({format(today, "E", { locale: ja })}曜日)
                  </span>
                </h2>
                <button onClick={() => setActiveTab("tools")} className="text-xs text-blue-500 font-bold hover:underline">
                  編集 →
                </button>
              </div>
              {todaySchedule.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {todaySchedule.map((subject, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs ${
                        SUBJECT_COLORS[subject] || SUBJECT_COLORS["その他"]
                      }`}
                    >
                      <span className="text-gray-400 text-[10px]">{i + 1}</span>
                      {subject}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">今日は授業なし（土日祝）</p>
              )}
            </div>

            {/* テストカウントダウン */}
            {nextTest && (
              <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5">次のテスト</p>
                    <p className="font-black text-gray-800">{nextTest.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{format(nextTest.date, "M月d日(E)", { locale: ja })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-orange-500">{differenceInDays(nextTest.date, today)}</p>
                    <p className="text-xs text-orange-400 font-bold">日後</p>
                  </div>
                </div>
              </div>
            )}

            {/* やること (TODO) */}
            <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-100 p-5">
              <h2 className="font-black text-sm text-gray-700 mb-3">✅ やること</h2>
              <div className="flex gap-2 mb-3">
                <select
                  value={todoSubject}
                  onChange={(e) => setTodoSubject(e.target.value)}
                  className="text-xs border border-gray-200 rounded-xl px-2 py-2 font-bold outline-none bg-gray-50"
                >
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  placeholder="やることを追加..."
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-black bg-gray-50"
                />
                <button onClick={addTodo} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black">追加</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {todos.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">やることはありません 🎉</p>
                ) : todos.map((todo) => (
                  <div key={todo.id} className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${todo.done ? "bg-gray-50 opacity-50" : "bg-white border-gray-100"}`}>
                    <button
                      onClick={() => setTodos(todos.map((t) => t.id === todo.id ? { ...t, done: !t.done } : t))}
                      className={`w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition ${todo.done ? "bg-black border-black text-white" : "border-gray-300"}`}
                    >
                      {todo.done && <span className="text-[10px] font-black">✓</span>}
                    </button>
                    <span className={`text-xs flex-1 font-bold ${todo.done ? "line-through text-gray-400" : ""}`}>{todo.text}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold ${SUBJECT_COLORS[todo.subject] || SUBJECT_COLORS["その他"]}`}>
                      {todo.subject}
                    </span>
                    <button onClick={() => setTodos(todos.filter((t) => t.id !== todo.id))} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 付箋ボード */}
            <div className="bg-slate-100 rounded-[1.5rem] p-5 min-h-[200px] border border-slate-200">
              <h2 className="text-xs font-black text-slate-500 mb-3 tracking-[0.3em] uppercase text-center">Sticky Notes</h2>
              <div className="flex gap-2 mb-4 bg-white p-2 rounded-xl shadow-sm">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  placeholder="メモを貼る..."
                  className="flex-1 px-3 py-1.5 font-bold text-sm outline-none border-none"
                />
                <button onClick={addNote} className="bg-black text-white px-4 py-1.5 rounded-lg font-black text-sm">貼る</button>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                    className={`${note.color} w-28 h-28 p-2.5 shadow-lg transform rotate-2 hover:rotate-0 transition-all cursor-pointer flex items-center justify-center text-center font-bold border-b-4 border-black/10 active:scale-90`}
                  >
                    <p className="text-xs text-gray-800 break-all leading-tight">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ 宿題タブ ══ */}
        {activeTab === "homework" && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-between border border-gray-100">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-xl">⬅️</button>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Selected Date</p>
                <p className="text-lg font-black">{format(new Date(selectedDate), "M月d日 (E)", { locale: ja })}</p>
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-full text-xl">➡️</button>
            </div>
            <section className="bg-white rounded-[1.5rem] shadow-md p-6 border border-gray-100">
              {loading ? (
                <div className="py-16 text-center animate-pulse text-gray-300 font-black text-xl">LOADING...</div>
              ) : post ? (
                <div className="grid gap-4">
                  <div className="p-5 rounded-2xl bg-blue-50 border-l-8 border-blue-500">
                    <span className="text-xs font-black text-blue-500 uppercase mb-1 block">📝 宿題</span>
                    <p className="text-lg font-bold whitespace-pre-wrap">{post.homework || "なし"}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-green-50 border-l-8 border-green-500">
                    <span className="text-xs font-black text-green-500 uppercase mb-1 block">🎒 持ち物</span>
                    <p className="text-lg font-bold whitespace-pre-wrap">{post.items || "なし"}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-orange-50 border-l-8 border-orange-500">
                    <span className="text-xs font-black text-orange-500 uppercase mb-1 block">📢 お知らせ</span>
                    <p className="text-lg font-bold whitespace-pre-wrap">{post.notice || "なし"}</p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center border-4 border-dashed border-gray-100 rounded-[1.5rem] text-gray-300 font-bold">
                  予定が登録されていません
                </div>
              )}
            </section>
          </div>
        )}

        {/* ══ ツールタブ ══ */}
        {activeTab === "tools" && (
          <div className="space-y-4 animate-in fade-in duration-300">

            {/* 時間割エディタ */}
            <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-800">📅 時間割</h2>
                {!editingTimetable ? (
                  <button
                    onClick={() => { setTempTimetable(timetable); setEditingTimetable(true); }}
                    className="text-xs bg-black text-white px-3 py-1.5 rounded-xl font-bold"
                  >編集</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditingTimetable(false)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-xl font-bold text-gray-500">キャンセル</button>
                    <button onClick={saveTimetable} className="text-xs bg-black text-white px-3 py-1.5 rounded-xl font-bold">保存</button>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-gray-400 font-bold pb-2 text-center w-8">#</th>
                      {["月", "火", "水", "木", "金"].map((d) => (
                        <th key={d} className="text-gray-600 font-black pb-2 text-center px-1">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }, (_, period) => (
                      <tr key={period}>
                        <td className="text-center text-gray-400 font-bold py-1 pr-2">{period + 1}</td>
                        {["月", "火", "水", "木", "金"].map((day) => {
                          const subject = editingTimetable
                            ? tempTimetable[day]?.[period] || ""
                            : timetable[day]?.[period] || "";
                          return (
                            <td key={day} className="py-0.5 px-0.5">
                              {editingTimetable ? (
                                <select
                                  value={subject}
                                  onChange={(e) => {
                                    const updated = { ...tempTimetable };
                                    if (!updated[day]) updated[day] = Array(6).fill("");
                                    updated[day][period] = e.target.value;
                                    setTempTimetable(updated);
                                  }}
                                  className="w-full text-[11px] border border-gray-200 rounded-lg p-1 font-bold outline-none bg-gray-50"
                                >
                                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                  <option value="">--</option>
                                </select>
                              ) : (
                                <div className={`text-center py-1 px-1 rounded-lg font-bold ${SUBJECT_COLORS[subject] || "text-gray-300"} ${subject ? "border" : ""}`}>
                                  {subject || "—"}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <StudyTimer />
            <GradeTracker />
          </div>
        )}

        {/* ══ 管理タブ ══ */}
        {activeTab === "admin" && (
          <div className="animate-in slide-in-from-bottom duration-300">
            {!isAdminAuthenticated ? (
              <div className="bg-white rounded-[2rem] shadow-xl p-8 border-4 border-black text-center max-w-sm mx-auto">
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
                <button
                  onClick={handleAdminLogin}
                  className="w-full py-4 bg-black text-white rounded-2xl font-black shadow-lg hover:bg-gray-800 active:scale-95 transition"
                >
                  認証する
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-white rounded-[2rem] shadow-xl p-6 border-4 border-dashed border-gray-200 relative">
                  <button
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="absolute top-4 right-4 text-xs font-bold text-gray-400 hover:text-red-500"
                  >
                    ログアウト
                  </button>
                  <h2 className="text-lg font-black mb-5 text-center text-gray-400 uppercase tracking-widest">
                    Date select & Edit
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                    <Calendar
                      onDateClick={(date: any) => {
                        const d = typeof date.format === "function"
                          ? date.format("YYYY-MM-DD")
                          : format(date, "yyyy-MM-dd");
                        setSelectedDate(d);
                      }}
                    />
                  </div>
                  <AdminMenu date={selectedDate} onClose={() => setActiveTab("homework")} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

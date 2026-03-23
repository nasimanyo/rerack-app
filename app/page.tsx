"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, subDays, differenceInDays, isToday, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import Calendar from "../components/Calendar";
import { Header } from "../components/Header";
import AdminMenu from "../components/AdminMenu";
import { supabase } from "../lib/supabase";

// ─── Types ───────────────────────────────────────────────
interface Notice {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface StickyNote {
  id: string;
  text: string;
  color: string;
}

type TabType = "home" | "homework" | "admin";

// Graduation date: 2026-03-24
const GRAD_DATE = new Date("2026-03-24");

// Check if today is graduation day
function isGraduationDay(): boolean {
  const today = new Date();
  return (
    today.getFullYear() === 2026 &&
    today.getMonth() === 2 &&
    today.getDate() === 24
  );
}

// Subject colors
const SUBJECT_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  国語:   { bg: "#fff0f0", accent: "#e55", text: "#c33" },
  数学:   { bg: "#f0f4ff", accent: "#46f", text: "#24c" },
  英語:   { bg: "#f0fff4", accent: "#2a9", text: "#177" },
  理科:   { bg: "#f5fff0", accent: "#5b2", text: "#3a1" },
  社会:   { bg: "#fffbf0", accent: "#e80", text: "#b60" },
  音楽:   { bg: "#fdf0ff", accent: "#a3d", text: "#72a" },
  美術:   { bg: "#fff5f0", accent: "#e73", text: "#c52" },
  体育:   { bg: "#f0faff", accent: "#29e", text: "#07b" },
  技術:   { bg: "#f8fff0", accent: "#6c2", text: "#4a1" },
  家庭:   { bg: "#fff0fb", accent: "#d3a", text: "#a27" },
  道徳:   { bg: "#f8f8ff", accent: "#88b", text: "#558" },
  総合:   { bg: "#fffff0", accent: "#aa0", text: "#770" },
  その他: { bg: "#f6f6f6", accent: "#888", text: "#555" },
};

// Confetti component (only on graduation day)
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => i);
  const colors = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b","#cc5de8","#f06595","#74c0fc"];

  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999, overflow:"hidden" }}>
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 4;
        const dur = 3 + Math.random() * 3;
        const color = colors[i % colors.length];
        const size = 8 + Math.random() * 8;
        const rotate = Math.random() * 360;
        return (
          <div
            key={i}
            style={{
              position:"absolute",
              left:`${left}%`,
              top:"-20px",
              width:size,
              height:size * 0.6,
              background:color,
              borderRadius:2,
              animation:`confettiFall ${dur}s ${delay}s linear infinite`,
              transform:`rotate(${rotate}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity:1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity:0.3; }
        }
      `}</style>
    </div>
  );
}

// ─── Homework card ───────────────────────────────────────
function HomeworkCard({ subject, content, isImportant }: {
  subject: string;
  content: string;
  isImportant?: boolean;
}) {
  const style = SUBJECT_COLORS[subject] || SUBJECT_COLORS["その他"];
  return (
    <div style={{
      background: style.bg,
      borderLeft: `4px solid ${style.accent}`,
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 10,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
        <span style={{
          background: style.accent,
          color:"#fff",
          fontSize:11,
          fontWeight:700,
          padding:"2px 10px",
          borderRadius:20,
          letterSpacing:1,
        }}>{subject}</span>
        {isImportant && (
          <span style={{
            background:"#ff3b30",
            color:"#fff",
            fontSize:10,
            fontWeight:700,
            padding:"2px 8px",
            borderRadius:20,
            letterSpacing:0.5,
          }}>⚠ 重要</span>
        )}
      </div>
      <p style={{ fontSize:15, color:"#222", lineHeight:1.6, margin:0, whiteSpace:"pre-wrap" }}>
        {content}
      </p>
    </div>
  );
}

// ─── Parse homework entries from post ───────────────────
// Expected format: "国語: ...\n数学: ...\n#重要: ..."
function parseHomework(raw: string): Array<{ subject: string; content: string; isImportant: boolean }> {
  if (!raw || raw.trim() === "なし") return [];
  const lines = raw.split("\n").filter(l => l.trim());
  const results: Array<{ subject: string; content: string; isImportant: boolean }> = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      let subject = line.slice(0, colonIdx).trim().replace(/^#重要\s*/, "");
      const content = line.slice(colonIdx + 1).trim();
      const isImportant = line.startsWith("#重要") || line.includes("【重要】");
      if (!SUBJECT_COLORS[subject]) subject = "その他";
      results.push({ subject, content, isImportant });
    } else {
      results.push({ subject: "その他", content: line.trim(), isImportant: false });
    }
  }
  return results;
}

// ─── Countdown ──────────────────────────────────────────
function CountdownCard({ daysLeft, label, emoji, color }: {
  daysLeft: number;
  label: string;
  emoji: string;
  color: string;
}) {
  return (
    <div style={{
      background:"#fff",
      borderRadius:20,
      padding:"24px 20px",
      textAlign:"center",
      boxShadow:"0 2px 16px rgba(0,0,0,0.06)",
      border:"1px solid #f0f0f0",
      flex:1,
    }}>
      <div style={{ fontSize:28, marginBottom:8 }}>{emoji}</div>
      <div style={{ fontSize:48, fontWeight:900, color, lineHeight:1, fontFamily:"'Georgia', serif" }}>
        {daysLeft}
      </div>
      <div style={{ fontSize:12, color:"#999", marginTop:6, fontWeight:600 }}>日</div>
      <div style={{ fontSize:12, color:"#777", marginTop:4 }}>{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // Notices
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readCount, setReadCount] = useState(0);

  // Sticky notes
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [noteInput, setNoteInput] = useState("");

  const graduated = isGraduationDay();

  // ── Fetch notices ─────────────────────────────────────
  useEffect(() => {
    const fetchNotices = async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setNotices(data);
        // Read count from localStorage
        try {
          const stored = localStorage.getItem("rerack_read_count");
          const storedCount = stored ? parseInt(stored) : 0;
          setReadCount(storedCount);
        } catch {}
      }
    };
    fetchNotices();
  }, []);

  // Unread count = total notices - what user has marked read
  const unreadCount = Math.max(0, notices.length - readCount);

  const markAllRead = () => {
    try { localStorage.setItem("rerack_read_count", String(notices.length)); } catch {}
    setReadCount(notices.length);
  };

  // ── Fetch post for selected date ──────────────────────
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

  // ── Countdowns ────────────────────────────────────────
  const daysToSummer = differenceInDays(new Date("2026-07-17"), new Date());
  const daysToNextYear = differenceInDays(new Date("2026-04-06"), new Date());

  const changeDate = (amount: number) => {
    const base = parseISO(selectedDate);
    const newDate = amount > 0 ? addDays(base, 1) : subDays(base, 1);
    setSelectedDate(format(newDate, "yyyy-MM-dd"));
  };

  const handleAdminLogin = () => {
    const code = passwordInput.trim();
    if (code === "Nasi-man-yo1209") {
      setIsAdminAuthenticated(true);
      return;
    }
    if (code === "re2026") {
      window.location.href = "/secret";
      return;
    }
    alert("パスワードが違います");
    setPasswordInput("");
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    const colors = ["#fffde7","#fce4ec","#e3f2fd","#e8f5e9","#f3e5f5"];
    const newNote: StickyNote = {
      id: Math.random().toString(36).slice(2),
      text: noteInput,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setNotes(prev => [...prev, newNote]);
    setNoteInput("");
  };

  const hwEntries = parseHomework(post?.homework || "");
  const itemsEntries = parseHomework(post?.items || "");
  const noticeEntries = post?.notice ? [{ subject: "その他", content: post.notice, isImportant: false }] : [];

  // ── Render ────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#f8f9fb", fontFamily:"'Hiragino Sans', 'Noto Sans JP', sans-serif" }}>

      {/* Graduation confetti */}
      {graduated && <Confetti />}

      {/* Graduation banner */}
      {graduated && (
        <div style={{
          position:"fixed",
          top:70,
          left:0,
          right:0,
          zIndex:1000,
          background:"linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff)",
          color:"#fff",
          textAlign:"center",
          padding:"12px 20px",
          fontSize:18,
          fontWeight:900,
          letterSpacing:2,
          boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
        }}>
          🎓 ご卒業おめでとうございます！ 🎉
        </div>
      )}

      {/* Notice bell */}
      <div style={{ position:"fixed", top:18, right:16, zIndex:200 }}>
        <button
          onClick={() => setIsNoticeOpen(!isNoticeOpen)}
          style={{
            background:"#fff",
            border:"1px solid #e8e8e8",
            borderRadius:14,
            width:42,
            height:42,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            cursor:"pointer",
            boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
            position:"relative",
          }}
        >
          <span style={{ fontSize:18 }}>🔔</span>
          {unreadCount > 0 && (
            <span style={{
              position:"absolute",
              top:-5,
              right:-5,
              background:"#ff3b30",
              color:"#fff",
              fontSize:10,
              fontWeight:700,
              width:18,
              height:18,
              borderRadius:"50%",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              border:"2px solid #fff",
            }}>{unreadCount}</span>
          )}
        </button>

        {/* Notice panel */}
        {isNoticeOpen && (
          <div style={{
            position:"absolute",
            top:50,
            right:0,
            width:300,
            background:"#fff",
            borderRadius:16,
            boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
            border:"1px solid #f0f0f0",
            overflow:"hidden",
          }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f5f5f5", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#444" }}>お知らせ</span>
              <button
                onClick={markAllRead}
                style={{ fontSize:11, background:"#222", color:"#fff", border:"none", borderRadius:8, padding:"4px 10px", cursor:"pointer" }}
              >既読にする</button>
            </div>
            <div style={{ maxHeight:320, overflowY:"auto" }}>
              {notices.length === 0 ? (
                <p style={{ padding:24, textAlign:"center", fontSize:13, color:"#aaa" }}>お知らせはありません</p>
              ) : notices.map(n => (
                <div key={n.id} style={{ padding:"12px 16px", borderBottom:"1px solid #f8f8f8" }}>
                  <div style={{ fontSize:11, color:"#bbb", marginBottom:4 }}>
                    {format(new Date(n.created_at), "yyyy/MM/dd")}
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{n.title}</div>
                  <div style={{ fontSize:12, color:"#666", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{n.content}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsNoticeOpen(false)}
              style={{ width:"100%", padding:"10px", fontSize:12, color:"#999", background:"none", border:"none", borderTop:"1px solid #f5f5f5", cursor:"pointer" }}
            >閉じる</button>
          </div>
        )}
      </div>

      {/* Header */}
      <Header
        onGoToToday={() => { setSelectedDate(format(new Date(), "yyyy-MM-dd")); setActiveTab("home"); }}
        onOpenAdmin={() => setActiveTab("admin")}
        onOpenHomework={() => setActiveTab("homework")}
      />

      {/* Tab nav */}
      <div style={{ paddingTop: graduated ? 110 : 72, paddingLeft:16, paddingRight:16 }}>
        <div style={{
          maxWidth:640,
          margin:"0 auto 20px",
          background:"#fff",
          borderRadius:16,
          padding:4,
          display:"flex",
          boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
          border:"1px solid #f0f0f0",
        }}>
          {([["home","🏠 ホーム"],["homework","📝 宿題"],["admin","⚙ 管理"]] as [TabType, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex:1,
                padding:"10px 6px",
                borderRadius:12,
                border:"none",
                cursor:"pointer",
                fontWeight:700,
                fontSize:13,
                transition:"all 0.2s",
                background: activeTab === tab ? "#111" : "transparent",
                color: activeTab === tab ? "#fff" : "#999",
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <main style={{ maxWidth:640, margin:"0 auto", padding:"0 16px 80px" }}>

        {/* ════ HOME ════ */}
        {activeTab === "home" && (
          <div>
            {/* Date display */}
            <div style={{
              background:"#fff",
              borderRadius:20,
              padding:"20px 24px",
              marginBottom:16,
              boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
              border:"1px solid #f0f0f0",
            }}>
              <div style={{ fontSize:12, color:"#aaa", fontWeight:600, marginBottom:6, letterSpacing:1 }}>TODAY</div>
              <div style={{ fontSize:22, fontWeight:800, color:"#111" }}>
                {format(new Date(), "yyyy年 M月d日 (E)", { locale: ja })}
              </div>
            </div>

            {/* Countdowns grid */}
            <div style={{ display:"flex", gap:12, marginBottom:16 }}>
              <CountdownCard
                daysLeft={Math.max(0, daysToNextYear)}
                label="新学年まで"
                emoji="🌸"
                color="#ff6b6b"
              />
              <CountdownCard
                daysLeft={Math.max(0, daysToSummer)}
                label="夏休みまで"
                emoji="☀️"
                color="#ff922b"
              />
            </div>

            {/* Quick homework preview */}
            <div style={{
              background:"#fff",
              borderRadius:20,
              padding:"20px 20px",
              marginBottom:16,
              boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
              border:"1px solid #f0f0f0",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <span style={{ fontSize:14, fontWeight:700, color:"#333" }}>📚 今日の宿題</span>
                <button
                  onClick={() => { setSelectedDate(format(new Date(), "yyyy-MM-dd")); setActiveTab("homework"); }}
                  style={{ fontSize:12, color:"#666", background:"#f5f5f5", border:"none", borderRadius:8, padding:"4px 12px", cursor:"pointer" }}
                >詳細 →</button>
              </div>
              {loading ? (
                <p style={{ fontSize:13, color:"#bbb", textAlign:"center", padding:"16px 0" }}>読み込み中...</p>
              ) : hwEntries.length > 0 ? (
                hwEntries.slice(0,3).map((hw, i) => (
                  <div key={i} style={{
                    display:"flex",
                    alignItems:"flex-start",
                    gap:8,
                    padding:"8px 0",
                    borderBottom: i < hwEntries.length-1 ? "1px solid #f5f5f5" : "none",
                  }}>
                    <span style={{
                      background: SUBJECT_COLORS[hw.subject]?.accent || "#888",
                      color:"#fff",
                      fontSize:10,
                      fontWeight:700,
                      padding:"2px 8px",
                      borderRadius:20,
                      whiteSpace:"nowrap",
                      flexShrink:0,
                    }}>{hw.subject}</span>
                    <span style={{ fontSize:13, color:"#444", lineHeight:1.5 }}>{hw.content}</span>
                    {hw.isImportant && <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>}
                  </div>
                ))
              ) : (
                <p style={{ fontSize:13, color:"#ccc", textAlign:"center", padding:"12px 0" }}>今日の宿題はありません</p>
              )}
            </div>

            {/* Sticky notes */}
            <div style={{
              background:"#fff",
              borderRadius:20,
              padding:"20px 20px",
              boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
              border:"1px solid #f0f0f0",
            }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#333", marginBottom:12 }}>📌 メモ</div>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <input
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addNote()}
                  placeholder="メモを追加..."
                  style={{
                    flex:1,
                    padding:"8px 12px",
                    border:"1px solid #e8e8e8",
                    borderRadius:10,
                    fontSize:13,
                    outline:"none",
                    fontFamily:"inherit",
                  }}
                />
                <button
                  onClick={addNote}
                  style={{
                    background:"#111",
                    color:"#fff",
                    border:"none",
                    borderRadius:10,
                    padding:"8px 16px",
                    fontSize:13,
                    fontWeight:700,
                    cursor:"pointer",
                  }}
                >追加</button>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {notes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setNotes(prev => prev.filter(n => n.id !== note.id))}
                    style={{
                      background:note.color,
                      padding:"10px 14px",
                      borderRadius:12,
                      fontSize:13,
                      cursor:"pointer",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
                      maxWidth:160,
                      wordBreak:"break-all",
                    }}
                  >{note.text}</div>
                ))}
                {notes.length === 0 && (
                  <p style={{ fontSize:12, color:"#ccc", width:"100%", textAlign:"center", padding:"8px 0" }}>
                    タップで削除できます
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════ HOMEWORK ════ */}
        {activeTab === "homework" && (
          <div>
            {/* Date navigator */}
            <div style={{
              background:"#fff",
              borderRadius:16,
              padding:"12px 20px",
              marginBottom:16,
              boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
              border:"1px solid #f0f0f0",
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
            }}>
              <button
                onClick={() => changeDate(-1)}
                style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#555", padding:"4px 8px" }}
              >‹</button>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#aaa", fontWeight:600, letterSpacing:1 }}>DATE</div>
                <div style={{ fontSize:17, fontWeight:800, color:"#111" }}>
                  {format(parseISO(selectedDate), "M月d日 (E)", { locale: ja })}
                </div>
                {isToday(parseISO(selectedDate)) && (
                  <span style={{ fontSize:10, background:"#ff3b30", color:"#fff", borderRadius:8, padding:"1px 8px", fontWeight:700 }}>TODAY</span>
                )}
              </div>
              <button
                onClick={() => changeDate(1)}
                style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#555", padding:"4px 8px" }}
              >›</button>
            </div>

            {/* Content */}
            {loading ? (
              <div style={{ textAlign:"center", padding:48, color:"#ccc", fontSize:14 }}>読み込み中...</div>
            ) : !post ? (
              <div style={{
                background:"#fff",
                borderRadius:20,
                padding:"40px 20px",
                textAlign:"center",
                boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                border:"2px dashed #eee",
              }}>
                <div style={{ fontSize:36, marginBottom:12 }}>📭</div>
                <div style={{ fontSize:14, color:"#bbb" }}>この日の予定はありません</div>
              </div>
            ) : (
              <div>
                {/* Homework section */}
                {hwEntries.length > 0 && (
                  <div style={{
                    background:"#fff",
                    borderRadius:20,
                    padding:"20px",
                    marginBottom:14,
                    boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                    border:"1px solid #f0f0f0",
                  }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:6, height:6, background:"#4d96ff", borderRadius:"50%", display:"inline-block" }} />
                      宿題
                    </div>
                    {hwEntries.map((hw, i) => (
                      <HomeworkCard key={i} {...hw} />
                    ))}
                  </div>
                )}

                {/* Items section */}
                {post.items && post.items.trim() && post.items !== "なし" && (
                  <div style={{
                    background:"#fff",
                    borderRadius:20,
                    padding:"20px",
                    marginBottom:14,
                    boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                    border:"1px solid #f0f0f0",
                  }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:6, height:6, background:"#6bcb77", borderRadius:"50%", display:"inline-block" }} />
                      持ち物
                    </div>
                    {itemsEntries.length > 0 ? (
                      itemsEntries.map((item, i) => <HomeworkCard key={i} {...item} />)
                    ) : (
                      <p style={{ fontSize:14, color:"#444", lineHeight:1.7, whiteSpace:"pre-wrap", margin:0 }}>{post.items}</p>
                    )}
                  </div>
                )}

                {/* Notice section */}
                {post.notice && post.notice.trim() && post.notice !== "なし" && (
                  <div style={{
                    background:"#fff",
                    borderRadius:20,
                    padding:"20px",
                    boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                    border:"1px solid #f0f0f0",
                  }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:6, height:6, background:"#ffd93d", borderRadius:"50%", display:"inline-block" }} />
                      お知らせ
                    </div>
                    <p style={{ fontSize:14, color:"#444", lineHeight:1.7, whiteSpace:"pre-wrap", margin:0 }}>
                      {post.notice}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════ ADMIN ════ */}
        {activeTab === "admin" && (
          <div>
            {!isAdminAuthenticated ? (
              <div style={{
                background:"#fff",
                borderRadius:24,
                padding:"40px 24px",
                textAlign:"center",
                boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                border:"1px solid #f0f0f0",
              }}>
                <div style={{ fontSize:36, marginBottom:16 }}>🔒</div>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:20, color:"#222" }}>管理者認証</div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                  placeholder="パスワードを入力"
                  style={{
                    width:"100%",
                    padding:"12px 16px",
                    border:"1px solid #e8e8e8",
                    borderRadius:12,
                    fontSize:15,
                    textAlign:"center",
                    outline:"none",
                    fontFamily:"inherit",
                    marginBottom:14,
                    boxSizing:"border-box",
                  }}
                />
                <button
                  onClick={handleAdminLogin}
                  style={{
                    width:"100%",
                    padding:"13px",
                    background:"#111",
                    color:"#fff",
                    border:"none",
                    borderRadius:12,
                    fontSize:15,
                    fontWeight:700,
                    cursor:"pointer",
                  }}
                >認証する</button>
              </div>
            ) : (
              <div>
                <div style={{
                  background:"#fff",
                  borderRadius:24,
                  padding:"24px 20px",
                  marginBottom:16,
                  boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                  border:"1px solid #f0f0f0",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <span style={{ fontSize:15, fontWeight:700, color:"#333" }}>📅 日付を選択 & 編集</span>
                    <button
                      onClick={() => setIsAdminAuthenticated(false)}
                      style={{ fontSize:12, color:"#999", background:"none", border:"none", cursor:"pointer" }}
                    >ログアウト</button>
                  </div>

                  {/* Calendar */}
                  <div style={{ marginBottom:20 }}>
                    <Calendar
                      onDateClick={(date: any) => {
                        const d = typeof date.format === "function"
                          ? date.format("YYYY-MM-DD")
                          : format(date, "yyyy-MM-dd");
                        setSelectedDate(d);
                      }}
                    />
                  </div>

                  {/* Admin form hint */}
                  <div style={{
                    background:"#f8f8f8",
                    borderRadius:12,
                    padding:"12px 14px",
                    marginBottom:16,
                    fontSize:12,
                    color:"#777",
                    lineHeight:1.7,
                  }}>
                    <strong>入力形式ヒント：</strong><br />
                    宿題・持ち物欄は「教科: 内容」の形式で記入すると科目タグが自動付与されます。<br />
                    例: <code>国語: ワーク P.12</code><br />
                    重要マーク: <code>#重要 数学: テスト範囲</code>
                  </div>

                  <AdminMenu
                    date={selectedDate}
                    onClose={() => setActiveTab("homework")}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

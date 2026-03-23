"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, differenceInDays, isToday, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import Calendar from "../components/Calendar";
import { Header } from "../components/Header";
import AdminMenu from "../components/AdminMenu";
import { supabase } from "../lib/supabase";

// ─── Types ───────────────────────────────────────────────
interface Notice { id: string; title: string; content: string; created_at: string; }
interface StickyNote { id: string; text: string; color: string; }
type TabType = "home" | "homework" | "admin";

// ─── Subject palette ─────────────────────────────────────
const SUBJECTS: Record<string, { bg: string; bar: string; label: string }> = {
  国語:   { bg: "#fff5f5", bar: "#ef4444", label: "#c53030" },
  数学:   { bg: "#eff6ff", bar: "#3b82f6", label: "#1e40af" },
  英語:   { bg: "#f0fdf4", bar: "#22c55e", label: "#15803d" },
  理科:   { bg: "#f7fee7", bar: "#84cc16", label: "#4d7c0f" },
  社会:   { bg: "#fefce8", bar: "#eab308", label: "#854d0e" },
  音楽:   { bg: "#fdf4ff", bar: "#a855f7", label: "#7e22ce" },
  美術:   { bg: "#fff7ed", bar: "#f97316", label: "#c2410c" },
  体育:   { bg: "#f0f9ff", bar: "#0ea5e9", label: "#0369a1" },
  技術:   { bg: "#f0fdf4", bar: "#10b981", label: "#065f46" },
  家庭:   { bg: "#fdf2f8", bar: "#ec4899", label: "#be185d" },
  道徳:   { bg: "#f8fafc", bar: "#94a3b8", label: "#475569" },
  総合:   { bg: "#fafaf9", bar: "#78716c", label: "#57534e" },
  その他: { bg: "#f9fafb", bar: "#6b7280", label: "#374151" },
};

// ─── Graduation check (3/24) ─────────────────────────────
function isGradDay() {
  const t = new Date();
  return t.getFullYear() === 2026 && t.getMonth() === 2 && t.getDate() === 24;
}

// ─── Confetti ────────────────────────────────────────────
function Confetti() {
  const cols = ["#f87171","#fbbf24","#34d399","#60a5fa","#a78bfa","#f472b6"];
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999, overflow:"hidden" }}>
      {Array.from({length:55},(_,i)=>{
        const l = Math.random()*100, d = Math.random()*5, dur = 3+Math.random()*3;
        const col = cols[i%cols.length], s = 7+Math.random()*7;
        return <div key={i} style={{ position:"absolute", left:`${l}%`, top:"-16px", width:s, height:s*0.55, background:col, borderRadius:2, animation:`cf ${dur}s ${d}s linear infinite` }}/>;
      })}
      <style>{`@keyframes cf{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:.2}}`}</style>
    </div>
  );
}

// ─── Parse "教科: 内容" format ────────────────────────────
function parseLines(raw: string) {
  if (!raw || raw.trim() === "" || raw.trim() === "なし") return [];
  return raw.split("\n").filter(l => l.trim()).map(line => {
    const important = line.startsWith("#重要") || line.includes("【重要】");
    const clean = line.replace(/^#重要\s*/, "").replace(/【重要】/, "").trim();
    const ci = clean.indexOf(":");
    if (ci > 0) {
      let sub = clean.slice(0, ci).trim();
      if (!SUBJECTS[sub]) sub = "その他";
      return { subject: sub, content: clean.slice(ci+1).trim(), important };
    }
    return { subject: "その他", content: clean, important };
  });
}

// ─── Inline SVG icons (no emoji) ─────────────────────────
const Ico = {
  alert: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  book:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  bag:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  bell:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  info:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  pin:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>,
  chev:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  cal:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  sun:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  flower:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z"/><path d="M12 14a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z"/><path d="M2 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4z"/><path d="M14 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4z"/></svg>,
};

// ─── Homework card ────────────────────────────────────────
function HwCard({ subject, content, important }: { subject:string; content:string; important:boolean }) {
  const s = SUBJECTS[subject] ?? SUBJECTS["その他"];
  return (
    <div style={{
      background: s.bg,
      borderRadius: 10,
      padding: "11px 14px 11px 44px",
      marginBottom: 8,
      position: "relative",
      border: `1px solid ${s.bar}22`,
    }}>
      {/* Colored left rail */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:s.bar, borderRadius:"10px 0 0 10px" }} />
      {/* Subject pill */}
      <div style={{
        position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
        background: s.bar, color:"#fff",
        fontSize:9, fontWeight:700, letterSpacing:0.5,
        padding:"2px 7px", borderRadius:20,
        writingMode:"horizontal-tb",
        whiteSpace:"nowrap",
      }}>{subject}</div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <p style={{ margin:0, fontSize:14, color:"#1a1a1a", lineHeight:1.65, whiteSpace:"pre-wrap" }}>{content}</p>
        {important && (
          <span style={{
            flexShrink:0, display:"flex", alignItems:"center", gap:3,
            background:"#fef2f2", border:"1px solid #fecaca",
            color:"#dc2626", fontSize:10, fontWeight:700,
            padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap",
          }}>
            {Ico.alert} 重要
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────
function SectionCard({ icon, title, color, children }: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:"18px 18px 14px",
      marginBottom:14, boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
      border:"1px solid #f1f1f1",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", color }}>
          {icon}
        </div>
        <span style={{ fontSize:13, fontWeight:700, color:"#333" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Countdown tile ───────────────────────────────────────
function CdTile({ days, label, icon, accent }: { days:number; label:string; icon:React.ReactNode; accent:string }) {
  return (
    <div style={{
      flex:1, background:"#fff", borderRadius:16,
      padding:"18px 14px 16px", textAlign:"center",
      boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
      border:`1px solid ${accent}22`,
      position:"relative", overflow:"hidden",
    }}>
      {/* accent stripe top */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:accent, borderRadius:"16px 16px 0 0" }} />
      <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:accent+"18", display:"flex", alignItems:"center", justifyContent:"center", color:accent }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize:36, fontWeight:900, color:accent, lineHeight:1, fontFamily:"'Georgia','Times New Roman',serif", letterSpacing:-1 }}>
        {Math.max(0, days)}
      </div>
      <div style={{ fontSize:10, color:"#aaa", marginTop:4, fontWeight:600, letterSpacing:0.5, textTransform:"uppercase" }}>days</div>
      <div style={{ fontSize:11, color:"#666", marginTop:6, fontWeight:600 }}>{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pw, setPw] = useState("");

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readCount, setReadCount] = useState(0);

  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [noteInput, setNoteInput] = useState("");

  const isGrad = isGradDay();

  // ── fetch notices ──
  useEffect(() => {
    supabase.from("notices").select("*").order("created_at",{ascending:false}).then(({data}) => {
      if (data) {
        setNotices(data);
        try {
          const s = localStorage.getItem("rerack_read");
          setReadCount(s ? parseInt(s) : 0);
        } catch {}
      }
    });
  }, []);

  const unread = Math.max(0, notices.length - readCount);

  function markRead() {
    try { localStorage.setItem("rerack_read", String(notices.length)); } catch {}
    setReadCount(notices.length);
  }

  // ── fetch post ──
  useEffect(() => {
    setLoading(true);
    supabase.from("posts").select("*").eq("date", selectedDate).maybeSingle().then(({data}) => {
      setPost(data || null);
      setLoading(false);
    });
  }, [selectedDate]);

  const daysToNewYear = differenceInDays(new Date("2026-04-06"), new Date());
  const daysToSummer  = differenceInDays(new Date("2026-07-17"), new Date());

  function changeDate(n: number) {
    const base = parseISO(selectedDate);
    setSelectedDate(format(n > 0 ? addDays(base,1) : subDays(base,1), "yyyy-MM-dd"));
  }

  function handleAdminLogin() {
    if (pw.trim() === "Nasi-man-yo1209") { setIsAdmin(true); return; }
    if (pw.trim() === "re2026") { window.location.href = "/secret"; return; }
    alert("パスワードが違います"); setPw("");
  }

  function addNote() {
    if (!noteInput.trim()) return;
    const cols = ["#fef9c3","#fce7f3","#dbeafe","#dcfce7","#f3e8ff"];
    setNotes(p => [...p, { id: Math.random().toString(36).slice(2), text: noteInput, color: cols[Math.floor(Math.random()*cols.length)] }]);
    setNoteInput("");
  }

  const hwLines    = parseLines(post?.homework || "");
  const itemLines  = parseLines(post?.items || "");

  // ─── Global styles ────────────────────────────────────
  const gs = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif; background: #f4f5f7; color: #111; margin:0; }
    input, textarea, button { font-family: inherit; }
    a { color: inherit; text-decoration: none; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

    .tab-btn {
      flex: 1; padding: 10px 6px; border-radius: 11px; border: none;
      font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.18s;
      background: transparent; color: #9ca3af; font-family: inherit;
    }
    .tab-btn.on { background: #111; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }

    .fade-in { animation: fadeUp 0.28s ease both; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

    .hw-section-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; color: #888;
      text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .hw-section-title::after {
      content: ''; flex: 1; height: 1px; background: #f0f0f0;
    }

    .note-chip {
      padding: 9px 13px; border-radius: 10px;
      font-size: 13px; cursor: pointer; word-break: break-all;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      transition: transform 0.1s, opacity 0.1s;
      max-width: 150px;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .note-chip:hover { transform: scale(0.97); opacity: 0.85; }

    .date-nav-btn {
      background: none; border: none; cursor: pointer;
      color: #666; padding: 6px 12px; font-size: 20px; border-radius: 10px;
      transition: background 0.1s; line-height: 1;
    }
    .date-nav-btn:hover { background: #f5f5f5; }

    .quick-hw-row {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 9px 0; border-bottom: 1px solid #f5f5f5;
    }
    .quick-hw-row:last-child { border-bottom: none; }
  `;

  return (
    <div style={{ minHeight:"100vh", background:"#f4f5f7" }}>
      <style>{gs}</style>

      {isGrad && <Confetti />}

      {/* Grad banner */}
      {isGrad && (
        <div style={{
          position:"fixed", top:58, left:0, right:0, zIndex:90,
          background:"linear-gradient(90deg,#f87171,#fbbf24,#34d399,#60a5fa,#a78bfa)",
          color:"#fff", textAlign:"center", padding:"10px 16px",
          fontSize:15, fontWeight:800, letterSpacing:1.5,
          boxShadow:"0 4px 20px rgba(0,0,0,0.1)",
        }}>
          ご卒業おめでとうございます
        </div>
      )}

      {/* Notice bell */}
      <div style={{ position:"fixed", top:12, right:16, zIndex:200 }}>
        <button
          onClick={() => setNoticeOpen(v => !v)}
          style={{
            width:36, height:36, borderRadius:10,
            background:"#fff", border:"1px solid #e8e8e8",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", position:"relative",
            boxShadow:"0 2px 6px rgba(0,0,0,0.06)",
            color: unread > 0 ? "#111" : "#9ca3af",
          }}
          aria-label="お知らせ"
        >
          {Ico.bell}
          {unread > 0 && (
            <span style={{
              position:"absolute", top:-4, right:-4,
              background:"#ef4444", color:"#fff",
              fontSize:9, fontWeight:700,
              width:16, height:16, borderRadius:"50%",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:"2px solid #fff",
            }}>{unread}</span>
          )}
        </button>

        {noticeOpen && (
          <div style={{
            position:"absolute", top:44, right:0, width:300,
            background:"#fff", borderRadius:14,
            boxShadow:"0 8px 30px rgba(0,0,0,0.12)",
            border:"1px solid #f0f0f0", overflow:"hidden",
            zIndex:300,
          }}>
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #f5f5f5", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#333", display:"flex", alignItems:"center", gap:5 }}>
                {Ico.bell} お知らせ
              </span>
              <button onClick={markRead} style={{ fontSize:10, background:"#111", color:"#fff", border:"none", borderRadius:7, padding:"4px 10px", cursor:"pointer" }}>
                既読にする
              </button>
            </div>
            <div style={{ maxHeight:300, overflowY:"auto" }}>
              {notices.length === 0 ? (
                <p style={{ padding:"24px 16px", textAlign:"center", fontSize:12, color:"#bbb" }}>お知らせはありません</p>
              ) : notices.map(n => (
                <div key={n.id} style={{ padding:"11px 16px", borderBottom:"1px solid #fafafa" }}>
                  <div style={{ fontSize:10, color:"#bbb", marginBottom:3 }}>{format(new Date(n.created_at),"yyyy/MM/dd")}</div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{n.title}</div>
                  <div style={{ fontSize:12, color:"#666", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{n.content}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setNoticeOpen(false)} style={{ width:"100%", padding:10, fontSize:11, color:"#aaa", background:"none", border:"none", borderTop:"1px solid #f5f5f5", cursor:"pointer" }}>
              閉じる
            </button>
          </div>
        )}
      </div>

      <Header
        onGoToToday={() => { setSelectedDate(format(new Date(),"yyyy-MM-dd")); setActiveTab("home"); }}
        onOpenAdmin={() => setActiveTab("admin")}
        onOpenHomework={() => setActiveTab("homework")}
      />

      {/* Tab bar */}
      <div style={{ paddingTop: isGrad ? 116 : 74, padding:`${isGrad?116:74}px 14px 0` }}>
        <div style={{ maxWidth:660, margin:"0 auto 18px", background:"#fff", borderRadius:14, padding:4, display:"flex", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", border:"1px solid #f0f0f0" }}>
          {(["home","homework","admin"] as TabType[]).map((t,i) => {
            const labels = ["ホーム","宿題","管理"];
            return <button key={t} className={`tab-btn ${activeTab===t?"on":""}`} onClick={()=>setActiveTab(t)}>{labels[i]}</button>;
          })}
        </div>
      </div>

      <main style={{ maxWidth:660, margin:"0 auto", padding:"0 14px 100px" }}>

        {/* ════════ HOME ════════ */}
        {activeTab === "home" && (
          <div className="fade-in">

            {/* Hero date card */}
            <div style={{
              background: "linear-gradient(135deg,#0f0f0f 0%,#1c1c2e 100%)",
              borderRadius: 20,
              padding: "24px 24px 22px",
              marginBottom: 16,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* decorative grid lines */}
              <div style={{
                position:"absolute", inset:0,
                backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
                backgroundSize:"32px 32px",
                borderRadius:20,
              }} />
              {/* accent dot */}
              <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:"rgba(74,222,128,0.18)" }} />

              <div style={{ position:"relative" }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:2, marginBottom:8, textTransform:"uppercase" }}>Today</div>
                <div style={{ fontSize:24, fontWeight:900, letterSpacing:-0.5 }}>
                  {format(new Date(), "M月d日", {locale:ja})}
                  <span style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.5)", marginLeft:10 }}>
                    {format(new Date(),"(E)",{locale:ja})}
                  </span>
                </div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:6 }}>
                  {format(new Date(),"yyyy年")}
                </div>
              </div>
            </div>

            {/* Countdown tiles */}
            <div style={{ display:"flex", gap:12, marginBottom:16 }}>
              <CdTile days={daysToNewYear} label="新学年まで" icon={Ico.flower} accent="#f43f5e" />
              <CdTile days={daysToSummer} label="夏休みまで" icon={Ico.sun} accent="#f97316" />
            </div>

            {/* Today's homework preview */}
            <div style={{
              background:"#fff", borderRadius:16, padding:"18px 18px 14px",
              marginBottom:16, boxShadow:"0 1px 8px rgba(0,0,0,0.05)", border:"1px solid #f1f1f1",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#3b82f6" }}>
                    {Ico.book}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#222" }}>今日の宿題</div>
                    <div style={{ fontSize:10, color:"#aaa" }}>{format(new Date(),"M月d日",{locale:ja})}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedDate(format(new Date(),"yyyy-MM-dd")); setActiveTab("homework"); }}
                  style={{
                    display:"flex", alignItems:"center", gap:3,
                    background:"#f5f5f5", border:"none", borderRadius:8,
                    padding:"5px 10px", fontSize:11, fontWeight:600, color:"#555", cursor:"pointer",
                  }}
                >
                  詳細 {Ico.chev}
                </button>
              </div>

              {loading ? (
                <div style={{ padding:"16px 0", textAlign:"center", fontSize:12, color:"#ccc" }}>
                  <div style={{ width:24, height:24, border:"2px solid #e0e0e0", borderTopColor:"#aaa", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 8px" }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : hwLines.length > 0 ? (
                hwLines.slice(0,4).map((hw,i) => {
                  const s = SUBJECTS[hw.subject] ?? SUBJECTS["その他"];
                  return (
                    <div key={i} className="quick-hw-row">
                      <span style={{ flexShrink:0, background:s.bar, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:20 }}>{hw.subject}</span>
                      <span style={{ fontSize:13, color:"#333", lineHeight:1.5, flex:1 }}>{hw.content}</span>
                      {hw.important && <span style={{ color:"#ef4444", flexShrink:0 }}>{Ico.alert}</span>}
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign:"center", padding:"14px 0", fontSize:12, color:"#ccc" }}>
                  今日の宿題はありません
                </div>
              )}
            </div>

            {/* Memo board */}
            <div style={{
              background:"#fff", borderRadius:16, padding:"18px 18px 16px",
              boxShadow:"0 1px 8px rgba(0,0,0,0.05)", border:"1px solid #f1f1f1",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"#fef9c3", display:"flex", alignItems:"center", justifyContent:"center", color:"#ca8a04" }}>
                  {Ico.pin}
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:"#222" }}>メモ</span>
              </div>

              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <input
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addNote()}
                  placeholder="メモを追加..."
                  style={{
                    flex:1, padding:"9px 12px", border:"1px solid #e8e8e8",
                    borderRadius:10, fontSize:13, outline:"none", background:"#fafafa",
                  }}
                />
                <button
                  onClick={addNote}
                  style={{
                    padding:"9px 16px", background:"#111", color:"#fff",
                    border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer",
                  }}
                >追加</button>
              </div>

              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {notes.map(n => (
                  <div key={n.id} className="note-chip" style={{ background:n.color }} onClick={() => setNotes(p => p.filter(x => x.id !== n.id))}>
                    {n.text}
                  </div>
                ))}
                {notes.length === 0 && (
                  <p style={{ width:"100%", textAlign:"center", fontSize:11, color:"#d1d5db", margin:"8px 0 4px" }}>タップで削除</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════ HOMEWORK ════════ */}
        {activeTab === "homework" && (
          <div className="fade-in">

            {/* Date navigator */}
            <div style={{
              background:"#fff", borderRadius:14, padding:"10px 16px",
              marginBottom:14, boxShadow:"0 1px 6px rgba(0,0,0,0.05)",
              border:"1px solid #f1f1f1", display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <button className="date-nav-btn" onClick={() => changeDate(-1)}>‹</button>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#111" }}>
                  {format(parseISO(selectedDate),"M月d日 (E)",{locale:ja})}
                </div>
                {isToday(parseISO(selectedDate)) && (
                  <span style={{ fontSize:9, fontWeight:700, background:"#111", color:"#fff", padding:"1px 8px", borderRadius:20 }}>TODAY</span>
                )}
              </div>
              <button className="date-nav-btn" onClick={() => changeDate(1)}>›</button>
            </div>

            {loading ? (
              <div style={{ textAlign:"center", padding:56, color:"#ccc" }}>
                <div style={{ width:28, height:28, border:"2px solid #e8e8e8", borderTopColor:"#aaa", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
              </div>
            ) : !post ? (
              <div style={{
                background:"#fff", borderRadius:16, padding:"48px 20px",
                textAlign:"center", border:"2px dashed #e8e8e8",
              }}>
                <div style={{ width:48, height:48, borderRadius:14, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:"#ccc" }}>
                  {Ico.cal}
                </div>
                <div style={{ fontSize:13, color:"#bbb", fontWeight:600 }}>この日の予定はありません</div>
              </div>
            ) : (
              <>
                {/* Homework */}
                {hwLines.length > 0 && (
                  <SectionCard icon={Ico.book} title="宿題" color="#3b82f6">
                    <div className="hw-section-title">HOMEWORK</div>
                    {hwLines.map((hw,i) => <HwCard key={i} {...hw} />)}
                  </SectionCard>
                )}

                {/* Items */}
                {post.items && post.items.trim() && post.items !== "なし" && (
                  <SectionCard icon={Ico.bag} title="持ち物" color="#10b981">
                    <div className="hw-section-title">ITEMS</div>
                    {itemLines.length > 0
                      ? itemLines.map((it,i) => <HwCard key={i} {...it} />)
                      : <p style={{ margin:0, fontSize:14, color:"#333", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{post.items}</p>
                    }
                  </SectionCard>
                )}

                {/* Notice */}
                {post.notice && post.notice.trim() && post.notice !== "なし" && (
                  <SectionCard icon={Ico.info} title="お知らせ" color="#f59e0b">
                    <div className="hw-section-title">NOTICE</div>
                    <p style={{ margin:0, fontSize:14, color:"#333", lineHeight:1.75, whiteSpace:"pre-wrap" }}>{post.notice}</p>
                  </SectionCard>
                )}
              </>
            )}
          </div>
        )}

        {/* ════════ ADMIN ════════ */}
        {activeTab === "admin" && (
          <div className="fade-in">
            {!isAdmin ? (
              <div style={{
                background:"#fff", borderRadius:20, padding:"40px 24px",
                textAlign:"center", boxShadow:"0 1px 8px rgba(0,0,0,0.05)", border:"1px solid #f1f1f1",
              }}>
                <div style={{
                  width:52, height:52, borderRadius:14, background:"#111",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  margin:"0 auto 18px", color:"#fff",
                }}>
                  {Ico.settings}
                </div>
                <div style={{ fontSize:16, fontWeight:800, marginBottom:20, color:"#111" }}>管理者認証</div>
                <input
                  type="password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                  placeholder="パスワード"
                  style={{
                    width:"100%", padding:"12px 16px", border:"1px solid #e8e8e8",
                    borderRadius:12, fontSize:14, textAlign:"center", outline:"none",
                    background:"#fafafa", marginBottom:14, boxSizing:"border-box",
                  }}
                />
                <button
                  onClick={handleAdminLogin}
                  style={{
                    width:"100%", padding:13, background:"#111", color:"#fff",
                    border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer",
                  }}
                >認証する</button>
              </div>
            ) : (
              <div>
                <div style={{
                  background:"#fff", borderRadius:20, padding:"22px 18px",
                  marginBottom:14, boxShadow:"0 1px 8px rgba(0,0,0,0.05)", border:"1px solid #f1f1f1",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#222" }}>日付選択 & 編集</span>
                    <button onClick={() => setIsAdmin(false)} style={{ fontSize:11, color:"#999", background:"none", border:"none", cursor:"pointer" }}>ログアウト</button>
                  </div>
                  <div style={{ marginBottom:18 }}>
                    <Calendar
                      onDateClick={(date: any) => {
                        const d = typeof date.format === "function" ? date.format("YYYY-MM-DD") : format(date,"yyyy-MM-dd");
                        setSelectedDate(d);
                      }}
                    />
                  </div>

                  {/* Format hint */}
                  <div style={{ background:"#f9fafb", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:11, color:"#888", lineHeight:1.7 }}>
                    <strong style={{ color:"#555" }}>入力形式：</strong>「教科: 内容」形式で自動タグ付き<br/>
                    例: <code style={{ background:"#eee", padding:"1px 5px", borderRadius:4 }}>数学: P.45 問1〜10</code><br/>
                    重要マーク: <code style={{ background:"#eee", padding:"1px 5px", borderRadius:4 }}>#重要 国語: 漢字テスト</code>
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

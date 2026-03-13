"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────
interface Room {
  id: string;
  name: string;
  pw: string | null;
  createdAt: number;
  createdBy: string;
}

interface Message {
  id: string;
  roomId: string;
  author: string;
  text: string;
  ts: number;
}

// ─── Storage helpers ──────────────────────────────────────
const ROOMS_KEY = "reroom_rooms";
const MSGS_KEY  = "reroom_msgs";
const USER_KEY  = "reroom_user";

function getRooms(): Room[] {
  try { return JSON.parse(localStorage.getItem(ROOMS_KEY) || "[]"); }
  catch { return []; }
}
function setRooms(r: Room[]) { localStorage.setItem(ROOMS_KEY, JSON.stringify(r)); }

function getMsgs(): Message[] {
  try { return JSON.parse(localStorage.getItem(MSGS_KEY) || "[]"); }
  catch { return []; }
}
function setMsgs(m: Message[]) { localStorage.setItem(MSGS_KEY, JSON.stringify(m)); }

function getSavedUser(): string {
  return localStorage.getItem(USER_KEY) || "";
}
function setSavedUser(u: string) { localStorage.setItem(USER_KEY, u); }

function fmt(ts: number) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
}

function uid() { return Math.random().toString(36).slice(2,10); }

// ─── Seed demo rooms ──────────────────────────────────────
function seedRooms() {
  if (getRooms().length === 0) {
    setRooms([
      { id: "general", name: "general",       pw: null,      createdAt: Date.now(), createdBy: "system" },
      { id: "secret",  name: "secret-lounge", pw: "room123", createdAt: Date.now(), createdBy: "system" },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════
export default function RoomPage() {
  // ── view: "login" | "lobby" | "chat"
  const [view, setView]         = useState<"login"|"lobby"|"chat">("login");
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [anon, setAnon]         = useState(false);
  const [anonN, setAnonN]       = useState(1);

  const [rooms, setRoomsState]  = useState<Room[]>([]);
  const [msgs,  setMsgsState]   = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // create-room modal
  const [showCreate,   setShowCreate]   = useState(false);
  const [newRoomName,  setNewRoomName]  = useState("");
  const [newRoomPw,    setNewRoomPw]    = useState("");

  // pw modal
  const [showPwModal,  setShowPwModal]  = useState(false);
  const [pendingRoom,  setPendingRoom]  = useState<Room | null>(null);
  const [enterPw,      setEnterPw]      = useState("");
  const [pwError,      setPwError]      = useState("");

  // edit modal
  const [showEdit,     setShowEdit]     = useState(false);
  const [editRoom,     setEditRoom]     = useState<Room | null>(null);
  const [editName,     setEditName]     = useState("");
  const [editPw,       setEditPw]       = useState("");

  // delete confirm modal
  const [showDelete,   setShowDelete]   = useState(false);
  const [deleteRoom,   setDeleteRoom]   = useState<Room | null>(null);

  // chat
  const [chatInput,    setChatInput]    = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // toast
  const [toast, setToast]   = useState("");
  const [toastVis, setToastVis] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  // poll
  const pollRef = useRef<ReturnType<typeof setInterval>|null>(null);

  // ── init
  useEffect(() => {
    seedRooms();
    setRoomsState(getRooms());
    setMsgsState(getMsgs());
    const saved = getSavedUser();
    if (saved) { setUsername(saved); setInputName(saved); }
  }, []);

  // ── auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, currentRoom]);

  // ── poll messages
  useEffect(() => {
    if (view === "chat") {
      pollRef.current = setInterval(() => {
        setMsgsState(getMsgs());
      }, 800);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [view]);

  function showToast(msg: string) {
    setToast(msg);
    setToastVis(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVis(false), 2500);
  }

  // ── Login
  function doLogin() {
    if (anon) {
      const name = `anon_${anonN}`;
      setAnonN(n => n + 1);
      setUsername(name);
      setRoomsState(getRooms());
      setView("lobby");
      return;
    }
    const n = inputName.trim();
    if (!n) { showToast("ニックネームを入力してください"); return; }
    setUsername(n);
    setSavedUser(n);
    setRoomsState(getRooms());
    setView("lobby");
  }

  // ── Create room
  function createRoom() {
    const name = newRoomName.trim();
    if (!name) { showToast("ルーム名を入力してください"); return; }
    const all = getRooms();
    if (all.find(r => r.name === name)) { showToast("同名のルームが既にあります"); return; }
    const room: Room = { id: uid(), name, pw: newRoomPw || null, createdAt: Date.now(), createdBy: username };
    const updated = [...all, room];
    setRooms(updated);
    setRoomsState(updated);
    setNewRoomName(""); setNewRoomPw("");
    setShowCreate(false);
    showToast(`「${name}」を作成しました`);
  }

  // ── Join
  function tryJoin(room: Room) {
    if (room.pw) {
      setPendingRoom(room);
      setEnterPw(""); setPwError("");
      setShowPwModal(true);
    } else {
      joinRoom(room);
    }
  }

  function joinLocked() {
    if (!pendingRoom) return;
    if (enterPw !== pendingRoom.pw) { setPwError("パスワードが違います"); return; }
    setShowPwModal(false);
    joinRoom(pendingRoom);
  }

  function joinRoom(room: Room) {
    setCurrentRoom(room);
    setMsgsState(getMsgs());
    setView("chat");
  }

  function leaveRoom() {
    if (pollRef.current) clearInterval(pollRef.current);
    setCurrentRoom(null);
    setRoomsState(getRooms());
    setView("lobby");
  }

  // ── Edit room
  function openEdit(e: React.MouseEvent, room: Room) {
    e.stopPropagation();
    setEditRoom(room);
    setEditName(room.name);
    setEditPw(room.pw || "");
    setShowEdit(true);
  }

  function saveEdit() {
    if (!editRoom) return;
    const name = editName.trim();
    if (!name) { showToast("ルーム名を入力してください"); return; }
    const all = getRooms();
    if (all.find(r => r.name === name && r.id !== editRoom.id)) {
      showToast("同名のルームが既にあります"); return;
    }
    const updated = all.map(r =>
      r.id === editRoom.id ? { ...r, name, pw: editPw || null } : r
    );
    setRooms(updated);
    setRoomsState(updated);
    setShowEdit(false);
    showToast("ルームを更新しました");
  }

  // ── Delete room
  function openDelete(e: React.MouseEvent, room: Room) {
    e.stopPropagation();
    setDeleteRoom(room);
    setShowDelete(true);
  }

  function confirmDelete() {
    if (!deleteRoom) return;
    const updatedRooms = getRooms().filter(r => r.id !== deleteRoom.id);
    const updatedMsgs  = getMsgs().filter(m => m.roomId !== deleteRoom.id);
    setRooms(updatedRooms);
    setMsgs(updatedMsgs);
    setRoomsState(updatedRooms);
    setMsgsState(updatedMsgs);
    setShowDelete(false);
    showToast(`「${deleteRoom.name}」を削除しました`);
  }

  // ── Send message
  function sendMessage() {
    if (!chatInput.trim() || !currentRoom) return;
    const msg: Message = {
      id: uid(), roomId: currentRoom.id,
      author: username, text: chatInput.trim(), ts: Date.now(),
    };
    const updated = [...getMsgs(), msg];
    setMsgs(updated);
    setMsgsState(updated);
    setChatInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const roomMsgs = msgs.filter(m => m.roomId === currentRoom?.id);

  // ════════════════════════════════════════════════════════
  return (
    <div className="reroom-root">
      <style>{`
        /* ── Reset & base ── */
        .reroom-root {
          min-height: 100dvh;
          background: #f8f9fa;
          font-family: 'Geist', 'Geist Sans', system-ui, sans-serif;
          color: #1a1a2e;
          display: flex;
          flex-direction: column;
        }

        /* ── Top header (matches re!RACK) ── */
        .rr-header {
          position: sticky; top: 0; z-index: 40;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          padding: 0 16px;
          height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
        }
        .rr-logo {
          font-size: 1.15rem; font-weight: 700; color: #1a1a2e;
          display: flex; align-items: center; gap: 6px;
        }
        .rr-logo span { color: #2563eb; }
        .rr-header-right { display: flex; align-items: center; gap: 10px; }
        .rr-user-badge {
          font-size: .78rem; color: #6b7280;
          background: #f3f4f6; border-radius: 20px;
          padding: 4px 10px;
          display: flex; align-items: center; gap: 5px;
        }
        .rr-dot { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; }
        .rr-btn-sm {
          font-size: .78rem; font-family: inherit;
          padding: 5px 12px; border-radius: 8px;
          border: 1px solid #e5e7eb; background: #fff;
          color: #374151; cursor: pointer;
          transition: background .15s;
        }
        .rr-btn-sm:hover { background: #f9fafb; }

        /* ── Main layout ── */
        .rr-main { flex: 1; display: flex; flex-direction: column; }

        /* ── Page title band ── */
        .rr-page-band {
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 20px 14px;
        }
        .rr-page-title {
          font-size: 1.35rem; font-weight: 700; color: #1a1a2e;
        }
        .rr-page-sub { font-size: .82rem; color: #9ca3af; margin-top: 2px; }

        /* ══ LOGIN ══ */
        .rr-center {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 40px 16px;
        }
        .rr-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #e5e7eb;
          padding: 32px 28px; width: min(400px, 100%);
          box-shadow: 0 2px 16px rgba(0,0,0,.06);
        }
        .rr-card-title {
          font-size: 1.1rem; font-weight: 700;
          margin-bottom: 22px; color: #1a1a2e;
        }
        .rr-field { margin-bottom: 14px; }
        .rr-label {
          display: block; font-size: .75rem; color: #6b7280;
          margin-bottom: 5px; font-weight: 500; letter-spacing: .3px;
        }
        .rr-input {
          width: 100%; padding: 10px 13px;
          border: 1px solid #e5e7eb; border-radius: 10px;
          font-family: inherit; font-size: .9rem; color: #1a1a2e;
          background: #fafafa; outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .rr-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.1);
          background: #fff;
        }
        .rr-toggle-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 18px; cursor: pointer;
          padding: 10px 12px; border-radius: 10px;
          border: 1px solid #e5e7eb;
          transition: background .15s;
        }
        .rr-toggle-row:hover { background: #f9fafb; }
        .rr-toggle {
          width: 36px; height: 20px; background: #e5e7eb;
          border-radius: 20px; position: relative;
          transition: background .2s; flex-shrink: 0;
        }
        .rr-toggle.on { background: #2563eb; }
        .rr-toggle::after {
          content: ''; position: absolute;
          top: 3px; left: 3px; width: 14px; height: 14px;
          background: #fff; border-radius: 50%;
          transition: transform .2s;
          box-shadow: 0 1px 3px rgba(0,0,0,.2);
        }
        .rr-toggle.on::after { transform: translateX(16px); }
        .rr-toggle-label { font-size: .85rem; color: #374151; }
        .rr-btn {
          display: block; width: 100%;
          padding: 11px; border-radius: 10px;
          background: #2563eb; color: #fff;
          font-family: inherit; font-size: .9rem; font-weight: 600;
          border: none; cursor: pointer;
          transition: background .15s, transform .1s;
        }
        .rr-btn:hover { background: #1d4ed8; }
        .rr-btn:active { transform: scale(.98); }
        .rr-btn.outline {
          background: #fff; color: #374151;
          border: 1px solid #e5e7eb;
        }
        .rr-btn.outline:hover { background: #f9fafb; }
        .rr-btn.danger { background: #ef4444; }
        .rr-btn.danger:hover { background: #dc2626; }

        /* ══ LOBBY ══ */
        .rr-lobby { flex: 1; overflow-y: auto; padding: 20px 16px 80px; }
        .rr-section-label {
          font-size: .72rem; font-weight: 600; color: #9ca3af;
          letter-spacing: 1.5px; text-transform: uppercase;
          margin-bottom: 10px; margin-top: 22px;
          display: flex; align-items: center; gap: 10px;
        }
        .rr-section-label::after { content:''; flex:1; height:1px; background:#f0f0f0; }
        .rr-create-row {
          display: flex; gap: 8px; margin-bottom: 4px;
        }
        .rr-create-row .rr-input { flex:1; }
        .rr-create-row .rr-btn { width: auto; padding: 10px 18px; font-size:.85rem; }
        .rr-room-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 10px;
        }
        .rr-room-card {
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 12px; padding: 16px;
          cursor: pointer; transition: border-color .15s, box-shadow .15s, transform .1s;
        }
        .rr-room-card:hover {
          border-color: #2563eb;
          box-shadow: 0 4px 16px rgba(37,99,235,.08);
          transform: translateY(-1px);
        }
        .rr-room-card-name {
          font-weight: 700; font-size: .95rem; color: #1a1a2e;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 5px;
        }
        .rr-room-card-name .lock { font-size: .8rem; opacity:.6; }
        .rr-room-meta { font-size: .75rem; color: #9ca3af; }
        .rr-room-online { display:flex; align-items:center; gap:4px; }
        .rr-room-online::before {
          content:''; width:6px; height:6px;
          background:#22c55e; border-radius:50%;
        }
        .rr-empty {
          grid-column: 1/-1; text-align:center;
          padding: 48px 20px; color: #9ca3af;
        }
        .rr-empty-icon { font-size:2rem; margin-bottom:10px; }

        /* ── Room card owner actions ── */
        .rr-room-card-actions {
          display: flex; gap: 6px; margin-top: 10px;
        }
        .rr-action-btn {
          flex: 1; padding: 5px 0; font-size: .72rem; font-family: inherit;
          border-radius: 7px; border: 1px solid #e5e7eb;
          background: #f9fafb; color: #6b7280; cursor: pointer;
          transition: background .15s, color .15s, border-color .15s;
        }
        .rr-action-btn:hover { background: #f3f4f6; color: #374151; }
        .rr-action-btn.del { color: #ef4444; border-color: #fca5a5; background: #fff5f5; }
        .rr-action-btn.del:hover { background: #fee2e2; }

        /* ══ CHAT ══ */
        .rr-chat-layout { flex:1; display:flex; flex-direction:column; overflow:hidden; }
        .rr-chat-topbar {
          display:flex; align-items:center; justify-content:space-between;
          padding: 10px 16px;
          background:#fff; border-bottom:1px solid #e5e7eb;
        }
        .rr-chat-info { display:flex; align-items:center; gap:10px; }
        .rr-back {
          background:none; border:none; font-size:1.15rem;
          cursor:pointer; color:#6b7280; padding:4px 6px;
          border-radius:8px; transition:background .15s;
        }
        .rr-back:hover { background:#f3f4f6; color:#1a1a2e; }
        .rr-chat-room-name { font-weight:700; font-size:.95rem; }
        .rr-chat-room-sub  { font-size:.73rem; color:#9ca3af; }

        .rr-messages {
          flex:1; overflow-y:auto; padding:16px;
          display:flex; flex-direction:column; gap:12px;
          scroll-behavior:smooth;
        }
        /* scrollbar */
        .rr-messages::-webkit-scrollbar { width:4px; }
        .rr-messages::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:4px; }

        .rr-msg-group { display:flex; flex-direction:column; gap:2px; }
        .rr-msg-group.own { align-items:flex-end; }
        .rr-msg-header {
          display:flex; align-items:baseline; gap:6px; margin-bottom:3px;
          font-size:.73rem;
        }
        .rr-msg-group.own .rr-msg-header { flex-direction:row-reverse; }
        .rr-msg-author { font-weight:700; color:#2563eb; }
        .rr-msg-group.other .rr-msg-author { color:#7c3aed; }
        .rr-msg-time { color:#9ca3af; }
        .rr-bubble {
          display:inline-block;
          max-width: min(72%, 480px);
          padding: 9px 13px; border-radius:14px;
          font-size:.88rem; line-height:1.55;
          word-break:break-word;
        }
        .rr-msg-group.own .rr-bubble {
          background: #2563eb; color:#fff;
          border-radius: 14px 14px 4px 14px;
        }
        .rr-msg-group.other .rr-bubble {
          background: #f3f4f6; color:#1a1a2e;
          border: 1px solid #e5e7eb;
          border-radius: 14px 14px 14px 4px;
        }
        .rr-sys-msg {
          text-align:center; font-size:.72rem; color:#9ca3af;
          align-self:center; padding:3px 12px;
          background:#f9fafb; border-radius:20px;
          border:1px solid #e5e7eb;
        }

        .rr-input-row {
          display:flex; gap:8px; padding:12px 16px;
          background:#fff; border-top:1px solid #e5e7eb;
        }
        .rr-chat-input {
          flex:1; padding:10px 14px;
          border:1px solid #e5e7eb; border-radius:24px;
          font-family:inherit; font-size:.88rem; color:#1a1a2e;
          background:#f9fafb; outline:none; resize:none;
          max-height:100px; transition:border-color .15s;
          line-height:1.4;
        }
        .rr-chat-input:focus {
          border-color:#2563eb;
          box-shadow:0 0 0 3px rgba(37,99,235,.08);
          background:#fff;
        }
        .rr-send {
          width:40px; height:40px; flex-shrink:0;
          background:#2563eb; border:none; border-radius:50%;
          color:#fff; font-size:1rem; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:background .15s, transform .1s;
        }
        .rr-send:hover { background:#1d4ed8; }
        .rr-send:active { transform:scale(.92); }



        /* ── Modal overlay ── */
        .rr-overlay {
          display:none; position:fixed; inset:0;
          background:rgba(0,0,0,.4); backdrop-filter:blur(4px);
          z-index:200; align-items:center; justify-content:center;
        }
        .rr-overlay.open { display:flex; }
        .rr-modal {
          background:#fff; border-radius:16px;
          padding:28px; width:min(360px,90vw);
          box-shadow:0 20px 60px rgba(0,0,0,.15);
          animation: modal-in .18s ease-out;
        }
        @keyframes modal-in {
          from { opacity:0; transform:scale(.95) translateY(8px); }
          to   { opacity:1; transform:none; }
        }
        .rr-modal-title {
          font-size:1rem; font-weight:700; margin-bottom:18px; color:#1a1a2e;
        }
        .rr-modal-btns { display:flex; gap:8px; margin-top:18px; }
        .rr-modal-btns .rr-btn { flex:1; }
        .rr-error { font-size:.78rem; color:#ef4444; margin-top:4px; }

        /* ── Toast ── */
        .rr-toast {
          position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
          background:#1a1a2e; color:#fff;
          padding:9px 18px; border-radius:24px; font-size:.82rem;
          z-index:9999; white-space:nowrap;
          transition:opacity .25s;
          pointer-events:none;
        }
        .rr-toast.hide { opacity:0; }
        .rr-toast.show { opacity:1; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      {view !== "login" && (
        <header className="rr-header">
          <div className="rr-logo">re!<span>RACK</span></div>
          <div className="rr-header-right">
            {view === "lobby" && (
              <>
                <div className="rr-user-badge">
                  <div className="rr-dot" />
                  {username}
                </div>
                <button className="rr-btn-sm" onClick={() => { setSavedUser(""); setView("login"); }}>
                  ログアウト
                </button>
              </>
            )}
            {view === "chat" && (
              <button className="rr-btn-sm" style={{ color:"#ef4444", borderColor:"#fca5a5" }} onClick={leaveRoom}>
                退出
              </button>
            )}
          </div>
        </header>
      )}

      {/* ═══ LOGIN ═══ */}
      {view === "login" && (
        <div className="rr-main">
          <header className="rr-header">
            <div className="rr-logo">re!<span>RACK</span></div>
          </header>
          <div className="rr-center">
            <div className="rr-card">
              <div className="rr-card-title">💬 re!Room に入室</div>

              <div className="rr-field">
                <label className="rr-label">ニックネーム</label>
                <input
                  className="rr-input"
                  placeholder={anon ? "自動で設定されます" : "好きな名前を入力..."}
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doLogin()}
                  disabled={anon}
                />
              </div>

              <div className="rr-toggle-row" onClick={() => setAnon(a => !a)}>
                <div className={`rr-toggle ${anon ? "on" : ""}`} />
                <span className="rr-toggle-label">🕶 匿名モードで入室する</span>
              </div>

              <button className="rr-btn" onClick={doLogin}>入室する →</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LOBBY ═══ */}
      {view === "lobby" && (
        <div className="rr-main">
          <div className="rr-page-band">
            <div className="rr-page-title">💬 re!Room</div>
            <div className="rr-page-sub">プライベートチャットスペース</div>
          </div>

          <div className="rr-lobby">
            <div className="rr-section-label">ルームを作成</div>
            <div className="rr-create-row">
              <input
                className="rr-input"
                placeholder="新しいルーム名..."
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setShowCreate(true)}
              />
              <button className="rr-btn" onClick={() => setShowCreate(true)}>+ 作成</button>
            </div>

            <div className="rr-section-label" style={{ marginTop: 28 }}>公開ルーム</div>
            <div className="rr-room-grid">
              {rooms.length === 0 ? (
                <div className="rr-empty">
                  <div className="rr-empty-icon">💬</div>
                  <div>まだルームがありません</div>
                </div>
              ) : rooms.map(room => {
                const roomMsgsLocal = msgs.filter(m => m.roomId === room.id);
                const members = [...new Set(roomMsgsLocal.map(m => m.author))];
                const last = roomMsgsLocal[roomMsgsLocal.length - 1];
                return (
                  <div key={room.id} className="rr-room-card" onClick={() => tryJoin(room)}>
                    <div className="rr-room-card-name">
                      # {room.name}
                      {room.pw && <span className="lock">🔒</span>}
                    </div>
                    <div className="rr-room-meta rr-room-online">
                      {members.length > 0 ? `${members.length}人が参加中` : "まだ誰もいません"}
                    </div>
                    {last && (
                      <div className="rr-room-meta" style={{ marginTop:4, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                        {last.author}: {last.text}
                      </div>
                    )}
                    {room.createdBy === username && (
                      <div className="rr-room-card-actions">
                        <button className="rr-action-btn" onClick={e => openEdit(e, room)}>✏️ 編集</button>
                        <button className="rr-action-btn del" onClick={e => openDelete(e, room)}>🗑 削除</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CHAT ═══ */}
      {view === "chat" && currentRoom && (
        <div className="rr-chat-layout">
          <div className="rr-chat-topbar">
            <div className="rr-chat-info">
              <button className="rr-back" onClick={leaveRoom}>←</button>
              <div>
                <div className="rr-chat-room-name"># {currentRoom.name}</div>
                <div className="rr-chat-room-sub">
                  {[...new Set(roomMsgs.map(m => m.author))].slice(0,3).join(", ") || "まだ誰もいません"}
                </div>
              </div>
            </div>
          </div>

          <div className="rr-messages">
            {roomMsgs.length === 0 && (
              <div className="rr-sys-msg">メッセージはまだありません。最初に話しかけよう！</div>
            )}
            {roomMsgs.map((msg, i) => {
              const isOwn = msg.author === username;
              const prevMsg = roomMsgs[i - 1];
              const showHeader = !prevMsg || prevMsg.author !== msg.author ||
                msg.ts - prevMsg.ts > 120000;
              return (
                <div key={msg.id} className={`rr-msg-group ${isOwn ? "own" : "other"}`}>
                  {showHeader && (
                    <div className="rr-msg-header">
                      <span className="rr-msg-author">{isOwn ? "あなた" : msg.author}</span>
                      <span className="rr-msg-time">{fmt(msg.ts)}</span>
                    </div>
                  )}
                  <div className="rr-bubble">{msg.text}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="rr-input-row">
            <textarea
              className="rr-chat-input"
              placeholder="メッセージを入力... (Enter で送信)"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className="rr-send" onClick={sendMessage}>↑</button>
          </div>
        </div>
      )}



      {/* ═══ CREATE MODAL ═══ */}
      <div className={`rr-overlay ${showCreate ? "open" : ""}`}
        onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
        <div className="rr-modal">
          <div className="rr-modal-title">✏️ 新しいルームを作成</div>
          <div className="rr-field">
            <label className="rr-label">ルーム名</label>
            <input className="rr-input" placeholder="例: 雑談部屋"
              value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
          </div>
          <div className="rr-field">
            <label className="rr-label">パスワード（空欄で公開ルーム）</label>
            <input className="rr-input" type="password" placeholder="任意"
              value={newRoomPw} onChange={e => setNewRoomPw(e.target.value)} />
          </div>
          <div className="rr-modal-btns">
            <button className="rr-btn outline" onClick={() => setShowCreate(false)}>キャンセル</button>
            <button className="rr-btn" onClick={createRoom}>作成する</button>
          </div>
        </div>
      </div>

      {/* ═══ PASSWORD MODAL ═══ */}
      <div className={`rr-overlay ${showPwModal ? "open" : ""}`}
        onClick={e => { if (e.target === e.currentTarget) setShowPwModal(false); }}>
        <div className="rr-modal">
          <div className="rr-modal-title">🔒 パスワードを入力</div>
          <p style={{ fontSize:".82rem", color:"#6b7280", marginBottom:16 }}>
            このルームはパスワードで保護されています
          </p>
          <div className="rr-field">
            <label className="rr-label">パスワード</label>
            <input className="rr-input" type="password" placeholder="パスワードを入力"
              value={enterPw}
              onChange={e => { setEnterPw(e.target.value); setPwError(""); }}
              onKeyDown={e => e.key === "Enter" && joinLocked()} />
            {pwError && <div className="rr-error">{pwError}</div>}
          </div>
          <div className="rr-modal-btns">
            <button className="rr-btn outline" onClick={() => setShowPwModal(false)}>キャンセル</button>
            <button className="rr-btn" onClick={joinLocked}>入室する</button>
          </div>
        </div>
      </div>

      {/* ═══ EDIT MODAL ═══ */}
      <div className={`rr-overlay ${showEdit ? "open" : ""}`}
        onClick={e => { if (e.target === e.currentTarget) setShowEdit(false); }}>
        <div className="rr-modal">
          <div className="rr-modal-title">✏️ ルームを編集</div>
          <div className="rr-field">
            <label className="rr-label">ルーム名</label>
            <input className="rr-input" value={editName}
              onChange={e => setEditName(e.target.value)} />
          </div>
          <div className="rr-field">
            <label className="rr-label">パスワード（空欄で公開ルームに変更）</label>
            <input className="rr-input" type="password" placeholder="任意"
              value={editPw} onChange={e => setEditPw(e.target.value)} />
          </div>
          <div className="rr-modal-btns">
            <button className="rr-btn outline" onClick={() => setShowEdit(false)}>キャンセル</button>
            <button className="rr-btn" onClick={saveEdit}>保存する</button>
          </div>
        </div>
      </div>

      {/* ═══ DELETE CONFIRM MODAL ═══ */}
      <div className={`rr-overlay ${showDelete ? "open" : ""}`}
        onClick={e => { if (e.target === e.currentTarget) setShowDelete(false); }}>
        <div className="rr-modal">
          <div className="rr-modal-title">🗑 ルームを削除</div>
          <p style={{ fontSize:".85rem", color:"#6b7280", marginBottom:8 }}>
            「<strong>{deleteRoom?.name}</strong>」を削除しますか？
          </p>
          <p style={{ fontSize:".78rem", color:"#ef4444" }}>
            ※ ルーム内のメッセージもすべて削除されます
          </p>
          <div className="rr-modal-btns">
            <button className="rr-btn outline" onClick={() => setShowDelete(false)}>キャンセル</button>
            <button className="rr-btn danger" onClick={confirmDelete}>削除する</button>
          </div>
        </div>
      </div>

      {/* ═══ TOAST ═══ */}
      <div className={`rr-toast ${toastVis ? "show" : "hide"}`}>{toast}</div>
    </div>
  );
}

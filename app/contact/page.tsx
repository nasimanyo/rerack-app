"use client";

import { useState } from "react";
import { Header } from "../../components/Header";
import { Send, MessageCircle, Bug, Megaphone, Sparkles, CheckCircle2 } from "lucide-react";

type Category = "general" | "feature" | "bug" | "other";

const categories: { id: Category; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { id: "general", label: "一般的なお問い合わせ", icon: <MessageCircle size={16} />, color: "text-blue-600",   bg: "bg-blue-50 border-blue-200"   },
  { id: "feature", label: "機能リクエスト",       icon: <Sparkles    size={16} />, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { id: "bug",     label: "バグ報告",             icon: <Bug         size={16} />, color: "text-red-500",    bg: "bg-red-50 border-red-200"      },
  { id: "other",   label: "その他",               icon: <Megaphone   size={16} />, color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
];

export default function ContactPage() {
  const [category, setCategory] = useState<Category>("general");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [message,  setMessage]  = useState("");
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");

  const TO = "nasimanyo1209@gmail.com";

  function handleSubmit() {
    if (!name.trim())    { setError("お名前を入力してください"); return; }
    if (!message.trim()) { setError("メッセージを入力してください"); return; }
    setError("");

    const cat  = categories.find(c => c.id === category)?.label ?? category;
    const body = encodeURIComponent(
      `【カテゴリ】${cat}\n【お名前】${name}\n【返信先】${email || "未入力"}\n\n${message}`
    );
    const subject = encodeURIComponent(`[re!RACK お問い合わせ] ${cat}`);

    window.location.href = `mailto:${TO}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <Header />

      <main className="max-w-lg mx-auto px-4 pt-24 pb-20">

        {/* ── ヘッダーバナー ── */}
        <div className="relative bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-8 pt-8 pb-6 mb-6 overflow-hidden">
          {/* 装飾ドット */}
          <div className="absolute top-4 right-6 flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-2">Contact Us</p>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 leading-tight">
            お問い合わせ
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-3 leading-relaxed">
            ご意見・バグ報告・機能リクエストなどをお気軽にどうぞ。<br />
            メールアプリが開きますので、そのまま送信してください。
          </p>
        </div>

        {sent ? (
          /* ── 送信完了画面 ── */
          <div className="bg-white rounded-[2rem] border-[3px] border-green-400 shadow-[6px_6px_0px_0px_rgba(74,222,128,0.4)] px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-500" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">メールアプリが開きました</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
              そのまま送信ボタンを押してください。<br />
              ご連絡ありがとうございます！
            </p>
            <button
              onClick={() => setSent(false)}
              className="px-8 py-3 bg-black text-white font-black rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg"
            >
              別の内容を送る
            </button>
          </div>
        ) : (
          /* ── フォーム ── */
          <div className="bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-8 py-8 space-y-6">

            {/* カテゴリ選択 */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-3">
                カテゴリ
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95
                      ${category === cat.id
                        ? `${cat.bg} ${cat.color} border-current shadow-sm`
                        : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                      }`}
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* お名前 */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-2">
                お名前 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="山田 太郎"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 font-bold text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* 返信用メール（任意） */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-2">
                返信先メール <span className="text-gray-300 font-medium normal-case tracking-normal text-[10px]">（任意）</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 font-bold text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* メッセージ */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-2">
                メッセージ <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="お問い合わせ内容を入力してください..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 font-bold text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all resize-none placeholder:text-gray-300 leading-relaxed"
              />
            </div>

            {/* エラー */}
            {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                ⚠️ {error}
              </p>
            )}

            {/* 送信先表示 */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
              <Send size={13} className="text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-400 font-bold truncate">
                送信先: {TO}
              </p>
            </div>

            {/* 送信ボタン */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:bg-gray-800 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] active:scale-95 transition-all flex items-center justify-center gap-2 text-base"
            >
              <Send size={18} strokeWidth={2.5} />
              メールアプリで開く
            </button>

            <p className="text-[11px] text-gray-400 text-center font-medium leading-relaxed">
              ボタンを押すとメールアプリが起動します。<br />
              内容を確認してから送信してください。
            </p>

          </div>
        )}

        {/* 広告ポリシー */}
        <div className="mt-6 px-6 py-4 bg-white rounded-2xl border border-gray-100 space-y-1.5">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">広告ポリシー</p>
          {[
            "本サービスでは画面の一部に画像形式の広告を表示する場合があります。",
            "本サービスは商業広告媒体ではありません。",
            "企業・法人・営利団体からの広告掲載依頼は受け付けておりません。",
          ].map((text, i) => (
            <p key={i} className="text-[11px] text-gray-400 font-medium leading-relaxed flex gap-2">
              <span className="text-gray-300 font-black flex-shrink-0">{i + 1}.</span>
              {text}
            </p>
          ))}
        </div>

      </main>
    </div>
  );
}

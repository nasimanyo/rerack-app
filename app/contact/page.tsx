"use client";

import { useState } from "react";
import { Header } from "../../components/Header";
import { ChevronDown, Mail, MessageCircle, Bug, Sparkles, Shield } from "lucide-react";

const faqs = [
  {
    icon: <MessageCircle size={15} />,
    color: "text-blue-500",
    bg: "bg-blue-50",
    q: "re!RACKはどんなサービスですか？",
    a: "クラスの宿題・持ち物・お知らせを共有するための学校向けアプリです。卒業カウントダウンやチャット機能（re!Room）も搭載しています。",
  },
  {
    icon: <MessageCircle size={15} />,
    color: "text-blue-500",
    bg: "bg-blue-50",
    q: "re!Roomのデータはどこに保存されますか？",
    a: "re!Roomのメッセージ・ルーム情報はお使いのブラウザのlocalStorageに保存されます。他の端末や別ブラウザからは見えません。",
  },
  {
    icon: <Sparkles size={15} />,
    color: "text-purple-500",
    bg: "bg-purple-50",
    q: "新しい機能を追加してほしいのですが？",
    a: "ご要望は大歓迎です！下記のメールアドレスに「機能リクエスト」とわかるタイトルでご連絡ください。すべての要望に対応できるわけではありませんが、参考にさせていただきます。",
  },
  {
    icon: <Bug size={15} />,
    color: "text-red-500",
    bg: "bg-red-50",
    q: "バグや不具合を見つけました",
    a: "ご報告ありがとうございます。発生した状況（どの画面で・何をしたときに・どうなったか）をできるだけ詳しく下記メールにお送りください。迅速に対応します。",
  },
  {
    icon: <Shield size={15} />,
    color: "text-green-500",
    bg: "bg-green-50",
    q: "広告について教えてください",
    a: "本サービスは非営利目的で運営しています。掲載される広告はすべて非商業的なものに限られ、企業・法人・営利団体からの広告掲載依頼は受け付けていません。",
  },
  {
    icon: <Shield size={15} />,
    color: "text-green-500",
    bg: "bg-green-50",
    q: "個人情報はどう扱われますか？",
    a: "re!RACKはユーザーの個人情報をサーバーに収集・保存しません。宿題データはSupabase（外部DB）に、チャットデータはブラウザのみに保存されます。",
  },
];

interface FaqItemProps {
  icon: React.ReactNode;
  color: string;
  bg: string;
  q: string;
  a: string;
}

function FaqItem({ icon, color, bg, q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden
        ${open ? "border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "border-gray-100 hover:border-gray-200"}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left bg-white"
      >
        <span className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          {icon}
        </span>
        <span className="flex-1 font-bold text-sm text-gray-800 leading-snug">{q}</span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white">
          <div className="ml-10 pt-1 border-t border-gray-100">
            <p className="text-sm text-gray-600 font-medium leading-relaxed mt-3">{a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <Header />

      <main className="max-w-lg mx-auto px-4 pt-24 pb-20 space-y-6">

        {/* ── ヘッダーバナー ── */}
        <div className="relative bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-8 pt-8 pb-7 overflow-hidden">
          <div className="absolute top-4 right-6 flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-1">Help & Contact</p>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900">よくある質問</h1>
          <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
            解決しない場合はメールでお気軽にどうぞ。
          </p>
        </div>

        {/* ── Q&A ── */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} {...faq} />
          ))}
        </div>

        {/* ── 直接連絡 ── */}
        <div className="bg-white rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-8 py-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
              <Mail size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Direct Contact</p>
              <h2 className="text-base font-black text-gray-900">直接メールで連絡する</h2>
            </div>
          </div>

          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-5">
            Q&Aで解決しない場合や、バグ報告・機能リクエストは以下のアドレスへどうぞ。
          </p>

          {/* メールアドレス直書き */}
          <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4">
            <Mail size={16} className="text-gray-400 flex-shrink-0" />
            <span className="font-black text-gray-800 text-sm tracking-tight select-all">
              nasimanyo1209@gmail.com
            </span>
          </div>

          <p className="text-[11px] text-gray-400 font-medium mt-3 leading-relaxed">
            ※ メールアドレスをコピーして、お使いのメールアプリから送信してください。
          </p>
        </div>

      </main>
    </div>
  );
}

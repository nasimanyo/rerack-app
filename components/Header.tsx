"use client";

import { Home, BookOpen, Wrench, Settings, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onGoToToday?: () => void;
  onOpenAdmin?: () => void;
  onOpenHomework?: () => void;
}

export const Header = ({ onGoToToday, onOpenAdmin, onOpenHomework }: HeaderProps) => {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-40 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">

        {/* ロゴ */}
        <Link href="/" onClick={onGoToToday} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm flex items-center justify-center bg-white border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="re!RACK" width={28} height={28} style={{ objectFit: "contain" }} />
          </div>
          <h1 className="text-base font-extrabold tracking-tighter text-gray-800">re!RACK</h1>
        </Link>

        {/* ナビ */}
        <div className="flex items-center gap-0.5">

          {/* ホーム */}
          <Link
            href="/"
            onClick={onGoToToday}
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl transition-all ${
              isHome ? 'text-black bg-gray-100' : 'text-gray-400 hover:text-black'
            }`}
          >
            <Home size={17} strokeWidth={isHome ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-0.5">ホーム</span>
          </Link>

          {/* 宿題 */}
          <button
            onClick={onOpenHomework}
            className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl transition-all text-gray-400 hover:text-blue-600"
          >
            <BookOpen size={17} strokeWidth={2} />
            <span className="text-[10px] font-bold mt-0.5">宿題</span>
          </button>

          {/* ツール */}
          <Link
            href="/contact"
            className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl text-gray-400 hover:text-green-600 transition-all"
          >
            <Mail size={17} strokeWidth={2} />
            <span className="text-[10px] font-bold mt-0.5">連絡</span>
          </Link>

          {/* 管理 */}
          <button
            onClick={onOpenAdmin}
            className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl transition-all text-gray-400 hover:text-orange-500"
          >
            <Settings size={17} strokeWidth={2} />
            <span className="text-[10px] font-bold mt-0.5">管理</span>
          </button>

        </div>
      </div>
    </nav>
  );
};

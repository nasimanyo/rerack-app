"use client";

import { Home, Edit3 } from 'lucide-react';

interface HeaderProps {
  onGoToToday: () => void;
  onOpenAdmin: () => void;
}

export const Header = ({ onGoToToday, onOpenAdmin }: HeaderProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 px-4 py-2 shadow-sm">
      <div className="max-w-md mx-auto flex justify-between items-center h-12">
        {/* ロゴ部分 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <h1 className="text-lg font-extrabold tracking-tighter text-gray-800">re!RACK</h1>
        </div>

        {/* ボタン類 */}
        <div className="flex gap-5">
          <button 
            onClick={onGoToToday}
            className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Home size={20} />
            <span className="text-[10px] font-bold mt-0.5">今日</span>
          </button>
          
          <button 
            onClick={onOpenAdmin}
            className="flex flex-col items-center justify-center text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Edit3 size={20} />
            <span className="text-[10px] font-bold mt-0.5">編集</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
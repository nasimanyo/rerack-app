"use client";

import { Home, BookOpen, MessageSquare, Settings, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onGoToToday: () => void;
  onOpenAdmin: () => void;
}

export const Header = ({ onGoToToday, onOpenAdmin }: HeaderProps) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'ホーム',
      icon: Home,
      href: '/',
      onClick: onGoToToday,
      activeColor: 'text-blue-600',
      hoverColor: 'hover:text-blue-600',
    },
    {
      label: '宿題',
      icon: BookOpen,
      href: '/?tab=homework',
      onClick: undefined,
      activeColor: 'text-green-600',
      hoverColor: 'hover:text-green-600',
    },
    {
      label: 'チャット',
      icon: MessageSquare,
      href: '/room',
      onClick: undefined,
      activeColor: 'text-purple-600',
      hoverColor: 'hover:text-purple-600',
    },
    {
      label: '管理',
      icon: Settings,
      href: '/?tab=admin',
      onClick: onOpenAdmin,
      activeColor: 'text-orange-500',
      hoverColor: 'hover:text-orange-500',
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-40 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">

        {/* ロゴ */}
        <Link href="/" onClick={onGoToToday} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <h1 className="text-base font-extrabold tracking-tighter text-gray-800">re!RACK</h1>
        </Link>

        {/* ナビ */}
        <div className="flex items-center gap-1">
          {navItems.map(({ label, icon: Icon, href, onClick, activeColor, hoverColor }) => {
            const isActive = pathname === '/room'
              ? href === '/room'
              : href.startsWith('/?tab=')
                ? false  // タブはURLに出ないのでactiveなし
                : pathname === href;

            const base = `flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all text-gray-400 ${hoverColor}`;
            const active = isActive ? `${activeColor} bg-gray-50` : '';

            if (onClick) {
              return (
                <button key={label} onClick={onClick} className={`${base} ${active}`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold mt-0.5">{label}</span>
                </button>
              );
            }
            return (
              <Link key={label} href={href} className={`${base} ${active}`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold mt-0.5">{label}</span>
              </Link>
            );
          })}

          {/* お問い合わせ */}
          <Link
            href="/contact"
            className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-gray-400 hover:text-blue-600 transition-all"
          >
            <Mail size={18} strokeWidth={2} />
            <span className="text-[10px] font-bold mt-0.5">連絡</span>
          </Link>
        </div>

      </div>
    </nav>
  );
};

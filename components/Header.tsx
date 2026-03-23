"use client";

import { Home, BookOpen, MessageSquare, Settings, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onGoToToday?: () => void;
  onOpenAdmin?: () => void;
  onOpenHomework?: () => void;
}

export const Header = ({ onGoToToday, onOpenAdmin, onOpenHomework }: HeaderProps) => {
  const pathname = usePathname();
  const isRoomPage = pathname === '/room';
  const isContactPage = pathname === '/contact';

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      zIndex: 100,
      height: 56,
    }}>
      <div style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 16px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link
          href="/"
          onClick={onGoToToday}
          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
        >
          <div style={{
            width: 30,
            height: 30,
            background: "#111",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 12, letterSpacing: -0.5 }}>re!</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>
            RACK
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>

          {/* Home */}
          <NavBtn
            href="/"
            label="ホーム"
            icon={<Home size={16} strokeWidth={2.5} />}
            active={pathname === "/" && !isRoomPage}
            onClick={onGoToToday}
          />

          {/* Homework */}
          {!isRoomPage ? (
            <button
              onClick={onOpenHomework}
              style={navBtnStyle(false)}
            >
              <BookOpen size={16} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>宿題</span>
            </button>
          ) : (
            <NavBtn href="/" label="宿題" icon={<BookOpen size={16} strokeWidth={2} />} active={false} />
          )}

          {/* Chat */}
          <NavBtn
            href="/room"
            label="チャット"
            icon={<MessageSquare size={16} strokeWidth={isRoomPage ? 2.5 : 2} />}
            active={isRoomPage}
          />

          {/* Admin */}
          {!isRoomPage ? (
            <button
              onClick={onOpenAdmin}
              style={navBtnStyle(false)}
            >
              <Settings size={16} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>管理</span>
            </button>
          ) : (
            <NavBtn href="/?tab=admin" label="管理" icon={<Settings size={16} strokeWidth={2} />} active={false} />
          )}

          {/* Contact */}
          <NavBtn
            href="/contact"
            label="連絡"
            icon={<Mail size={16} strokeWidth={2} />}
            active={isContactPage}
          />
        </div>
      </div>
    </nav>
  );
};

function navBtnStyle(active: boolean): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    padding: "6px 10px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    background: active ? "#111" : "transparent",
    color: active ? "#fff" : "#888",
    transition: "all 0.15s",
    fontFamily: "inherit",
  };
}

function NavBtn({ href, label, icon, active, onClick }: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        ...navBtnStyle(active),
        textDecoration: "none",
      }}
    >
      {icon}
      <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
    </Link>
  );
}

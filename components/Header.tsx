"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  onGoToToday?: () => void;
  onOpenAdmin?: () => void;
  onOpenHomework?: () => void;
}

const Icons = {
  home: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  book: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  chat: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  settings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  mail: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
};

export const Header = ({ onGoToToday, onOpenAdmin, onOpenHomework }: HeaderProps) => {
  const pathname = usePathname();
  const isRoom = pathname === '/room';
  const isContact = pathname === '/contact';
  const isHome = !isRoom && !isContact;

  return (
    <>
      <style>{`
        .rr-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 58px;
          background: rgba(255,255,255,0.94);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          z-index: 100;
        }
        .rr-nav-inner {
          max-width: 720px;
          width: 100%;
          height: 100%;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rr-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          user-select: none;
        }
        .rr-logo-icon {
          position: relative;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }
        .rr-logo-icon img {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          object-fit: cover;
          display: block;
        }
        .rr-logo-icon .fallback {
          display: none;
          position: absolute;
          inset: 0;
          background: #0f0f0f;
          border-radius: 9px;
          align-items: center;
          justify-content: center;
        }
        .rr-logo-wordmark {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .rr-logo-main {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 16px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.5px;
        }
        .rr-logo-main em {
          font-style: normal;
          color: #16a34a;
        }
        .rr-logo-sub {
          font-size: 8.5px;
          font-weight: 600;
          color: #aaa;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-top: 1px;
        }
        .rr-links {
          display: flex;
          align-items: center;
          gap: 1px;
        }
        .rr-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 5px 9px 6px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          transition: background 0.14s, color 0.14s;
          text-decoration: none;
          font-family: 'Hiragino Sans', 'Noto Sans JP', sans-serif;
          line-height: 1;
        }
        .rr-link:hover {
          background: rgba(0,0,0,0.05);
          color: #444;
        }
        .rr-link.on {
          background: #0f0f0f;
          color: #fff !important;
        }
        .rr-link.on:hover {
          background: #1a1a1a;
        }
        .rr-lbl {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
      `}</style>

      <nav className="rr-nav">
        <div className="rr-nav-inner">

          {/* ─── Logo ─── */}
          <Link href="/" onClick={onGoToToday} className="rr-logo">
            <div className="rr-logo-icon">
              {/* favicon.ico — if missing, shows inline SVG fallback */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/favicon.ico"
                alt="re!RACK"
                onError={e => {
                  const img = e.currentTarget;
                  img.style.display = 'none';
                  const fb = img.parentElement?.querySelector('.fallback') as HTMLElement;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div className="fallback" aria-hidden="true">
                <svg viewBox="0 0 32 32" width="32" height="32">
                  <rect width="32" height="32" rx="9" fill="#0f0f0f"/>
                  <text x="5" y="24" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#fff">R</text>
                  <circle cx="26" cy="7" r="5" fill="#4ade80"/>
                </svg>
              </div>
            </div>
            <div className="rr-logo-wordmark">
              <span className="rr-logo-main">re<em>!</em>RACK</span>
              <span className="rr-logo-sub">中学生の連絡帳</span>
            </div>
          </Link>

          {/* ─── Nav links ─── */}
          <div className="rr-links">

            <Link href="/" onClick={onGoToToday} className={`rr-link ${isHome ? 'on' : ''}`}>
              {Icons.home}
              <span className="rr-lbl">ホーム</span>
            </Link>

            {!isRoom ? (
              <button onClick={onOpenHomework} className="rr-link">
                {Icons.book}
                <span className="rr-lbl">宿題</span>
              </button>
            ) : (
              <Link href="/" className="rr-link">
                {Icons.book}
                <span className="rr-lbl">宿題</span>
              </Link>
            )}
          
            {!isRoom ? (
              <button onClick={onOpenAdmin} className="rr-link">
                {Icons.settings}
                <span className="rr-lbl">管理</span>
              </button>
            ) : (
              <Link href="/?tab=admin" className="rr-link">
                {Icons.settings}
                <span className="rr-lbl">管理</span>
              </Link>
            )}

            <Link href="/contact" className={`rr-link ${isContact ? 'on' : ''}`}>
              {Icons.mail}
              <span className="rr-lbl">連絡</span>
            </Link>

          </div>
        </div>
      </nav>
    </>
  );
};

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  Building2,
  PieChart,
  Settings,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/priority-list', label: 'Priority List', icon: ClipboardList },
  { href: '/map',           label: 'Map View',      icon: Map },
  { href: '/properties',    label: 'Properties',    icon: Building2 },
  { href: '/segments',      label: 'Segments',      icon: PieChart },
  { href: '/admin',         label: 'Admin',         icon: Settings },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#e8e4dc' }}>

      {/* ── Sidebar ── */}
      <div
        style={{
          width: '240px',
          flexShrink: 0,
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1a1412',
        }}
      >
        {/* Logo/branding block */}
        <div
          style={{
            padding: '20px 20px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#f7f3ee',
              letterSpacing: '-0.01em',
            }}
          >
            RE/MAX Regency
          </div>
          <div
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '11px',
              fontWeight: 400,
              color: '#9c958f',
              marginTop: '2px',
            }}
          >
            Merrimac Dashboard
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = router.pathname === href;
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    marginBottom: '2px',
                    borderRadius: '8px',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textDecoration: 'none',
                    borderLeft: isActive ? '3px solid #660000' : '3px solid transparent',
                    backgroundColor: isActive ? 'rgba(102,0,0,0.15)' : 'transparent',
                    color: isActive ? '#f7f3ee' : '#f7f3ee',
                    opacity: isActive ? 1 : 0.65,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                      (e.currentTarget as HTMLElement).style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLElement).style.opacity = '0.65';
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User profile block */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(102,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: '#f7f3ee',
              }}
            >
              TR
            </div>

            {/* Name & role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#f7f3ee',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Taya Rich
              </div>
              <div
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '10px',
                  color: '#9c958f',
                  marginTop: '1px',
                }}
              >
                RE/MAX Regency
              </div>
            </div>
          </div>

          {/* Log out */}
          <button
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '12px',
              color: '#9c958f',
              background: 'none',
              border: 'none',
              padding: '8px 0 0',
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main
        style={{
          flex: 1,
          marginLeft: '240px',
          overflowY: 'auto',
          background: '#e8e4dc',
          padding: '40px 48px',
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

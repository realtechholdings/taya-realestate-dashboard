import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  ListChecks,
  Map,
  Building2,
  PieChart,
  BarChart3,
  Settings,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/priority-list', label: 'Priority List', icon: ListChecks },
  { href: '/map', label: 'Map View', icon: Map },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/segments', label: 'Segments', icon: PieChart },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#dedad2' }}>
      {/* Sidebar */}
      <div
        className="fixed inset-y-0 left-0 flex flex-col"
        style={{
          width: '220px',
          backgroundColor: '#1a1412',
          borderRight: '1px solid rgba(0,14,53,0.12)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-5 py-4"
          style={{ borderBottom: '1px solid rgba(247,245,238,0.10)', minHeight: '72px' }}
        >
          <img
            src="/images/remax-regency.png"
            alt="RE/MAX Regency"
            style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
            onError={(e) => {
              // Fallback to text logo if image fails to load
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentNode?.querySelector('.logo-fallback') as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div className="logo-fallback flex flex-col" style={{ display: 'none' }}>
            <span
              className="font-bold tracking-widest text-xs uppercase"
              style={{ color: '#f7f5ee' }}
            >
              RE/MAX
            </span>
            <span
              className="text-xs mt-0.5"
              style={{ color: 'rgba(247,245,238,0.45)' }}
            >
              Regency
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = router.pathname === href;
            return (
              <Link key={href} href={href}>
                <span
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
                  style={{
                    color: isActive ? '#f7f5ee' : 'rgba(247,245,238,0.55)',
                    backgroundColor: isActive ? 'rgba(247,245,238,0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid #660000' : '3px solid transparent',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(247,245,238,0.08)';
                      (e.currentTarget as HTMLElement).style.color = '#f7f5ee';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(247,245,238,0.55)';
                    }
                  }}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User block */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(247,245,238,0.10)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ backgroundColor: '#660000', color: '#f7f5ee' }}
            >
              TR
            </div>
            <div>
              <div className="text-xs" style={{ color: '#f7f5ee', fontWeight: 600 }}>
                Taya Rich
              </div>
              <div className="text-xs" style={{ color: 'rgba(247,245,238,0.45)' }}>
                RE/MAX Regency
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: '220px', backgroundColor: '#e8e4dc' }}
      >
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
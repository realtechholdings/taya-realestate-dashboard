'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Map, Building2, PieChart, Settings } from 'lucide-react';

const navItems = [
  { name: 'Priority List', href: '/priority-list', icon: ClipboardList },
  { name: 'Map View', href: '/map', icon: Map },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Segments', href: '/segments', icon: PieChart },
  { name: 'Admin', href: '/admin', icon: Settings, adminOnly: true },
];

interface SidebarProps {
  userRole: 'agent' | 'admin';
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div 
      className="fixed left-0 h-full flex flex-col"
      style={{ 
        width: '240px', 
        backgroundColor: '#660000' 
      }}
    >
      {/* Top section - logo/branding */}
      <div className="p-4">
        <div style={{ fontFamily: 'Syne', fontSize: '13px', color: '#f7f5ee', letterSpacing: '0.1em', marginBottom: '4px' }}>
          RE/MAX REGENCY
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: '11px', color: '#8a9bc4' }}>
          Merrimac Dashboard
        </div>
        <div 
          className="mt-4"
          style={{ 
            height: '1px', 
            backgroundColor: 'rgba(255,255,255,0.1)' 
          }} 
        />
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && userRole !== 'admin') return null;
            
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-r-md transition-all duration-150"
                style={{
                  borderLeft: isActive ? '3px solid #ff1200' : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 18, 0, 0.12)' : 'transparent',
                  color: '#f7f5ee',
                  opacity: isActive ? 1 : 0.7,
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section - user profile */}
      <div className="p-4 border-t border-white border-opacity-10">
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center rounded-full"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'rgba(255,18,0,0.3)',
              fontFamily: 'Syne',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#f7f5ee',
            }}
          >
            TR
          </div>
          <div className="flex-1">
            <div style={{ fontFamily: 'Inter', fontSize: '13px', color: '#f7f5ee' }}>
              Taya Rich
            </div>
            <div 
              className="inline-block px-2 py-1 rounded text-xs uppercase"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                fontFamily: 'Inter',
                fontSize: '10px',
                color: '#f7f5ee',
              }}
            >
              {userRole}
            </div>
          </div>
        </div>
        <button
          className="mt-3 text-left w-full"
          style={{ 
            fontFamily: 'Inter', 
            fontSize: '12px', 
            color: '#8a9bc4',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
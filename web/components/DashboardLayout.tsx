import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserButton, useAuth } from '@clerk/nextjs';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: router.pathname === '/dashboard' },
    { name: 'Properties', href: '/properties', icon: HomeModernIcon, current: router.pathname === '/properties' },
    { name: 'Prospects', href: '/prospects', icon: UsersIcon, current: router.pathname === '/prospects' },
    { name: 'Actions', href: '/actions', icon: ClipboardDocumentListIcon, current: router.pathname === '/actions' },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, current: router.pathname === '/analytics' },
    { name: 'Map', href: '/map', icon: MapIcon, current: router.pathname === '/map' },
  ];

  if (!isSignedIn) {
    return (
      <div className=\"min-h-screen flex items-center justify-center bg-gray-50\">
        <div className=\"max-w-md w-full space-y-8\">
          <div className=\"text-center\">
            <h2 className=\"mt-6 text-3xl font-extrabold text-gray-900\">
              Please sign in to continue
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      {/* Sidebar */}
      <div className=\"fixed inset-y-0 left-0 w-64 bg-white shadow-lg\">
        <div className=\"flex flex-col h-full\">
          {/* Logo */}
          <div className=\"flex items-center px-6 py-4 border-b border-gray-200\">
            <div className=\"flex items-center\">
              <div className=\"w-8 h-8 bg-remax-red rounded-lg flex items-center justify-center\">
                <span className=\"text-white font-bold text-sm\">TR</span>
              </div>
              <div className=\"ml-3\">
                <div className=\"text-sm font-semibold text-gray-900\">Taya Rich</div>
                <div className=\"text-xs text-gray-500\">REMAX Regency</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className=\"flex-1 px-4 py-4 space-y-2\">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-dashboard-accent text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className=\"mr-3 h-5 w-5\" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className=\"p-4 border-t border-gray-200\">
            <div className=\"flex items-center\">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10'
                  }
                }}
              />
              <div className=\"ml-3 flex-1\">
                <div className=\"text-sm font-medium text-gray-900\">Taya Rich</div>
                <div className=\"text-xs text-gray-500\">Merrimac Specialist</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=\"pl-64\">
        <main className=\"py-8 px-8\">
          {children}
        </main>
      </div>
    </div>
  );
};

// Icons (simplified versions - in a real app you'd import from @heroicons/react)
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6\" />
  </svg>
);

const HomeModernIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M8 21h8a2 2 0 002-2V9.5L12 3 6 9.5V19a2 2 0 002 2z\" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z\" />
  </svg>
);

const ClipboardDocumentListIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z\" />
  </svg>
);

const MapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.158.69-.158 1.006 0l4.994 2.497c.317.158.69.158 1.007 0z\" />
  </svg>
);

export default DashboardLayout;
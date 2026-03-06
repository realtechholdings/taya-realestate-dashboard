import { Metadata } from 'next';
import { getCurrentUser } from '../src/lib/auth';
import Sidebar from '../src/components/Sidebar';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Merrimac Dashboard - RE/MAX Regency',
  description: 'Market Intelligence Dashboard for Taya Rich',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar userRole={user.role} />
          <main 
            className="flex-1 overflow-y-auto"
            style={{ 
              marginLeft: '240px',
              backgroundColor: '#000e35',
              padding: '32px'
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
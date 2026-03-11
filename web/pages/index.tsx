import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#e8e4dc' }}
    >
      <Head>
        <title>Taya Real Estate CRM</title>
        <meta name="description" content="Professional real estate CRM dashboard" />
      </Head>

      <div className="text-center">
        <div className="flex flex-col items-center mb-6">
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1412',
              letterSpacing: '-0.02em',
            }}
          >
            RE/MAX Regency
          </span>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              color: '#9c958f',
              marginTop: '4px',
            }}
          >
            Merrimac Dashboard
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div
            className="animate-spin rounded-full h-5 w-5 border-b-2"
            style={{ borderColor: '#660000' }}
          />
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '13px',
              color: '#9c958f',
            }}
          >
            Loading your dashboard…
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;

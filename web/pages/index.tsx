import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Home: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard immediately
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000e35' }}>
      <Head>
        <title>Taya Real Estate CRM</title>
        <meta name="description" content="Professional real estate CRM dashboard" />
      </Head>
      
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#ff1200' }}>
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold" style={{ color: '#f7f5ee' }}>Taya Dashboard</div>
            <div className="text-sm" style={{ color: '#94a3b8' }}>RE/MAX Regency</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#ff1200' }}></div>
          <span className="ml-3 text-sm" style={{ color: '#94a3b8' }}>
            Loading your dashboard...
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
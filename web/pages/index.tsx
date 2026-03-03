import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : 
                   currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  // Mock priority counts for the preview
  const priorityCounts = {
    urgent: 2,
    followUp: 2, 
    scheduled: 2,
    communications: 2,
    opportunities: 2
  };

  const totalItems = Object.values(priorityCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Layout>
      <Head>
        <title>Taya Real Estate Dashboard</title>
        <meta name="description" content="Priority-driven real estate management dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#000e35' }}>
              {greeting}, Taya! 👋
            </h1>
            <div className="text-lg mb-6" style={{ color: '#660000' }}>
              <p className="font-semibold">{formatDate(currentTime)} • {formatTime(currentTime)}</p>
              <p className="mt-2">Your priority dashboard is ready with <strong>{totalItems} items</strong> requiring attention</p>
            </div>
          </div>

          {/* Priority Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {/* Urgent */}
            <div className="bg-white rounded-lg border-2 border-red-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🔴</div>
              <div className="text-2xl font-bold" style={{ color: '#660000' }}>{priorityCounts.urgent}</div>
              <div className="text-sm font-medium" style={{ color: '#000e35' }}>Urgent Actions</div>
              <div className="text-xs text-gray-500 mt-2">Immediate attention required</div>
            </div>

            {/* Follow-up */}
            <div className="bg-white rounded-lg border-2 border-orange-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🟠</div>
              <div className="text-2xl font-bold text-orange-600">{priorityCounts.followUp}</div>
              <div className="text-sm font-medium" style={{ color: '#000e35' }}>Follow-ups</div>
              <div className="text-xs text-gray-500 mt-2">Client responses needed</div>
            </div>

            {/* Scheduled */}
            <div className="bg-white rounded-lg border-2 border-yellow-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🟡</div>
              <div className="text-2xl font-bold text-yellow-600">{priorityCounts.scheduled}</div>
              <div className="text-sm font-medium" style={{ color: '#000e35' }}>Scheduled</div>
              <div className="text-xs text-gray-500 mt-2">Upcoming appointments</div>
            </div>

            {/* Communications */}
            <div className="bg-white rounded-lg border-2 border-blue-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🔵</div>
              <div className="text-2xl font-bold text-blue-600">{priorityCounts.communications}</div>
              <div className="text-sm font-medium" style={{ color: '#000e35' }}>Messages</div>
              <div className="text-xs text-gray-500 mt-2">Tenant & owner comms</div>
            </div>

            {/* Opportunities */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🟢</div>
              <div className="text-2xl font-bold text-green-600">{priorityCounts.opportunities}</div>
              <div className="text-sm font-medium" style={{ color: '#000e35' }}>Opportunities</div>
              <div className="text-xs text-gray-500 mt-2">New prospects</div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="bg-white rounded-lg border-2 p-8 mb-12" style={{ borderColor: '#000e35' }}>
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#000e35' }}>
              🎯 ShieldPro-Inspired Priority System
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#660000' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#000e35' }}>Urgent First</h3>
                <p className="text-sm text-gray-600">Critical items bubble to the top. Never miss an important deadline.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#660000' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#000e35' }}>Smart Timing</h3>
                <p className="text-sm text-gray-600">Overdue items highlighted in red. Due dates clearly displayed.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#660000' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#000e35' }}>One-Click Actions</h3>
                <p className="text-sm text-gray-600">Click to call, email, or complete tasks. Australian formatting built-in.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-4">
              <Link href="/dashboard">
                <a 
                  className="inline-flex items-center px-8 py-4 text-lg font-bold text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                  style={{ backgroundColor: '#000e35' }}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Enter Priority Dashboard
                </a>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Start with red items, work your way down. Clear, focused, efficient.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-12 pt-8 border-t" style={{ borderColor: '#f7f5ee' }}>
            <p>Powered by ShieldPro methodology • Designed for REMAX • Last updated: {formatTime(currentTime)}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
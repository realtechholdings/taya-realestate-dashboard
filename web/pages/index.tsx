import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

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
    <>
      <Head>
        <title>Taya Real Estate Dashboard</title>
        <meta name="description" content="Priority-driven real estate management dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {greeting}, Taya! 👋
            </h1>
            <p className="text-xl text-gray-600">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>

          {/* Main Dashboard Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Priority Dashboard</h2>
                    <p className="text-blue-100 mt-1">
                      Real estate management powered by ShieldPro methodology
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{totalItems}</div>
                    <div className="text-blue-100 text-sm">Priority Items</div>
                  </div>
                </div>
              </div>

              {/* Priority Overview */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                  {/* Urgent */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl">🔴</div>
                        <div className="text-xs font-medium text-red-700 mt-2">URGENT</div>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {priorityCounts.urgent}
                      </div>
                    </div>
                    <div className="text-xs text-red-600 mt-2">
                      Immediate Action
                    </div>
                  </div>

                  {/* Follow-up */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl">🟠</div>
                        <div className="text-xs font-medium text-orange-700 mt-2">FOLLOW-UP</div>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {priorityCounts.followUp}
                      </div>
                    </div>
                    <div className="text-xs text-orange-600 mt-2">
                      Required
                    </div>
                  </div>

                  {/* Scheduled */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl">🟡</div>
                        <div className="text-xs font-medium text-yellow-700 mt-2">SCHEDULED</div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {priorityCounts.scheduled}
                      </div>
                    </div>
                    <div className="text-xs text-yellow-600 mt-2">
                      Activities
                    </div>
                  </div>

                  {/* Communications */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl">🔵</div>
                        <div className="text-xs font-medium text-blue-700 mt-2">COMMS</div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {priorityCounts.communications}
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      Responses
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl">🟢</div>
                        <div className="text-xs font-medium text-green-700 mt-2">OPPS</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {priorityCounts.opportunities}
                      </div>
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      New Leads
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <Link href="/dashboard">
                    <a className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      Enter Priority Dashboard
                    </a>
                  </Link>
                </div>

                {/* Features List */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Color-Coded Priority System</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Inspired by ShieldPro's proven field service methodology, adapted for real estate workflow
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Smart Task Prioritization</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Never miss urgent listings, hot prospects, or critical deadlines again
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14L17 4M9 9v6M15 9v6" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Property & Contact Management</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Full property details, contact info, and valuations at your fingertips
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Performance Tracking</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Clear visibility into daily progress and workflow efficiency
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              Powered by REMAX Regency • Built with ShieldPro methodology
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
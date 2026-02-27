import React from 'react';
import Head from 'next/head';

// Mock data (same as dashboard)
const mockData = {
  metrics: {
    totalProperties: 1247,
    prospects: 892,
    hotLeads: 67,
    conversions: 23
  },
  actionItems: [
    {
      id: '1',
      type: 'call' as const,
      priority: 'high' as const,
      title: 'Call Sarah Johnson',
      description: 'Follow up on property upgrade inquiry',
      propertyAddress: '123 Sunset Drive, Merrimac',
      ownerName: 'Sarah Johnson',
      estimatedValue: 850000,
      contactInfo: '+61 7 1234 5678',
      callScript: 'Hi Sarah, this is [Your Name] from REMAX Regency. I wanted to follow up on your interest in upgrading your property...',
      lastContact: '3 days ago',
      nextAction: 'Schedule property assessment'
    }
  ]
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Taya's Real Estate Dashboard - Icon Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-2xl font-bold text-gray-900">REMAX Regency</h1>
                  <p className="text-sm text-gray-600">Taya Rich - Prospecting Dashboard</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Icons reduced from 24px to 12px (50% smaller)
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Morning Briefing */}
          <div className="bg-white rounded-lg shadow-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">🌅 Good Morning, Taya!</h2>
              <span className="text-sm text-gray-500">Thursday, Feb 27, 2026</span>
            </div>
            <p className="text-gray-600">
              You have <span className="font-semibold text-blue-600">3 high-priority calls</span> to make today and 
              <span className="font-semibold text-green-600"> 5 new prospects</span> in Merrimac. 
              The market is showing strong activity with 2 new listings this week.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Properties</p>
                  <p className="text-2xl font-semibold text-gray-900">{mockData.metrics.totalProperties}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Prospects</p>
                  <p className="text-2xl font-semibold text-gray-900">{mockData.metrics.prospects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                  <p className="text-2xl font-semibold text-gray-900">{mockData.metrics.hotLeads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-2xl font-semibold text-gray-900">{mockData.metrics.conversions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Size Comparison Section */}
          <div className="bg-white rounded-lg shadow-card p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Icon Size Comparison</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="font-medium mb-4 text-gray-700">BEFORE: Original Size (24px)</h3>
                <div className="p-4 bg-red-50 rounded-lg inline-block">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mt-2">Too large - dominates screen</p>
              </div>
              <div className="text-center">
                <h3 className="font-medium mb-4 text-gray-700">AFTER: Reduced Size (12px)</h3>
                <div className="p-4 bg-green-50 rounded-lg inline-block">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mt-2">Perfect - visible but space-efficient</p>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Priority Actions</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <h3 className="font-medium text-gray-900">Call Sarah Johnson</h3>
                      <div className="w-3 h-3 rounded-full bg-red-500 ml-2"></div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Follow up on property upgrade inquiry</p>
                    <p className="text-sm text-gray-800 font-medium">123 Sunset Drive, Merrimac</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-3 h-3 mr-1 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    High Priority
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
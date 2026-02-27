import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Components
import DashboardLayout from '../components/DashboardLayout';
import ActionItemCard from '../components/ActionItemCard';

// Types
interface ActionItem {
  id: string;
  title: string;
  priority: number;
  actionType: string;
  propertyOwner: {
    fullName: string;
    email?: { address: string };
    phone?: { mobile: string };
    prospectSegment: { category: string; score: number };
  };
  property: {
    address: { fullAddress: string };
    currentValuation?: { estimate: number };
  };
  callScript: string;
  estimatedDuration: number;
  scheduledDate: string;
}

interface DashboardData {
  todayActions: ActionItem[];
  metrics: {
    totalProperties: number;
    totalOwners: number;
    todayTasks: number;
    weeklyGoal: number;
    weeklyProgress: number;
  };
  segments: {
    name: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

// Data fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data for display
  const mockData = {
    todayActions: [
      {
        id: '1',
        title: 'Initial Contact - New Property Owner',
        priority: 8,
        actionType: 'First Contact',
        propertyOwner: {
          fullName: 'Sarah Johnson',
          email: { address: 'sarah.johnson@email.com' },
          phone: { mobile: '0412 345 678' },
          prospectSegment: { category: 'Hot Prospect', score: 85 }
        },
        property: {
          address: { fullAddress: '15 Woodland Drive, Merrimac QLD 4226' },
          currentValuation: { estimate: 750000 }
        },
        callScript: 'Hi Sarah, this is Taya Rich from REMAX Regency...',
        estimatedDuration: 15,
        scheduledDate: new Date().toISOString()
      }
    ],
    metrics: {
      totalProperties: 1247,
      totalOwners: 1156,
      todayTasks: 12,
      weeklyGoal: 50,
      weeklyProgress: 68
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Australia/Brisbane'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <Head>
        <title>Dashboard - Taya's Prospecting Tool</title>
        <meta name=\"description\" content=\"Daily prospecting dashboard for Taya Rich\" />
      </Head>

      <DashboardLayout>
        {/* Header */}
        <div className=\"mb-8\">
          <div className=\"flex items-center justify-between\">
            <div>
              <h1 className=\"text-3xl font-bold text-gray-900\">
                {getGreeting()}, Taya! 👋
              </h1>
              <p className=\"text-gray-600 mt-1\">
                {currentTime.toLocaleDateString('en-AU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • {formatTime(currentTime)}
              </p>
            </div>
            <div className=\"text-right\">
              <div className=\"text-sm text-gray-500\">Today's Focus</div>
              <div className=\"text-2xl font-bold text-blue-600\">
                {mockData.todayActions.length || 0} actions
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6 mb-8\">
          <div className=\"bg-white rounded-lg shadow-card p-6\">
            <div className=\"flex items-center\">
              <div className=\"p-2 bg-blue-100 rounded-lg\">
                <svg className=\"w-6 h-6 text-blue-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6\" />
                </svg>
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-gray-600\">Properties</p>
                <p className=\"text-2xl font-semibold text-gray-900\">{mockData.metrics.totalProperties || 0}</p>
              </div>
            </div>
          </div>

          <div className=\"bg-white rounded-lg shadow-card p-6\">
            <div className=\"flex items-center\">
              <div className=\"p-2 bg-green-100 rounded-lg\">
                <svg className=\"w-6 h-6 text-green-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z\" />
                </svg>
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-gray-600\">Prospects</p>
                <p className=\"text-2xl font-semibold text-gray-900\">{mockData.metrics.totalOwners || 0}</p>
              </div>
            </div>
          </div>

          <div className=\"bg-white rounded-lg shadow-card p-6\">
            <div className=\"flex items-center\">
              <div className=\"p-2 bg-yellow-100 rounded-lg\">
                <svg className=\"w-6 h-6 text-yellow-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01\" />
                </svg>
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-gray-600\">Today's Tasks</p>
                <p className=\"text-2xl font-semibold text-gray-900\">{mockData.metrics.todayTasks || 0}</p>
              </div>
            </div>
          </div>

          <div className=\"bg-white rounded-lg shadow-card p-6\">
            <div className=\"flex items-center\">
              <div className=\"p-2 bg-purple-100 rounded-lg\">
                <svg className=\"w-6 h-6 text-purple-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z\" />
                </svg>
              </div>
              <div className=\"ml-4\">
                <p className=\"text-sm font-medium text-gray-600\">Weekly Progress</p>
                <p className=\"text-2xl font-semibold text-gray-900\">
                  {mockData.metrics.weeklyProgress || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
          {/* Priority Actions */}
          <div className=\"space-y-6\">
            <div className=\"flex items-center justify-between\">
              <h2 className=\"text-xl font-semibold text-gray-900\">Priority Actions Today</h2>
              <span className=\"text-sm text-gray-500\">
                {mockData.todayActions.length || 0} remaining
              </span>
            </div>

            <div className=\"space-y-4\">
              {mockData.todayActions.slice(0, 5).map((action) => (
                <ActionItemCard key={action.id} action={action} />
              ))}
            </div>

            {(mockData.todayActions.length || 0) > 5 && (
              <div className=\"text-center\">
                <button className=\"text-blue-600 hover:text-blue-600/80 text-sm font-medium\">
                  View all {mockData.todayActions.length} actions →
                </button>
              </div>
            )}
          </div>

          {/* Prospect Segments & Recent Activity */}
          <div className=\"space-y-6\">
            <div className=\"bg-white p-6 rounded-lg shadow-md\">
              <h3 className=\"text-lg font-semibold mb-4\">Prospect Segments</h3>
              <p className=\"text-gray-500\">Component coming soon...</p>
            </div>
            <div className=\"bg-white p-6 rounded-lg shadow-md\">
              <h3 className=\"text-lg font-semibold mb-4\">Recent Activity</h3>
              <p className=\"text-gray-500\">Component coming soon...</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className=\"mt-8\">
          <div className=\"bg-white p-6 rounded-lg shadow-md\">
            <h3 className=\"text-lg font-semibold mb-4\">Performance Metrics</h3>
            <p className=\"text-gray-500\">Component coming soon...</p>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
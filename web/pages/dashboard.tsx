import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

// Mock data for daily actions
const dailyActions = [
  {
    id: 1,
    name: 'Sarah Johnson',
    address: '15 Woodland Drive, Merrimac QLD 4226',
    segment: 'Hot Prospect',
    confidence: 85,
    valuationRange: '$720k - $780k',
    talkingPoint: 'Contract expires tomorrow - renewal decision needed',
    lastContacted: '2 days ago',
    status: 'urgent'
  },
  {
    id: 2,
    name: 'Marcus Williams',
    address: 'Buyer - Looking in Palm Beach area',
    segment: 'Active Buyer',
    confidence: 78,
    valuationRange: '$800k - $1.2M',
    talkingPoint: 'Callback overdue - interested in waterfront properties',
    lastContacted: '3 days ago',
    status: 'urgent'
  },
  {
    id: 3,
    name: 'Jennifer Chen',
    address: '22 Palm Beach Road, Palm Beach QLD 4221',
    segment: 'Valuation Lead',
    confidence: 65,
    valuationRange: '$1.1M - $1.3M',
    talkingPoint: 'Online inquiry for property appraisal - potential listing',
    lastContacted: '1 day ago',
    status: 'follow-up'
  },
  {
    id: 4,
    name: 'Robert Kim',
    address: '44 Main Street, Southport QLD 4215',
    segment: 'Current Client',
    confidence: 92,
    valuationRange: '$650k - $710k',
    talkingPoint: 'Inspection scheduled - wants market update',
    lastContacted: '5 days ago',
    status: 'scheduled'
  },
  {
    id: 5,
    name: 'Lisa Martinez',
    address: '18 River Road, Nerang QLD 4211',
    segment: 'Tenant',
    confidence: 88,
    valuationRange: '$490k - $550k',
    talkingPoint: 'AC maintenance issue reported',
    lastContacted: '6 hours ago',
    status: 'message'
  },
  {
    id: 6,
    name: 'Catherine Roberts',
    address: 'Buyer - Premium waterfront seeker',
    segment: 'HNW Buyer',
    confidence: 90,
    valuationRange: '$2M+',
    talkingPoint: 'Off-market inquiry - high budget, serious buyer',
    lastContacted: '3 days ago',
    status: 'opportunity'
  },
];

interface PriorityCardProps {
  title: string;
  count: number;
  description: string;
  color: string;
  emoji: string;
}

const PriorityCard: React.FC<PriorityCardProps> = ({ title, count, description, color, emoji }) => {
  return (
    <div 
      className="rounded-xl p-6 hover:transform hover:scale-105 transition-all duration-200 cursor-pointer border"
      style={{ 
        backgroundColor: '#001a4d',
        borderColor: 'rgba(255,18,0,0.2)'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div 
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm font-medium" style={{ color: '#f7f5ee' }}>
              {title}
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {count}
          </div>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {description}
          </p>
        </div>
        <div className="text-2xl opacity-50">
          {emoji}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return '#ff1200';
      case 'follow-up': return '#ff8c00';
      case 'scheduled': return '#0043ff';
      case 'message': return '#94a3b8';
      case 'opportunity': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'urgent': return 'URGENT';
      case 'follow-up': return 'FOLLOW-UP';
      case 'scheduled': return 'SCHEDULED';
      case 'message': return 'MESSAGE';
      case 'opportunity': return 'OPPORTUNITY';
      default: return 'NEUTRAL';
    }
  };

  // Count items by status
  const priorityCounts = {
    urgent: dailyActions.filter(item => item.status === 'urgent').length,
    followUp: dailyActions.filter(item => item.status === 'follow-up').length,
    scheduled: dailyActions.filter(item => item.status === 'scheduled').length,
    messages: dailyActions.filter(item => item.status === 'message').length,
    opportunities: dailyActions.filter(item => item.status === 'opportunity').length,
  };

  return (
    <Layout>
      <Head>
        <title>Dashboard - Taya Real Estate CRM</title>
        <meta name="description" content="Professional real estate CRM dashboard" />
      </Head>

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#f7f5ee' }}>
            Good Morning, Taya 👋
          </h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {formatDate(currentTime)} • {formatTime(currentTime)} • {dailyActions.length} active items requiring attention
          </p>
        </div>

        {/* Priority Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <PriorityCard
            title="Urgent Actions"
            count={priorityCounts.urgent}
            description="Immediate attention required"
            color="#ff1200"
            emoji="🔴"
          />
          <PriorityCard
            title="Follow-ups"
            count={priorityCounts.followUp}
            description="Client responses needed"
            color="#ff8c00"
            emoji="🟠"
          />
          <PriorityCard
            title="Scheduled"
            count={priorityCounts.scheduled}
            description="Upcoming appointments"
            color="#0043ff"
            emoji="🟡"
          />
          <PriorityCard
            title="Messages"
            count={priorityCounts.messages}
            description="Tenant & owner communications"
            color="#94a3b8"
            emoji="🔵"
          />
          <PriorityCard
            title="Opportunities"
            count={priorityCounts.opportunities}
            description="New prospects & leads"
            color="#22c55e"
            emoji="🟢"
          />
        </div>

        {/* Daily Action List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#f7f5ee' }}>
              Today's Action List
            </h2>
            <div className="flex items-center space-x-3">
              <button 
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#ff1200' }}
              >
                Add New Contact
              </button>
              <button 
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                style={{ 
                  color: '#f7f5ee',
                  borderColor: '#f7f5ee',
                  backgroundColor: 'transparent'
                }}
              >
                Export List
              </button>
            </div>
          </div>

          {/* Table */}
          <div 
            className="rounded-xl border overflow-hidden"
            style={{ 
              backgroundColor: '#001a4d',
              borderColor: 'rgba(255,18,0,0.2)'
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ backgroundColor: 'rgba(0,26,77,0.5)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#f7f5ee' }}>
                      Name & Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#f7f5ee' }}>
                      Segment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#f7f5ee' }}>
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#f7f5ee' }}>
                      Valuation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#f7f5ee' }}>
                      Talking Point
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#f7f5ee' }}>
                      Last Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#f7f5ee' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyActions.map((action, index) => (
                    <tr 
                      key={action.id}
                      className="border-t border-gray-700 hover:bg-opacity-50 cursor-pointer transition-colors"
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(0,26,77,0.3)',
                        ':hover': { backgroundColor: 'rgba(255,18,0,0.08)' }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,18,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(0,26,77,0.3)';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: '#f7f5ee' }}>
                            {action.name}
                          </div>
                          <div className="text-sm" style={{ color: '#94a3b8' }}>
                            {action.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: 'rgba(68,164,255,0.1)',
                            color: '#0043ff'
                          }}
                        >
                          {action.segment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${action.confidence}%`,
                                backgroundColor: action.confidence >= 80 ? '#22c55e' : action.confidence >= 60 ? '#ff8c00' : '#ff1200'
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium" style={{ color: '#f7f5ee' }}>
                            {action.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium" style={{ color: '#f7f5ee' }}>
                          {action.valuationRange}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: '#f7f5ee' }}>
                          {action.talkingPoint}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: '#94a3b8' }}>
                          {action.lastContacted}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                          style={{ 
                            backgroundColor: `${getStatusColor(action.status)}20`,
                            color: getStatusColor(action.status)
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: getStatusColor(action.status) }}
                          ></div>
                          {getStatusText(action.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="rounded-xl p-6 border"
            style={{ 
              backgroundColor: '#001a4d',
              borderColor: 'rgba(255,18,0,0.2)'
            }}
          >
            <div className="text-2xl font-bold text-white mb-1">$2.8M</div>
            <div className="text-sm" style={{ color: '#94a3b8' }}>
              Total Pipeline Value
            </div>
          </div>
          
          <div 
            className="rounded-xl p-6 border"
            style={{ 
              backgroundColor: '#001a4d',
              borderColor: 'rgba(255,18,0,0.2)'
            }}
          >
            <div className="text-2xl font-bold text-white mb-1">12</div>
            <div className="text-sm" style={{ color: '#94a3b8' }}>
              Active Listings
            </div>
          </div>

          <div 
            className="rounded-xl p-6 border"
            style={{ 
              backgroundColor: '#001a4d',
              borderColor: 'rgba(255,18,0,0.2)'
            }}
          >
            <div className="text-2xl font-bold text-white mb-1">85%</div>
            <div className="text-sm" style={{ color: '#94a3b8' }}>
              Client Satisfaction
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
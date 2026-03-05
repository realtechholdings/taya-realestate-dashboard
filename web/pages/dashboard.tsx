import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../components/DashboardLayout';
import { Bell, Plus, Download, Phone, Mail } from 'lucide-react';

const dailyActions = [
  {
    id: 1,
    name: 'Sarah Johnson',
    address: '15 Woodland Drive, Merrimac QLD 4226',
    segment: 'Hot Prospect',
    confidence: 85,
    valuationRange: '$720k – $780k',
    talkingPoint: 'Contract expires tomorrow - renewal decision needed',
    lastContacted: '2 days ago',
    status: 'urgent'
  },
  {
    id: 2,
    name: 'Marcus Williams',
    address: 'Buyer – Looking in Palm Beach area',
    segment: 'Active Buyer',
    confidence: 78,
    valuationRange: '$800k – $1.2M',
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
    valuationRange: '$1.1M – $1.3M',
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
    valuationRange: '$650k – $710k',
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
    valuationRange: '$490k – $550k',
    talkingPoint: 'AC maintenance issue reported',
    lastContacted: '6 hours ago',
    status: 'message'
  },
  {
    id: 6,
    name: 'Catherine Roberts',
    address: 'Buyer – Premium waterfront seeker',
    segment: 'HNW Buyer',
    confidence: 90,
    valuationRange: '$2M+',
    talkingPoint: 'Off-market inquiry - high budget, serious buyer',
    lastContacted: '3 days ago',
    status: 'opportunity'
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  urgent: { label: 'URGENT', color: '#660000', bg: 'rgba(102,0,0,0.10)', border: 'rgba(102,0,0,0.25)' },
  'follow-up': { label: 'FOLLOW-UP', color: '#92400e', bg: 'rgba(146,64,14,0.10)', border: 'rgba(146,64,14,0.25)' },
  scheduled: { label: 'SCHEDULED', color: '#003399', bg: 'rgba(0,51,153,0.09)', border: 'rgba(0,51,153,0.22)' },
  message: { label: 'MESSAGE', color: 'rgba(0,14,53,0.65)', bg: 'rgba(0,14,53,0.07)', border: 'rgba(0,14,53,0.15)' },
  opportunity: { label: 'OPPORTUNITY', color: '#000e35', bg: 'rgba(0,14,53,0.07)', border: 'rgba(0,14,53,0.16)' },
};

const summaryCards = [
  { label: 'Total Properties', value: '3,842', sub: 'Merrimac 4226' },
  { label: 'Verified Contacts', value: '2,104', sub: '+38 this week' },
  { label: 'Active Segments', value: '8', sub: 'AI-classified' },
  { label: 'Pipeline Value', value: '$2.8M', sub: '12 active listings' },
];

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const urgentCount = dailyActions.filter(a => a.status === 'urgent').length;
  const formatDate = (d: Date) => d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <DashboardLayout>
      <Head><title>Dashboard – Taya Real Estate CRM</title></Head>
      
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 h-16 sticky top-0 z-10"
        style={{
          backgroundColor: '#f7f5ee',
          borderBottom: '1px solid rgba(0,14,53,0.12)',
        }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: '#000e35' }}>
            Good morning, Taya 👋
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(0,14,53,0.45)' }}>
            {formatDate(currentTime)} · Merrimac QLD 4226
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search contacts, properties..."
            className="text-sm px-3 py-1.5 rounded-lg w-60 outline-none"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,14,53,0.12)',
              color: '#000e35',
            }}
          />
          <button className="relative" style={{ color: 'rgba(0,14,53,0.45)' }}>
            <Bell size={18} />
            {urgentCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: '#660000' }}
              />
            )}
          </button>
          <button
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#660000', color: '#f7f5ee' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#880000')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#660000')}
          >
            <Plus size={14} />
            Add Contact
          </button>
        </div>
      </div>

      <div className="px-8 pt-6 pb-10">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {summaryCards.map(card => (
            <div
              key={card.label}
              className="rounded-xl p-5"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(0,14,53,0.13)',
                boxShadow: '0 1px 3px rgba(0,14,53,0.06)',
              }}
            >
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: 'rgba(0,14,53,0.4)' }}
              >
                {card.label}
              </p>
              <p className="text-3xl font-bold font-data" style={{ color: '#000e35' }}>
                {card.value}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(0,14,53,0.4)' }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Urgent banner */}
        {urgentCount > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3 rounded-xl mb-5"
            style={{
              backgroundColor: 'rgba(102,0,0,0.06)',
              border: '1px solid rgba(102,0,0,0.15)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#660000' }}
              />
              <span className="text-sm" style={{ color: '#000e35' }}>
                {urgentCount} contacts require immediate attention today
              </span>
            </div>
            <button className="text-sm font-medium" style={{ color: '#660000' }}>
              View All →
            </button>
          </div>
        )}

        {/* Action List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold" style={{ color: '#000e35' }}>
                Today's Action List
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(0,14,53,0.07)',
                  color: 'rgba(0,14,53,0.55)'
                }}
              >
                {dailyActions.length}
              </span>
            </div>
            <button
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{
                border: '1px solid rgba(0,14,53,0.15)',
                color: 'rgba(0,14,53,0.55)',
                backgroundColor: 'transparent',
              }}
            >
              <Download size={12} />
              Export List
            </button>
          </div>

          {/* Table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,14,53,0.11)',
              boxShadow: '0 1px 3px rgba(0,14,53,0.05)',
            }}
          >
            {/* Header */}
            <div
              className="grid px-5 py-3"
              style={{
                gridTemplateColumns: '2fr 1.1fr 0.9fr 1fr 1.6fr 0.8fr 1.1fr 80px',
                backgroundColor: 'rgba(0,14,53,0.03)',
                borderBottom: '1px solid rgba(0,14,53,0.08)',
              }}
            >
              {['NAME & ADDRESS','SEGMENT','CONFIDENCE','VALUATION','TALKING POINT','LAST CONTACT','STATUS',''].map(h => (
                <span
                  key={h}
                  className="text-xs uppercase tracking-wider font-medium"
                  style={{ color: 'rgba(0,14,53,0.38)' }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {dailyActions.map((action, i) => {
              const st = statusConfig[action.status];
              const isHovered = hoveredRow === action.id;
              const confColor = action.confidence >= 80 ? '#000e35' : action.confidence >= 60 ? 'rgba(0,14,53,0.45)' : 'rgba(0,14,53,0.25)';

              return (
                <div
                  key={action.id}
                  className="grid px-5 py-4 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: '2fr 1.1fr 0.9fr 1fr 1.6fr 0.8fr 1.1fr 80px',
                    borderBottom: i < dailyActions.length - 1 ? '1px solid rgba(0,14,53,0.06)' : 'none',
                    backgroundColor: isHovered ? 'rgba(0,14,53,0.025)' : 'transparent',
                    alignItems: 'center',
                  }}
                  onMouseEnter={() => setHoveredRow(action.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#000e35' }}>{action.name}</div>
                    <div className="text-xs mt-0.5 font-data" style={{ color: 'rgba(0,14,53,0.45)' }}>{action.address}</div>
                  </div>

                  <div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(0,14,53,0.06)',
                        color: 'rgba(0,14,53,0.7)'
                      }}
                    >
                      {action.segment}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-data" style={{ color: '#000e35' }}>{action.confidence}%</span>
                    <div className="mt-1 h-1 w-16 rounded-full" style={{ backgroundColor: 'rgba(0,14,53,0.10)' }}>
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${action.confidence}%`, backgroundColor: confColor }}
                      />
                    </div>
                  </div>

                  <div className="text-sm font-medium font-data" style={{ color: '#000e35' }}>
                    {action.valuationRange}
                  </div>

                  <div className="text-xs pr-3" style={{ color: 'rgba(0,14,53,0.55)', lineHeight: 1.5 }}>
                    {action.talkingPoint}
                  </div>

                  <div className="text-xs font-data" style={{ color: 'rgba(0,14,53,0.4)' }}>
                    {action.lastContacted}
                  </div>

                  <div>
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: st.bg,
                        color: st.color,
                        border: `1px solid ${st.border}`
                      }}
                    >
                      {st.label}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1.5 transition-opacity"
                    style={{ opacity: isHovered ? 1 : 0 }}
                  >
                    <button
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(0,14,53,0.07)',
                        color: 'rgba(0,14,53,0.6)'
                      }}
                    >
                      <Phone size={12} />
                    </button>
                    <button
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(0,14,53,0.07)',
                        color: 'rgba(0,14,53,0.6)'
                      }}
                    >
                      <Mail size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom stats */}
        <div
          className="flex items-center gap-8 px-6 py-4 rounded-xl"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,14,53,0.11)',
            boxShadow: '0 1px 3px rgba(0,14,53,0.05)',
          }}
        >
          {[
            { label: 'Total Pipeline Value', value: '$2.8M' },
            { label: 'Active Listings', value: '12' },
            { label: 'Client Satisfaction', value: '85%' },
          ].map((stat, i, arr) => (
            <React.Fragment key={stat.label}>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(0,14,53,0.38)' }}>{stat.label}</p>
                <p className="text-xl font-bold font-data" style={{ color: '#000e35' }}>{stat.value}</p>
              </div>
              {i < arr.length - 1 && (
                <div
                  className="w-px h-8 self-center"
                  style={{ backgroundColor: 'rgba(0,14,53,0.10)' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
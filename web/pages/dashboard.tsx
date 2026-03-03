import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

// Mock data generator for demo
const generateMockData = () => ({
  urgent: [
    {
      id: '1',
      title: 'Listing Expires Tomorrow - 15 Woodland Drive',
      description: 'Contract expires 3/03/26. Owner Sarah Johnson needs renewal decision.',
      contact: {
        name: 'Sarah Johnson',
        phone: '0412 345 678',
        email: 'sarah.johnson@email.com'
      },
      property: {
        address: '15 Woodland Drive, Merrimac QLD 4226',
        value: 750000
      },
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      urgency: 'critical' as const,
      actionType: 'Contract Renewal'
    },
    {
      id: '2',
      title: 'Hot Prospect - Callback Overdue',
      description: 'Marcus Williams called 48h ago about urgent purchase. Follow-up required.',
      contact: {
        name: 'Marcus Williams',
        phone: '0423 456 789',
        email: 'marcus.w@email.com'
      },
      dueDate: new Date(Date.now() - 172800000).toISOString(),
      urgency: 'high' as const,
      actionType: 'Prospect Follow-up'
    }
  ],
  followUp: [
    {
      id: '3',
      title: 'New Lead - Property Valuation Request',
      description: 'Online inquiry for property appraisal. Potential listing opportunity.',
      contact: {
        name: 'Jennifer Chen',
        phone: '0434 789 012',
        email: 'jen.chen@email.com'
      },
      property: {
        address: '22 Palm Beach Road, Palm Beach QLD 4221',
        value: 1200000
      },
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      urgency: 'medium' as const,
      actionType: 'First Contact'
    },
    {
      id: '4',
      title: 'Investment Buyer Referral',
      description: 'Client David referred his brother looking for investment property under $600k.',
      contact: {
        name: 'Michael Thompson',
        phone: '0445 678 123',
        email: 'mthompson@email.com'
      },
      dueDate: new Date(Date.now() + 259200000).toISOString(),
      urgency: 'medium' as const,
      actionType: 'Buyer Consultation'
    }
  ],
  scheduled: [
    {
      id: '5',
      title: 'Property Inspection - 44 Main Street',
      description: 'Routine inspection scheduled. Owner wants market update afterward.',
      contact: {
        name: 'Robert Kim',
        phone: '0456 789 234',
        email: 'rkim@email.com'
      },
      property: {
        address: '44 Main Street, Southport QLD 4215',
        value: 680000
      },
      dueDate: new Date(Date.now() + 345600000).toISOString(),
      urgency: 'low' as const,
      actionType: 'Property Inspection'
    },
    {
      id: '6',
      title: 'Photography Session - New Listing',
      description: 'Professional photos for 12 Sunset Boulevard. Staging complete.',
      property: {
        address: '12 Sunset Boulevard, Broadbeach QLD 4218',
        value: 1450000
      },
      dueDate: new Date(Date.now() + 432000000).toISOString(),
      urgency: 'low' as const,
      actionType: 'Marketing Preparation'
    }
  ],
  communications: [
    {
      id: '7',
      title: 'Tenant Maintenance Query',
      description: 'Tenant at 18 River Road reporting air conditioning issue.',
      contact: {
        name: 'Lisa Martinez',
        phone: '0467 890 345',
        email: 'lisa.martinez@email.com'
      },
      property: {
        address: '18 River Road, Nerang QLD 4211',
        value: 520000
      },
      urgency: 'medium' as const,
      actionType: 'Tenant Communication'
    },
    {
      id: '8',
      title: 'Owner Rent Review Response',
      description: 'Owner at 33 Park View wants to discuss rent increase proposal.',
      contact: {
        name: 'Andrew Wilson',
        phone: '0478 901 456',
        email: 'awilson@email.com'
      },
      property: {
        address: '33 Park View, Varsity Lakes QLD 4227',
        value: 640000
      },
      urgency: 'low' as const,
      actionType: 'Owner Communication'
    }
  ],
  opportunities: [
    {
      id: '9',
      title: 'Off-Market Inquiry - Waterfront Property',
      description: 'High-net-worth client seeking premium waterfront. Budget $2M+.',
      contact: {
        name: 'Catherine Roberts',
        phone: '0489 012 567',
        email: 'croberts@email.com'
      },
      urgency: 'high' as const,
      actionType: 'Premium Buyer'
    },
    {
      id: '10',
      title: 'Expired Listing - Competitor Property',
      description: 'Ray White listing expired last week. Owners may be open to changing agents.',
      contact: {
        name: 'Paul & Maria Santos',
        phone: '0490 123 678'
      },
      property: {
        address: '7 Hillside Crescent, Mudgeeraba QLD 4213',
        value: 785000
      },
      urgency: 'medium' as const,
      actionType: 'Prospect Opportunity'
    }
  ]
});

interface PriorityItemProps {
  title: string;
  description: string;
  contact?: {
    name: string;
    phone?: string;
    email?: string;
  };
  property?: {
    address: string;
    value?: number;
  };
  dueDate?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  actionType: string;
  onComplete?: () => void;
  onDefer?: () => void;
}

const PriorityItem: React.FC<PriorityItemProps> = ({
  title,
  description,
  contact,
  property,
  dueDate,
  urgency = 'medium',
  actionType,
  onComplete,
  onDefer
}) => {
  const urgencyColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'text-white border-red-600'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    
    return {
      text: date.toLocaleDateString('en-AU', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      isOverdue
    };
  };

  return (
    <div className="bg-white rounded-lg border-2 hover:shadow-md transition-all duration-200" style={{ borderColor: '#000e35' }}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span 
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${urgencyColors[urgency]}`}
                style={{
                  backgroundColor: urgency === 'critical' ? '#660000' : undefined
                }}
              >
                {urgency.toUpperCase()}
              </span>
              <span className="text-xs font-medium" style={{ color: '#000e35' }}>{actionType}</span>
              {dueDate && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span 
                    className={`text-xs font-medium ${
                      formatDate(dueDate).isOverdue ? 'text-red-600 font-bold' : ''
                    }`}
                    style={{ color: formatDate(dueDate).isOverdue ? '#660000' : '#000e35' }}
                  >
                    {formatDate(dueDate).isOverdue ? 'OVERDUE' : 'Due'} {formatDate(dueDate).text}
                  </span>
                </>
              )}
            </div>
            
            <h4 className="text-lg font-bold mb-2" style={{ color: '#000e35' }}>
              {title}
            </h4>
            
            <p className="text-sm text-gray-700 mb-3">
              {description}
            </p>

            {contact && (
              <div className="flex items-center space-x-4 text-sm mb-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000e35' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-bold" style={{ color: '#000e35' }}>{contact.name}</span>
                </div>
                
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center font-medium hover:underline"
                    style={{ color: '#660000' }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {contact.phone}
                  </a>
                )}

                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center font-medium hover:underline"
                    style={{ color: '#660000' }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </a>
                )}
              </div>
            )}

            {property && (
              <div className="text-sm mb-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000e35' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span style={{ color: '#000e35' }}>{property.address}</span>
                </div>
                {property.value && (
                  <div className="ml-6 mt-1">
                    <span className="font-bold text-green-600">
                      Est. {formatCurrency(property.value)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t" style={{ borderColor: '#f7f5ee' }}>
          {onComplete && (
            <button 
              onClick={onComplete}
              className="inline-flex items-center px-4 py-2 text-sm font-bold text-white rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#000e35' }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
          )}
          
          {onDefer && (
            <button 
              onClick={onDefer}
              className="inline-flex items-center px-4 py-2 border-2 text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
              style={{ 
                borderColor: '#000e35',
                color: '#000e35',
                backgroundColor: '#f7f5ee'
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface PrioritySectionProps {
  title: string;
  count: number;
  color: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
  emoji: string;
  children: React.ReactNode;
}

const PrioritySection: React.FC<PrioritySectionProps> = ({
  title,
  count,
  color,
  emoji,
  children
}) => {
  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200', 
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200'
  };

  return (
    <div className={`rounded-lg border-2 ${colorClasses[color]} mb-6`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{emoji}</span>
            <h2 className="text-xl font-bold" style={{ color: '#000e35' }}>
              {title}
            </h2>
          </div>
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: '#660000' }}
          >
            {count}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mockData] = useState(generateMockData());

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

  const totalItems = Object.values(mockData).reduce((sum, section) => sum + section.length, 0);

  return (
    <Layout>
      <Head>
        <title>Priority Dashboard - Taya Real Estate</title>
        <meta name="description" content="Priority-driven real estate management dashboard" />
      </Head>

      {/* Header */}
      <div className="border-b" style={{ backgroundColor: 'white', borderColor: '#000e35' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#000e35' }}>
                Priority Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: '#660000' }}>
                {formatDate(currentTime)} • {formatTime(currentTime)} • {totalItems} active items
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: '#000e35' }}>Good morning, Taya</p>
              <p className="text-xs" style={{ color: '#660000' }}>Focus on red and orange priorities first</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* URGENT - IMMEDIATE ACTION */}
          <PrioritySection
            title="URGENT - IMMEDIATE ACTION"
            color="red"
            count={mockData.urgent.length}
            emoji="🔴"
          >
            {mockData.urgent.map((item) => (
              <PriorityItem
                key={item.id}
                title={item.title}
                description={item.description}
                contact={item.contact}
                property={item.property}
                dueDate={item.dueDate}
                urgency={item.urgency}
                actionType={item.actionType}
                onComplete={() => console.log('Complete:', item.id)}
                onDefer={() => console.log('Defer:', item.id)}
              />
            ))}
          </PrioritySection>

          {/* FOLLOW-UP REQUIRED */}
          <PrioritySection
            title="FOLLOW-UP REQUIRED"
            color="orange"
            count={mockData.followUp.length}
            emoji="🟠"
          >
            {mockData.followUp.map((item) => (
              <PriorityItem
                key={item.id}
                title={item.title}
                description={item.description}
                contact={item.contact}
                property={item.property}
                dueDate={item.dueDate}
                urgency={item.urgency}
                actionType={item.actionType}
                onComplete={() => console.log('Complete:', item.id)}
                onDefer={() => console.log('Defer:', item.id)}
              />
            ))}
          </PrioritySection>

          {/* SCHEDULED ACTIVITIES */}
          <PrioritySection
            title="SCHEDULED ACTIVITIES"
            color="yellow"
            count={mockData.scheduled.length}
            emoji="🟡"
          >
            {mockData.scheduled.map((item) => (
              <PriorityItem
                key={item.id}
                title={item.title}
                description={item.description}
                contact={item.contact}
                property={item.property}
                dueDate={item.dueDate}
                urgency={item.urgency}
                actionType={item.actionType}
                onComplete={() => console.log('Complete:', item.id)}
                onDefer={() => console.log('Defer:', item.id)}
              />
            ))}
          </PrioritySection>

          {/* COMMUNICATIONS */}
          <PrioritySection
            title="COMMUNICATIONS"
            color="blue"
            count={mockData.communications.length}
            emoji="🔵"
          >
            {mockData.communications.map((item) => (
              <PriorityItem
                key={item.id}
                title={item.title}
                description={item.description}
                contact={item.contact}
                property={item.property}
                dueDate={(item as any).dueDate}
                urgency={item.urgency}
                actionType={item.actionType}
                onComplete={() => console.log('Complete:', item.id)}
                onDefer={() => console.log('Defer:', item.id)}
              />
            ))}
          </PrioritySection>

          {/* NEW OPPORTUNITIES */}
          <PrioritySection
            title="NEW OPPORTUNITIES"
            color="green"
            count={mockData.opportunities.length}
            emoji="🟢"
          >
            {mockData.opportunities.map((item) => (
              <PriorityItem
                key={item.id}
                title={item.title}
                description={item.description}
                contact={item.contact}
                property={item.property}
                dueDate={(item as any).dueDate}
                urgency={item.urgency}
                actionType={item.actionType}
                onComplete={() => console.log('Complete:', item.id)}
                onDefer={() => console.log('Defer:', item.id)}
              />
            ))}
          </PrioritySection>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
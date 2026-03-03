import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Components
import DashboardLayout from '../components/DashboardLayout';
import PrioritySection from '../components/PrioritySection';
import PriorityItem from '../components/PriorityItem';

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
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      urgency: 'critical' as const,
      actionType: 'Contract Renewal'
    },
    {
      id: '2', 
      title: 'Hot Prospect Callback Overdue',
      description: 'Marcus Williams called 48 hours ago about selling. Flagged as ready to list.',
      contact: {
        name: 'Marcus Williams',
        phone: '0423 567 890',
        email: 'marcus.w@email.com'
      },
      property: {
        address: '8 Ocean View Terrace, Burleigh Heads QLD 4220',
        value: 950000
      },
      dueDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      urgency: 'high' as const,
      actionType: 'Follow-up Call'
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
      dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
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
      dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days
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
      dueDate: new Date(Date.now() + 345600000).toISOString(), // 4 days
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
      dueDate: new Date(Date.now() + 432000000).toISOString(), // 5 days  
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

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mockData] = useState(generateMockData());

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

  const totalItems = mockData.urgent.length + mockData.followUp.length + 
                    mockData.scheduled.length + mockData.communications.length + 
                    mockData.opportunities.length;

  return (
    <DashboardLayout>
      <Head>
        <title>Taya Real Estate - Priority Dashboard</title>
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Taya! 
              </h1>
              <p className="text-gray-600 mt-1">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-sm text-gray-500">Total Priority Items</div>
            </div>
          </div>

          {/* Quick counts */}
          <div className="mt-6 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">{mockData.urgent.length} Urgent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="font-medium">{mockData.followUp.length} Follow-up</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">{mockData.scheduled.length} Scheduled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">{mockData.communications.length} Communications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">{mockData.opportunities.length} Opportunities</span>
            </div>
          </div>
        </div>

        {/* Priority Sections */}
        <div className="space-y-6">
          {/* URGENT - Immediate Action Required */}
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

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>Priority Dashboard • Items clear once actioned • Last updated: {formatTime(currentTime)}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

// Mock data - in a real app this would come from MongoDB
const mockDashboardData = {
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
      callScript: `Hi Sarah, this is Taya Rich from REMAX Regency. I noticed you recently purchased the beautiful property on Woodland Drive in Merrimac. Congratulations! I specialize in the Merrimac area and wanted to introduce myself as your local real estate expert. I'd love to share some insights about your neighborhood and how I can help with any future property needs. Would you have a few minutes for a quick chat?`,
      estimatedDuration: 15,
      scheduledDate: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Follow-up - Property Valuation Interest',
      priority: 7,
      actionType: 'Follow-up Call',
      propertyOwner: {
        fullName: 'Michael Chen',
        phone: { mobile: '0423 567 890' },
        prospectSegment: { category: 'Market Mover', score: 72 }
      },
      property: {
        address: { fullAddress: '8 Riverside Court, Merrimac QLD 4226' },
        currentValuation: { estimate: 820000 }
      },
      callScript: `Hi Michael, it's Taya from REMAX Regency following up on our conversation about getting a current market appraisal for your property on Riverside Court. I've prepared a comprehensive market analysis that shows some interesting trends in your area. When would be a good time to pop by and discuss this with you?`,
      estimatedDuration: 20,
      scheduledDate: new Date(Date.now() + 3600000).toISOString()
    },
    {
      id: '3',
      title: 'Market Update - Investment Property',
      priority: 6,
      actionType: 'Market Update',
      propertyOwner: {
        fullName: 'Jennifer Williams',
        email: { address: 'j.williams@investments.com' },
        phone: { mobile: '0434 678 901' },
        prospectSegment: { category: 'Investment Opportunity', score: 68 }
      },
      property: {
        address: { fullAddress: '22 Pacific View Street, Merrimac QLD 4226' },
        currentValuation: { estimate: 680000 }
      },
      callScript: `Hi Jennifer, Taya here from REMAX Regency. I have some exciting news about the investment property market in Merrimac. There's been a 12% increase in rental yields in your area over the past quarter. I thought you'd be interested in how this affects your Pacific View property and some new opportunities I'm seeing. Do you have time for a quick update?`,
      estimatedDuration: 12,
      scheduledDate: new Date(Date.now() + 7200000).toISOString()
    }
  ],
  metrics: {
    totalProperties: 1247,
    totalOwners: 1156,
    todayTasks: 12,
    weeklyGoal: 50,
    weeklyProgress: 68
  },
  segments: [
    { name: 'Hot Prospects', count: 23, percentage: 15.8, color: '#dc2626' },
    { name: 'Market Movers', count: 45, percentage: 30.9, color: '#ea580c' },
    { name: 'Investment Opportunities', count: 34, percentage: 23.4, color: '#0284c7' },
    { name: 'Service Needs', count: 28, percentage: 19.2, color: '#10b981' },
    { name: 'Lifecycle Triggers', count: 16, percentage: 10.7, color: '#8b5cf6' }
  ],
  recentActivity: [
    {
      type: 'Property Added',
      description: 'New listing detected at 45 Emerald Drive',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      type: 'Contact Updated',
      description: 'Phone verified for David Thompson',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      type: 'Action Completed',
      description: 'Follow-up call completed with Lisa Parker',
      timestamp: new Date(Date.now() - 5400000).toISOString()
    },
    {
      type: 'Valuation Updated',
      description: 'Property valuation increased for 12 Ocean View',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ]
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify user is authenticated
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In a real app, you would:
  // 1. Connect to MongoDB
  // 2. Query for user's dashboard data
  // 3. Apply any filters or personalization
  // 4. Return the data
  
  try {
    // Simulate some processing time
    const data = {
      ...mockDashboardData,
      lastUpdated: new Date().toISOString(),
      userId: userId
    };

    res.status(200).json(data);
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
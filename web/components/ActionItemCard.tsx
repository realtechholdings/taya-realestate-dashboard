import React from 'react';

interface ActionItemProps {
  action: {
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
  };
}

const ActionItemCard: React.FC<ActionItemProps> = ({ action }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                Priority {action.priority}
              </span>
              <span className="text-xs text-gray-500">{action.actionType}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{action.estimatedDuration}min</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {action.title}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{action.propertyOwner.fullName}</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs">{action.propertyOwner.prospectSegment.category}</span>
                <span className="ml-1 font-medium">({action.propertyOwner.prospectSegment.score}/100)</span>
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              📍 {action.property.address.fullAddress}
              {action.property.currentValuation?.estimate && (
                <span className="ml-2 font-medium text-green-600">
                  Est. {formatCurrency(action.property.currentValuation.estimate)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center space-x-4 text-sm">
          {action.propertyOwner.phone?.mobile && (
            <a
              href={`tel:${action.propertyOwner.phone.mobile}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-500"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {action.propertyOwner.phone.mobile}
            </a>
          )}
          
          {action.propertyOwner.email?.address && (
            <a
              href={`mailto:${action.propertyOwner.email.address}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-500"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">📝 Call Script</h4>
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700">
              {action.callScript || 'No call script available for this action.'}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Scheduled: {new Date(action.scheduledDate).toLocaleString('en-AU')}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>
              
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0v10a2 2 0 002 2h4a2 2 0 002-2V7" />
                </svg>
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionItemCard;
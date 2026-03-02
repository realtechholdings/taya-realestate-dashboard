import React from 'react';

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
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800', 
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
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
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyColors[urgency]}`}>
                {urgency.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">{actionType}</span>
              {dueDate && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">Due {formatDate(dueDate)}</span>
                </>
              )}
            </div>
            
            <h4 className="text-md font-semibold text-gray-900 mb-1">
              {title}
            </h4>
            
            <p className="text-sm text-gray-600 mb-2">
              {description}
            </p>

            {contact && (
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{contact.name}</span>
                </div>
                
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-500"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {contact.phone}
                  </a>
                )}
              </div>
            )}

            {property && (
              <div className="text-sm text-gray-500">
                📍 {property.address}
                {property.value && (
                  <span className="ml-2 font-medium text-green-600">
                    Est. {formatCurrency(property.value)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
          {onComplete && (
            <button 
              onClick={onComplete}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
          )}
          
          {onDefer && (
            <button 
              onClick={onDefer}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default PriorityItem;
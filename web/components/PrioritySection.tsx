import React from 'react';

interface PrioritySectionProps {
  title: string;
  color: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
  count: number;
  children: React.ReactNode;
  emoji: string;
}

const colorClasses = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    header: 'bg-red-100 text-red-900',
    icon: 'text-red-600'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200', 
    header: 'bg-orange-100 text-orange-900',
    icon: 'text-orange-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    header: 'bg-yellow-100 text-yellow-900', 
    icon: 'text-yellow-600'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-100 text-blue-900',
    icon: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    header: 'bg-green-100 text-green-900',
    icon: 'text-green-600'
  }
};

const PrioritySection: React.FC<PrioritySectionProps> = ({ 
  title, 
  color, 
  count, 
  children, 
  emoji 
}) => {
  const colors = colorClasses[color];

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} overflow-hidden`}>
      <div className={`px-4 py-3 ${colors.header} flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <span className="text-xl">{emoji}</span>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${colors.icon} bg-white`}>
          {count}
        </div>
      </div>
      <div className="p-4">
        {count > 0 ? (
          <div className="space-y-3">
            {children}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8 italic">
            No items requiring attention
          </div>
        )}
      </div>
    </div>
  );
};

export default PrioritySection;
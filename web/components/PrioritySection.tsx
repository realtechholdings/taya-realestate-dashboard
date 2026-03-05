import React from 'react';

interface PrioritySectionProps {
  title: string;
  color: 'red' | 'orange' | 'blue' | 'slate' | 'sky';
  count: number;
  children: React.ReactNode;
}

const colorMap = {
  red: { dot: '#660000', border: 'rgba(102,0,0,0.15)', bg: 'rgba(102,0,0,0.05)' },
  orange: { dot: '#92400e', border: 'rgba(146,64,14,0.15)', bg: 'rgba(146,64,14,0.05)' },
  blue: { dot: '#0043ff', border: 'rgba(0,67,255,0.15)', bg: 'rgba(0,67,255,0.04)' },
  slate: { dot: 'rgba(0,14,53,0.35)', border: 'rgba(0,14,53,0.10)', bg: 'rgba(0,14,53,0.03)' },
  sky: { dot: 'rgba(0,14,53,0.5)', border: 'rgba(0,14,53,0.12)', bg: 'rgba(0,14,53,0.04)' },
};

const PrioritySection: React.FC<PrioritySectionProps> = ({ title, color, count, children }) => {
  const c = colorMap[color];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${c.border}`, backgroundColor: '#ffffff' }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: c.bg, borderBottom: `1px solid ${c.border}` }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: c.dot }}
          />
          <h2 className="text-sm font-semibold" style={{ color: '#000e35' }}>{title}</h2>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(0,14,53,0.07)', color: 'rgba(0,14,53,0.6)' }}
        >
          {count}
        </span>
      </div>
      <div className="p-4">
        {count > 0 ? (
          <div className="space-y-3">{children}</div>
        ) : (
          <p className="text-center py-6 text-xs italic" style={{ color: 'rgba(0,14,53,0.35)' }}>
            No items requiring attention
          </p>
        )}
      </div>
    </div>
  );
};

export default PrioritySection;
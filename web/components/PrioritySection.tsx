import React from 'react';

interface PrioritySectionProps {
  title: string;
  color: 'red' | 'orange' | 'blue' | 'slate' | 'sky';
  count: number;
  children: React.ReactNode;
}

const colorMap = {
  red: { dot: '#ff1200', border: 'rgba(255,18,0,0.25)', bg: 'rgba(255,18,0,0.08)' },
  orange: { dot: '#fb923c', border: 'rgba(251,146,60,0.25)', bg: 'rgba(251,146,60,0.08)' },
  blue: { dot: '#6699ff', border: 'rgba(0,67,255,0.25)', bg: 'rgba(0,67,255,0.10)' },
  slate: { dot: 'rgba(247,245,238,0.45)', border: 'rgba(247,245,238,0.12)', bg: 'rgba(247,245,238,0.05)' },
  sky: { dot: '#60a5fa', border: 'rgba(96,165,250,0.25)', bg: 'rgba(96,165,250,0.08)' },
};

const PrioritySection: React.FC<PrioritySectionProps> = ({ title, color, count, children }) => {
  const c = colorMap[color];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${c.border}`, backgroundColor: 'rgba(247,245,238,0.03)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          backgroundColor: c.bg,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: c.dot }}
          />
          <h2 className="text-sm font-semibold" style={{ color: '#f7f5ee' }}>{title}</h2>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: 'rgba(247,245,238,0.10)',
            color: '#f7f5ee',
          }}
        >
          {count}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {count > 0 ? (
          <div className="space-y-3">{children}</div>
        ) : (
          <p className="text-center py-6 text-xs italic" style={{ color: 'rgba(247,245,238,0.35)' }}>
            No items requiring attention
          </p>
        )}
      </div>
    </div>
  );
};

export default PrioritySection;
import React from 'react';
import Head from 'next/head';
import { PieChart } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const SegmentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Head>
        <title>Segments — Merrimac Dashboard</title>
      </Head>
      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '28px', fontWeight: 700, color: '#1a1412', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Segments
          </h1>
          <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: '#6b6560', fontWeight: 400 }}>
            Coming in Phase 5C — Prospect segmentation intelligence for Merrimac, QLD 4226
          </p>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #d4cfc8', boxShadow: '0 1px 3px rgba(26,20,18,0.06), 0 8px 24px rgba(26,20,18,0.04)', padding: '64px 48px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(102,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <PieChart size={22} color="#660000" strokeWidth={1.8} />
          </div>
          <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '15px', fontWeight: 600, color: '#1a1412', marginBottom: '8px' }}>
            Coming in Phase 5C
          </p>
          <p style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#9c958f', fontWeight: 400 }}>
            Data and UI will be wired up in this phase.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SegmentsPage;

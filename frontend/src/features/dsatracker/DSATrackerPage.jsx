import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DSATrackerPage() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0c0e12', margin: 0, padding: 0 }}>
      {/* Discrete floating navigation back button */}
      <button
        onClick={() => navigate('/login')}
        style={{
          position: 'fixed',
          top: '12px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '8px',
          backgroundColor: '#1c2230',
          color: '#e6edf3',
          border: '1px solid #262e3d',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#262e3d';
          e.currentTarget.style.borderColor = '#58a6ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1c2230';
          e.currentTarget.style.borderColor = '#262e3d';
        }}
        title="Return to Study Library Dashboard"
      >
        <ArrowLeft size={14} />
        <span>Exit to Library</span>
      </button>

      {/* 100% exact replica of index.html */}
      <iframe
        src="/dsa-tracker.html"
        title="DSA Interview Question Tracker"
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          display: 'block',
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
}

import React from 'react';

export default function StatsRow({ completedCount, projectsCount, isDarkMode }) {
  // Balanced theme mapping styles matching low-fatigue slate guidelines
  const cardStyle = `border rounded-2xl p-5 shadow-sm flex justify-between items-start transition-colors ${
    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-textMain'
  }`;

return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* 1. COMPLETED SHIPMENT LEDGER TRACK */}
      <div className={cardStyle}>
        <div className="text-left">
          <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Tasks Completed</span>
          <div className="text-3xl font-bold mt-1 tracking-tight font-sans">{completedCount}</div>
        </div>
        
        {/* MINIMALIST GEOMETRIC CHECKMARK CIRCLE */}
        <span className={`p-2 rounded-xl border transition-colors ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-100 text-slate-500'
        }`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </div>
      
      {/* 2. ACTIVE SYSTEM PROJECTS LEDGER TRACK */}
      <div className={cardStyle}>
        <div className="text-left">
          <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Active Workspace Projects</span>
          <div className="text-3xl font-bold mt-1 tracking-tight font-sans">{projectsCount}</div>
        </div>

        {/* MINIMALIST GEOMETRIC FOLDER DECK */}
        <span className={`p-2 rounded-xl border transition-colors ${
          isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-200 text-slate-500'
        }`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 002-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </span>
      </div>

    </div>
  );
}
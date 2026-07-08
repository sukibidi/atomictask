import React from 'react';

function MiniTrendChart({ data, accentColor, fillColor, label }) {
  const values = Array.isArray(data) && data.length ? data : [2, 3, 2, 4, 3, 5, 4];
  const width = 140;
  const height = 44;
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const spread = maxValue - minValue || 1;

  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - minValue) / spread) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className="w-full">
      <div className="text-[10px] uppercase tracking-[0.24em] text-textMuted mb-1">{label}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12" preserveAspectRatio="none">
        <path
          d={`M ${points[0]} L ${points.slice(1).join(' L ')}`}
          fill="none"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M ${points[0]} L ${points.slice(1).join(' L ')} L ${width},${height} L 0,${height} Z`}
          fill={fillColor}
          opacity="0.22"
        />
      </svg>
    </div>
  );
}

export default function StatsRow({ completedCount, projectsCount, isDarkMode, taskTrend, projectTrend }) {
  const cardStyle = `border rounded-2xl p-4 shadow-sm transition-colors ${
    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-textMain'
  }`;

  const trendAccent = isDarkMode ? '#34d399' : '#0f766e';
  const trendFill = isDarkMode ? '#34d399' : '#14b8a6';

  return (
    <div className="space-y-3">
      <div className={`rounded-2xl border p-4 shadow-sm transition-colors ${
        isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-textMuted">Daily performance</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Weekly pulse</div>
          </div>
          <div className={`text-[10px] rounded-full px-2.5 py-1 border ${
            isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-slate-500'
          }`}>7D</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800/50 p-3 bg-slate-950/40">
            <MiniTrendChart data={taskTrend} accentColor={trendAccent} fillColor={trendFill} label="Tasks" />
          </div>
          <div className="rounded-xl border border-slate-800/50 p-3 bg-slate-950/40">
            <MiniTrendChart data={projectTrend} accentColor={trendAccent} fillColor={trendFill} label="Projects" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={cardStyle}>
          <div className="flex justify-between items-start gap-3">
            <div className="text-left min-w-0">
              <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.24em]">Tasks Completed</span>
              <div className="text-2xl font-bold mt-1 tracking-tight font-sans">{completedCount}</div>
            </div>

            <span className={`p-2 rounded-xl border transition-colors ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-100 text-slate-500'
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="flex justify-between items-start gap-3">
            <div className="text-left min-w-0">
              <span className="text-[10px] font-semibold text-textMuted uppercase tracking-[0.24em]">Active Projects</span>
              <div className="text-2xl font-bold mt-1 tracking-tight font-sans">{projectsCount}</div>
            </div>

            <span className={`p-2 rounded-xl border transition-colors ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-200 text-slate-500'
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 002-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
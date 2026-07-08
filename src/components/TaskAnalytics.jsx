import React from 'react';

export default function TaskAnalytics({ totalTasksCount, todoCount, inProgressCount, completedCount, isDarkMode }) {
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;
  
  const maxLanesCount = Math.max(todoCount, inProgressCount, completedCount, 1);
  const todoGraphHeight = (todoCount / maxLanesCount) * 100;
  const inProgressGraphHeight = (inProgressCount / maxLanesCount) * 100;
  const completedGraphHeight = (completedCount / maxLanesCount) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Linear Progress Card */}
      <div className={`border rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div>
          <span className="text-[10px] font-bold tracking-wider text-textMuted uppercase">Macro Completion Metrics</span>
          <div className="text-3xl font-extrabold mt-1 tracking-tight">{completionPercentage}%</div>
          <p className="text-[11px] text-textMuted mt-1">Total operational workload successfully shipped to completion status loops.</p>
        </div>
        <div className="mt-6 space-y-2">
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-blue-600'}`} 
              style={{ width: `${completionPercentage}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold font-mono tracking-wide text-gray-400">
            <span>WORKLOAD DECK BALANCE</span>
            <span>{completedCount} / {totalTasksCount} UNITS</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Vertical Bar Graph Card */}
      <div className={`border rounded-2xl p-5 shadow-sm transition-colors lg:col-span-2 flex flex-col sm:flex-row justify-between items-end gap-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <div className="w-full sm:w-1/3 self-start">
          <span className="text-[10px] font-bold tracking-wider text-textMuted uppercase">Distribution Matrix</span>
          <h3 className="text-sm font-bold mt-1 tracking-tight">Lane Volumes</h3>
          <p className="text-[11px] text-textMuted mt-1">Visual comparison mapping absolute workloads across processing pipelines.</p>
          <div className="mt-4 grid grid-cols-3 text-center border-t border-gray-100/10 pt-3 text-[11px] font-mono font-bold">
            <div><div className="text-sm text-gray-400">{todoCount}</div><div className="text-[9px] opacity-65">TODO</div></div>
            <div><div className="text-sm text-orange-400">{inProgressCount}</div><div className="text-[9px] opacity-65">PROG</div></div>
            <div><div className="text-sm text-emerald-400">{completedCount}</div><div className="text-[9px] opacity-65">DONE</div></div>
          </div>
        </div>

        <div className="w-full sm:w-2/3 h-28 flex items-end justify-around gap-4 px-2 border-b border-gray-100/10 pb-1">
          {/* To Do Column */}
          <div className="w-12 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold font-mono text-gray-400">{todoCount}</span>
            <div className={`w-full rounded-t-lg transition-all duration-500 ${isDarkMode ? 'bg-slate-700/60' : 'bg-gray-200'}`} style={{ height: `${todoGraphHeight}%` }} />
            <span className="text-[9px] font-bold tracking-wider text-textMuted uppercase mt-1">To Do</span>
          </div>

          {/* In Progress Column */}
          <div className="w-12 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold font-mono text-orange-400">{inProgressCount}</span>
            <div className="w-full rounded-t-lg transition-all duration-500 bg-orange-500/80" style={{ height: `${inProgressGraphHeight}%` }} />
            <span className="text-[9px] font-bold tracking-wider text-textMuted uppercase mt-1">Active</span>
          </div>

          {/* Completed Column */}
          <div className="w-12 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold font-mono text-emerald-400">{completedCount}</span>
            <div className={`w-full rounded-t-lg transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-t from-teal-500 to-emerald-400' : 'bg-blue-600'}`} style={{ height: `${completedGraphHeight}%` }} />
            <span className="text-[9px] font-bold tracking-wider text-textMuted uppercase mt-1">Done</span>
          </div>
        </div>
      </div>
    </div>
  );
}
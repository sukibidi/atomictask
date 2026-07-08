import React, { useState } from 'react';

export default function GanttChartSlider({ 
  projects = [], // FIXED: Named projects to prevent loop undefined errors
  tasks = [],      
  semesterStartDate = "2026-03-30", 
  isDarkMode 
}) {
  const [viewMode, setViewMode] = useState('weeks');

  const getGridPlacement = (targetDateStr) => {
    const startSem = new Date(`${semesterStartDate}T00:00:00`);
    const targetDate = targetDateStr ? new Date(`${targetDateStr}T00:00:00`) : new Date(startSem);
    const msPerDay = 1000 * 60 * 60 * 24;

    if (viewMode === 'days') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      let dayIdx = targetDate.getMonth() === currentMonth && targetDate.getFullYear() === currentYear ? targetDate.getDate() : 1;
      return { gridColumnStart: dayIdx, gridColumnEnd: 'span 1', justifySelf: 'center' };
    } else if (viewMode === 'weeks') {
      const daysFromStart = Math.floor((targetDate.getTime() - startSem.getTime()) / msPerDay);
      let weekIdx = Math.floor(daysFromStart / 7) + 1;
      weekIdx = Math.max(1, Math.min(16, weekIdx));
      return { gridColumnStart: weekIdx, gridColumnEnd: 'span 1', justifySelf: 'center' };
    } else {
      let monthIdx = targetDate.getMonth() + 1;
      return { gridColumnStart: monthIdx, gridColumnEnd: 'span 1', justifySelf: 'center' };
    }
  };

  const getProjectBarPlacement = (startStr, endStr) => {
    const startSem = new Date(`${semesterStartDate}T00:00:00`);
    const startProj = startStr ? new Date(`${startStr}T00:00:00`) : new Date(startSem);
    const endProj = endStr ? new Date(`${endStr}T00:00:00`) : new Date(startProj);
    const msPerDay = 1000 * 60 * 60 * 24;

    if (viewMode === 'days') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      let sDay = startProj.getMonth() === currentMonth && startProj.getFullYear() === currentYear ? startProj.getDate() : 1;
      let eDay = endProj.getMonth() === currentMonth && endProj.getFullYear() === currentYear ? endProj.getDate() : 31;
      if (startProj.getMonth() !== currentMonth) sDay = 1;
      if (endProj.getMonth() !== currentMonth) eDay = 31;
      return { gridColumnStart: sDay, gridColumnEnd: `span ${Math.max(1, eDay - sDay + 1)}` };
    } else if (viewMode === 'weeks') {
      const daysFromStart = Math.floor((startProj.getTime() - startSem.getTime()) / msPerDay);
      let startWeek = Math.floor(daysFromStart / 7) + 1;
      startWeek = Math.max(1, Math.min(16, startWeek));
      const durationDays = Math.floor((endProj.getTime() - startProj.getTime()) / msPerDay);
      const spanWeeks = Math.max(1, Math.ceil(durationDays / 7));
      return { gridColumnStart: startWeek, gridColumnEnd: `span ${Math.min(17 - startWeek, spanWeeks)}` };
    } else {
      let sMonth = startProj.getMonth() + 1;
      let eMonth = endProj.getMonth() + 1;
      if (endProj.getFullYear() !== startProj.getFullYear()) eMonth = 12;
      return { gridColumnStart: sMonth, gridColumnEnd: `span ${Math.max(1, eMonth - sMonth + 1)}` };
    }
  };

  const totalTracksCount = viewMode === 'days' ? 31 : viewMode === 'weeks' ? 16 : 12;
  const gridStyle = { display: 'grid', gridTemplateColumns: `repeat(${totalTracksCount}, minmax(0, 1fr))` };

  return (
    <div className={`w-full overflow-hidden border rounded-2xl shadow-xs flex flex-col justify-between transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100'
    }`}>
      <div className={`px-4 py-3 sm:px-5 sm:py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50/40 border-gray-100'
      }`}>
        <div className="text-left">
          <h3 className="text-sm font-bold tracking-tight">Milestones & Deadlines</h3>
          <p className="text-[10px] text-textMuted mt-0.5">An automatically updating timeline that makes sure you never miss a project start or end date.</p>
        </div>
        <div className={`flex w-full sm:w-auto gap-1 p-1 rounded-xl border justify-center ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200/40'
        }`}>
          {['days', 'weeks', 'months'].map((mode) => (
            <button key={mode} type="button" onClick={() => setViewMode(mode)} className={`flex-1 sm:flex-initial px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer transition-all ${viewMode === mode ? (isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-slate-900 shadow-3xs') : 'text-textMuted'}`}>{mode}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto p-4 sm:p-5 -webkit-overflow-scrolling-touch">
        <div className="min-w-[850px] sm:min-w-[950px] space-y-4">
          <div className={`grid grid-cols-12 font-bold text-[10px] border-b pb-2 ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-gray-100 text-slate-500'}`}>
            <div className="col-span-4 uppercase tracking-wider text-left">Active Projects</div>
            <div className="col-span-8" style={gridStyle}>
              {viewMode === 'days' && Array.from({ length: 31 }, (_, i) => <div key={i+1} className="text-center font-mono text-[9px] font-bold">{i+1}</div>)}
              {viewMode === 'weeks' && Array.from({ length: 16 }, (_, i) => <div key={i+1} className="text-center font-mono text-[9px]">W{i+1}</div>)}
              {viewMode === 'months' && ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <div key={m} className="text-center uppercase tracking-tight">{m}</div>)}
            </div>
          </div>

          <div className="divide-y divide-gray-100/10">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-gray-400">// Your workspace is clear—ready to start a new project?</div>
            ) : (
              projects.map((project) => {
                const projectMilestones = tasks.filter(t => t.project_id === project.id && t.is_milestone === true);
                const hasTimeline = project.start_date && project.end_date;

                return (
                  <div key={project.id} className="grid grid-cols-12 items-center py-3 border-b border-gray-100/5 hover:bg-gray-500/5">
                    <div className="col-span-4 flex items-center gap-2 text-xs font-semibold text-left pr-2">
                      <span className="text-xs">📁</span>
                      <div className="flex flex-col truncate">
                        <span className="truncate text-slate-900 dark:text-slate-100 font-bold">{project.title}</span>
                        <span className="text-[9px] text-slate-400 font-mono tracking-tight uppercase truncate">{projectMilestones.length} SMART Markers</span>
                      </div>
                    </div>

                    <div className="col-span-8 relative h-5 flex items-center" style={gridStyle}>
                      {Array.from({ length: totalTracksCount }).map((_, i) => (
                        <div key={i} className={`border-l h-full w-full pointer-events-none ${isDarkMode ? 'border-slate-800/20' : 'border-gray-100'}`} />
                      ))}
                      {hasTimeline ? (
                        <div style={getProjectBarPlacement(project.start_date, project.end_date)} className="h-2.5 rounded-full bg-blue-500/20 text-blue-600 dark:bg-emerald-400/10 dark:text-emerald-400 border border-blue-500/10 dark:border-emerald-400/20 font-mono text-[7px] sm:text-[8px] font-bold px-1 sm:px-2 flex items-center justify-between transition-all overflow-hidden truncate pointer-events-none">
                          <span className="hidden sm:inline">START</span><span>TRACK</span><span className="hidden sm:inline">END</span>
                        </div>
                      ) : (
                        <div className="absolute inset-x-0 text-center text-[9px] font-mono text-gray-400 italic pointer-events-none">// Awaiting bounds...</div>
                      )}

                      {projectMilestones.map((milestone) => {
                        const isCompleted = milestone.status === 'completed';
                        return (
                          <div key={milestone.id} style={getGridPlacement(milestone.due_date || project.end_date)} title={milestone.title} className={`absolute text-xs sm:text-sm leading-none transition-all select-none z-10 font-bold cursor-help ${isCompleted ? 'text-emerald-500 transform scale-125' : 'text-blue-500 dark:text-white'}`}>♦</div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
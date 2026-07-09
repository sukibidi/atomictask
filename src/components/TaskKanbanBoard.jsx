import React from 'react';

export default function TaskKanbanBoard({ 
  tasks, 
  projects, 
  teamMembers = [], 
  currentUserId, 
  activeProjectId,
  onToggleComplete,
  onDragStart, 
  onDrop, 
  handleDeleteTask, 
  isDarkMode 
}) {
  
  // Find current active project details to evaluate authority parameters
  const currentProject = projects.find(p => p.id === activeProjectId);
  const isOwner = currentProject?.owner_id === currentUserId;

  const getPriorityBadge = (prio) => {
    switch(prio) {
      case 'high': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
    }
  };

  const lanes = [
    { 
      id: 'to_do', 
      title: 'To Do', 
      icon: 'https://cdn-icons-png.flaticon.com/128/9741/9741134.png',
      bg: isDarkMode ? 'bg-slate-900/40' : 'bg-gray-50/50',
      isInvertible: true // Flags that this black icon needs to turn white in dark mode
    },
    { 
      id: 'in_progress', 
      title: 'In Progress', 
      icon: '⚡', // Kept emoji since no specific icon was specified for this lane
      bg: isDarkMode ? 'bg-slate-900/40' : 'bg-gray-50/50',
      isInvertible: false
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      icon: 'https://cdn-icons-png.flaticon.com/128/17981/17981277.png',
      bg: isDarkMode ? 'bg-slate-900/40' : 'bg-gray-50/50',
      isInvertible: false // Already a bright badge color, no inversion needed
    }
  ];
    
  return (
    <div className="space-y-6">
      
      {/* MACRO PROGRESS MONITORING BAR DISPLAY FOR TEAM TRANSPARENCY */}
      {tasks.length > 0 && (
        <div className={`p-4 border rounded-2xl text-left ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center text-[11px] font-bold tracking-wide text-textMuted uppercase mb-2">
            <span>Vault Delivery Velocity</span>
            <span>
              {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}% Complete
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(tasks.filter(t => t.status === 'completed').length / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* CORE BOARD SYSTEM METRIC LANES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {lanes.map((lane) => {
          const laneTasks = tasks.filter(t => t.status === lane.id);

          return (
            <div 
              key={lane.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, lane.id)}
              className={`border rounded-2xl p-4 flex flex-col min-h-[480px] transition-colors ${lane.bg} ${
                isDarkMode ? 'border-slate-800/80' : 'border-gray-100'
              }`}
            >
              {/* ============================================================================
                  FIXED COLUMN HEADER PANE WITH FLATICON IMAGE COMPATIBILITY
                  ============================================================================ */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100/10 px-1">
                <div className="flex items-center gap-2">
                  
                  {/* DYNAMIC CHECK: If the icon string is a web link, render an <img> tag. Else, render the inline text emoji */}
                  {lane.icon.startsWith('http') ? (
                    <img 
                      src={lane.icon} 
                      alt={`${lane.title} Icon`} 
                      className={`w-4 h-4 object-contain select-none ${
                        lane.isInvertible && isDarkMode ? 'invert opacity-90' : ''
                      }`} 
                    />
                  ) : (
                    <span className="text-sm select-none">{lane.icon}</span>
                  )}

                  <span className={`text-xs font-bold tracking-wide uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {lane.title}
                  </span>
                </div>
                
                <span className="text-[10px] font-mono font-bold bg-gray-500/10 px-2 py-0.5 rounded-full opacity-70">
                  {laneTasks.length}
                </span>
              </div>

              {/* TASK DROPDOWN MATRIX ITEMS */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {laneTasks.length === 0 ? (
                  <div className="text-center text-[11px] text-gray-400 py-10 border border-dashed border-gray-300/10 rounded-xl">// Lane entry clear</div>
                ) : (
                  laneTasks.map((task) => {
                    const isPersonalTask = !task.project_id;
                    const isCompleted = task.status === 'completed';
                    
                    return (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task.id)}
                        className={`p-4 border rounded-xl relative text-left transition-all group select-none shadow-2xs ${
                          isDarkMode ? 'bg-slate-800/80 border-slate-700/60 hover:border-slate-400' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* OWNER-ONLY PURGE SWITCH CONTROLLER LINK */}
                        {isOwner && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 text-[10px] invisible group-hover:visible cursor-pointer z-10"
                          >
                            ✕
                          </button>
                        )}

                        <div className={`text-xs font-semibold tracking-tight pr-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          {task.title}
                        </div>

                        {/* PERSONAL TASK COMPLETION CONTROL */}
                        <div className="mt-4 pt-2 border-t border-gray-100/10 flex flex-col gap-2 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-textMuted font-medium">
                              {isPersonalTask ? 'Personal task' : 'Project task'}
                            </span>
                            {isPersonalTask ? (
                              <label className="flex items-center gap-2 cursor-pointer rounded-full px-2 py-1 transition hover:bg-slate-700/40">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    onToggleComplete(task.id, e.target.checked);
                                  }}
                                  className="h-3.5 w-3.5 rounded border border-slate-600 bg-transparent accent-emerald-500"
                                />
                                <span className={`text-[10px] font-medium ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  {isCompleted ? 'Done' : 'Mark as done'}
                                </span>
                              </label>
                            ) : (
                              <span className="text-[10px] text-slate-500">Locked</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[9px] font-bold">
                            <span className="opacity-60 font-mono tracking-tight text-textMuted uppercase">
                               {task.estimated_minutes || 10} MIN
                            </span>
                            <span className={`px-2 py-0.5 rounded-md uppercase border tracking-wider font-mono ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
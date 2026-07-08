import React from 'react';

export default function TaskKanbanBoard({ 
  tasks, 
  projects, 
  teamMembers = [], 
  currentUserId, 
  activeProjectId,
  onAssignUser, 
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
    { id: 'to_do', title: '📋 To Do', bg: isDarkMode ? 'bg-slate-900/40' : 'bg-gray-50/50' },
    { id: 'in_progress', title: '⚡ In Progress', bg: isDarkMode ? 'bg-slate-900/40' : 'bg-gray-50/50' },
    { id: 'completed', title: '🎯 Completed', bg: isDarkMode ? 'bg-slate-900/40' : 'bg-gray-50/50' }
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
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100/10 px-1">
                <span className={`text-xs font-bold tracking-wide uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{lane.title}</span>
                <span className="text-[10px] font-mono font-bold bg-gray-500/10 px-2 py-0.5 rounded-full opacity-70">{laneTasks.length}</span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {laneTasks.length === 0 ? (
                  <div className="text-center text-[11px] text-gray-400 py-10 border border-dashed border-gray-300/10 rounded-xl">// Lane entry clear</div>
                ) : (
                  laneTasks.map((task) => {
                    const assignedUser = teamMembers.find(m => m.id === task.assignee_id);
                    
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

                        {/* ASSIGNMENT COMPONENT ACTION HUB INTERFACE ROW */}
                        <div className="mt-4 pt-2 border-t border-gray-100/10 flex flex-col gap-2 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="text-textMuted font-medium">Assignee:</span>
                            {isOwner ? (
                              /* OWNER ACCESS: Interactive management dropdown switch selector */
                              <select 
                                value={task.assignee_id || ""}
                                onChange={(e) => onAssignUser(task.id, e.target.value || null)}
                                className={`border rounded-md px-1.5 py-0.5 outline-none text-[9px] font-semibold max-w-[120px] ${
                                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200'
                                }`}
                              >
                                <option value="">Unassigned</option>
                                {teamMembers.map(member => (
                                  <option key={member.id} value={member.id}>{member.display_name}</option>
                                ))}
                              </select>
                            ) : (
                              /* COLLABORATOR ACCESS: Flat descriptive, un-clickable profile metric label text */
                              <span className="font-bold text-slate-300">
                                {assignedUser ? assignedUser.display_name : "Unassigned"}
                              </span>
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
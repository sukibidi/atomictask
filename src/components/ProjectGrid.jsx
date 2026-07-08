import React, { useState } from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectGrid({ 
  projects, tasks, attachments, currentUserId, isDarkMode, 
  onTriggerInvite, onEdit, onAddTask, onToggleTask, onDeleteTask, refreshData 
}) {
  const [layoutMode, setLayoutMode] = useState('grid'); // Options: grid, list

  return (
    <div className="space-y-4 w-full">
      
      {/* MINIMALIST LAYOUT VIEWER SWITCH CONTROLS */}
      <div className="flex justify-end gap-1.5 font-mono text-[10px]">
        <button 
          onClick={() => setLayoutMode('grid')} 
          className={`px-2.5 py-1 rounded-md font-bold uppercase transition-all cursor-pointer border ${
            layoutMode === 'grid' 
              ? (isDarkMode ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-slate-900 text-white border-slate-900') 
              : 'text-textMuted border-transparent'
          }`}
        >
          [ Grid View ]
        </button>
        <button 
          onClick={() => setLayoutMode('list')} 
          className={`px-2.5 py-1 rounded-md font-bold uppercase transition-all cursor-pointer border ${
            layoutMode === 'list' 
              ? (isDarkMode ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-slate-900 text-white border-slate-900') 
              : 'text-textMuted border-transparent'
          }`}
        >
          [ List View ]
        </button>
      </div>

      {/* CONDITIONAL COMPONENT DISPLAY MANAGER */}
      {layoutMode === 'grid' ? (
        /* STANDARD DOCK CONTAINER MATRIX BOXES */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              currentUserId={currentUserId}
              tasks={tasks.filter(t => t.project_id === project.id)}
              attachments={attachments.filter(a => a.project_id === project.id)}
              isDarkMode={isDarkMode}
              onTriggerInvite={onTriggerInvite}
              onEdit={onEdit}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              refreshData={refreshData}
            />
          ))}
        </div>
      ) : (
        /* PREMIUM MINIMALIST TABLE DATA LIST SPREADSHEET MODE */
        <div className={`border rounded-2xl overflow-hidden text-xs text-left ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className={`border-b font-mono text-[10px] uppercase font-bold text-textMuted ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50/60 border-gray-100'
                }`}>
                  <th className="p-4 text-left">Vault Directory Token</th>
                  <th className="p-4 text-left">Roadmap Bounds</th>
                  <th className="p-4 text-left">Assets</th>
                  <th className="p-4 text-left">Progress</th>
                  <th className="p-4 text-right">Actions Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center font-mono text-gray-400">// Workspace index log clear</td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const pTasks = tasks.filter(t => t.project_id === project.id);
                    const pFiles = attachments.filter(a => a.project_id === project.id);
                    const percent = pTasks.length > 0 ? Math.round((pTasks.filter(t => t.status === 'completed').length / pTasks.length) * 100) : 0;
                    
                    return (
                      <React.Fragment key={project.id}>
                        <tr className="hover:bg-gray-500/5 transition-colors group">
                          <td className="p-4 font-bold max-w-xs truncate">
                            <span className="mr-2">📁</span>{project.title}
                          </td>
                          <td className="p-4 font-mono text-[10px] text-slate-400">
                            {project.start_date || "Open"} $\rightarrow$ {project.end_date || "Open"}
                          </td>
                          <td className="p-4 font-semibold text-slate-500">
                            📎 {pFiles.length} files
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <div className="w-full h-1 bg-gray-100 dark:bg-slate-950 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-400 dark:bg-white transition-all" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="font-mono text-[9px] font-bold">{percent}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-right space-x-2 font-mono text-[10px]" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => onEdit(project)} className="text-gray-400 hover:text-blue-500 cursor-pointer">[EDIT]</button>
                            {project.owner_id === currentUserId && (
                              <button onClick={() => onTriggerInvite(project.id)} className="text-gray-400 hover:text-emerald-500 cursor-pointer">[INVITE]</button>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
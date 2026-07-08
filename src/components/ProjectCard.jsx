import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function ProjectCard({ 
  project, 
  tasks, 
  attachments, 
  currentUserId, 
  isDarkMode, 
  onTriggerInvite, 
  onEdit, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask, 
  refreshData 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // --- SUB-TASK INLINE STATE INPUTS ---
  const [taskTitle, setTaskTitle] = useState("");
  const [isMilestone, setIsMilestone] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const isOwner = project.owner_id === currentUserId;
  const completionPercentage = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
    : 0;

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await onAddTask(project.id, taskTitle, isMilestone, dueDate, priority);
    setTaskTitle(""); setIsMilestone(false); setDueDate(""); setPriority("medium");
  };

  const handleInlineFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const uniqueFileName = `${project.id}/${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('project-assets').upload(uniqueFileName, file, { cacheControl: '3600', upsert: true });
      await supabase.from('attachments').insert([{ project_id: project.id, file_name: file.name, storage_path: uniqueFileName, file_size: file.size, file_mime: file.type }]);
      refreshData();
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  // HANDLES DIRECT PROJECT PURGING FROM THE CARD LEVEL
  const handleProjectDelete = async (e) => {
    e.stopPropagation(); // Prevents card clicking conflict loops
    if (!window.confirm(`Purge project vault [${project.title}] and all nested documents permanently?`)) return;
    
    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      refreshData(); // Triggers parent matrix state reload
    } catch (err) {
      alert(`Deletion Failed: ${err.message}`);
    }
  };

  return (
    <div className="border rounded-2xl p-5 relative flex flex-col justify-between text-left shadow-2xs transition-all group bg-white border-gray-100 hover:border-gray-200 dark:bg-slate-900 dark:border-slate-800/80 dark:hover:border-slate-700">
      
      {/* FIXED AND SECURED MANAGEMENT CONTROL PANEL (Visually pinned to the upper right) */}
      {isOwner && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20 font-mono text-[10px]">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(project); }} 
            className="text-gray-400 hover:text-blue-500 cursor-pointer transition-colors"
          >
            [ EDIT ]
          </button>
          <button 
            type="button"
            onClick={handleProjectDelete} 
            className="text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"
          >
            [ PURGE ]
          </button>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-xl block">📁</span>
        <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white pr-20">{project.title}</h3>
        <p className="text-[11px] text-textMuted line-clamp-2 min-h-[32px]">{project.description}</p>
        
        {(project.start_date || project.end_date) && (
          <div className="pt-1 flex items-center text-[9px] font-mono font-bold tracking-tight text-slate-400 uppercase">
            <span className="mr-1">⏱️ Scope:</span> 
            <span>{project.start_date || "Open"} → {project.end_date || "Open"}</span>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3 pt-4 border-t border-gray-100/10">
        <div className="flex justify-between items-center text-[10px] font-bold font-mono text-textMuted">
          <span>PROGRESS ENGINE</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-slate-950">
          <div className="h-full bg-slate-400 dark:bg-white transition-all duration-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
        </div>

        <div className="pt-1 flex gap-2 justify-between items-center">
          <button onClick={() => setIsExpanded(!isExpanded)} className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase cursor-pointer ${isExpanded ? 'text-orange-400 bg-orange-500/5 border-orange-500/20' : 'text-textMuted'}`}>
            {isExpanded ? "✕ Close Workspace" : `📂 View Workspace (${tasks.length})`}
          </button>
          {isOwner && (
            <button onClick={() => onTriggerInvite(project.id)} className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase border bg-white border-gray-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">[ Invite ]</button>
          )}
        </div>
      </div>

      {/* EXPANDED INTERFACE ACTIONS AREA */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100/10 space-y-4">
          
          {/* TASK & MILESTONE APPREND FORM */}
          <form onSubmit={handleTaskSubmit} className="space-y-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
            <span className="text-[9px] font-bold uppercase font-mono text-textMuted block">Append Task / SMART Milestone</span>
            <input required type="text" placeholder="Task text description..." value={taskTitle} onChange={(e)=>setTaskTitle(e.target.value)} className="w-full border p-2 rounded-lg text-[11px] outline-none bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-950 dark:text-white" />
            
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} className="border p-1 rounded-lg text-[10px] outline-none dark:bg-slate-900 dark:border-slate-800 font-mono text-slate-950 dark:text-white" />
              <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="border p-1 rounded-lg text-[10px] outline-none dark:bg-slate-900 dark:border-slate-800 font-mono text-slate-950 dark:text-white">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input type="checkbox" checked={isMilestone} onChange={(e)=>setIsMilestone(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>♦ Mark as SMART Milestone</span>
              </label>
              <button type="submit" className="px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950">Add</button>
            </div>
          </form>

          {/* ACTIVE ASSIGNED TASKS MATRIX */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 text-[11px]">
            {tasks.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-gray-400 font-mono">// Task matrix empty</div>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className={`p-2 border rounded-xl flex justify-between items-center ${t.status === 'completed' ? 'opacity-60 bg-emerald-500/5 border-emerald-500/10' : 'bg-white dark:bg-slate-950/40 border-gray-100 dark:border-slate-800/60'}`}>
                  <div className="flex items-center gap-2 truncate pr-2">
                    <input type="checkbox" checked={t.status === 'completed'} onChange={() => onToggleTask(t.id, t.status)} className="cursor-pointer rounded border-gray-300" />
                    <span className="text-xs">{t.is_milestone ? "♦" : "🔹"}</span>
                    <span className={`truncate font-semibold ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {t.title}
                    </span>
                  </div>
                  <button type="button" onClick={() => onDeleteTask(t.id)} className="text-gray-400 hover:text-rose-500 font-bold px-1 cursor-pointer">✕</button>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function ProjectCard({ 
  project, tasks, attachments, currentUserId, isDarkMode, teamMembers = [],
  onTriggerInvite, onEdit, onAddTask, onToggleTask, onDeleteTask, onDeleteProject, onRefresh
}) {
  // View Windows and Upload States
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeViewUrl, setActiveViewUrl] = useState(null);
  const [viewingFileName, setViewingFileName] = useState("");
  const [toast, setToast] = useState(null);
  
  // Form Values (Right Panel Inputs)
  const [inviteEmail, setInviteEmail] = useState("");
  const [editTitle, setEditTitle] = useState(project.title);
  const [editDescription, setEditDescription] = useState(project.description || "");

  // Custom Targeted Task Inputs
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskEndDate, setTaskEndDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const isOwner = project.owner_id === currentUserId;
  const completionPercentage = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
    : 0;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleUpdateProjectDetails = async (e) => {
    e?.preventDefault();
    if (!editTitle.trim()) return;
    try {
      const { error } = await supabase
        .from('projects')
        .update({ title: editTitle.trim(), description: editDescription.trim() })
        .eq('id', project.id);
      if (error) throw error;
      setIsWorkspaceOpen(false);
      showToast("Project details updated");
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    
    // Sends the task title, member assignment, and calendar ranges to parent function
    await onAddTask(project.id, taskTitle, false, taskEndDate, priority, taskAssignee, taskStartDate);
    setTaskTitle(""); setTaskAssignee(""); setTaskStartDate(""); setTaskEndDate(""); setPriority("medium");
  };

  const handleInlineFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const uniqueFileName = `${project.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('project-assets').upload(uniqueFileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('attachments').insert([{ project_id: project.id, file_name: file.name, storage_path: uniqueFileName, file_size: file.size, file_mime: file.type, user_id: currentUserId }]);
      if (insertError) throw insertError;

      // Don't wait on the realtime subscription — refresh state immediately
      await onRefresh?.();
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleViewFile = async (file) => {
    try {
      setViewingFileName(file.file_name);
      const { data, error } = await supabase.storage
        .from('project-assets')
        .createSignedUrl(file.storage_path, 300); // 5 min expiry
      if (error) throw error;

      const viewableMimes = ['image/png','image/jpeg','image/jpg','image/gif','image/webp','application/pdf'];
      
      if (viewableMimes.includes(file.file_mime)) {
        // Open directly in new tab — bypasses iframe CSP block
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        // For Word docs, zips, etc — just trigger download instead
        setActiveViewUrl(data.signedUrl);
      }
    } catch (err) {
      alert(`File access failed: ${err.message}`);
    }
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(`Delete "${project.title}"? This will permanently remove all its tasks, files, and member invites. This cannot be undone.`);
    if (!confirmed) return;
    await onDeleteProject(project.id);
    setIsWorkspaceOpen(false);
  };

  const handleDeleteFile = async (file) => {
    const confirmed = window.confirm(`Delete "${file.file_name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await supabase.storage.from('project-assets').remove([file.storage_path]);
      const { error } = await supabase.from('attachments').delete().eq('id', file.id);
      if (error) throw error;
      await onRefresh?.();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const getUploaderName = (uploaderId) => {
    if (!uploaderId) return "Unknown";
    if (uploaderId === currentUserId) return "You";
    return teamMembers.find((m) => m.id === uploaderId)?.display_name || "Unknown";
  };

  const handleDownloadFile = async (file) => {
    try {
      const { data, error } = await supabase.storage.from('project-assets').download(file.storage_path);
      if (error) throw error;
      
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Download Refused: ${err.message}`);
    }
  };

  return (
    <div className={`border rounded-2xl p-5 relative flex flex-col justify-between text-left shadow-2xs transition-all group ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700' : 'bg-white border-gray-100 text-slate-900 hover:border-gray-200'
    }`}>

      {/* MINIMALIST TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-xl border text-xs font-semibold shadow-lg animate-fadeIn ${
          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {toast}
        </div>
      )}
      
      {/* CARD CONTENT HEADER */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => setIsWorkspaceOpen(true)}
          className="p-2 -ml-2 rounded-xl border border-transparent hover:border-gray-100/10 dark:hover:bg-slate-950/40 cursor-pointer transition-all active:scale-95 flex items-center justify-center w-10 h-10 group/icon"
        >
          <img src="https://cdn-icons-png.flaticon.com/128/1383/1383970.png" alt="Workspace Logo" className={`w-6 h-6 object-contain ${isDarkMode ? 'invert opacity-90' : ''}`} />
        </button>

        <h3 onClick={() => setIsWorkspaceOpen(true)} className="text-sm font-bold truncate cursor-pointer hover:underline pr-4">{project.title}</h3>
        <p className="text-[11px] text-textMuted line-clamp-2 min-h-[32px]">{project.description}</p>
      </div>

      {/* CARD RUNTIME STATS FOOTER */}
      <div className="mt-4 space-y-3 pt-3 border-t border-gray-100/10 dark:border-slate-800/60">
        <div className="flex justify-between items-center text-[9px] font-bold font-mono text-textMuted">
          <span>COMPLETION PROGRESS</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>
          <div className={`h-full transition-all duration-500 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-slate-900'}`} style={{ width: `${completionPercentage}%` }} />
        </div>

        <button 
          type="button"
          onClick={() => setIsWorkspaceOpen(true)} 
          className={`w-full py-2 rounded-xl border text-[10px] font-bold uppercase cursor-pointer text-center transition-colors ${
            isDarkMode ? 'text-slate-300 bg-slate-950/60 border-slate-800 hover:bg-slate-800' : 'text-slate-700 bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
        >
           Open Workspace Popup ({tasks.length})
        </button>
      </div>

      {/* ============================================================================
          FIXED: CENTERED SCREEN POPUP FOR INNER WORKSPACE LAYOUT
          ============================================================================ */}
      {isWorkspaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          
          <div className={`w-full max-w-5xl h-[85vh] rounded-3xl border shadow-2xl flex overflow-hidden relative text-left ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'
          }`}>

            {/* MAIN WORKSPACE CONTENT GRID (LEFT WINDOW SIDE) */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">Project Workspace Workspace</span>
                  <h2 className="text-xl font-black tracking-tight mt-0.5">{project.title}</h2>
                  <p className="text-xs text-textMuted mt-1 max-w-xl">{project.description}</p>
                </div>
              </div>

              {/* ATTACHMENT AND REPOSITORY MANAGER BOX */}
              <div className={`p-4 border rounded-2xl space-y-3 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-[10px] font-bold uppercase font-mono text-textMuted block">Shared Files & Documents</span>
                <div className="flex items-center justify-between gap-2">
                  <input type="file" onChange={handleInlineFileUpload} disabled={isUploading} className="text-[11px] text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 cursor-pointer" />
                  {isUploading && <span className="font-mono text-[9px] text-amber-500 animate-pulse">Uploading asset...</span>}
                </div>
                
                <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto">
                  {attachments.length === 0 ? (
                    <div className="text-[10px] text-slate-400 py-1">No uploaded project files available inside this workspace.</div>
                  ) : (
                    attachments.map(file => {
                      const canDeleteFile = isOwner || file.user_id === currentUserId;
                      return (
                        <div key={file.id} className={`text-[10px] font-mono flex flex-col gap-1 p-2 rounded-xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-white border-gray-100 text-slate-700'}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate pr-4">📎 {file.file_name}</span>
                            <div className="flex items-center gap-3 font-bold whitespace-nowrap">
                              <button type="button" onClick={() => handleViewFile(file)} className="text-blue-500 hover:underline cursor-pointer uppercase">[ View ]</button>
                              <button type="button" onClick={() => handleDownloadFile(file)} className="text-emerald-500 hover:underline cursor-pointer uppercase">[ Download ]</button>
                              {canDeleteFile && (
                                <button type="button" onClick={() => handleDeleteFile(file)} className="text-rose-500 hover:underline cursor-pointer uppercase">[ Delete ]</button>
                              )}
                            </div>
                          </div>
                          <span className="text-[9px] font-normal normal-case opacity-60">
                            Uploaded by {getUploaderName(file.user_id)}{file.created_at ? ` · ${new Date(file.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CORE TEAM CHECKLIST ROW */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase font-mono text-textMuted block">Active Tasks Ledger</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {tasks.length === 0 ? (
                    <div className="text-[11px] text-slate-400 py-3">No active tasks assigned to this workspace card.</div>
                  ) : (
                    tasks.map((t) => (
                      <div key={t.id} className={`p-2.5 border rounded-xl flex justify-between items-center ${t.status === 'completed' ? 'opacity-40 bg-emerald-500/5 border-emerald-500/10' : (isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-100')}`}>
                        <div className="flex items-center gap-2 truncate pr-2">
                          <input type="checkbox" checked={t.status === 'completed'} onChange={() => onToggleTask(t.id, t.status)} className="rounded cursor-pointer" />
                          <span className={`truncate text-xs font-semibold ${t.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{t.title}</span>
                        </div>
                        <button type="button" onClick={() => onDeleteTask(t.id)} className="text-gray-400 hover:text-rose-500 font-bold px-2 cursor-pointer">✕</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* CONTROLS SLIDING DRAWER (RIGHT PANEL SIDE) */}
            <div className={`w-80 h-full p-5 border-l flex flex-col justify-between overflow-y-auto shrink-0 animate-slideInRight ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100/10 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-orange-400 tracking-wider">Management Options</span>
                  <button type="button" onClick={() => setIsWorkspaceOpen(false)} className="text-[10px] font-mono font-bold text-rose-500 uppercase hover:underline">✕ Close</button>
                </div>

                {/* FORM 1: RE-NAME OR CHANGE DESCRIPTION METRICS */}
                {isOwner && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Edit Project Details</span>
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={`w-full text-xs p-2 rounded-lg border outline-none font-bold ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'}`} />
                    <textarea rows="2" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={`w-full text-xs p-2 rounded-lg border outline-none resize-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'}`} />
                  </div>
                )}

                {/* FORM 2: INVITATION PANEL HUB */}
                {isOwner && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-100/10 dark:border-slate-800/60">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Invite Teammate</span>
                    <div className="flex gap-1.5">
                      <input type="email" placeholder="Enter user email..." value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className={`flex-1 text-xs p-2 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'}`} />
                      <button type="button" onClick={async () => { await onTriggerInvite(project.id, inviteEmail); setInviteEmail(""); }} className="px-2.5 py-1.5 bg-emerald-600 text-white text-[9px] font-bold uppercase rounded-lg hover:bg-emerald-700 cursor-pointer">Invite</button>
                    </div>
                  </div>
                )}

                {/* FORM 3: TIMELINE AND MEMBER TARGETED TASK CREATION TRACK */}
                <form onSubmit={handleTaskSubmit} className="space-y-2.5 pt-3 border-t border-gray-100/10 dark:border-slate-800/60">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Assign Member Task</span>
                  
                  <input required type="text" placeholder="Task description name..." value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className={`w-full text-xs p-2 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'}`} />

                  <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className={`w-full text-xs p-2 rounded-lg border outline-none font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
                    <option value="">Unassigned Account</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.display_name}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Start Date</label>
                      <input type="date" value={taskStartDate} onChange={(e) => setTaskStartDate(e.target.value)} className={`w-full text-[10px] p-1 rounded-lg border outline-none font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'}`} />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase">End Deadline</label>
                      <input type="date" value={taskEndDate} onChange={(e) => setTaskEndDate(e.target.value)} className={`w-full text-[10px] p-1 rounded-lg border outline-none font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'}`} />
                    </div>
                  </div>

                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`w-full text-xs p-2 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'}`}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  <button type="submit" className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase rounded-lg hover:opacity-90 transition-all cursor-pointer">+ Add Member Task</button>
                </form>

                {/* PROJECT-LEVEL ACTIONS: SAVE CHANGES + DANGER ZONE */}
                {isOwner && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-rose-500/20">
                    <button
                      type="button"
                      onClick={handleUpdateProjectDetails}
                      className={`w-full py-2 rounded-lg text-[9px] font-bold uppercase border cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-gray-200 hover:bg-gray-100'}`}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteProject}
                      className="w-full py-2 rounded-lg text-[9px] font-bold uppercase border border-rose-500/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    >
                      🗑 Delete Project
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center font-mono text-[8px] text-slate-400 mt-4 opacity-50">
                Workspace Code ID: {project.id}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeViewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className={`w-full max-w-sm rounded-2xl flex flex-col overflow-hidden border shadow-2xl p-6 space-y-4 text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-slate-900'
          }`}>
            <span className="text-2xl">📄</span>
            <p className="text-sm font-bold">{viewingFileName}</p>
            <p className="text-xs text-slate-400">This file type cannot be previewed directly. Download it to open.</p>
            <div className="flex gap-3 justify-center">
              <a
                href={activeViewUrl}
                download={viewingFileName}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
              >
                Download File
              </a>
              <button
                type="button"
                onClick={() => { setActiveViewUrl(null); setViewingFileName(""); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
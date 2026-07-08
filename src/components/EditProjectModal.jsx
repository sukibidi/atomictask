import React, { useState, useEffect } from 'react';

export default function EditProjectModal({ project, onClose, onUpdate, isDarkMode }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Keep state parameters in sync whenever target properties change
  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(project.id, title.trim(), description);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
      <div className={`w-full max-w-sm border rounded-2xl p-5 text-xs text-left shadow-2xl ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100'
      }`}>
        <div className="flex justify-between items-center border-b border-gray-100/10 pb-3 mb-4">
          <h4 className="font-bold text-sm">⚙️ Adjust Project Base Scope</h4>
          <button type="button" onClick={onClose} className="text-gray-400 font-bold cursor-pointer hover:text-rose-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textMuted uppercase">Project Name</label>
            <input 
              required 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={`border p-2.5 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50'}`} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textMuted uppercase">Description</label>
            <textarea 
              rows="3" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className={`border p-2.5 rounded-xl outline-none resize-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50'}`} 
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 font-semibold cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
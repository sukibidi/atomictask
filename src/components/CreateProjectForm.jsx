import React, { useState } from 'react';

export default function CreateProjectForm({ onCreate, isDarkMode }) {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStartDate, setProjectStartDate] = useState("");
  const [projectEndDate, setProjectEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    onCreate({
      title: projectTitle.trim(),
      description: projectDescription,
      start_date: projectStartDate,
      end_date: projectEndDate
    });

    // Reset local inputs cleanly
    setProjectTitle("");
    setProjectDescription("");
    setProjectStartDate("");
    setProjectEndDate("");
  };

  return (
    <div className={`border rounded-2xl p-5 shadow-2xs transition-colors text-left ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
    }`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-3">Launch Strategic Project Node</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input 
            required 
            type="text" 
            placeholder="Project Title" 
            value={projectTitle} 
            onChange={(e) => setProjectTitle(e.target.value)} 
            className={`border rounded-xl px-4 py-2.5 outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-gray-50/50 border-gray-200'}`} 
          />
          <input 
            type="text" 
            placeholder="Scope description outline..." 
            value={projectDescription} 
            onChange={(e) => setProjectDescription(e.target.value)} 
            className={`border rounded-xl px-4 py-2.5 outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-gray-50/50 border-gray-200'}`} 
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase text-textMuted">Target Start</label>
              <input 
                type="date" 
                value={projectStartDate} 
                onChange={(e) => setProjectStartDate(e.target.value)} 
                className={`border p-1.5 rounded-lg outline-none font-mono text-[11px] h-8 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-gray-300'}`} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase text-textMuted">Target End</label>
              <input 
                type="date" 
                value={projectEndDate} 
                onChange={(e) => setProjectEndDate(e.target.value)} 
                className={`border p-1.5 rounded-lg outline-none font-mono text-[11px] h-8 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-gray-300'}`} 
              />
            </div>
          </div>
          <button type="submit" className={`px-6 h-9 font-bold rounded-xl text-[11px] uppercase tracking-wide cursor-pointer ${isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white'}`}>
            Deploy Vault
          </button>
        </div>
      </form>
    </div>
  );
}
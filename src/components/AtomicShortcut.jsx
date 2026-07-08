import React from 'react';

export default function AtomicShortcut({ inputType, setInputType, titleInput, setTitleInput, priorityInput, setPriorityInput, selectedProjectId, setSelectedProjectId, projects, handleDeployShortcut, isDarkMode }) {
  return (
    <div className={`border rounded-2xl p-5 shadow-sm space-y-4 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100'}`}>
      <div className="flex justify-between items-center border-b border-gray-50/10 pb-3">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-1.5">⚡ Atomic Input Shortcut</h3>
          <p className="text-xs text-textMuted">Deploy items straight to their target data nodes instantly.</p>
        </div>
        <div className={`flex gap-1.5 p-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100/80'}`}>
          <button type="button" onClick={() => setInputType("project")} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer ${inputType === 'project' ? (isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-blue-600') : 'text-textMuted'}`}>📋 Task</button>
          <button type="button" onClick={() => setInputType("todo")} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer ${inputType === 'todo' ? (isDarkMode ? 'bg-slate-700 text-orange-400' : 'bg-white text-orange-600') : 'text-textMuted'}`}>⚡ Todo</button>
        </div>
      </div>
      <form onSubmit={handleDeployShortcut} className="flex flex-col md:flex-row gap-2">
        <input type="text" required value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder={inputType === 'project' ? "Enter project task..." : "Enter daily todo..."} className={`flex-1 border rounded-xl px-4 py-2.5 text-xs outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-gray-50/50 border-gray-200 text-textMain focus:border-blue-500'}`} />
        {inputType === "project" && (
          <>
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className={`border rounded-xl px-3 py-2 text-xs outline-none font-medium max-w-[180px] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`}>
              {projects.map(p => <option key={p.id} value={p.id} className={isDarkMode ? 'bg-slate-900' : ''}>📁 {p.title}</option>)}
            </select>
            <select value={priorityInput} onChange={(e) => setPriorityInput(e.target.value)} className={`border rounded-xl px-3 py-2 text-xs outline-none font-medium ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`}>
              <option value="high" className={isDarkMode ? 'bg-slate-900' : ''}>🔴 High</option>
              <option value="medium" className={isDarkMode ? 'bg-slate-900' : ''}>🟡 Medium</option>
              <option value="low" className={isDarkMode ? 'bg-slate-900' : ''}>🟢 Low</option>
            </select>
          </>
        )}
        <button type="submit" className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer ${inputType === 'project' ? 'bg-blue-600' : 'bg-orange-500'}`}>Deploy</button>
      </form>
    </div>
  );
}
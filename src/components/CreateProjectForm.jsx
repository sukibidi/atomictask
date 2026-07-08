import React, { useState } from 'react';

export default function CreateProjectForm({ onCreate, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Package form parameters safely to pass upstream to your main project view
    onCreate({ 
      title: title.trim(), 
      description: description.trim(), 
      start_date: startDate || null, 
      end_date: endDate || null,
      invited_email: inviteEmail.trim().toLowerCase() || null
    });
    
    // Cleanly clear out text form entry fields
    setTitle(''); 
    setDescription(''); 
    setStartDate(''); 
    setEndDate('');
    setInviteEmail('');
    setIsOpen(false);
  };

  return (
    <div className={`w-full border rounded-2xl transition-all text-left overflow-hidden ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-3xs'
    }`}>
      
      {/* EXPANDABLE TRIGGER ROW BAR */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`px-4 py-3.5 sm:px-5 sm:py-4 flex justify-between items-center cursor-pointer select-none transition-colors ${
          isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50'
        }`}
      >
        <div>
          <h3 className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            [+] Create New Project
          </h3>
          <p className="text-[10px] text-textMuted mt-0.5">
            Initialize a new shared workspace directory within your index profile.
          </p>
        </div>
        <span className={`text-[10px] font-mono font-bold transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-orange-400' : 'text-slate-400'
        }`}>
          {isOpen ? '▲ CLOSE' : '▼ OPEN FORM'}
        </span>
      </div>

      {/* FORM CORE CONTAINER COLLAPSIBLE PANEL */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 border-t border-gray-100/10 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* PROJECT NAME INPUT */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-1">
              <label className="text-[9px] font-bold uppercase font-mono text-textMuted">Project Title *</label>
              <input 
                required 
                type="text" 
                placeholder="e.g., Brand Merchandise Marketplace" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className={`w-full text-xs p-2.5 rounded-xl border outline-none font-semibold ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-slate-700' : 'bg-white border-gray-200 text-slate-900 focus:border-gray-300'
                }`} 
              />
            </div>

            {/* DESCRIPTION FIELD BOX */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-1">
              <label className="text-[9px] font-bold uppercase font-mono text-textMuted">Project Description</label>
              <textarea 
                placeholder="Briefly map parameters, core milestones, or system deliverables..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows="2" 
                className={`w-full text-xs p-2.5 rounded-xl border outline-none resize-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-slate-700' : 'bg-white border-gray-200 text-slate-900 focus:border-gray-300'
                }`} 
              />
            </div>

            {/* CALENDAR INPUT FIELD: TRACK START DATE */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase font-mono text-textMuted">📅 Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className={`w-full text-xs p-2.5 rounded-xl border outline-none font-mono cursor-pointer font-bold ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white color-scheme-dark' : 'bg-white border-gray-200 text-slate-900'
                }`} 
              />
            </div>

            {/* CALENDAR INPUT FIELD: TRACK END DEADLINE */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase font-mono text-textMuted">⌛ End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className={`w-full text-xs p-2.5 rounded-xl border outline-none font-mono cursor-pointer font-bold ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white color-scheme-dark' : 'bg-white border-gray-200 text-slate-900'
                }`} 
              />
            </div>

            {/* INLINE MEMBER EMAIL INVITATION INPUT */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <label className="text-[9px] font-bold uppercase font-mono text-textMuted">✉ Add Member (Optional)</label>
              <input 
                type="email" 
                placeholder="Teammate's registration email..." 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
                className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-slate-700' : 'bg-white border-gray-200 text-slate-900 focus:border-gray-300'
                }`} 
              />
            </div>

            {/* DISPATCH CREATE ACTION TRIGGER BUTTON */}
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button 
                type="submit" 
                className={`w-full py-2.5 rounded-xl text-xs font-black uppercase font-mono cursor-pointer transition-all active:scale-[0.98] shadow-2xs ${
                  isDarkMode ? 'bg-white text-slate-950 hover:bg-gray-100' : 'bg-slate-950 text-white hover:bg-slate-800'
                }`}
              >
                Create Project
              </button>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}
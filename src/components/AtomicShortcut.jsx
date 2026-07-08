import React from 'react';

export default function AtomicShortcut({
  inputType, setInputType, titleInput, setTitleInput,
  priorityInput, setPriorityInput, selectedProjectId, setSelectedProjectId,
  projects, handleDeployShortcut, isDarkMode
}) {
  return (
    <form onSubmit={handleDeployShortcut} className={`p-4 rounded-2xl border text-left transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-2xs'
    }`}>
      
      {/* HEADER CONTROL BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <span className="text-[10px] font-bold uppercase font-mono text-textMutedTracking tracking-wider">
          // already finished? Input your new task here!
        </span>
        
        {/* INTERACTIVE NAVIGATION BUTTON TRACK */}
        <div className={`flex gap-1 p-1 rounded-xl border w-full sm:w-auto justify-center ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-200'
        }`}>
          
          {/* PROJECT TASK TOGGLE */}
          <button 
            type="button" 
            onClick={() => setInputType('project')} 
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              inputType === 'project' 
                ? (isDarkMode ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-white text-slate-900 shadow-xs border-transparent') 
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            {/* Flaticon image icon integration with theme color inverted filtering */}
            <img 
              src="https://cdn-icons-png.flaticon.com/128/4337/4337311.png" 
              alt="Task Icon" 
              className={`w-3.5 h-3.5 transition-all object-contain ${isDarkMode ? 'invert opacity-90' : ''}`} 
            />
            <span>Project Task</span>
          </button>
          
          {/* PERSONAL TODO TOGGLE */}
          <button 
            type="button" 
            onClick={() => setInputType('todo')} 
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              inputType === 'todo' 
                ? (isDarkMode ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-white text-slate-900 shadow-xs border-transparent') 
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <img 
              src="https://cdn-icons-png.flaticon.com/128/839/839860.png" 
              alt="Todo Icon" 
              className={`w-3.5 h-3.5 transition-all object-contain ${isDarkMode ? 'invert opacity-90' : ''}`} 
            />
            <span>Personal Todo</span>
          </button>
        </div>
      </div>

      {/* INPUT FIELDS PLATFORM - Mobile-first grid stacks layout items cleanly */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center sm:items-stretch">
        
        {/* TEXT INPUT FIELD */}
        <input 
          required 
          type="text" 
          placeholder={inputType === 'project' ? "Input project task ..." : "Enter your task ..."}
          value={titleInput} 
          onChange={(e) => setTitleInput(e.target.value)}
          className={`w-full text-xs p-2.5 rounded-xl border outline-none font-medium transition-colors ${
            inputType === 'project' ? 'sm:col-span-4' : 'sm:col-span-10'
          } ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-slate-700' : 'bg-white border-gray-200 text-slate-900 focus:border-gray-300'}`} 
        />

        {inputType === 'project' && (
          <>
            {/* PROJECT SELECTION LIST Dropdown */}
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border outline-none font-mono transition-colors sm:col-span-3 cursor-pointer appearance-none bg-no-repeat ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800 text-slate-200 focus:border-emerald-400/40' : 'bg-white border-gray-200 text-slate-900 focus:border-slate-300'
              }`}
              style={{
                backgroundImage: isDarkMode ? "linear-gradient(45deg, transparent 50%, #34d399 50%), linear-gradient(135deg, #34d399 50%, transparent 50%)" : "linear-gradient(45deg, transparent 50%, #0f172a 50%), linear-gradient(135deg, #0f172a 50%, transparent 50%)",
                backgroundPosition: 'calc(100% - 14px) calc(50% - 2px), calc(100% - 9px) calc(50% - 2px)',
                backgroundSize: '5px 5px, 5px 5px',
                backgroundRepeat: 'no-repeat',
                paddingRight: '2.2rem'
              }}
            >
              {projects.length === 0 ? (
                <option value="">-- No Vaults Found --</option>
              ) : (
                projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)
              )}
            </select>

            {/* PRIORITY SPECIFICATION Dropdown */}
            <select 
              value={priorityInput} 
              onChange={(e) => setPriorityInput(e.target.value)}
              className={`w-full text-xs p-2.5 rounded-xl border outline-none font-mono transition-colors sm:col-span-2 cursor-pointer appearance-none bg-no-repeat ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800 text-slate-200 focus:border-emerald-400/40' : 'bg-white border-gray-200 text-slate-900 focus:border-slate-300'
              }`}
              style={{
                backgroundImage: isDarkMode ? "linear-gradient(45deg, transparent 50%, #34d399 50%), linear-gradient(135deg, #34d399 50%, transparent 50%)" : "linear-gradient(45deg, transparent 50%, #0f172a 50%), linear-gradient(135deg, #0f172a 50%, transparent 50%)",
                backgroundPosition: 'calc(100% - 14px) calc(50% - 2px), calc(100% - 9px) calc(50% - 2px)',
                backgroundSize: '5px 5px, 5px 5px',
                backgroundRepeat: 'no-repeat',
                paddingRight: '2.2rem'
              }}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Mid Priority</option>
              <option value="high">High Priority</option>
            </select>
          </>
        )}

        {/* SUBMIT ACTION TRIGGER BUTTON */}
        <button 
          type="submit" 
          className={`w-full sm:col-span-2 min-w-[92px] py-2.5 rounded-xl text-[10px] font-bold uppercase font-mono cursor-pointer transition-all active:scale-[0.98] text-center flex items-center justify-center gap-1.5 border ${
            isDarkMode ? 'bg-slate-950/70 text-emerald-400 border-slate-800 hover:bg-slate-800/80' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
          }`}
        >
          <span className="text-sm leading-none">＋</span>
          <span>Send</span>
        </button>
      </div>
    </form>
  );
}
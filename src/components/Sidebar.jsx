import React from 'react';

export default function Sidebar({ currentTab, setCurrentTab, onLogout, isDarkMode, setIsDarkMode }) {
  const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Daily Tasks' },
  { id: 'projects', label: 'Project Hub' },
  { id: 'partners', label: 'Friends Hub' },
  { id: 'profile', label: 'Profile Settings' }, // Added target profile row entry here
];

  return (
    <div className={`w-64 h-screen p-6 flex flex-col justify-between border-r select-none transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'
    }`}>
      
      <div className="space-y-8">
        {/* MINIMALIST TRIANGLE LOGO LAYER */}
        <div className="flex items-center gap-3 px-1 pt-2">
          <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 2,22 22,22" />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-widest leading-none">ATOMIC</span>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-1 leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Habit Forge
            </span>
          </div>
        </div>

        {/* CLEAN PLATFORM NAVIGATION RAIL */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                  isActive
                    ? (isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-900 border-transparent text-white')
                    : (isDarkMode ? 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-50')
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM CONTROL DECK */}
      <div className="space-y-1.5 border-t border-gray-100/10 pt-4">
        
        {/* INTERFACE CONTRAST TOGGLE */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
            isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white' : 'bg-gray-50 border-gray-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Interface Mode</span>
          <span className="text-[9px] opacity-60 font-mono">{isDarkMode ? 'DARK' : 'LIGHT'}</span>
        </button>

        {/* SIGN OUT ROUTINE */}
        <button
          type="button"
          onClick={onLogout}
          className={`w-full px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all text-left cursor-pointer ${
            isDarkMode 
              ? 'bg-transparent border-transparent text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400' 
              : 'bg-transparent border-transparent text-slate-600 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          Sign Out Session
        </button>

      </div>

    </div>
  );
}
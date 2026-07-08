import React from 'react';
import AuthCard from '../components/AuthCard';

export default function Login({ onAuthSuccess, isDarkMode }) {
  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-textMain'
    }`}>
      
      {/* LEFT SPLIT PANEL: PREMIUM BRAND LANDING */}
      <div className={`w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r ${
        isDarkMode ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-gray-100'
      }`}>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* ALIGNED ADAPTIVE TRIANGLE LOGO */}
        <div className="flex items-center gap-3 relative z-10 select-none">
          <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 2,22 22,22" />
          </svg>
          <div className="flex flex-col text-left">
            <span className={`text-sm font-black tracking-widest leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              ATOMIC
            </span>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-1 leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Habit Forge
            </span>
          </div>
        </div>

        {/* Narrative Core Context */}
        <div className="space-y-6 my-auto py-12 relative z-10 max-w-md">
          <h1 className="text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent dark:block hidden">
            Build 1% Better Daily Routines.
          </h1>
          <h1 className="text-3xl font-black tracking-tight leading-none text-slate-900 dark:hidden block">
            Build 1% Better Daily Routines.
          </h1>
          
          <p className="text-xs text-textMuted leading-relaxed">
            Welcome to your centralized cognitive command station. Engineered to eliminate friction and compound marginal gains, this framework provides a minimalist, data-driven ecosystem to track daily matrix ledgers, plan workflows, and audit personal consistency structures.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 text-left">
            <div className={`p-4 border rounded-xl ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
              <div className="text-xs font-bold tracking-wide uppercase">Identity Systems</div>
              <p className="text-[10px] text-textMuted mt-1 leading-normal">Focusing on behavioral architecture instead of goals to build sustainable tracking habits loops.</p>
            </div>
            <div className={`p-4 border rounded-xl ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
              <div className="text-xs font-bold tracking-wide uppercase">Frictionless Audits</div>
              <p className="text-[10px] text-textMuted mt-1 leading-normal">Integrated dashboard metrics map out task execution velocities in real time.</p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-textMuted font-mono opacity-60 relative z-10">
          SYSTEM TERMINAL MODULE CORE // VER 2.6.0
        </div>
      </div>

      {/* RIGHT SPLIT PANEL: REGISTRATION / AUTH LAYER */}
      <div className="w-full md:w-1/2 p-8 lg:p-12 flex items-center justify-center relative">
        <AuthCard onAuthSuccess={onAuthSuccess} isDarkMode={isDarkMode} />
      </div>

    </div>
  );
}
import React from 'react';
import AuthCard from '../components/AuthCard';

export default function Login({ onAuthSuccess, isDarkMode }) {
  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'
    }`}>
      
      {/* LEFT SPLIT PANEL: BRANDING & PURPOSE */}
      <div className={`w-full md:w-1/2 p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r ${
        isDarkMode ? 'bg-slate-900/30 border-slate-900/60' : 'bg-white border-gray-100'
      }`}>
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* LOGO HEADER */}
        <div className="flex items-center gap-3 relative z-10 select-none">
          <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-gray-200'}`}>
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 2,22 22,22" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className={`text-base font-extrabold tracking-wider leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              ATOMIC
            </span>
            <span className={`text-[10px] font-medium tracking-wide uppercase mt-0.5 leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Habit Forge
            </span>
          </div>
        </div>

        {/* MAIN HERO TEXT (POPPINS) */}
        <div className="space-y-6 my-auto py-10 relative z-10 max-w-lg text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent dark:block hidden">
            Build 1% Better Daily Routines.
          </h1>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-slate-900 dark:hidden block">
            Build 1% Better Daily Routines.
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
            Welcome to your all-in-one planning dashboard. Designed to remove friction and support steady daily growth—manage your schedule, keep up with study targets, and visualize real progress.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
            <div className={`p-4 border rounded-2xl transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-gray-50/80 border-gray-100'}`}>
              <div className="text-xs font-semibold tracking-wide text-emerald-400 uppercase font-mono">Identity Systems</div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Focus on daily structure rather than just end targets. Reliable habits form naturally when supported by smart routines.</p>
            </div>
            <div className={`p-4 border rounded-2xl transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-gray-50/80 border-gray-100'}`}>
              <div className="text-xs font-semibold tracking-wide text-teal-400 uppercase font-mono">Frictionless Audits</div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Track progress and output velocity smoothly as you work, without added complexity or manual overhead.</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-[10px] text-slate-500 font-mono opacity-80 relative z-10 pt-4 text-left">
          IMS566 & IMS560 Project 2026 | Atomic task v0.04.1 | <span className="font-bold">© 2026</span> | All rights reserved
        </div>
      </div>

      {/* RIGHT SPLIT PANEL: AUTHENTICATION FORM */}
      <div className="w-full md:w-1/2 p-6 lg:p-12 flex items-center justify-center relative">
        <AuthCard onAuthSuccess={onAuthSuccess} isDarkMode={isDarkMode} />
      </div>

    </div>
  );
}
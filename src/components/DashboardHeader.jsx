import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function DashboardHeader({ isDarkMode }) {
  const [time, setTime] = useState(new Date());
  const [displayName, setDisplayName] = useState("Al-Ashraf");
  const [isCalibrating, setIsCalibrating] = useState(false);

  // --- UNIVERSAL STATE INPUT VECTORS ---
  const [startDateStr, setStartDateStr] = useState("2026-03-30"); // Default Week 1 Monday
  const [breakDateStr, setBreakDateStr] = useState("2026-05-25"); // Default Break Monday

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    async function fetchUserConfigAndProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.user_metadata?.semester_start_date) {
            setStartDateStr(user.user_metadata.semester_start_date);
          }
          if (user.user_metadata?.break_start_date) {
            setBreakDateStr(user.user_metadata.break_start_date);
          }
          if (user.user_metadata?.full_name) {
            setDisplayName(user.user_metadata.full_name);
          }
        }
      } catch (err) {
        console.error("IDENTITY TOKEN RECOVERY FAILURE:", err);
      }
    }

    fetchUserConfigAndProfile();
    return () => clearInterval(timer);
  }, []);

  const saveSemesterConfig = async (e) => {
    e.preventDefault();
    if (!startDateStr || !breakDateStr) return;

    try {
      await supabase.auth.updateUser({
        data: { 
          semester_start_date: startDateStr,
          break_start_date: breakDateStr
        }
      });
      setIsCalibrating(false);
    } catch (err) {
      console.error("TIMELINE SYNC ERROR:", err.message);
    }
  };

  // ============================================================================
  // THE UNIVERSAL ACADEMIC TIMELINE MATH ENGINE
  // ============================================================================
  const getUniversalAcademicPhase = () => {
    if (!startDateStr || !breakDateStr) return "Awaiting Calibration Loop";

    // Standardize dates to midnight timestamps
    const today = new Date();
    const cleanToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const weekOneMonday = new Date(`${startDateStr}T00:00:00`);
    const breakMonday = new Date(`${breakDateStr}T00:00:00`);

    if (isNaN(weekOneMonday.getTime()) || !isNaN(cleanToday.getTime()) && isNaN(breakMonday.getTime())) {
      return "Invalid Timeline Parameters";
    }

    // 1. Pre-Semester Check
    if (cleanToday < weekOneMonday) {
      return "Pre-Semester Phase";
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    
    // Calculate total absolute days elapsed since Week 1 launched
    const totalDaysElapsed = Math.floor((cleanToday.getTime() - weekOneMonday.getTime()) / msPerDay);
    const calendarWeek = Math.floor(totalDaysElapsed / 7) + 1;

    // Calculate when the break happens relative to Week 1
    const daysUntilBreak = Math.floor((breakMonday.getTime() - weekOneMonday.getTime()) / msPerDay);
    const breakWeekIndex = Math.floor(daysUntilBreak / 7) + 1;

    // 2. Mid-Semester Break Check
    if (calendarWeek === breakWeekIndex) {
      return "Mid-Semester Break";
    }

    // 3. Post-Break Offset Shift Logic
    const activeWeekIndex = calendarWeek > breakWeekIndex ? calendarWeek - 1 : calendarWeek;

    // 4. Lecture Weeks 1 - 14 Check
    if (activeWeekIndex >= 1 && activeWeekIndex <= 14) {
      return `Semester Week ${activeWeekIndex}`;
    }

    // 5. Study Week Check (Immediately follows Week 14)
    if (activeWeekIndex === 15) {
      return "Study Week";
    }

    // 6. Examination Phase Check (Follows Study Week)
    if (activeWeekIndex === 16) {
      return "Final Examination Week";
    }

    return "Semester Concluded / End Phase";
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className={`w-full flex flex-col space-y-4 pb-5 border-b transition-colors duration-300 text-left ${
      isDarkMode ? 'border-slate-800 text-white' : 'border-gray-100 text-slate-900'
    }`}>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
        <div className="space-y-1.5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight">
              {getGreeting()}, {displayName}
            </h1>
            
            <button
              onClick={() => setIsCalibrating(!isCalibrating)}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase font-mono mt-1 sm:mt-0 max-w-max cursor-pointer border transition-colors ${
                isCalibrating 
                  ? 'bg-slate-800 text-orange-400 border-slate-700' 
                  : (isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500' : 'bg-slate-900 text-white hover:bg-slate-800')
              }`}
            >
              {getUniversalAcademicPhase()} [EDIT]
            </button>
          </div>
          <p className="text-xs text-textMuted font-medium">
            Your personalized performance cockpit adjusts dynamically to your calendar inputs.
          </p>
        </div>

        {/* TIME DISPLAY CLOCK */}
        <div className="mt-3 sm:mt-0 flex flex-col items-start sm:items-end font-mono select-none">
          <div className="text-xl font-bold tracking-tight">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-textMuted mt-0.5">
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* DYNAMIC TWO-INPUT CALIBRATION PANEL */}
      {isCalibrating && (
        <form onSubmit={saveSemesterConfig} className={`p-4 border rounded-xl flex flex-col gap-4 text-xs ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="text-left space-y-0.5">
            <span className="font-bold block tracking-tight">Universal Calendar Calibration System</span>
            <span className="text-[10px] text-textMuted block">Input your specific semester dates below. The system automatically computes your dynamic timelines.</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-textMuted uppercase font-mono">Week 1 Start Date (Monday)</label>
                <input 
                  required 
                  type="date" 
                  value={startDateStr} 
                  onChange={(e) => setStartDateStr(e.target.value)} 
                  className={`border p-1.5 rounded-lg outline-none font-mono text-[11px] h-8 ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-textMuted uppercase font-mono">Mid-Sem Holiday Date (Monday)</label>
                <input 
                  required 
                  type="date" 
                  value={breakDateStr} 
                  onChange={(e) => setBreakDateStr(e.target.value)} 
                  className={`border p-1.5 rounded-lg outline-none font-mono text-[11px] h-8 ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-gray-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end">
              <button type="submit" className={`px-3 h-8 rounded-lg font-bold cursor-pointer text-[11px] transition-colors ${isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>Save Config</button>
              <button type="button" onClick={() => setIsCalibrating(false)} className={`px-2.5 h-8 rounded-lg font-semibold cursor-pointer text-[11px] ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-textMuted'}`}>Cancel</button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
}
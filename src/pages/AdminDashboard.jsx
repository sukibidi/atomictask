import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AdminDashboard({ isDarkMode }) {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    lateTasksCount: 0
  });
  const [userBreakdown, setUserBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search Filter & Card Expansion Tracking States
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserId, setExpandedUserId] = useState(null);

  async function compileGlobalAnalytics() {
    try {
      setLoading(true);

      const { data: users } = await supabase.from('users').select('id, display_name, email, role_id');
      const { data: projects } = await supabase.from('projects').select('id, user_id, title, description');
      const { data: tasks } = await supabase.from('tasks').select('id, user_id, status, due_date, title');

      const totalUsers = users?.length || 0;
      const totalProjects = projects?.length || 0;
      const totalTasks = tasks?.length || 0;

      const completed = tasks?.filter(t => t.status === 'completed').length || 0;
      const inProgress = tasks?.filter(t => t.status === 'in_progress' || t.status === 'to_do').length || 0;

      const today = new Date();
      const lateTasks = tasks?.filter(t => {
        if (t.status !== 'completed' && t.due_date) {
          return new Date(t.due_date) < today;
        }
        return false;
      }) || [];

      setMetrics({
        totalUsers,
        totalProjects,
        totalTasks,
        completedTasks: completed,
        inProgressTasks: inProgress,
        lateTasksCount: lateTasks.length
      });

      const breakdown = users?.map(u => {
        const userProjects = projects?.filter(p => p.user_id === u.id) || [];
        const userTasks = tasks?.filter(t => t.user_id === u.id) || [];
        const doneTasks = userTasks.filter(t => t.status === 'completed').length;
        
        const taskRate = userTasks.length > 0 ? Math.round((doneTasks / userTasks.length) * 100) : 0;

        const personalLate = userTasks.filter(t => {
          if (t.status !== 'completed' && t.due_date) {
            return new Date(t.due_date) < today;
          }
          return false;
        }).length;

        return {
          ...u,
          projectsCount: userProjects.length,
          tasksCount: userTasks.length,
          completionRate: taskRate,
          lateCount: personalLate,
          // Attaching detailed child rows for the accordion fold view
          rawProjects: userProjects,
          rawTasks: userTasks
        };
      }) || [];

      setUserBreakdown(breakdown);
    } catch (err) {
      console.error("Analytical core compiling crash:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    compileGlobalAnalytics();
  }, []);

  if (loading) return <div className="text-xs font-mono p-10 text-slate-400">// Compiling global intelligence ledger streams...</div>;

  const totalTaskChart = metrics.totalTasks || 1;
  const completedDeg = (metrics.completedTasks / totalTaskChart) * 360;
  const inProgressDeg = (metrics.inProgressTasks / totalTaskChart) * 360;

  const topPerformers = [...userBreakdown]
    .filter(u => u.role_id !== 2)
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 3);

  // Filter accounts by User ID, Display Name, or Email Address
  const filteredStudents = userBreakdown.filter(user => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      user.id.toLowerCase().includes(query) ||
      (user.display_name && user.display_name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query))
    );
  });

  const toggleCardExpansion = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  return (
    <div className="w-full space-y-6 text-left">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Executive Analytics Command Core
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor atomic completion rates, track deadlines, and flag overdue submissions instantly.
        </p>
      </div>

      {/* CORE SUMMARY METRIC BOXES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Accounts', value: metrics.totalUsers, color: 'text-blue-500' },
          { label: 'ACTIVE Projects', value: metrics.totalProjects, color: 'text-purple-500' },
          { label: 'TOTAL ASSIGNMENTS', value: metrics.totalTasks, color: 'text-teal-500' },
          { label: 'Late Trigger Violations', value: metrics.lateTasksCount, color: metrics.lateTasksCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400' },
        ].map((card, idx) => (
          <div key={idx} className={`p-4 border rounded-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-xs'}`}>
            <span className="text-[10px] font-bold uppercase font-mono text-slate-400 block">{card.label}</span>
            <span className={`text-3xl font-black font-mono tracking-tight block mt-2 ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* GRAPHIC BLOCKS LAYOUT MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PIE CHART PANEL */}
        <div className={`p-5 border rounded-2xl lg:col-span-1 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-xs'}`}>
          <div>
            <h3 className="text-xs font-bold uppercase font-mono text-slate-400 tracking-wider">// ACADEMIC TASK DISTRIBUTION</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Visual completion status tracking across active course modules.</p>
          </div>

          <div className="flex justify-center items-center py-6">
            <div 
              className="w-36 h-36 rounded-full relative shadow-inner border border-black/5"
              style={{
                background: `conic-gradient(
                  #14b8a6 0deg ${completedDeg}deg, 
                  #3b82f6 ${completedDeg}deg ${completedDeg + inProgressDeg}deg,
                  #f43f5e ${completedDeg + inProgressDeg}deg 360deg
                )`
              }}
            >
              <div className={`absolute inset-10 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                {metrics.totalTasks} Units
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono font-medium pt-2 border-t border-gray-100/10">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500 block"></span>Resolved</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 block"></span>Active</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 block"></span>Overdue</div>
          </div>
        </div>

        {/* TOP PERFORMANCE TRACKER PANEL */}
        <div className={`p-5 border rounded-2xl lg:col-span-2 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-xs'}`}>
          <div>
            <h3 className="text-xs font-bold uppercase font-mono text-slate-400 tracking-wider">// Top Performing Students</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Ranked by task completion rate and submission speed.</p>
          </div>

          <div className="space-y-3 my-4 flex-1 flex flex-col justify-center">
            {topPerformers.length === 0 ? (
              <div className="text-xs font-mono text-center text-slate-500 py-4">// Operational profile logs blank</div>
            ) : (
              topPerformers.map((user, idx) => (
                <div key={user.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded-md">#01</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{user.display_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      {user.completionRate}% Efficiency Ratio
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-[9px] font-mono text-slate-500 tracking-tight">// Computed securely via automated checkpoint triggers.</div>
        </div>

      </div>

      {/* ============================================================================
          FIXED: SEARCHABLE STUDENT DIRECTORY (CARD DECK & FILTER CONTROLS)
          ============================================================================ */}
      <div className="space-y-4">
        
        {/* Search Control Dashboard Header Bar */}
        <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="text-left w-full sm:w-auto">
            <h3 className="text-xs font-bold uppercase font-mono text-slate-400 tracking-wider">// Student Account Lookup Directory</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Filter records instantly by name, email string parameters, or user registration IDs.</p>
          </div>
          
          {/* Real-time Search Input Field */}
          <input 
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full sm:w-80 text-xs p-2.5 rounded-xl border outline-none transition-all ${
              isDarkMode 
                ? 'bg-slate-950 border-slate-800 text-white focus:border-slate-700' 
                : 'bg-gray-50 border-gray-200 text-slate-900 focus:border-gray-300'
            }`}
          />
        </div>

        {/* Dynamic Cards Grid Result Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full text-center py-12 font-mono text-xs text-slate-500 border border-dashed rounded-2xl border-gray-500/10">
              // No user nodes match the active filter criteria
            </div>
          ) : (
            filteredStudents.map((user) => {
              const isCardExpanded = expandedUserId === user.id;

              return (
                <div 
                  key={user.id}
                  className={`border rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden h-fit ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-800 text-white hover:border-slate-700' 
                      : 'bg-white border-gray-100 text-slate-900 hover:border-gray-200 shadow-sm'
                  }`}
                >
                  {/* Status Indicator Badges */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 font-mono text-[9px] font-bold">
                    {user.role_id === 2 && (
                      <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/10">ADMIN</span>
                    )}
                    {user.lateCount > 0 ? (
                      <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md border border-rose-500/20 animate-pulse">LATE ({user.lateCount})</span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">ON TIME</span>
                    )}
                  </div>

                  {/* Base Profile Metadata Row */}
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-500 font-bold block max-w-[160px] truncate">ID: {user.id}</span>
                    <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mt-1">{user.display_name || "Anonymous User"}</h4>
                    <span className="text-xs text-slate-400 font-mono block">{user.email}</span>
                  </div>

                  {/* Core Activity Stat Numbers */}
                  <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-gray-100/10 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-400 block uppercase">Projects</span>
                      <strong className="text-sm font-bold block mt-0.5">{user.projectsCount} Vaults</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">Tasks</span>
                      <strong className="text-sm font-bold block mt-0.5">{user.tasksCount} Items</strong>
                    </div>
                  </div>

                  {/* Completion Rate Progress bar slider element */}
                  <div className="space-y-1.5 pb-2">
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                      <span>COMPLETION RATE</span>
                      <span>{user.completionRate}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-300" 
                        style={{ width: `${user.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Accordion Expansion Trigger Action Control Button */}
                  <button
                    type="button"
                    onClick={() => toggleCardExpansion(user.id)}
                    className={`w-full mt-2 py-2 rounded-xl border font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                        : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100'
                    }`}
                  >
                    {isCardExpanded ? '▲ Hide User Log Node' : '▼ Inspect User Activities'}
                  </button>

                  {/* ============================================================================
                      ACCORDION EXPANSION CONTAINER: Renders detailed overview lists of user data
                      ============================================================================ */}
                  {isCardExpanded && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-100/10 space-y-4 animate-fadeIn text-xs">
                      
                      {/* Sub-section: Account Owned Project Folders */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-purple-400 block">Linked Vault Folders:</span>
                        {user.rawProjects.length === 0 ? (
                          <div className="text-[10px] font-mono text-slate-500 italic">// No project logs registered</div>
                        ) : (
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                            {user.rawProjects.map(p => (
                              <div key={p.id} className={`p-2 rounded-lg border text-[11px] ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                                <strong className="block truncate">{p.title}</strong>
                                {p.description && <span className="text-[10px] text-slate-400 block truncate">{p.description}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sub-section: Account Checklists Task Status */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase text-teal-400 block">Personal Task Records:</span>
                        {user.rawTasks.length === 0 ? (
                          <div className="text-[10px] font-mono text-slate-500 italic">// No checklist metrics recorded</div>
                        ) : (
                          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
                            {user.rawTasks.map(t => (
                              <div 
                                key={t.id} 
                                className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 ${
                                  t.status === 'completed' 
                                    ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-400' 
                                    : (isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50 border-gray-200')
                                }`}
                              >
                                <span className={`truncate ${t.status === 'completed' ? 'line-through' : ''}`}>{t.title}</span>
                                <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                  t.status === 'completed' 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {t.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
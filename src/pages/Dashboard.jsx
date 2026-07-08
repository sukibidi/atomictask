import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

import DashboardHeader from '../components/DashboardHeader';
import StatsRow from '../components/StatsRow';
import IdentityCard from '../components/IdentityCard';
import GanttChartSlider from '../components/GanttChartSlider';
import AtomicShortcut from '../components/AtomicShortcut';

export default function Dashboard({ isDarkMode }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Atomic shortcut state for dashboard task creation
  const [inputType, setInputType] = useState("project");
  const [titleInput, setTitleInput] = useState("");
  const [priorityInput, setPriorityInput] = useState("medium");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  async function fetchDashboardEnvironment(userId) {
    if (!userId) return;
    try {
      // SECURITY GUARD: Fetch project references only if the user owns them or accepted an invitation
      const { data: memberRecords } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      const accessibleIds = memberRecords?.map(m => m.project_id) || [];
      const accountFilter = `user_id.eq.${userId},owner_id.eq.${userId}`;
      const groupFilter = accessibleIds.length > 0 ? `,id.in.(${accessibleIds.join(',')})` : '';

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, description, start_date, end_date, owner_id')
        .or(`${accountFilter}${groupFilter}`)
        .order('title', { ascending: true });
        
      const visibleIds = projectsData?.map(p => p.id) || [];
      
      let tasksData = [];
      if (visibleIds.length > 0) {
        // SECURE FIXED FILTER: Grabs exclusively tasks belonging strictly to permitted projects
        const { data: tData } = await supabase
          .from('tasks')
          .select('*')
          .in('project_id', visibleIds)
          .order('created_at', { ascending: false });
        tasksData = tData || [];
      }

      setProjects(projectsData || []);
      setTasks(tasksData);

      // Pre-select the first available project context if none is actively locked in
      if (projectsData && projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (e) {
      console.error("Dashboard core fetch error:", e);
    }
  }

  useEffect(() => {
    async function initDashboardSession() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      setLoading(false);
    }
    initDashboardSession();
  }, []);

  // INSTANT FEED REAL-TIME SYNC: Listens dynamically to postgreSQL updates to eliminate manual refresh bugs
  useEffect(() => {
    if (!currentUserId) return;
    fetchDashboardEnvironment(currentUserId);

    const dashboardLiveChannel = supabase
      .channel('dashboard-realtime-instant-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchDashboardEnvironment(currentUserId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchDashboardEnvironment(currentUserId))
      .subscribe();

    return () => { supabase.removeChannel(dashboardLiveChannel); };
  }, [currentUserId, selectedProjectId]);

  const handleDeployShortcut = async (e) => {
    e.preventDefault();
    if (!titleInput.trim() || !currentUserId) return;

    try {
      const isProjectTask = inputType === 'project';
      const payload = {
        title: titleInput.trim(),
        user_id: currentUserId,
        status: 'to_do',
        priority: isProjectTask ? priorityInput : 'low',
        project_id: isProjectTask ? (selectedProjectId || null) : null
      };

      const { error } = await supabase.from('tasks').insert([payload]);
      if (error) throw error;

      setTitleInput("");
      await fetchDashboardEnvironment(currentUserId);
    } catch (err) {
      console.error("Instant submission fault:", err);
    }
  };

  const finishedTasksList = tasks.filter(t => t.status === 'completed');
  const totalCompletedCount = finishedTasksList.length;

  const buildWeeklyTrend = (items, fallback = [2, 3, 2, 4, 3, 5, 4]) => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().slice(0, 10);
    });

    const counts = days.map(day => {
      return items.filter(item => {
        if (!item.created_at) return false;
        return new Date(item.created_at).toISOString().slice(0, 10) === day;
      }).length;
    });

    return counts.some(value => value > 0) ? counts : fallback;
  };

  const taskTrend = buildWeeklyTrend(finishedTasksList);
  const projectTrend = buildWeeklyTrend(projects);

  if (loading) return <div className="text-xs font-mono p-10 text-center animate-pulse text-slate-400">// Syncing instant response canvas nodes...</div>;

  return (
    <div className="w-full max-w-full overflow-hidden px-4 sm:px-0 space-y-6 sm:space-y-8 text-left">
      
      <DashboardHeader isDarkMode={isDarkMode} />
      
      <StatsRow 
        completedCount={totalCompletedCount} 
        projectsCount={projects.length} 
        isDarkMode={isDarkMode} 
        taskTrend={taskTrend} 
        projectTrend={projectTrend} 
      />
      
      {/* RESPONSIVE CONTENT HOUSING GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT TWO COLUMNS: MANAGEMENT ACTIONS & TIMELINES */}
        <div className="grid grid-cols-1 lg:col-span-2 gap-6 overflow-hidden">
          
          <IdentityCard completedCount={totalCompletedCount} />
          
          {/* INSTANT RESPONDING TASK CREATOR PANEL */}
          <div className={`p-5 border rounded-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900 shadow-sm'
          }`}>
            <AtomicShortcut 
              inputType={inputType}
              setInputType={setInputType}
              titleInput={titleInput}
              setTitleInput={setTitleInput}
              priorityInput={priorityInput}
              setPriorityInput={setPriorityInput}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              projects={projects}
              handleDeployShortcut={handleDeployShortcut}
              isDarkMode={isDarkMode}
            />


          </div>

          <GanttChartSlider projects={projects} tasks={tasks} isDarkMode={isDarkMode} />
        </div>

        {/* RIGHT COLUMN SIDEBAR: CLICK NATIVE DEEP LINK TIMELINE LISTINGS */}
        <div className="grid grid-cols-1 lg:col-span-1 gap-6">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase font-mono text-slate-400 tracking-wider">// Project Timeline Milestones</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Click any tracking panel summary to deep-link directly into its workspace lab.</p>
            </div>

            <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1">
              {projects.length === 0 ? (
                <div className="text-xs font-mono text-slate-500 py-6 border border-dashed rounded-2xl border-gray-500/10 text-center">// Directory listing blank.</div>
              ) : (
                projects.map(project => (
                  <div 
                    key={project.id} 
                    // FIXED: Employs standard browser route shifting to run safely without structural Router wrappers
                    onClick={() => window.location.pathname = '/projects'}
                    className={`p-4 border rounded-2xl text-left transition-all cursor-pointer hover:scale-[0.99] active:scale-[0.98] group ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900 shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-amber-500 uppercase">
                      <span>Timeline Window</span>
                      <span>Target: {project.end_date || "Open"}</span>
                    </div>
                    <h4 className="text-sm font-black tracking-tight mt-1 group-hover:underline text-slate-900 dark:text-white truncate">{project.title}</h4>
                    <p className="text-[11px] text-textMuted mt-0.5 line-clamp-2 min-h-[32px]">{project.description || "No parameter details loaded. Click to open workspace context folder."}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
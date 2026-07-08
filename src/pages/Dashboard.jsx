import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

import DashboardHeader from '../components/DashboardHeader';
import StatsRow from '../components/StatsRow';
import IdentityCard from '../components/IdentityCard';
import AtomicShortcut from '../components/AtomicShortcut';
import TodoMatrixLedger from '../components/TodoMatrixLedger';
import GanttChartSlider from '../components/GanttChartSlider';
import AcademicTimetable from '../components/AcademicTimetable';

export default function Dashboard({ isDarkMode }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [todos, setTodos] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Shortcut Form States
  const [inputType, setInputType] = useState("project");
  const [titleInput, setTitleInput] = useState("");
  const [priorityInput, setPriorityInput] = useState("medium");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isManageMode, setIsManageMode] = useState(false);

  async function fetchDashboardEnvironment(userId) {
    if (!userId) return;
    try {
      const { data: memberRecords } = await supabase.from('project_members').select('project_id').eq('user_id', userId);
      const accessibleIds = memberRecords?.map(m => m.project_id) || [];
      const accountFilter = `user_id.eq.${userId},owner_id.eq.${userId}`;
      const groupFilter = accessibleIds.length > 0 ? `,id.in.(${accessibleIds.join(',')})` : '';

      const { data: projectsData } = await supabase.from('projects').select('id, title, start_date, end_date, owner_id').or(`${accountFilter}${groupFilter}`).order('title', { ascending: true });
      const visibleIds = projectsData?.map(p => p.id) || [];
      
      let tasksData = [];
      if (visibleIds.length > 0) {
        const { data: tData } = await supabase.from('tasks').select('*').in('project_id', visibleIds);
        tasksData = tData || [];
      }

      const { data: timetableData } = await supabase.from('timetable').select('*').eq('user_id', userId);
      const { data: todosData } = await supabase.from('todos').select('*').eq('user_id', userId).order('created_at', { ascending: false });

      setTasks(tasksData);
      setProjects(projectsData || []);
      setTodos(todosData || []);
      setScheduleData(timetableData || []);
      
      if (projectsData && projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (e) {
      console.error(e);
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

  // REALTIME SYNCHRONIZER
  useEffect(() => {
    if (!currentUserId) return;
    fetchDashboardEnvironment(currentUserId);

    const dashboardChannel = supabase
      .channel('dashboard-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchDashboardEnvironment(currentUserId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchDashboardEnvironment(currentUserId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => fetchDashboardEnvironment(currentUserId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => fetchDashboardEnvironment(currentUserId))
      .subscribe();

    return () => { supabase.removeChannel(dashboardChannel); };
  }, [currentUserId]);

  const handleDeployShortcut = async (e) => {
    e.preventDefault();
    if (!titleInput.trim() || !currentUserId) return;
    
    if (inputType === "project") {
      if (!selectedProjectId) return;
      await supabase.from('tasks').insert([{ title: titleInput, priority: priorityInput, status: 'in_progress', user_id: currentUserId, project_id: selectedProjectId }]);
    } else {
      await supabase.from('todos').insert([{ title: titleInput, status: 'in_progress', user_id: currentUserId }]);
    }
    setTitleInput("");
  };

  const handleAddClass = async (classPayload) => {
    if (currentUserId) await supabase.from('timetable').insert([{ ...classPayload, user_id: currentUserId }]);
  };

  const handleUpdateClass = async (id, updatedFields) => {
    await supabase.from('timetable').update(updatedFields).eq('id', id);
  };

  const handleDeleteClass = async (id, name) => {
    if (window.confirm(`Purge class block [${name}]?`)) await supabase.from('timetable').delete().eq('id', id);
  };

  const baseDaysMap = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
  scheduleData.forEach(item => { if (baseDaysMap[item.day]) baseDaysMap[item.day].push(item); });
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  if (loading) return <div className={`text-sm font-medium p-10 text-center animate-pulse ${isDarkMode ? 'text-slate-400' : 'text-textMuted'}`}>Syncing structural canvas matrix...</div>;

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8">
      <DashboardHeader isDarkMode={isDarkMode} />
      <StatsRow completedCount={completedCount} projectsCount={projects.length} isDarkMode={isDarkMode} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6 overflow-hidden">
          <IdentityCard completedCount={completedCount} />
          <AtomicShortcut 
            inputType={inputType} setInputType={setInputType} titleInput={titleInput} setTitleInput={setTitleInput}
            priorityInput={priorityInput} setPriorityInput={setPriorityInput} selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId}
            projects={projects} handleDeployShortcut={handleDeployShortcut} isDarkMode={isDarkMode}
          />
          <GanttChartSlider milestones={projects} tasks={tasks} isDarkMode={isDarkMode} />
        </div>

        <div className="space-y-6 lg:col-span-1 flex flex-col">
          <AcademicTimetable baseDaysMap={baseDaysMap} isManageMode={isManageMode} setIsManageMode={setIsManageMode} onAddClass={handleAddClass} onUpdateClass={handleUpdateClass} onDeleteClass={handleDeleteClass} isDarkMode={isDarkMode} />
          <div className="w-full h-full"><TodoMatrixLedger isDarkMode={isDarkMode} /></div>
        </div>
      </div>
    </div>
  );
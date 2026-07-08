import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

import ProjectGrid from '../components/ProjectGrid';
import GanttChartSlider from '../components/GanttChartSlider';
import CreateProjectForm from '../components/CreateProjectForm';
import EditProjectModal from '../components/EditProjectModal';

export default function Projects({ isDarkMode }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [semesterStartDate, setSemesterStartDate] = useState("2026-03-30");

  const [editingProject, setEditingProject] = useState(null);

  async function fetchProjectEnvironment(userId) {
    if (!userId) return;
    try {
      // SECURITY GUARD: Fetch only projects where the user's invitation is explicitly accepted
      const { data: memberRecords } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');
        
      const accessibleIds = memberRecords?.map(m => m.project_id) || [];
      const accountFilter = `user_id.eq.${userId},owner_id.eq.${userId}`;
      const groupFilter = accessibleIds.length > 0 ? `,id.in.(${accessibleIds.join(',')})` : '';

      // Secure Filter Execution
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .or(`${accountFilter}${groupFilter}`)
        .order('created_at', { ascending: false });
        
      const visibleIds = projectsData?.map(p => p.id) || [];
      
      if (visibleIds.length > 0) {
        const { data: tasksData } = await supabase.from('tasks').select('*').in('project_id', visibleIds).order('created_at', { ascending: true });
        const { data: filesData } = await supabase.from('attachments').select('*').in('project_id', visibleIds);
        setTasks(tasksData || []);
        setAttachments(filesData || []);
      } else {
        setTasks([]); setAttachments([]);
      }
      setProjects(projectsData || []);
    } catch (e) {
      console.error("ENVIRONMENT FETCH FAILURE:", e);
    }
  }

  useEffect(() => {
    async function initSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Load clean roster of system team members for popup select fields
        const { data: usersRoster } = await supabase.from('users').select('id, display_name, email');
        setTeamMembers(usersRoster || []);

        if (user.user_metadata?.semester_start_date) {
          setSemesterStartDate(user.user_metadata.semester_start_date);
        }
      }
      setLoading(false);
    }
    initSession();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchProjectEnvironment(currentUserId);

    const projectsRealtimeChannel = supabase
      .channel('projects-page-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchProjectEnvironment(currentUserId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchProjectEnvironment(currentUserId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attachments' }, () => fetchProjectEnvironment(currentUserId))
      .subscribe();

    return () => { supabase.removeChannel(projectsRealtimeChannel); };
  }, [currentUserId]);

  const handleCreateProject = async (payload) => {
    try {
      const { invited_email, ...projectData } = payload;
      
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: currentUserId, owner_id: currentUserId }])
        .select()
        .single();

      if (error) throw error;

      // Handle direct, optional partner invite from creation drawer instantly
      if (invited_email && newProject) {
        await handleInviteMemberByEmail(newProject.id, invited_email);
      }
    } catch (err) {
      console.error("PROJECT INSERTER CHAIN FAULT:", err);
    }
  };

  const handleUpdateProject = async (id, title, description) => {
    try {
      await supabase.from('projects').update({ title, description }).eq('id', id);
      setEditingProject(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (projectId, title, isMilestone, dueDate, priority, assigneeId = null, startDate = null) => {
    try {
      const { error } = await supabase.from('tasks').insert([
        { 
          project_id: projectId, 
          title, 
          is_milestone: isMilestone, 
          due_date: dueDate || null, 
          start_date: startDate || null,
          priority, 
          status: 'to_do', // Initialize instantly into your To-Do stack
          user_id: currentUserId,
          assignee_id: assigneeId || null
        }
      ]);
      if (error) throw error;
    } catch (err) { 
      console.error("TASK DEPLOYMENT FAILURE:", err); 
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    // Dynamic execution block: instantly moves items back and forth between states
    const status = currentStatus === 'completed' ? 'to_do' : 'completed';
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);
      if (error) throw error;
    } catch (err) { 
      console.error("STATUS SYNC FAILURE:", err); 
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      if (error) throw error;
    } catch (err) { 
      console.error("PURGE SYNC FAILURE:", err); 
    }
  };

  const handleInviteMemberByEmail = async (projectId, emailInput) => {
    if (!emailInput || !emailInput.trim()) return;
    try {
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailInput.trim().toLowerCase())
        .single();

      if (userError || !targetUser) {
        alert("Account Lookup Failed: No user registered under that email address.");
        return;
      }

      const { data: duplicateCheck } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', targetUser.id)
        .maybeSingle();

      if (duplicateCheck) {
        alert("Notice: This user already has a pending or active invite to this workspace.");
        return;
      }

      const { error: insertError } = await supabase
        .from('project_members')
        .insert([{ project_id: projectId, user_id: targetUser.id, status: 'pending' }]);

      if (insertError) throw insertError;
      alert(`Success! Invitation request sent to ${emailInput.trim().toLowerCase()}.`);
    } catch (err) {
      console.error("INVITE ROUTE FAULT:", err);
    }
  };

  if (loading) return <div className="text-xs font-mono p-6 sm:p-10 text-slate-400">// Loading workspace cluster profiles...</div>;

  return (
    <div className="w-full max-w-full overflow-hidden px-4 sm:px-0 space-y-6 sm:space-y-8 text-left">
      <div>
        <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Atomic Project Lab
        </h1>
        <p className="text-[11px] sm:text-xs text-textMuted mt-1">
          Launch new goals, track your progress, and keep your workflow sharp.
        </p>
      </div>

      <CreateProjectForm onCreate={handleCreateProject} isDarkMode={isDarkMode} />

      <GanttChartSlider projects={projects} tasks={tasks} semesterStartDate={semesterStartDate} isDarkMode={isDarkMode} />

      <ProjectGrid 
        projects={projects} 
        tasks={tasks} 
        attachments={attachments} 
        currentUserId={currentUserId} 
        isDarkMode={isDarkMode}
        teamMembers={teamMembers} // Passes system roster array cleanly through grid layouts
        onTriggerInvite={handleInviteMemberByEmail} 
        onEdit={setEditingProject} 
        onAddTask={handleAddTask} 
        onToggleTask={handleToggleTaskStatus} 
        onDeleteTask={handleDeleteTask}
        refreshData={() => fetchProjectEnvironment(currentUserId)}
      />
      
      {editingProject && (
        <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onUpdate={handleUpdateProject} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// Bring back your individual building block components cleanly
import ProjectGrid from '../components/ProjectGrid';
import CollaborationModal from '../components/CollaborationModal';
import GanttChartSlider from '../components/GanttChartSlider';
import CreateProjectForm from '../components/CreateProjectForm';
import EditProjectModal from '../components/EditProjectModal';

export default function Projects({ isDarkMode }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [semesterStartDate, setSemesterStartDate] = useState("2026-03-30");

  // Inline Modal Configuration Drawer Toggles
  const [inviteProjectId, setInviteProjectId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  // DATABASE FETCH PIPELINE
  async function fetchProjectEnvironment(userId) {
    if (!userId) return;
    try {
      const { data: memberRecords } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId);
        
      const accessibleIds = memberRecords?.map(m => m.project_id) || [];
      const accountFilter = `user_id.eq.${userId},owner_id.eq.${userId}`;
      const groupFilter = accessibleIds.length > 0 ? `,id.in.(${accessibleIds.join(',')})` : '';

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .or(`${accountFilter}${groupFilter}`)
        .order('created_at', { ascending: false });

      const visibleIds = projectsData?.map(p => p.id) || [];
      
      if (visibleIds.length > 0) {
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .in('project_id', visibleIds)
          .order('created_at', { ascending: true });
          
        const { data: filesData } = await supabase
          .from('attachments')
          .select('*')
          .in('project_id', visibleIds);
          
        setTasks(tasksData || []);
        setAttachments(filesData || []);
      } else {
        setTasks([]);
        setAttachments([]);
      }
      setProjects(projectsData || []);
    } catch (e) {
      console.error("PROJECT ENGINE REINDEX ERROR:", e);
    }
  }

  // 1. Initial Session Verification
  useEffect(() => {
    async function initSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        if (user.user_metadata?.semester_start_date) {
          setSemesterStartDate(user.user_metadata.semester_start_date);
        }
      }
      setLoading(false);
    }
    initSession();
  }, []);

  // 2. REALTIME DATABASE BROADCAST CHANNELS STREAM
  useEffect(() => {
    if (!currentUserId) return;

    fetchProjectEnvironment(currentUserId);

    const projectsRealtimeChannel = supabase
      .channel('projects-page-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjectEnvironment(currentUserId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchProjectEnvironment(currentUserId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attachments' }, () => {
        fetchProjectEnvironment(currentUserId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsRealtimeChannel);
    };
  }, [currentUserId]);

  // --- PROJECT PAGE CRUD MUTATION ACTIONS ---
  const handleCreateProject = async (payload) => {
    try {
      const { error } = await supabase.from('projects').insert([
        { ...payload, user_id: currentUserId, owner_id: currentUserId }
      ]);
      if (error) throw error;
    } catch (err) {
      alert(`Deployment Failed: ${err.message}`);
    }
  };

  const handleUpdateProject = async (id, updatedTitle, updatedDescription) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ title: updatedTitle, description: updatedDescription })
        .eq('id', id);
      if (error) throw error;
      setEditingProject(null);
    } catch (err) {
      alert(`Update Failed: ${err.message}`);
    }
  };

  const handleAddTask = async (projectId, taskTitle, isMilestone, dueDate, priority) => {
    try {
      const { error } = await supabase.from('tasks').insert([
        { 
          project_id: projectId, 
          title: taskTitle.trim(), 
          is_milestone: isMilestone, 
          due_date: dueDate || null, 
          priority: priority, 
          status: 'in_progress', 
          user_id: currentUserId 
        }
      ]);
      if (error) throw error;
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    try {
      await supabase.from('tasks').update({ status: nextStatus }).eq('id', taskId);
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
    } catch (err) { 
      console.error(err); 
    }
  };

  if (loading) return <div className="text-xs font-mono p-10 text-slate-400">// Loading management console tables...</div>;

  return (
    <div className="space-y-8 w-full text-left">
      <div>
        <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Workspace Engine Hub
        </h1>
        <p className="text-xs text-textMuted mt-1">
          Deploy project scopes, track project ownership, and run structural management updates.
        </p>
      </div>

      {/* 1. Project creation module form */}
      <CreateProjectForm onCreate={handleCreateProject} isDarkMode={isDarkMode} />

      {/* 2. Synced roadmap slider layout */}
      <GanttChartSlider 
        milestones={projects} 
        tasks={tasks} 
        semesterStartDate={semesterStartDate} 
        isDarkMode={isDarkMode} 
      />

      <ProjectGrid 
        projects={projects} 
        tasks={tasks} 
        attachments={attachments} 
        currentUserId={currentUserId} 
        isDarkMode={isDarkMode}
        onTriggerInvite={setInviteProjectId} 
        onEdit={setEditingProject}
        onAddTask={handleAddTask} 
        onToggleTask={handleToggleTaskStatus} 
        onDeleteTask={handleDeleteTask}
        refreshData={() => fetchProjectEnvironment(currentUserId)}
      />

      {inviteProjectId && (
        <CollaborationModal 
          projectId={inviteProjectId} 
          onClose={() => setInviteProjectId(null)} 
          isDarkMode={isDarkMode} 
        />
      )}
      
      {editingProject && (
        <EditProjectModal 
          project={editingProject} 
          onClose={() => setEditingProject(null)} 
          onUpdate={handleUpdateProject} 
          isDarkMode={isDarkMode} 
        />
      )}
    </div>
  );
}
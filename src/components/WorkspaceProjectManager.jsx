import React, { useState } from 'react';
import ProjectGrid from './ProjectGrid';
import CollaborationModal from './CollaborationModal';
import GanttChartSlider from './GanttChartSlider';
import CreateProjectForm from './CreateProjectForm';
import EditProjectModal from './EditProjectModal';

// CRITICAL: Ensure "export default function" is declared exactly like this
export default function ProjectWorkspaceManager({
  projects,
  tasks,
  attachments,
  currentUserId,
  semesterStartDate,
  isDarkMode,
  onCreateProject,
  onUpdateProject,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  refreshData
}) {
  const [inviteProjectId, setInviteProjectId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  return (
    <div className="space-y-8 w-full text-left">
      <div>
        <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Workspace Engine Hub
        </h1>
        <p className="text-xs text-textMuted mt-1">
          Deploy project scopes and manage operational tasks alongside SMART checkpoints.
        </p>
      </div>

      <CreateProjectForm onCreate={onCreateProject} isDarkMode={isDarkMode} />

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
        onAddTask={onAddTask} 
        onToggleTask={onToggleTask} 
        onDeleteTask={onDeleteTask}
        refreshData={refreshData}
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
          onUpdate={onUpdateProject} 
          isDarkMode={isDarkMode} 
        />
      )}
    </div>
  );
}
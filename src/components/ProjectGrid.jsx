import React from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectGrid({ 
  projects, 
  tasks, 
  attachments, 
  currentUserId, 
  isDarkMode,
  onTriggerInvite, 
  onEdit, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {projects.length === 0 ? (
        <div className="col-span-full py-16 text-center border border-dashed rounded-2xl border-gray-100/10 font-mono text-xs text-slate-400">
          // No active project vaults mapped to this account session node.
        </div>
      ) : (
        projects.map((project) => {
          // Isolate and filter child task arrays belonging strictly to this project card container
          const projectTasks = tasks.filter((t) => t.project_id === project.id);
          const projectFiles = attachments.filter((a) => a.project_id === project.id);

          return (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={projectTasks}
              attachments={projectFiles}
              currentUserId={currentUserId}
              isDarkMode={isDarkMode}
              
              // FIXED: Tunnels the prop execution safely straight to the card layout actions
              onTriggerInvite={onTriggerInvite} 
              
              onEdit={onEdit}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
            />
          );
        })
      )}
    </div>
  );
}
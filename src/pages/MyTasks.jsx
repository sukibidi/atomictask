import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import AtomicShortcut from '../components/AtomicShortcut';
import TaskKanbanBoard from '../components/TaskKanbanBoard';
import TaskAnalytics from '../components/TaskAnalytics';

export default function MyTasks({ isDarkMode }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userId, setUserId] = useState(null);

  // --- ATOMIC SHORTCUT STATE MANAGEMENT CORES ---
  const [inputType, setInputType] = useState("project"); // 'project' or 'todo'
  const [titleInput, setTitleInput] = useState("");
  const [priorityInput, setPriorityInput] = useState("medium");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // --- EDIT MODAL OVERLAY STATE ---
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editStatus, setEditStatus] = useState("to_do");

  async function fetchTaskEnvironment(currentUserId) {
    if (!currentUserId) return;
    try {
      // Pull all task lines associated with this specific authenticated user ID string
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('title', { ascending: true });

      setTasks(tasksData || []);
      setProjects(projectsData || []);
      
      if (projectsData && projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (e) {
      console.error("METRIC DATA SYNCHRONIZATION FAILURE:", e);
    }
  }

  useEffect(() => {
    async function initSession() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchTaskEnvironment(user.id);
      }
      setLoading(false);
    }
    initSession();
  }, []);

  // ==========================================
  // CORE INTERACTION DEPLOYMENT LOGIC CORES
  // ==========================================

  const handleDeployShortcut = async (e) => {
    e.preventDefault();
    if (!titleInput.trim() || !userId) return;

    try {
      const isProjectTask = inputType === 'project';
      
      const payload = {
        title: titleInput.trim(),
        user_id: userId,
        status: 'to_do',
        priority: isProjectTask ? priorityInput : 'low',
        project_id: isProjectTask ? (selectedProjectId || null) : null
      };

      const { error } = await supabase.from('tasks').insert([payload]);
      if (error) throw error;

      setTitleInput("");
      await fetchTaskEnvironment(userId);
    } catch (err) {
      console.error("SHORTCUT INJECT MATRIX ERROR:", err.message);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = async (e, targetLaneId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId || !userId) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: targetLaneId })
        .eq('id', taskId);

      if (error) throw error;
      await fetchTaskEnvironment(userId);
    } catch (err) {
      console.error("KANBAN DRAG-DROP STATE SYNC ERROR:", err.message);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || "");
    setEditPriority(task.priority || "medium");
    setEditStatus(task.status || "to_do");
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask || !userId) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title: editTitle, priority: editPriority, status: editStatus })
        .eq('id', editingTask.id);

      if (error) throw error;
      setEditingTask(null);
      await fetchTaskEnvironment(userId);
    } catch (err) {
      console.error("TASK MODIFICATION FAILURE:", err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!userId || !window.confirm("Purge this task entry permanently from records?")) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      await fetchTaskEnvironment(userId);
    } catch (err) {
      console.error("CRITICAL PURGE EXCEPTION:", err.message);
    }
  };

  if (loading) return <div className="text-xs font-mono text-slate-500 text-left animate-pulse">// Aligning workflow sub-components...</div>;

  // --- PRE-COMPUTE ANALYTICS METRICS VALUES PACKS ---
  const totalTasksCount = tasks.length;
  const todoCount = tasks.filter(t => t.status === 'to_do').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      
      {/* Title Panel */}
      <div className="text-left">
        <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Daily Ledger Tasks
        </h1>
        <p className="text-xs text-textMuted mt-1">
          Monitor completion velocities, log actions instantly, and organize workflows using the drag-and-drop board.
        </p>
      </div>

      {/* 1. TASK PERFORMANCE ANALYTICS COMPONENT ROW */}
      <TaskAnalytics 
        totalTasksCount={totalTasksCount}
        todoCount={todoCount}
        inProgressCount={inProgressCount}
        completedCount={completedCount}
        isDarkMode={isDarkMode}
      />

      {/* 2. ATOMIC INSERTION SHORTCUT CONTROLLER COMPONENT */}
      <AtomicShortcut 
        inputType={inputType} setInputType={setInputType}
        titleInput={titleInput} setTitleInput={setTitleInput}
        priorityInput={priorityInput} setPriorityInput={setPriorityInput}
        selectedProjectId={selectedProjectId} setSelectedProjectId={setSelectedProjectId}
        projects={projects}
        handleDeployShortcut={handleDeployShortcut}
        isDarkMode={isDarkMode}
      />

      {/* 3. DYNAMIC KANBAN BOARD SYSTEM WORKSPACE COMPONENT */}
      <TaskKanbanBoard 
        tasks={tasks}
        projects={projects}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        openEditModal={openEditModal}
        handleDeleteTask={handleDeleteTask}
        isDarkMode={isDarkMode}
      />

      {/* 4. MODAL PARAMETERS PROFILE EDITOR OVERLAY */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className={`w-full max-w-sm border rounded-2xl shadow-2xl p-5 text-xs text-left ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'
          }`}>
            <div className="flex justify-between items-center border-b border-gray-100/10 pb-3 mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider">Modify Ledger Target</h4>
              <button onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-rose-500 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-textMuted uppercase">Task Title Descriptor</label>
                <input required type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={`border p-2.5 rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50'}`} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-textMuted uppercase">Priority Tier</label>
                  <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className={`border p-2 rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white'}`}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-textMuted uppercase">Kanban Status Lane</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={`border p-2 rounded-xl outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white'}`}>
                    <option value="to_do">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100/10">
                <button type="button" onClick={() => setEditingTask(null)} className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100'}`}>Cancel</button>
                <button type="submit" className={`px-5 py-2 rounded-xl font-bold cursor-pointer ${isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white'}`}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
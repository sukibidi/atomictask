import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function TodoMatrixLedger({ isDarkMode }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  async function fetchDailyTodos(currentUserId) {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', currentUserId)
        .is('project_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (err) {
      console.error("LEDGER FETCH EXCEPTION:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchDailyTodos(user.id);
      }
    }
    initSession();
  }, []);

  const handleToggleTodo = async (todo) => {
    if (!userId) return;
    const nextStatus = todo.status === 'completed' ? 'to_do' : 'completed';
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', todo.id);
      if (error) throw error;
      await fetchDailyTodos(userId);
    } catch (err) {
      console.error("LEDGER TOGGLE EXCEPTION:", err.message);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (!userId || !window.confirm("Purge this item from the ledger?")) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', todoId);
      if (error) throw error;
      await fetchDailyTodos(userId);
    } catch (err) {
      console.error("LEDGER PURGE EXCEPTION:", err.message);
    }
  };

  if (loading) return <div className="text-[11px] font-mono text-slate-500 text-left animate-pulse">// Fetching daily ledger...</div>;

  const pendingTodos = todos.filter(t => t.status !== 'completed');

  return (
    <div className={`border rounded-2xl shadow-sm overflow-hidden text-left h-full flex flex-col justify-between transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'
    }`}>
      
      <div>
        {/* FIXED THEME HEADER WITH BUTTON COMPLIANCE */}
        <div className={`px-5 py-4 border-b flex justify-between items-center ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50/40 border-gray-100'
        }`}>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">Daily Todo Matrix Ledger</h3>
            <p className="text-[10px] text-textMuted mt-0.5">Deploy new items through the main shortcut terminal console.</p>
          </div>
          
          {/* RE-STYLED ADAPTIVE THEME BADGE BUTTON BUTTON NODE */}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-colors select-none ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 text-slate-300' 
              : 'bg-gray-100 border-gray-200 text-slate-600'
          }`}>
            {pendingTodos.length} ACTIVE
          </span>
        </div>

        <div className="p-4">
          {pendingTodos.length === 0 ? (
            <div className="text-center text-[11px] text-gray-400 py-14 font-mono">// Focus matrix ledger clear for today.</div>
          ) : (
            <div className="divide-y divide-gray-100/10 max-h-[250px] overflow-y-auto pr-1">
              {pendingTodos.map((todo) => (
                <div key={todo.id} className="flex justify-between items-center py-2.5 px-1.5 rounded-xl hover:bg-slate-500/5 transition-colors group">
                  <div className="flex items-center gap-3 truncate pr-2">
                    <button 
                      type="button" 
                      onClick={() => handleToggleTodo(todo)} 
                      className={`w-4 h-4 rounded-md border flex items-center justify-center text-[9px] cursor-pointer transition-colors ${
                        isDarkMode ? 'border-slate-700 bg-slate-800 hover:border-slate-500' : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      {todo.status === 'completed' && "✓"}
                    </button>
                    <span className="text-xs font-semibold truncate text-slate-200 dark:text-white">
                      {todo.title}
                    </span>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => handleDeleteTodo(todo.id)} 
                    className="text-[10px] text-rose-500 opacity-0 group-hover:opacity-100 font-bold px-1 transition-opacity cursor-pointer font-mono shrink-0"
                  >
                    [ Erase ]
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
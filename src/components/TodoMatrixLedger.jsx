import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function TodoMatrixLedger({ isDarkMode }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTodos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id) // Strict user validation mapping
        .order('created_at', { ascending: false });
      setTodos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();

    // LIVE INTERACTIVE RE-INDEX SUB-STREAM
    const todoSubscription = supabase
      .channel('todos-ledger-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => {
        fetchTodos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(todoSubscription);
    };
  }, []);

  const handleToggleTodo = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    await supabase.from('todos').update({ status: nextStatus }).eq('id', id);
  };

  if (loading) return <div className="text-[10px] font-mono text-gray-400">// Retrieving records...</div>;

  return (
    <div className={`border rounded-2xl p-4 text-left transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900 shadow-2xs'
    }`}>
      <h3 className="text-xs font-bold uppercase font-mono text-textMuted mb-3">// To do</h3>
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
        {todos.length === 0 ? (
          <div className="text-[10px] font-mono text-gray-400 py-4">// Zero pending operations.</div>
        ) : (
          todos.map(t => (
            <label key={t.id} className={`flex items-center gap-2 p-2 border rounded-xl cursor-pointer text-xs transition-colors ${
              t.status === 'completed' ? 'opacity-50 bg-emerald-500/5 border-emerald-500/10' : (isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50 border-gray-100')
            }`}>
              <input type="checkbox" checked={t.status === 'completed'} onChange={() => handleToggleTodo(t.id, t.status)} className="rounded border-gray-300" />
              <span className={t.status === 'completed' ? 'line-through text-slate-400' : 'font-semibold'}>{t.title}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
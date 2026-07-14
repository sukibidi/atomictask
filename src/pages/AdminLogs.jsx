import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const ACTION_COLORS = {
  INSERT: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  UPDATE: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  DELETE: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

export default function AdminLogs({ isDarkMode }) {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  async function fetchLogs() {
    try {
      setLoading(true);
      const { data: logsData, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;

      const { data: usersData } = await supabase.from('users').select('id, display_name, email');

      setLogs(logsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error('AUDIT LOG FETCH FAILURE:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('audit-logs-live-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => fetchLogs())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getActorName = (actorId) => {
    if (!actorId) return 'System';
    return users.find((u) => u.id === actorId)?.display_name || actorId;
  };

  const tableNames = ['all', ...Array.from(new Set(logs.map((l) => l.table_name)))];

  const filteredLogs = logs.filter((log) => {
    if (tableFilter !== 'all' && log.table_name !== tableFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const actorName = getActorName(log.actor_id).toLowerCase();
      if (!actorName.includes(q) && !log.record_id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (loading) return <div className="text-xs font-mono p-6 sm:p-10 text-slate-400">// Retrieving database audit ledger...</div>;

  return (
    <div className="w-full max-w-full overflow-hidden px-4 sm:px-0 space-y-6 sm:space-y-8 text-left">
      <div>
        <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Database Audit Logs
        </h1>
        <p className="text-[11px] sm:text-xs text-textMuted mt-1">
          Every INSERT, UPDATE, and DELETE on core tables, captured automatically by database triggers.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row gap-2.5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        <input
          type="text"
          placeholder="Search by actor name or record ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`flex-1 text-xs p-2 rounded-lg border outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'}`}
        />
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className={`text-xs p-2 rounded-lg border outline-none font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'}`}
        >
          {tableNames.map((t) => (
            <option key={t} value={t}>{t === 'all' ? 'All Tables' : t}</option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={`text-xs p-2 rounded-lg border outline-none font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'}`}
        >
          <option value="all">All Actions</option>
          <option value="INSERT">Insert</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
      </div>

      {/* LOG LIST */}
      <div className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-xs font-mono text-slate-400">// No matching audit entries found.</div>
        ) : (
          <div className="divide-y divide-gray-100/10 max-h-[70vh] overflow-y-auto">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div key={log.id} className="p-3 sm:p-4">
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-lg border font-mono whitespace-nowrap ${ACTION_COLORS[log.action] || ''}`}>
                        {log.action}
                      </span>
                      <span className="text-xs font-bold truncate">{log.table_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate hidden sm:inline">#{log.record_id}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-slate-400">{getActorName(log.actor_id)}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {log.old_data && (
                        <div className={`p-2.5 rounded-xl border overflow-x-auto ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                          <span className="text-[9px] font-bold uppercase text-rose-500 block mb-1.5">Before</span>
                          <pre className="text-[10px] font-mono whitespace-pre-wrap break-all">{JSON.stringify(log.old_data, null, 2)}</pre>
                        </div>
                      )}
                      {log.new_data && (
                        <div className={`p-2.5 rounded-xl border overflow-x-auto ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                          <span className="text-[9px] font-bold uppercase text-emerald-500 block mb-1.5">After</span>
                          <pre className="text-[10px] font-mono whitespace-pre-wrap break-all">{JSON.stringify(log.new_data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

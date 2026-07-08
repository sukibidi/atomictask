import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AccountabilityHub({ isDarkMode }) {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  async function fetchConnections(userId) {
    if (!userId) return;
    try {
      setLoading(true);
      
      // Fetch connections where friendship state is fully accepted
      const { data: acceptedData, error: err1 } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          user_id,
          friend_id,
          sender:users!friendships_user_id_fkey(id, display_name, email),
          receiver:users!friendships_friend_id_fkey(id, display_name, email)
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (err1) throw err1;

      // Fetch incoming requests waiting for authorization
      const { data: pendingData, error: err2 } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          sender:users!friendships_user_id_fkey(id, display_name, email)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (err2) throw err2;

      setFriends(acceptedData || []);
      setPendingRequests(pendingData || []);
    } catch (err) {
      console.error("CONNECTION RETRIEVAL ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        await fetchConnections(user.id);
      }
    }
    initSession();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    const targetedEmail = searchEmail.trim().toLowerCase();
    if (!targetedEmail || !currentUserId) return;
    
    setActionLoading(true);
    setStatusText("");

    try {
      // 1. Search public data profiles for matching unique email addresses
      const { data: targetUser, error: findErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', targetedEmail)
        .maybeSingle();

      if (findErr) throw findErr;
      if (!targetUser) throw new Error("Account token with that email address does not exist inside directory.");
      if (targetUser.id === currentUserId) throw new Error("Self-referencing loops not permitted in partner channels.");

      // 2. Insert connection row into friendships table
      const { error: insertErr } = await supabase
        .from('friendships')
        .insert([{ user_id: currentUserId, friend_id: targetUser.id, status: 'pending' }]);

      if (insertErr) throw new Error("Sync link is already active or awaiting friend approval.");

      setSearchEmail("");
      setStatusText("Connection request dispatched successfully to target companion.");
      await fetchConnections(currentUserId);
    } catch (err) {
      setStatusText(err.message || "An unexpected handshake error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      await fetchConnections(currentUserId);
    } catch (err) {
      console.error("ACCEPT PRIVILEGE FAILURE:", err.message);
    }
  };

  const handleSeverConnection = async (requestId) => {
    if (!window.confirm("Sever connection access parameters for this companion?")) return;
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      await fetchConnections(currentUserId);
    } catch (err) {
      console.error("SEVER CONNECTION DELETION EXCEPTION:", err.message);
    }
  };

  if (loading) return <div className="text-xs font-mono text-slate-500 text-left animate-pulse">// Aligning secure social link matrices...</div>;

  return (
    <div className="space-y-8 w-full max-w-full text-left overflow-hidden">
      
      <div>
        <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Accountability Network Hub
        </h1>
        <p className="text-xs text-textMuted mt-1">
          Synchronize focus metrics with trusted companions via verified identity email channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: CONNECTION FORM & INCOMING REQUESTS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Dispatch request card */}
          <div className={`border rounded-2xl p-5 shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-2">Initialize Companion Link</h3>
            <form onSubmit={handleSendRequest} className="space-y-3 text-xs">
              <input 
                required
                type="email" 
                placeholder="companion@workspace.com" 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 outline-none font-medium transition-all ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-slate-600 placeholder-slate-700' : 'bg-gray-50 border-gray-200 focus:border-slate-400 text-slate-900'
                }`}
              />
              <button 
                type="submit" 
                disabled={actionLoading}
                className={`w-full py-2.5 font-bold rounded-xl text-[11px] uppercase tracking-wide cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {actionLoading ? "Syncing..." : "Connect via Email"}
              </button>
            </form>
            {statusText && <div className="text-[10px] font-mono mt-3 text-slate-400 break-words">// {statusText}</div>}
          </div>

          {/* Incoming requests checklist panel */}
          <div className={`border rounded-2xl p-5 shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-3">Pending Authorizations</h3>
            <div className="space-y-2">
              {pendingRequests.length === 0 ? (
                <div className="text-[11px] font-mono text-gray-500 py-2">// No external entry requests pending.</div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="flex justify-between items-center p-3 border border-gray-100/10 rounded-xl bg-slate-950/20 text-xs">
                    <div className="truncate pr-2 text-left">
                      <span className="font-bold block truncate">{req.sender?.display_name || "Focus User"}</span>
                      <span className="text-[9px] text-textMuted font-mono truncate block">{req.sender?.email}</span>
                    </div>
                    <button 
                      onClick={() => handleAcceptRequest(req.id)} 
                      className={`shrink-0 px-3 py-1.5 font-bold rounded-lg text-[10px] uppercase transition-colors cursor-pointer ${
                        isDarkMode ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      Accept
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LINKED ACTIVE COMPANIONS DIRECTORY LISTING */}
        <div className={`lg:col-span-2 border rounded-2xl p-5 shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-3">Active Connected Observers</h3>
          
          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-center py-16 text-xs font-mono text-gray-500">// Your partner link grid is currently unlinked.</div>
            ) : (
              friends.map(link => {
                const isOwnerSender = link.user_id === currentUserId;
                const activeFriend = isOwnerSender ? link.receiver : link.sender;

                return (
                  <div key={link.id} className={`p-4 border rounded-xl flex justify-between items-center text-xs transition-colors ${
                    isDarkMode ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="space-y-0.5 text-left">
                      <span className="font-bold text-sm block">{activeFriend?.display_name || "Focus Companion"}</span>
                      <span className="text-[10px] font-mono tracking-tight text-textMuted block">{activeFriend?.email}</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => alert(`Launching Remote Session. Loading workload logs for: ${activeFriend?.email}`)} 
                        className={`px-3 py-1.5 font-bold rounded-lg text-[10px] uppercase border transition-colors cursor-pointer ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-slate-500' : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-100'
                        }`}
                      >
                        Observe Grid
                      </button>
                      <button onClick={() => handleSeverConnection(link.id)} className="text-[10px] text-rose-500 font-bold px-2 font-mono hover:underline cursor-pointer">[ Sever ]</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
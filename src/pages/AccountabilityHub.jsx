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

  // States to monitor accordion visibility and project lists for each companion card
  const [expandedFriendId, setExpandedFriendId] = useState(null);
  const [friendProjects, setFriendProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  async function fetchConnections(userId) {
    if (!userId) return;
    try {
      setLoading(true);
      
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
      const { data: targetUser, error: findErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', targetedEmail)
        .maybeSingle();

      if (findErr) throw findErr;
      if (!targetUser) throw new Error("No atomic profile found with that email address.");
      if (targetUser.id === currentUserId) throw new Error("You can't add yourself to your own Atomic Squad.");

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
      setExpandedFriendId(null);
      setFriendProjects([]);
      await fetchConnections(currentUserId);
    } catch (err) {
      console.error("SEVER CONNECTION DELETION EXCEPTION:", err.message);
    }
  };

  const toggleObserveGrid = async (friendId) => {
    if (expandedFriendId === friendId) {
      setExpandedFriendId(null);
      setFriendProjects([]);
      return;
    }

    try {
      setProjectsLoading(true);
      setExpandedFriendId(friendId);
      setFriendProjects([]);

      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, start_date, end_date')
        .eq('user_id', friendId);

      if (error) throw error;
      setFriendProjects(data || []);
    } catch (err) {
      console.error("OBSERVER GRID FETCH EXCEPTION:", err.message);
    } finally {
      setProjectsLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-slate-500 animate-pulse">Loading squad...</div>;

  return (
    <div className="space-y-8 w-full max-w-6xl px-0 text-left">
      <div className="max-w-2xl">
        <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
          Atomic Squad
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Minimal squad access and connection control.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className={`rounded-3xl border p-5 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Invite</p>
              <form onSubmit={handleSendRequest} className="flex flex-col gap-3">
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-800'
                  }`}
                >
                  {actionLoading ? 'Sending...' : 'Send invite'}
                </button>
              </form>
            </div>

            {statusText && <p className="text-sm text-slate-500">{statusText}</p>}

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending</p>
              <div className="space-y-2">
                {pendingRequests.length === 0 ? (
                  <div className="text-sm text-slate-400">No pending requests.</div>
                ) : (
                  pendingRequests.map(req => (
                    <div
                      key={req.id}
                      className={`rounded-3xl border p-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{req.sender?.display_name || 'Pending companion'}</p>
                          <p className="text-sm text-slate-500">{req.sender?.email}</p>
                        </div>
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                            isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-800'
                          }`}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: LINKED ACTIVE COMPANIONS DIRECTORY LISTING */}
        <section className={`rounded-3xl border p-5 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active squad</p>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Companions</p>
            </div>
            <p className="text-sm text-slate-500">{friends.length} connected</p>
          </div>

          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-sm text-slate-400">No members connected yet.</div>
            ) : (
              friends.map(link => {
                const isOwnerSender = link.user_id === currentUserId;
                const activeFriend = isOwnerSender ? link.receiver : link.sender;
                const isExpanded = expandedFriendId === activeFriend?.id;
                return (
                  <div
                    key={link.id}
                    className={`rounded-3xl border p-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{activeFriend?.display_name || 'Focus Companion'}</p>
                        <p className="text-sm text-slate-500">{activeFriend?.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleObserveGrid(activeFriend?.id)}
                          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                            isExpanded ? 'bg-slate-950 text-white' : isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {isExpanded ? 'Close' : 'View'}
                        </button>
                        <button
                          onClick={() => handleSeverConnection(link.id)}
                          className="text-sm text-rose-500 underline-offset-2 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 rounded-3xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-500">
                        {projectsLoading ? (
                          <div>Loading projects…</div>
                        ) : friendProjects.length === 0 ? (
                          <div>No shared projects.</div>
                        ) : (
                          <div className="space-y-3">
                            {friendProjects.map(proj => (
                              <div key={proj.id} className="rounded-3xl border border-slate-200 bg-white p-3">
                                <p className="font-medium text-slate-950">{proj.title}</p>
                                <p className="text-sm text-slate-500 truncate">{proj.description || 'No description'}</p>
                                <p className="mt-2 text-xs text-slate-400">Deadline: {proj.end_date || 'Open'}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>

    </div>
  );
}
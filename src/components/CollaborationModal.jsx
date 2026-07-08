import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function CollaborationModal({ projectId, onClose, isDarkMode }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setSending(true);
    try {
      // Find matching user row inside our profile mappings index
      const { data: targetUser, error: findErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', targetEmail)
        .maybeSingle();

      if (findErr || !targetUser) throw new Error("Account token not located inside public terminal directory registry.");

      const { error: joinErr } = await supabase
        .from('project_members')
        .insert([{ project_id: projectId, user_id: targetUser.id }]);

      if (joinErr) throw new Error("Target member already possesses clear keys for this collaborative vault loop.");

      alert("Access keys authorized. Vault decryption link enabled.");
      setEmail("");
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
      <div className={`w-full max-w-sm border rounded-2xl shadow-2xl p-5 text-xs text-left transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-slate-900'
      }`}>
        <div className="flex justify-between items-center border-b border-gray-100/10 pb-3 mb-4">
          <div className="font-mono tracking-tight text-[10px] uppercase font-bold text-slate-400">Secure Invitation Channel</div>
          <button onClick={onClose} className="text-gray-400 hover:text-rose-500 font-bold cursor-pointer text-xs">✕</button>
        </div>

        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Companion Identity Email</label>
            <input 
              required type="email" placeholder="partner@workspace.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className={`border p-2.5 rounded-xl outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`} 
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-slate-600'}`}>Cancel</button>
            <button type="submit" disabled={sending} className={`px-5 py-2 rounded-xl font-bold transition-colors cursor-pointer ${isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white'}`}>
              {sending ? "Authorizing..." : "Grant Vault Clearance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
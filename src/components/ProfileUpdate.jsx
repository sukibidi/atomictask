import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function ProfileUpdate({ isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [email, setEmail] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [statusMessage, setStatusMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setEmail(user.email || "");
          setFullName(user.user_metadata?.full_name || "");
          setStudentId(user.user_metadata?.student_id || "");
          setFaculty(user.user_metadata?.faculty || "");
        }
      } catch (err) {
        console.error("PROFILE MOUNT RECOVERY FAILURE:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadUserProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setStatusMessage({ text: "", isError: false });

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          student_id: studentId,
          faculty: faculty
        }
      });

      if (error) throw error;
      setStatusMessage({ text: "Profile metrics synchronized successfully.", isError: false });
    } catch (err) {
      console.error("PROFILE SYNC CRASH:", err.message);
      setStatusMessage({ text: err.message || "Failed to update identity record.", isError: true });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-xs font-mono text-slate-500 text-left animate-pulse">// Compiling identity index tokens...</div>;

  return (
    <div className={`border rounded-2xl p-6 max-w-xl text-left shadow-2xs transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
    }`}>
      
      <div className="border-b border-gray-100/10 pb-3 mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider">Edit Profile</h3>
        <p className="text-[11px] text-textMuted mt-0.5">Update your core profile variables. All changes are written directly to the system registry.</p>
      </div>

      {statusMessage.text && (
        <div className={`mb-4 p-2.5 rounded-xl text-[11px] font-bold text-center border ${
          statusMessage.isError 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {statusMessage.isError ? "Error: " : ""}{statusMessage.text}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-1 text-xs">
        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Account Authentication Email</span>
        <div className={`p-2.5 rounded-xl font-mono text-[11px] border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-100 text-slate-500'}`}>
          {email || "anonymous-operator@matrix.net"}
        </div>
      </div>

      <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Full Name</label>
          <input 
            required
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Al-Ashraf"
            className={`border p-2.5 rounded-xl outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-slate-500 text-white' : 'bg-white border-gray-200'}`} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Student ID Matrix Number</label>
            <input 
              required
              type="text" 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g., 2026110294"
              className={`border p-2.5 rounded-xl outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-slate-500 text-white' : 'bg-white border-gray-200'}`} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Faculty Department</label>
            <input 
              required
              type="text" 
              value={faculty} 
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="e.g., Information Management"
              className={`border p-2.5 rounded-xl outline-none transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-slate-500 text-white' : 'bg-white border-gray-200'}`} 
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button 
            type="submit" 
            disabled={updating}
            className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors ${
              updating 
                ? 'bg-slate-800 text-slate-500 cursor-wait animate-pulse' 
                : (isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800')
            }`}
          >
            {updating ? "Syncing..." : "Update Directory Profile"}
          </button>
        </div>
      </form>

    </div>
  );
}
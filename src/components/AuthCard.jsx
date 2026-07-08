import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function AuthCard({ onAuthSuccess, isDarkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleAuthentication = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isRegisterMode) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Registration link dispatched! Check your email inbox to verify your credentials.");
        setIsRegisterMode(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (onAuthSuccess) onAuthSuccess(data.user);
      }
    } catch (err) {
      setErrorMessage(err.message || "An unexpected security handshaking error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-sm border rounded-3xl p-6 lg:p-8 shadow-xl relative backdrop-blur-md transition-all ${
      isDarkMode ? 'bg-slate-900/60 border-slate-800/80 shadow-black/30' : 'bg-white border-gray-100 shadow-slate-200/40'
    }`}>
      
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-base font-bold tracking-wider uppercase">
          {isRegisterMode ? "Create an Account" : "Log in to Your Account"}
        </h2>
        <p className="text-[10px] text-textMuted tracking-wide">
          {isRegisterMode ? "Register to create your account." : "Sign in to access your account."}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-medium text-center">
          Error: {errorMessage}
        </div>
      )}

      <form onSubmit={handleAuthentication} className="space-y-4 text-xs">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Identity Email</label>
          <input 
            required 
            type="email" 
            placeholder="operator@habitforge.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
              isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-slate-500 text-white placeholder-slate-700' : 'bg-gray-50 border-gray-200 focus:border-slate-400 text-textMain'
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Secret Password</label>
          <input 
            required 
            type="password" 
            placeholder="••••••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full border rounded-xl px-3.5 py-2.5 outline-none font-medium transition-all ${
              isDarkMode ? 'bg-slate-950 border-slate-800 focus:border-slate-500 text-white placeholder-slate-700' : 'bg-gray-50 border-gray-200 focus:border-slate-400 text-textMain'
            }`}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-2.5 font-bold rounded-xl shadow-xs transition-all mt-2 cursor-pointer text-xs uppercase tracking-wider ${
            loading 
              ? 'bg-slate-700 text-slate-400 cursor-wait animate-pulse' 
              : (isDarkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800')
          }`}
        >
          {loading ? "Verifying Token..." : (isRegisterMode ? "Create Account" : "Log In")}
        </button>
      </form>

      <div className="mt-5 text-center border-t border-gray-100/10 pt-3 text-[11px] font-medium text-textMuted">
        {isRegisterMode ? "You're back?" : "First time here?"}{" "}
        <button 
          type="button" 
          onClick={() => setIsRegisterMode(!isRegisterMode)}
          className={`font-bold hover:underline transition-all ml-0.5 bg-transparent border-none cursor-pointer ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          {isRegisterMode ? "Sign In" : "Create Account"}
        </button>
      </div>

    </div>
  );
}
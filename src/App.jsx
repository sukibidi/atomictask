import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import Projects from './pages/Projects';
import Profile from './pages/Profile'; // Added profile page import
import Sidebar from './components/Sidebar';
import AccountabilityHub from './pages/AccountabilityHub';

export default function App() {
  const [sessionUser, setSessionUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("dashboard"); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user || null);
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-slate-500">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
        <span>Initializing Workspace Terminal...</span>
      </div>
    );
  }

  if (!sessionUser) {
    return <Login onAuthSuccess={(user) => setSessionUser(user)} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`h-screen w-screen max-w-full flex overflow-hidden select-none transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'
    }`}>
      
      {/* Sticky Sidebar Navigation Left Pane */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={handleLogout} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Content Viewport Right Pane */}
      <main className={`flex-1 h-screen overflow-y-auto p-6 lg:p-8 flex flex-col justify-start transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}>
        <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12">
          {currentTab === 'dashboard' && <Dashboard isDarkMode={isDarkMode} />}
          {currentTab === 'tasks' && <MyTasks isDarkMode={isDarkMode} />}
          {currentTab === 'projects' && <Projects isDarkMode={isDarkMode} />}
          {currentTab === 'partners' && <AccountabilityHub isDarkMode={isDarkMode} />}
          {currentTab === 'profile' && <Profile isDarkMode={isDarkMode} />} {/* Profile Page Render View */}
        
        </div>
      </main>

    </div>
  );
}
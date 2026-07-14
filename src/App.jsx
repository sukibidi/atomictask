import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import Projects from './pages/Projects';
import Profile from './pages/Profile'; 
import Sidebar from './components/Sidebar';
import AccountabilityHub from './pages/AccountabilityHub';
import AdminDashboard from './pages/AdminDashboard'; // Ensure capitalization matches exactly
import AdminLogs from './pages/AdminLogs';

export default function App() {
  const [sessionUser, setSessionUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("dashboard"); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // NEW: Admin Role Security Tracker State
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function resolveUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSessionUser(session.user);
        
        // Query the public.users database profile table to look up their assigned role_id
        const { data: userProfile } = await supabase
          .from('users')
          .select('role_id')
          .eq('id', session.user.id)
          .single();
          
        if (userProfile && userProfile.role_id === 2) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
      setCheckingAuth(false);
    }

    resolveUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        const { data: userProfile } = await supabase.from('users').select('role_id').eq('id', session.user.id).single();
        setIsAdmin(userProfile?.role_id === 2);
      } else {
        setSessionUser(null);
        setIsAdmin(false);
        setCurrentTab("dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
    setIsAdmin(false);
  };

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-slate-500">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
        <span>Initializing Secured Terminal Session...</span>
      </div>
    );
  }

  if (!sessionUser) {
    return <Login onAuthSuccess={(user) => setSessionUser(user)} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`h-screen w-screen max-w-full flex relative overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'
    }`}>
      
      {/* MOBILE FLOATING BAR */}
      <div className={`lg:hidden fixed top-0 inset-x-0 h-14 px-4 z-40 border-b flex items-center justify-between transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/80 backdrop-blur-md' : 'bg-white/90 border-gray-200 backdrop-blur-md'
      }`}>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-xl border text-sm font-bold transition-all focus:outline-none cursor-pointer ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-gray-50 border-gray-200 text-slate-700'
          }`}
        >
          {isSidebarOpen ? '✕ CLOSE' : '☰ MENU'}
        </button>

        <span className="font-mono text-xs font-black tracking-wider uppercase">ATOMIC FORGE</span>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-xs p-1 cursor-pointer select-none rounded-full hover:bg-slate-800/60 transition-colors"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '◐' : '◑'}
        </button>
      </div>

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30" />}

      {/* RESPONSIVE SIDEBAR */}
      <div className={`fixed lg:static top-0 bottom-0 left-0 z-50 h-full transition-transform duration-300 lg:transform-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          onLogout={handleLogout} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          closeMobileDrawer={() => setIsSidebarOpen(false)}
          isAdmin={isAdmin} // SECURED FLAG PASSED DOWN HERE
        />
      </div>
      
      {/* MAIN VIEWPORT REGION */}
      <main className={`flex-1 h-screen overflow-y-auto pt-20 lg:pt-8 p-4 sm:p-6 lg:p-8 flex flex-col justify-start transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}>
        <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 pb-12">
          
          {currentTab === 'dashboard' && <Dashboard isDarkMode={isDarkMode} />}
          {currentTab === 'tasks' && <MyTasks isDarkMode={isDarkMode} />}
          {currentTab === 'projects' && <Projects isDarkMode={isDarkMode} />}
          {currentTab === 'partners' && <AccountabilityHub isDarkMode={isDarkMode} />}
          {currentTab === 'profile' && <Profile isDarkMode={isDarkMode} />}
          
          {/* HARD SECURITY BLOCK ROUTE FOR ADMIN TERMINAL VIEW */}
          {currentTab === 'admin' && (
            isAdmin ? (
              <AdminDashboard isDarkMode={isDarkMode} />
            ) : (
              /* If a sneaky student manually triggers currentTab = 'admin', this access denied page displays instantly */
              <div className="p-12 text-center border border-dashed rounded-2xl border-rose-500/20 bg-rose-500/5 max-w-md mx-auto space-y-2 font-mono text-xs">
                <span className="text-2xl block">🛑</span>
                <h2 className="text-rose-500 font-bold uppercase tracking-wider">Access Restrained</h2>
                <p className="text-textMuted leading-relaxed">Your account parameters do not contain administrative clearance keys. This security breach has been cataloged.</p>
              </div>
            )
          )}

          {/* HARD SECURITY BLOCK ROUTE FOR DATABASE AUDIT LOGS VIEW */}
          {currentTab === 'adminLogs' && (
            isAdmin ? (
              <AdminLogs isDarkMode={isDarkMode} />
            ) : (
              <div className="p-12 text-center border border-dashed rounded-2xl border-rose-500/20 bg-rose-500/5 max-w-md mx-auto space-y-2 font-mono text-xs">
                <span className="text-2xl block">🛑</span>
                <h2 className="text-rose-500 font-bold uppercase tracking-wider">Access Restrained</h2>
                <p className="text-textMuted leading-relaxed">Your account parameters do not contain administrative clearance keys. This security breach has been cataloged.</p>
              </div>
            )
          )}
        
        </div>
      </main>

    </div>
  );
}
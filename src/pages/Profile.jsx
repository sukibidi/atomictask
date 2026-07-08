import React from 'react';
import ProfileUpdate from '../components/ProfileUpdate';

export default function Profile({ isDarkMode }) {
  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      
      {/* Page Title Header */}
      <div className="text-left">
        <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Profile Settings
        </h1>
        <p className="text-xs text-textMuted mt-1">
          Configure your student credentials and fine-tune your cockpit terminal settings.
        </p>
      </div>

      {/* Profile Update Core Component */}
      <div className="pt-2">
        <ProfileUpdate isDarkMode={isDarkMode} />
      </div>

    </div>
  );
}
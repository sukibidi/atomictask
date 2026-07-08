import React, { useState } from 'react';

export default function AcademicTimetable({ 
  baseDaysMap = {}, isManageMode, setIsManageMode, onAddClass, onUpdateClass, onDeleteClass, isDarkMode 
}) {
  // --- CREATE FORM STATE MATRIX ---
  const [formDay, setFormDay] = useState("Mon");
  const [formSubject, setFormSubject] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formLecturer, setFormLecturer] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formColor, setFormColor] = useState("bg-blue-50 text-blue-600 border-blue-200");

  // --- FULL EDIT/UPDATE MODAL STATE ---
  const [editingClass, setEditingClass] = useState(null); 
  const [editSubject, setEditSubject] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editLecturer, setEditLecturer] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onAddClass({
      day: formDay,
      subject: formSubject,
      label: formLabel,
      lecturer: formLecturer || 'N/A',
      time: formTime || 'TBD',
      room: formRoom || 'TBD',
      color: formColor
    });
    setFormSubject(""); setFormLabel(""); setFormLecturer(""); setFormTime(""); setFormRoom("");
  };

  const openEditModal = (course) => {
    setEditingClass(course);
    setEditSubject(course.subject || "");
    setEditLabel(course.label || "");
    setEditLecturer(course.lecturer || "");
    setEditTime(course.time || "");
    setEditRoom(course.room || "");
    setEditColor(course.color || "bg-blue-50 text-blue-600 border-blue-200");
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingClass) return;

    onUpdateClass(editingClass.id, {
      subject: editSubject,
      label: editLabel,
      lecturer: editLecturer,
      time: editTime,
      room: editRoom,
      color: editColor
    });

    setEditingClass(null); 
  };

  const handleDragStart = (e, classId) => {
    e.dataTransfer.setData("text/plain", classId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, targetDay) => {
    e.preventDefault();
    const classId = e.dataTransfer.getData("text/plain");
    if (classId) {
      onUpdateClass(classId, { day: targetDay });
    }
  };

  return (
    <div className={`w-full overflow-hidden border rounded-2xl shadow-sm flex flex-col justify-between transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100'
    }`}>
      
      {/* Header controls layout block */}
      <div className={`px-5 py-4 border-b flex justify-between items-center ${
        isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50/40 border-gray-100'
      }`}>
        <div>
          <h3 className="text-sm font-bold">Academic Schedule</h3>
          <p className="text-[11px] text-textMuted mt-0.5">Click cells to edit. Hover to reveal full names and course configurations smoothly.</p>
        </div>
        <button 
          onClick={() => setIsManageMode(!isManageMode)} 
          className={`px-3 py-1 text-xs border rounded-xl font-semibold transition-all cursor-pointer ${
            isManageMode 
              ? 'bg-orange-50 border-orange-200 text-orange-600' 
              : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white' : 'bg-white border-gray-200 text-textMuted hover:border-gray-400')
          }`}
        >
          {isManageMode ? "✕ Close Panel" : "⚙️ Manage Classes"}
        </button>
      </div>
      
      {/* Manage / Create Inputs strip */}
      {isManageMode && (
        <form onSubmit={handleCreateSubmit} className={`p-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50'}`}>
          <select value={formDay} onChange={(e)=>setFormDay(e.target.value)} className={`border p-2 rounded-lg outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-textMain'}`}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <option key={d} value={d} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>{d}</option>)}
          </select>
          <input required placeholder="Subject (e.g., IMS564)" value={formSubject} onChange={(e)=>setFormSubject(e.target.value)} className={`border p-2 rounded-lg outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white'}`} />
          <input required placeholder="Short Label" value={formLabel} onChange={(e)=>setFormLabel(e.target.value)} className={`border p-2 rounded-lg outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white'}`} maxLength={11} />
          <select value={formColor} onChange={(e)=>setFormColor(e.target.value)} className={`border p-2 rounded-lg outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-textMain'}`}>
            <option value="bg-teal-50 text-teal-600 border-teal-200">🟢 TEAL</option>
            <option value="bg-blue-50 text-blue-600 border-blue-200">🔵 BLUE</option>
            <option value="bg-purple-50 text-purple-600 border-purple-200">🔮 PURPLE</option>
            <option value="bg-amber-50 text-amber-600 border-amber-200">🟡 AMBER</option>
          </select>
          <input placeholder="Lecturer Name" value={formLecturer} onChange={(e)=>setFormLecturer(e.target.value)} className={`border p-2 rounded-lg outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white'}`} />
          <input placeholder="Time" value={formTime} onChange={(e)=>setFormTime(e.target.value)} className={`border p-2 rounded-lg outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white'}`} />
          <input placeholder="Room" value={formRoom} onChange={(e)=>setFormRoom(e.target.value)} className={`border p-2 rounded-lg outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white'}`} />
          <button type="submit" className={`p-2 rounded-lg font-bold cursor-pointer transition-colors ${isDarkMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-black text-white hover:bg-gray-800'}`}>Add Class</button>
        </form>
      )}

      {/* Grid Landscape Board */}
      <div className="overflow-x-auto">
        <div className={`min-w-[800px] grid grid-cols-7 divide-x text-xs pt-2 ${isDarkMode ? 'divide-slate-800/80' : 'divide-gray-100'}`}>
          {Object.keys(baseDaysMap).map((day) => {
            const isToday = day === "Tue";
            const dayClasses = baseDaysMap[day] || [];

            return (
              <div 
                key={day} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, day)}
                className={`p-2.5 min-h-[300px] space-y-3 transition-colors ${
                  isToday ? (isDarkMode ? 'bg-slate-800/30' : 'bg-blue-50/10') : ''
                } hover:bg-slate-500/5`}
              >
                <div className={`text-center pb-1 border-b font-bold uppercase text-[11px] tracking-wide ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-gray-50 text-textMuted'}`}>
                  <span className={isToday ? "text-emerald-400 font-extrabold" : ""}>{day}</span>
                </div>
                
                <div className="space-y-2">
                  {dayClasses.map((course) => (
                    <div 
                      key={course.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, course.id)}
                      onClick={() => openEditModal(course)}
                      /* UPDATED LIMITS: Adjusted min/max scale capacities to safely support un-truncating lines */
                      className={`group relative p-3 border rounded-xl flex flex-col text-left justify-between min-h-[92px] max-h-[92px] hover:max-h-[260px] transition-all duration-300 ease-in-out shadow-3xs cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-md overflow-hidden ${
                        isDarkMode 
                          ? 'bg-slate-800/90 border-slate-700/80 text-slate-200 hover:border-slate-400' 
                          : (course.color || 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400')
                      }`}
                    >
                      {isManageMode && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteClass(course.id, course.label); }} 
                          className="absolute top-2 right-2 bg-red-500 text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold border border-white shadow-sm cursor-pointer z-30"
                        >
                          ✕
                        </button>
                      )}
                      
                      {/* Standard Default Presentation Frame View */}
                      <div>
                        {/* FIXED: Subject label un-truncates and expands into full word wrapping on card hover */}
                        <div className="font-bold text-xs tracking-tight truncate group-hover:whitespace-normal group-hover:break-words pr-4" title={course.subject}>
                          {course.label}
                        </div>
                        {course.lecturer && course.lecturer !== 'N/A' && (
                          <div className="text-[10px] opacity-60 truncate font-medium mt-0.5 group-hover:hidden">
                            {course.lecturer}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 space-y-0.5 border-t pt-1.5 border-current/10 pointer-events-none group-hover:hidden transition-opacity duration-200">
                        {course.time && <div className="text-[9px] font-mono tracking-tight opacity-75 font-semibold">🕒 {course.time}</div>}
                        {course.room && <div className={`text-[9px] font-bold truncate ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>📍 {course.room}</div>}
                      </div>

                      {/* ==========================================================================
                          UPGRADED ACCORDION VIEW: Complete un-truncated layout wrapping fields
                          ========================================================================== */}
                      <div className="mt-2 pt-2 border-t border-current/10 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out hidden group-hover:flex flex-col text-[10px] pointer-events-none">
                        <div>
                          <span className="opacity-50 font-bold block uppercase text-[8px] tracking-wide">Subject Catalog</span>
                          <span className="font-bold tracking-tight text-slate-400 dark:text-emerald-400 block whitespace-normal break-words">{course.subject || course.label}</span>
                        </div>
                        
                        {course.lecturer && course.lecturer !== 'N/A' && (
                          <div>
                            <span className="opacity-50 font-bold block uppercase text-[8px] tracking-wide">Lecturer</span>
                            {/* FIXED: Erased the truncate filter class on hover layout so the full name wraps natively */}
                            <span className="font-semibold text-textMain dark:text-slate-200 block whitespace-normal break-words leading-tight">
                              {course.lecturer}
                            </span>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 pt-0.5 border-t border-current/5">
                          <div>
                            <span className="opacity-50 font-bold block uppercase text-[8px] tracking-wide">Schedule</span>
                            <span className="font-mono font-semibold block">{course.time || 'TBD'}</span>
                          </div>
                          <div>
                            <span className="opacity-50 font-bold block uppercase text-[8px] tracking-wide">Location</span>
                            <span className={`font-bold block whitespace-normal break-words ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>📍 {course.room || 'TBD'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full edit schema workflow overlay config sheet modal */}
      {editingClass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className={`w-full max-w-md border rounded-2xl shadow-2xl p-6 transition-all transform scale-100 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-textMain'
          }`}>
            
            <div className="flex justify-between items-start border-b border-gray-100/10 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">⚙️ Edit Class Configuration</h4>
                <p className="text-[11px] text-textMuted mt-0.5">Updating data properties for node: {editingClass.label}</p>
              </div>
              <button type="button" onClick={() => setEditingClass(null)} className="text-gray-400 hover:text-rose-500 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Display Tag Label</label>
                  <input required type="text" value={editLabel} onChange={(e)=>setEditLabel(e.target.value)} className={`border p-2.5 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} maxLength={11} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Full Subject Catalog</label>
                  <input required type="text" value={editSubject} onChange={(e)=>setEditSubject(e.target.value)} className={`border p-2.5 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Responsible Lecturer</label>
                <input type="text" value={editLecturer} onChange={(e)=>setEditLecturer(e.target.value)} className={`border p-2.5 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Time Block Interval</label>
                  <input type="text" value={editTime} onChange={(e)=>setEditTime(e.target.value)} className={`border p-2.5 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Room Location</label>
                  <input type="text" value={editRoom} onChange={(e)=>setEditRoom(e.target.value)} className={`border p-2.5 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Card Color Paradigm Accent</label>
                <select value={editColor} onChange={(e)=>setEditColor(e.target.value)} className={`border p-2.5 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-textMain'}`}>
                  <option value="bg-teal-50 text-teal-600 border-teal-200">🟢 TEAL TRACK</option>
                  <option value="bg-blue-50 text-blue-600 border-blue-200">🔵 BLUE TRACK</option>
                  <option value="bg-purple-50 text-purple-600 border-purple-200">🔮 PURPLE TRACK</option>
                  <option value="bg-amber-50 text-amber-600 border-amber-200">🟡 AMBER TRACK</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100/10">
                <button type="button" onClick={() => setEditingClass(null)} className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-textMuted hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit" className={`px-5 py-2 rounded-xl font-bold cursor-pointer transition-colors ${isDarkMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-black text-white hover:bg-gray-800'}`}>
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
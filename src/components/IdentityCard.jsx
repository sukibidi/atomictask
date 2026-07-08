import React from 'react';

export default function IdentityCard({ completedCount }) {
  const totalXp = completedCount * 20; 
  const xpPerLevel = 100;
  const currentLevel = Math.floor(totalXp / xpPerLevel) + 1;
  const currentXpInLevel = totalXp % xpPerLevel;
  const xpPercentage = (currentXpInLevel / xpPerLevel) * 100;

  const identityStatementsMatrix = [
    { title: "Novice Builder", statement: "Turning raw thoughts into code, one tiny atomic step at a time." },
    { title: "Momentum Maker", statement: "Stacking daily milestone cards and launching consistent iterations." },
    { title: "Code Artisan", statement: "Crafting structured execution flows and reliable database tables." },
    { title: "System Architect", statement: "Designing scalable components and mapping clean layout matrices." },
    { title: "Unstoppable Force", statement: "Master of consistency and execution, shipping every single day." }
  ];

  const activeLevelConfig = identityStatementsMatrix[Math.min(currentLevel - 1, identityStatementsMatrix.length - 1)];

  return (
    <div className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
      <div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold tracking-wider opacity-60 uppercase">Evolving Identity Statement</span>
          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md uppercase tracking-wide">
            LVL {currentLevel} · {activeLevelConfig.title}
          </span>
        </div>
        <h2 className="text-base font-medium mt-3 tracking-tight">
          "{activeLevelConfig.statement}"
        </h2>
      </div>
      
      <div className="mt-5">
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full transition-all duration-500" 
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] opacity-70 mt-2 font-mono font-medium">
          <span>{currentXpInLevel} / {xpPerLevel} XP TO LEVEL UP</span>
          <span>TOTAL SHIPMENT COUNT: {completedCount}</span>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { useSession } from '../context/SessionContext';
import { Terminal, Users, FileCode, Rocket } from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, session, triggerHaptic } = useSession();

  const isRunning = session?.status === 'RUNNING' || session?.status === 'VERIFYING';
  const isAwaitingApproval = session?.status === 'AWAITING_APPROVAL';
  const isLaunchReady = session?.status === 'LAUNCH_READY' || session?.status === 'APPROVED';

  // Real artifact count from session
  const artifactCount = Object.keys(session?.artifacts || {}).length;

  const tabs = [
    { id: 'command', label: 'Command', icon: Terminal },
    { id: 'workforce', label: 'Workforce', icon: Users, badge: isRunning },
    { id: 'artifacts', label: 'Outputs', icon: FileCode, count: artifactCount },
    { id: 'launch', label: 'Launch', icon: Rocket, alert: isAwaitingApproval, success: isLaunchReady },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 w-full shrink-0 z-30 bg-[#080C16]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]">
      <div className="w-full grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic([40]);
                setActiveTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition duration-150 min-h-[46px] select-none ${
                isActive ? 'text-emerald-400 bg-slate-900/90' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
                {tab.alert && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-bold bg-emerald-500 text-slate-950 rounded-full animate-bounce">
                    1
                  </span>
                )}
                {tab.count > 0 && !isActive && (
                  <span className="absolute -top-1 -right-2.5 px-1 py-0.2 text-[8px] font-bold bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

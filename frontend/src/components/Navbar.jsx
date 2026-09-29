import React from 'react';
import { useSession } from '../context/SessionContext';
import { PlusCircle } from 'lucide-react';
import UdyamLogo from './UdyamLogo';

export default function Navbar() {
  const { session, wsStatus, startNewSession, loading } = useSession();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RUNNING':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">WORKFORCE RUNNING</span>;
      case 'VERIFYING':
        return <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">VERIFYING</span>;
      case 'AWAITING_APPROVAL':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs font-semibold">APPROVAL REQUIRED</span>;
      case 'LAUNCH_READY':
        return <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full text-xs font-semibold">🚀 LAUNCH READY</span>;
      case 'FAILED':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full text-xs font-semibold">HALTED</span>;
      default:
        return (
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-400' : wsStatus === 'reconnecting' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
            {wsStatus === 'connected' ? 'Live' : wsStatus === 'reconnecting' ? 'Reconnecting' : 'Offline'}
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080C16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Dominant Product Brand */}
        <UdyamLogo size="sm" showWordmark />

        {/* Status Pill & Action */}
        <div className="flex items-center gap-2">
          {session ? getStatusBadge(session.status) : (
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              System Online
            </span>
          )}
          
          <button
            onClick={() => startNewSession()}
            disabled={loading}
            title="Start New Venture"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white active:scale-95 transition"
            aria-label="New Session"
          >
            <PlusCircle size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}

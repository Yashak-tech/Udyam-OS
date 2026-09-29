import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import {
  Rocket,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Activity,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import UdyamLogo from '../components/UdyamLogo';
import ExecutionGraph from '../components/ExecutionGraph';
import CompanyMemoryCard from '../components/CompanyMemoryCard';
import DecisionLedgerCard from '../components/DecisionLedgerCard';
import CompanyTimelineCard from '../components/CompanyTimelineCard';
import SharedCompanyContextModal from '../components/SharedCompanyContextModal';
import { reconcileSessionState } from '../utils/stateReconciliation';

export default function HomeScreen({ onStartGoal }) {
  const { session, startNewSession, loading, setActiveTab } = useSession();
  const [showContextModal, setShowContextModal] = useState(false);

  const recon = reconcileSessionState(session);
  const hasActiveSession = session && session.status !== 'CREATED' && session.status !== 'FAILED';

  const handleStart = async () => {
    if (!session) {
      await startNewSession();
    }
    onStartGoal();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LAUNCH_READY':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            LAUNCH READY
          </span>
        );
      case 'AWAITING_APPROVAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
            AWAITING APPROVAL
          </span>
        );
      case 'RUNNING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse">
            WORKFORCE RUNNING
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
            {status || 'IDLE'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* 1. Primary Hero Positioning */}
      <div className="text-center pt-2 pb-1">
        <div className="flex justify-center mb-2.5">
          <UdyamLogo size="md" />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight leading-tight mb-1">
          UDYAM OS
        </h1>
        <p className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-2">
          THE AI COMPANY COMMAND CENTER
        </p>
        <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
          Give your business objective.
          <br />
          <span className="text-emerald-300 font-semibold">Udyam coordinates the workforce.</span>
        </p>
      </div>

      {/* 2. Active Venture Card */}
      {hasActiveSession ? (
        <div className="udyam-glass-card rounded-2xl p-4 border border-emerald-500/30 shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              ACTIVE VENTURE
            </span>
            {getStatusBadge(session.status)}
          </div>

          <div>
            <h2 className="text-base font-extrabold text-white">
              {session.goal?.project_name || 'Venture in progress'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">
              {session.goal?.tagline || session.goal?.raw_intent?.raw_input}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setActiveTab('workforce')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              <span>Workforce Status</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setShowContextModal(true)}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Layers size={14} className="text-sky-400" />
              <span>Context</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="udyam-glass-card rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Rocket size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Start a New Venture</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              State a business goal to commission Research, Product, Builder, and Growth specialists.
            </p>
          </div>
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition"
          >
            <span>START A NEW VENTURE</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* 3. Section: COMPANY CONTROL CENTER (Section 6 Requirement) */}
      <div className="udyam-glass-card rounded-2xl p-4 border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              COMPANY CONTROL CENTER
            </h3>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 font-bold">
            Executive View
          </span>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-900 space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pb-1 border-b border-slate-900">
            <span className="text-emerald-400 font-bold">UDYAM MANAGER</span>
            <span>Orchestration Core</span>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-center gap-2 text-slate-200">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                hasActiveSession ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                ✓
              </span>
              <span>Company objective received</span>
            </div>

            <div className="flex items-center gap-2 text-slate-200">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                recon.isPipelineRunning || recon.allCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                ✓
              </span>
              <span>Workforce coordinated</span>
            </div>

            <div className="flex items-center gap-2 text-slate-200">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                recon.allCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                ✓
              </span>
              <span>4 specialists completed</span>
            </div>

            <div className="flex items-center gap-2 text-slate-200">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                session?.verification?.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                ✓
              </span>
              <span>Quality verification passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Visual Execution Graph (Section 7 Requirement) */}
      <ExecutionGraph session={session} />

      {/* 5. Company Memory (Section 19 Requirement) */}
      <CompanyMemoryCard context={session?.context} />

      {/* 6. Decision Ledger (Section 21 Requirement) */}
      <DecisionLedgerCard context={session?.context} goal={session?.goal} />

      {/* 7. Company Timeline (Section 22 Requirement) */}
      <CompanyTimelineCard session={session} />

      {/* Full Shared Context Modal */}
      {showContextModal && (
        <SharedCompanyContextModal
          context={session?.context}
          onClose={() => setShowContextModal(false)}
        />
      )}
    </div>
  );
}

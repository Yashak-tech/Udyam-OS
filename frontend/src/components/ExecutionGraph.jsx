import React from 'react';
import { CheckCircle2, Loader2, Circle, ArrowDown, ChevronRight } from 'lucide-react';
import { getAgentTaskStatus } from '../utils/stateReconciliation';

export default function ExecutionGraph({ session }) {
  const isGoalReceived = !!session?.goal;
  const researchStatus = getAgentTaskStatus(session, 'ResearchAgent');
  const productStatus = getAgentTaskStatus(session, 'ProductAgent');
  const builderStatus = getAgentTaskStatus(session, 'BuilderAgent');
  const growthStatus = getAgentTaskStatus(session, 'GrowthAgent');

  const isVerifying = session?.status === 'VERIFYING';
  const isVerified = ['AWAITING_APPROVAL', 'APPROVED', 'LAUNCH_READY'].includes(session?.status);
  const isApproved = ['APPROVED', 'LAUNCH_READY'].includes(session?.status);
  const isLaunchReady = session?.status === 'LAUNCH_READY';

  const getNodeBadge = (status, isExplicitCompleted = false) => {
    if (isExplicitCompleted || status === 'COMPLETED') {
      return (
        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
          <CheckCircle2 size={11} strokeWidth={2.5} />
        </span>
      );
    }
    if (status === 'RUNNING') {
      return (
        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
          <Loader2 size={10} className="animate-spin" />
        </span>
      );
    }
    return (
      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center shrink-0">
        <Circle size={8} />
      </span>
    );
  };

  return (
    <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
            Workforce Execution Graph
          </span>
        </div>
        <span className="text-[9px] font-mono text-slate-500">Autonomous Orchestration</span>
      </div>

      <div className="flex flex-col items-center space-y-1.5 pt-1 text-xs">
        {/* Node 1: Founder Objective */}
        <div className="w-full max-w-[280px] bg-slate-950 p-2 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getNodeBadge(isGoalReceived ? 'COMPLETED' : 'IDLE', isGoalReceived)}
            <span className="font-semibold text-slate-200 text-[11px]">FOUNDER OBJECTIVE</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">Intake</span>
        </div>

        <ArrowDown size={13} className="text-slate-600 shrink-0" />

        {/* Node 2: Udyam Manager */}
        <div className="w-full max-w-[280px] bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            {getNodeBadge('COMPLETED', isGoalReceived)}
            <span className="font-bold text-emerald-300 text-[11px]">UDYAM MANAGER</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 font-semibold">Orchestrator</span>
        </div>

        <ArrowDown size={13} className="text-slate-600 shrink-0" />

        {/* Node 3: Specialist Cluster */}
        <div className="w-full max-w-[320px] grid grid-cols-3 gap-1.5">
          {/* Research */}
          <div className={`p-2 rounded-xl border flex flex-col items-center text-center transition ${
            researchStatus === 'COMPLETED'
              ? 'bg-slate-950 border-emerald-500/30 text-emerald-300'
              : researchStatus === 'RUNNING'
              ? 'bg-slate-950 border-amber-500/40 text-amber-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className="mb-1">{getNodeBadge(researchStatus)}</div>
            <span className="text-[10px] font-bold">RESEARCH</span>
            <span className="text-[8px] font-mono text-slate-400">Market</span>
          </div>

          {/* Product */}
          <div className={`p-2 rounded-xl border flex flex-col items-center text-center transition ${
            productStatus === 'COMPLETED'
              ? 'bg-slate-950 border-emerald-500/30 text-emerald-300'
              : productStatus === 'RUNNING'
              ? 'bg-slate-950 border-amber-500/40 text-amber-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className="mb-1">{getNodeBadge(productStatus)}</div>
            <span className="text-[10px] font-bold">PRODUCT</span>
            <span className="text-[8px] font-mono text-slate-400">PRD / MVP</span>
          </div>

          {/* Builder */}
          <div className={`p-2 rounded-xl border flex flex-col items-center text-center transition ${
            builderStatus === 'COMPLETED'
              ? 'bg-slate-950 border-emerald-500/30 text-emerald-300'
              : builderStatus === 'RUNNING'
              ? 'bg-slate-950 border-amber-500/40 text-amber-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className="mb-1">{getNodeBadge(builderStatus)}</div>
            <span className="text-[10px] font-bold">BUILDER</span>
            <span className="text-[8px] font-mono text-slate-400">Experience</span>
          </div>
        </div>

        <ArrowDown size={13} className="text-slate-600 shrink-0" />

        {/* Node 4: Growth Specialist */}
        <div className={`w-full max-w-[280px] p-2 rounded-xl border flex items-center justify-between transition ${
          growthStatus === 'COMPLETED'
            ? 'bg-slate-950 border-emerald-500/30 text-emerald-300'
            : growthStatus === 'RUNNING'
            ? 'bg-slate-950 border-amber-500/40 text-amber-300'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            {getNodeBadge(growthStatus)}
            <span className="font-bold text-[11px]">GROWTH AGENT</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">GTM Strategy</span>
        </div>

        <ArrowDown size={13} className="text-slate-600 shrink-0" />

        {/* Node 5: Verification & Quality Gate */}
        <div className={`w-full max-w-[280px] p-2 rounded-xl border flex items-center justify-between transition ${
          isVerified
            ? 'bg-slate-950 border-emerald-500/30 text-emerald-300'
            : isVerifying
            ? 'bg-slate-950 border-sky-500/40 text-sky-300 animate-pulse'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            {getNodeBadge(isVerified ? 'COMPLETED' : isVerifying ? 'RUNNING' : 'IDLE', isVerified)}
            <span className="font-semibold text-[11px]">12-POINT QUALITY AUDIT</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 font-bold">
            {isVerified ? '12/12' : 'Gate'}
          </span>
        </div>

        <ArrowDown size={13} className="text-slate-600 shrink-0" />

        {/* Node 6: Founder Approval Gate */}
        <div className={`w-full max-w-[280px] p-2 rounded-xl border flex items-center justify-between transition ${
          isApproved
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            : session?.status === 'AWAITING_APPROVAL'
            ? 'bg-amber-950/20 border-amber-500/50 text-amber-300 animate-pulse'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            {getNodeBadge(isApproved ? 'COMPLETED' : session?.status === 'AWAITING_APPROVAL' ? 'RUNNING' : 'IDLE', isApproved)}
            <span className="font-bold text-[11px]">FOUNDER APPROVAL</span>
          </div>
          <span className="text-[9px] font-mono text-amber-400 font-bold">Authority</span>
        </div>

        <ArrowDown size={13} className="text-slate-600 shrink-0" />

        {/* Node 7: Launch Ready */}
        <div className={`w-full max-w-[280px] p-2.5 rounded-xl border flex items-center justify-between shadow-lg transition ${
          isLaunchReady
            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500 text-white'
            : 'bg-slate-950/60 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            {getNodeBadge(isLaunchReady ? 'COMPLETED' : 'IDLE', isLaunchReady)}
            <span className="font-extrabold text-[12px] tracking-wide">🚀 LAUNCH READY</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 font-bold">Package Sealed</span>
        </div>
      </div>
    </div>
  );
}

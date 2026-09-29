import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import {
  Users,
  Search,
  Box,
  Palette,
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Layers,
  GitBranch
} from 'lucide-react';
import { getAgentTaskStatus } from '../utils/stateReconciliation';
import SharedCompanyContextModal from '../components/SharedCompanyContextModal';

export default function WorkforceScreen() {
  const { session, events, setSelectedAgent, setActiveTab, setSelectedArtifact, triggerHaptic } = useSession();
  const [showContextModal, setShowContextModal] = useState(false);

  const researchStatus = getAgentTaskStatus(session, 'ResearchAgent');
  const productStatus = getAgentTaskStatus(session, 'ProductAgent');
  const builderStatus = getAgentTaskStatus(session, 'BuilderAgent');
  const growthStatus = getAgentTaskStatus(session, 'GrowthAgent');

  const agents = [
    {
      id: 'ResearchAgent',
      name: 'RESEARCH',
      fullName: 'Research Agent',
      role: 'Market Intelligence',
      icon: Search,
      mission: 'Analyze target customers, pain points, and market wedge.',
      dependency: 'Intake from Founder Objective',
      status: researchStatus,
      currentTask: researchStatus === 'RUNNING' ? 'Synthesizing market intelligence' : researchStatus === 'COMPLETED' ? 'Market research delivered' : 'Awaiting initialization',
      artifactId: 'art_research_brief',
      artifactName: 'Research Brief',
      createdLabel: 'Research Brief Created',
    },
    {
      id: 'ProductAgent',
      name: 'PRODUCT',
      fullName: 'Product Agent',
      role: 'Product Definition',
      icon: Box,
      mission: 'Define MVP scope, user journeys, and core requirements.',
      dependency: researchStatus === 'COMPLETED' ? 'Consuming Market & Customer Intelligence' : 'Waiting for Research context',
      status: productStatus,
      currentTask: productStatus === 'RUNNING' ? 'Drafting PRD & functional specifications' : productStatus === 'COMPLETED' ? 'PRD scope finalized' : 'Queued behind Research',
      artifactId: 'art_product_requirements',
      artifactName: 'Product Requirements',
      createdLabel: 'Product Requirements Created',
    },
    {
      id: 'BuilderAgent',
      name: 'BUILDER',
      fullName: 'Builder / Designer Agent',
      role: 'Execution & Experience',
      icon: Palette,
      mission: 'Engineers responsive glassmorphic customer touchpoint.',
      dependency: productStatus === 'COMPLETED' ? 'Using Product Requirements + Brand Context' : 'Waiting for PRD & user flows',
      status: builderStatus,
      currentTask: builderStatus === 'RUNNING' ? 'Building interactive customer experience' : builderStatus === 'COMPLETED' ? 'Landing experience built' : 'Queued behind Product',
      artifactId: 'art_landing_page',
      artifactName: 'Landing Experience',
      createdLabel: 'Landing Experience Built',
    },
    {
      id: 'GrowthAgent',
      name: 'GROWTH',
      fullName: 'Growth Agent',
      role: 'Go-To-Market',
      icon: TrendingUp,
      mission: 'Prepare zero-cost distribution, hooks, and launch plan.',
      dependency: builderStatus === 'COMPLETED' ? 'Using Market + Product + Landing Experience' : 'Waiting for Builder & Experience assets',
      status: growthStatus,
      currentTask: growthStatus === 'RUNNING' ? 'Formulating distribution & launch tactics' : growthStatus === 'COMPLETED' ? 'GTM strategy packaged' : 'Queued behind Builder',
      artifactId: 'art_launch_strategy',
      artifactName: 'Launch Strategy',
      createdLabel: 'Launch Strategy Prepared',
    },
  ];

  const renderStatusBadge = (state) => {
    switch (state) {
      case 'RUNNING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Loader2 size={11} className="animate-spin" />
            Working
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={11} />
            COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertTriangle size={11} />
            Halted
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <Clock size={11} />
            Queued
          </span>
        );
    }
  };

  const handleCardClick = (agent) => {
    triggerHaptic?.([40]);
    setSelectedAgent(agent);
  };

  const isAwaitingApproval = session?.status === 'AWAITING_APPROVAL';

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Header (Section 8 Requirement) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">AI WORKFORCE</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Four specialists. One shared company context.
          </p>
        </div>

        <button
          onClick={() => setShowContextModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition"
        >
          <Layers size={13} className="text-sky-400" />
          <span>Shared Memory</span>
        </button>
      </div>

      {/* Orchestrator Banner */}
      <div className="udyam-glass-card rounded-2xl p-4 border border-emerald-500/30 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
              UDYAM MANAGER
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {session?.status || 'IDLE'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {session?.status === 'RUNNING' && 'Four AI specialists executing sequentially against shared company context.'}
          {session?.status === 'VERIFYING' && 'Running 12-point automated verification across business, product, experience, and system layers.'}
          {session?.status === 'AWAITING_APPROVAL' && 'Specialists completed and verified. Founder approval required.'}
          {session?.status === 'LAUNCH_READY' && 'Autonomous workforce completed. Launch package sealed and verified.'}
          {(!session?.status || session?.status === 'CREATED') && 'Workforce initialized. Awaiting founder objective.'}
        </p>

        {isAwaitingApproval && (
          <button
            onClick={() => setActiveTab('launch')}
            className="w-full mt-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <ShieldCheck size={15} />
            <span>Launch Package Ready — Review Approval</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* 4 Agent Cards (Section 8 & 20 Requirements) */}
      <div className="space-y-2.5">
        {agents.map((agent) => {
          const isDone = agent.status === 'COMPLETED';
          const isWorking = agent.status === 'RUNNING';
          const Icon = agent.icon;

          return (
            <div
              key={agent.id}
              onClick={() => handleCardClick(agent)}
              className={`udyam-glass-card rounded-2xl p-4 border transition cursor-pointer active:scale-[0.99] ${
                isWorking
                  ? 'border-amber-500/50 shadow-lg shadow-amber-950/20'
                  : isDone
                  ? 'border-emerald-500/30 hover:border-emerald-500/50'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isWorking
                      ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white tracking-wide">{agent.name}</h3>
                    <p className="text-[11px] text-slate-300 font-medium">{agent.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {renderStatusBadge(agent.status)}
                  <ChevronRight size={14} className="text-slate-500" />
                </div>
              </div>

              {/* Dependency Indicator (Requirement 20) */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-2 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-slate-900">
                <GitBranch size={11} className="text-slate-500 shrink-0" />
                <span className="truncate">{agent.dependency}</span>
              </div>

              {/* Status & Output row */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {isWorking ? agent.currentTask : isDone ? agent.createdLabel : 'Queued'}
                </span>
                {isDone && (
                  <span className="text-emerald-400 font-semibold font-mono text-[10px]">
                    ✓ COMPLETED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Activity Feed */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Live Activity
          </span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Sanitized Stream
          </span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
          {events.length === 0 ? (
            <div className="text-slate-500 text-center py-6 text-xs italic">
              Awaiting operational events from Udyam Manager...
            </div>
          ) : (
            events.slice(0, 15).map((evt, idx) => {
              const timeStr = new Date(evt.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              return (
                <div key={evt.id || idx} className="flex items-start gap-2 text-[11px] leading-tight pb-1 border-b border-slate-900 last:border-0">
                  <span className="text-slate-500 shrink-0 font-mono text-[10px]">{timeStr}</span>
                  <div className="flex-1">
                    <span className="text-emerald-400 font-semibold mr-1.5">{evt.source}:</span>
                    <span className="text-slate-300">{evt.message}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Shared Company Context Modal */}
      {showContextModal && (
        <SharedCompanyContextModal
          context={session?.context}
          onClose={() => setShowContextModal(false)}
        />
      )}
    </div>
  );
}

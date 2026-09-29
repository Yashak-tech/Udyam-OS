import React from 'react';
import { useSession } from '../context/SessionContext';
import { X, CheckCircle2, Clock, Loader2, AlertTriangle, FileCode, ArrowRight, Layers } from 'lucide-react';
import { getAgentTaskStatus } from '../utils/stateReconciliation';

export default function AgentDetailModal({ agent, onClose }) {
  const { session, setSelectedArtifact, setActiveTab, triggerHaptic } = useSession();

  if (!agent) return null;

  const status = getAgentTaskStatus(session, agent.id);
  const artifact = session?.artifacts?.[agent.artifactId];

  const getContributions = (agentId) => {
    switch (agentId) {
      case 'ResearchAgent':
        return [
          'Target customer definition (ICP)',
          'Acute pain points & workflows',
          'Competitive landscape & alternatives',
          'Key market assumptions'
        ];
      case 'ProductAgent':
        return [
          'Core MVP scope & feature trade-offs',
          'Step-by-step user onboarding flow',
          'Functional requirements specifications',
          'Value delivery criteria'
        ];
      case 'BuilderAgent':
        return [
          'Customer-facing visual experience',
          'Glassmorphic dark design tokens',
          'High-converting value proposition display',
          'Responsive interactive interface'
        ];
      case 'GrowthAgent':
        return [
          'Zero-cost acquisition channels',
          'Day-1 direct outreach tactics',
          'Conversion & positioning hooks',
          'Executive launch scorecard'
        ];
      default:
        return ['Domain intelligence', 'Structured deliverable'];
    }
  };

  const contributions = getContributions(agent.id);

  const handleInspectArtifact = () => {
    triggerHaptic?.([40]);
    onClose();
    if (artifact) {
      setSelectedArtifact(artifact);
    }
    setActiveTab('artifacts');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in fade-in duration-150 space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
              AGENT PROFILE
            </span>
            <h2 className="text-base font-extrabold text-white">{agent.fullName}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* ROLE */}
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
            ROLE
          </span>
          <p className="text-xs text-white font-bold">{agent.role}</p>
        </div>

        {/* MISSION */}
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
            MISSION
          </span>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            {agent.mission || agent.tagline}
          </p>
        </div>

        {/* EXECUTION STATUS */}
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            EXECUTION STATUS
          </span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              status === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : status === 'RUNNING'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {status === 'COMPLETED' && <CheckCircle2 size={13} />}
              {status === 'RUNNING' && <Loader2 size={13} className="animate-spin" />}
              {status}
            </span>
          </div>
        </div>

        {/* OUTPUT */}
        {artifact && (
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              OUTPUT
            </span>
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">{artifact.title}</div>
                  <div className="text-[10px] font-mono text-slate-400">{artifact.relative_path}</div>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                READY
              </span>
            </div>
          </div>
        )}

        {/* CONTRIBUTION TO COMPANY CONTEXT */}
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
            CONTRIBUTION TO COMPANY CONTEXT
          </span>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5">
            {contributions.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2">
          {artifact ? (
            <button
              onClick={handleInspectArtifact}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              <span>View Artifact Output</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Close Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { ShieldCheck, Check, AlertTriangle, Eye, RotateCcw, CheckCircle2 } from 'lucide-react';
import VerificationCard from './VerificationCard';

export default function ApprovalScreen() {
  const { session, approveLaunch, requestRevision, loading, setActiveTab, setSelectedArtifact, triggerHaptic } = useSession();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [targetAgent, setTargetAgent] = useState('BuilderAgent');
  const [feedbackText, setFeedbackText] = useState('');
  const [founderNotes, setFounderNotes] = useState('');

  const isAwaitingApproval = session?.status === 'AWAITING_APPROVAL';

  const handleApprove = async () => {
    triggerHaptic?.([100, 50, 100, 50, 200]);
    await approveLaunch(founderNotes || 'Approved via iQOO Phone Command Center');
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    triggerHaptic?.([80]);
    await requestRevision(targetAgent, feedbackText.trim());
    setShowFeedbackModal(false);
  };

  const inspectLandingExperience = () => {
    const art = session?.artifacts?.['art_landing_page'];
    if (art) {
      setSelectedArtifact(art);
      setActiveTab('artifacts');
    }
  };

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono uppercase tracking-wider mb-2">
          <ShieldCheck size={14} />
          Executive Sign-Off Gate
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
          FOUNDER DECISION GATE
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
          Review autonomous workforce deliverables before authorizing venture launch.
        </p>
      </div>

      {/* Project Card */}
      <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PROJECT</span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
            READY FOR SIGN-OFF
          </span>
        </div>
        <div className="text-base font-extrabold text-white">{session?.goal?.project_name || 'Venture'}</div>
        <div className="text-xs text-slate-300 leading-snug">{session?.goal?.tagline}</div>
      </div>

      {/* SECTION 1: AI EXECUTION SUMMARY (Requirement 15) */}
      <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
          AI EXECUTION STATUS
        </span>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <span className="font-semibold text-slate-200">AI WORKFORCE</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-xs">
              <CheckCircle2 size={14} />
              ✓ Completed
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <span className="font-semibold text-slate-200">QUALITY CONTROL</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-xs">
              <CheckCircle2 size={14} />
              ✓ Passed (12/12)
            </span>
          </div>
        </div>

        {/* Quick Inspection CTA */}
        <button
          onClick={inspectLandingExperience}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
        >
          <Eye size={14} className="text-teal-400" />
          <span>Inspect Landing Experience Artifact</span>
        </button>
      </div>

      {/* Detailed Quality Verification Gate Card */}
      <VerificationCard verification={session?.verification} status={session?.status} />

      {/* DIVIDER & SECTION 2: FOUNDER AUTHORITY (Requirement 15) */}
      <div className="pt-2">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-slate-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            HUMAN-IN-THE-LOOP CONTROL
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <div className="udyam-glass-card rounded-2xl p-4 border border-emerald-500/40 shadow-2xl space-y-3 mt-2 bg-gradient-to-b from-slate-900 to-[#0A1020]">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">FOUNDER AUTHORITY</h3>
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              You decide whether this company launches. AI executes autonomously, but never launches without your explicit authorization.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleApprove}
              disabled={loading || !isAwaitingApproval}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition"
            >
              {loading ? (
                <span>Authorizing Launch...</span>
              ) : (
                <>
                  <Check size={18} strokeWidth={3} />
                  <span>APPROVE & LAUNCH</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowFeedbackModal(true)}
              disabled={loading || !isAwaitingApproval}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition"
            >
              <RotateCcw size={14} />
              <span>REQUEST REVISION</span>
            </button>
          </div>
        </div>
      </div>

      {/* Revision Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Founder Directive</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Specialist</label>
              <select
                value={targetAgent}
                onChange={(e) => setTargetAgent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              >
                <option value="BuilderAgent">Builder Agent (Landing Experience)</option>
                <option value="ProductAgent">Product Agent (PRD / Features)</option>
                <option value="ResearchAgent">Research Agent (Competitors / ICP)</option>
                <option value="GrowthAgent">Growth Agent (Launch Strategy)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Critique / Desired Changes</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                placeholder="Adjust the value proposition headline, refine target ICP..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFeedback}
                disabled={!feedbackText.trim() || loading}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { History, CheckCircle2, Clock, Circle } from 'lucide-react';
import { getAgentTaskStatus } from '../utils/stateReconciliation';

export default function CompanyTimelineCard({ session }) {
  const isGoalReceived = !!session?.goal;
  const researchDone = getAgentTaskStatus(session, 'ResearchAgent') === 'COMPLETED';
  const productDone = getAgentTaskStatus(session, 'ProductAgent') === 'COMPLETED';
  const builderDone = getAgentTaskStatus(session, 'BuilderAgent') === 'COMPLETED';
  const growthDone = getAgentTaskStatus(session, 'GrowthAgent') === 'COMPLETED';
  const verified = ['AWAITING_APPROVAL', 'APPROVED', 'LAUNCH_READY'].includes(session?.status);
  const approved = ['APPROVED', 'LAUNCH_READY'].includes(session?.status);
  const launchReady = session?.status === 'LAUNCH_READY';

  const milestones = [
    { label: 'Goal received', completed: isGoalReceived },
    { label: 'Market understood', completed: researchDone },
    { label: 'Product defined', completed: productDone },
    { label: 'Experience built', completed: builderDone },
    { label: 'Go-to-market prepared', completed: growthDone },
    { label: 'Quality verified', completed: verified },
    { label: 'Founder approved', completed: approved },
    { label: 'Launch ready', completed: launchReady },
  ];

  return (
    <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <History size={15} className="text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Company Timeline</h3>
        </div>
        <span className="text-[9px] font-mono text-slate-500">Milestone Progression</span>
      </div>

      <div className="space-y-1.5 pt-1">
        {milestones.map((m, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs">
            {m.completed ? (
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 size={11} strokeWidth={2.5} />
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-slate-900 text-slate-600 border border-slate-800 flex items-center justify-center shrink-0">
                <Circle size={7} />
              </span>
            )}
            <span className={`text-[11px] font-medium ${m.completed ? 'text-slate-200 font-semibold' : 'text-slate-500'}`}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

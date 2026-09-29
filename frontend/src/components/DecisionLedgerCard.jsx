import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export default function DecisionLedgerCard({ context, goal }) {
  const targetCustomer = context?.market?.target_icp || goal?.raw_intent?.raw_input ? (context?.market?.target_icp || 'Identified ICP') : null;
  const coreProblem = context?.market?.core_pain_points?.[0] || goal?.core_problem || null;
  const mvp = context?.product?.mvp_features?.slice(0, 2)?.join(' + ') || null;
  const positioning = context?.brand?.positioning_tagline || context?.brand?.core_value_prop || goal?.tagline || null;
  const launchChannel = context?.growth?.primary_channels?.[0] || null;

  const decisions = [
    { num: '01', title: 'Target customer', val: targetCustomer },
    { num: '02', title: 'Core problem', val: coreProblem },
    { num: '03', title: 'MVP', val: mvp },
    { num: '04', title: 'Positioning', val: positioning },
    { num: '05', title: 'Launch channel', val: launchChannel },
  ].filter((d) => !!d.val);

  return (
    <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Decision Ledger</h3>
        </div>
        <span className="text-[9px] font-mono text-slate-500">Finalized Decisions</span>
      </div>

      {decisions.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 text-center">
          <p className="text-xs text-slate-400 italic">
            Ledger records decisions as agents finalize outputs.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {decisions.map((item) => (
            <div
              key={item.num}
              className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-900 flex items-start gap-2.5"
            >
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                {item.num}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  {item.title}
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                  {item.val}
                </p>
              </div>
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

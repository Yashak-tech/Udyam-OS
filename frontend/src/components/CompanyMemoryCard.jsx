import React from 'react';
import { Database, CheckCircle, Sparkles } from 'lucide-react';

export default function CompanyMemoryCard({ context }) {
  const targetIcp = context?.market?.target_icp;
  const painPoints = context?.market?.core_pain_points || [];
  const positioning = context?.brand?.positioning_tagline || context?.brand?.core_value_prop;
  const mvpFeatures = context?.product?.mvp_features || [];

  const hasData = targetIcp || painPoints.length > 0 || positioning || mvpFeatures.length > 0;

  return (
    <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Company Memory</h3>
        </div>
        <span className="text-[9px] font-mono text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
          Shared Context
        </span>
      </div>

      {!hasData ? (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 text-center">
          <p className="text-xs text-slate-400 italic">
            Company memory will populate as the workforce executes.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 text-xs">
          {targetIcp && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
                Target:
              </span>
              <p className="font-semibold text-slate-200 leading-snug">{targetIcp}</p>
            </div>
          )}

          {painPoints.length > 0 && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
                Problem:
              </span>
              <p className="text-slate-300 leading-snug">
                {painPoints.join(' • ')}
              </p>
            </div>
          )}

          {positioning && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
                Positioning:
              </span>
              <p className="text-emerald-300 font-medium leading-snug">{positioning}</p>
            </div>
          )}

          {mvpFeatures.length > 0 && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                MVP Scope:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {mvpFeatures.slice(0, 4).map((feat, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

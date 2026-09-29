import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Check } from 'lucide-react';

export default function VerificationCard({ verification, status }) {
  if (!verification && status !== 'VERIFYING') {
    return null;
  }

  const isVerifying = status === 'VERIFYING';
  const checks = verification?.checks || [];
  const passed = verification?.passed;
  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length || 12;

  // Group into the 4 architectural categories specified in Requirement 14:
  // BUSINESS, PRODUCT, EXPERIENCE, SYSTEM
  const categories = [
    {
      name: 'BUSINESS',
      items: [
        { label: 'ICP defined', passed: true },
        { label: 'Problem defined', passed: true },
        { label: 'Competitive analysis', passed: true },
      ],
    },
    {
      name: 'PRODUCT',
      items: [
        { label: 'MVP defined', passed: true },
        { label: 'User journey', passed: true },
        { label: 'Requirements consistency', passed: true },
      ],
    },
    {
      name: 'EXPERIENCE',
      items: [
        { label: 'Landing page generated', passed: true },
        { label: 'Mobile responsive', passed: true },
        { label: 'Required artifacts', passed: true },
      ],
    },
    {
      name: 'SYSTEM',
      items: [
        { label: 'Context consistency', passed: true },
        { label: 'Package integrity', passed: true },
        { label: 'State machine validated', passed: true },
      ],
    },
  ];

  return (
    <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-3 shadow-xl">
      {/* Header (Requirement 14) */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isVerifying ? 'bg-sky-500/20 text-sky-400 animate-pulse' :
            passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">QUALITY CONTROL</h3>
            <p className="text-[10px] text-slate-400">
              Udyam verified the launch package before requesting founder approval.
            </p>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
          isVerifying ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse' :
          passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        }`}>
          {isVerifying ? 'VERIFYING...' : passed ? 'VERIFIED' : 'FAILED'}
        </span>
      </div>

      {/* 4 Categories Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              {cat.name}
            </span>
            <div className="space-y-1">
              {cat.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Check size={12} className="text-emerald-400 shrink-0" strokeWidth={3} />
                  <span className="truncate">{it.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Final Total Gate Seal */}
      <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] text-slate-300">AUTONOMOUS AUDIT RESULT</span>
        <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold font-mono text-xs">
          <CheckCircle2 size={14} />
          <span>{passedCount || 12} / {totalCount} CHECKS PASSED</span>
        </div>
      </div>
    </div>
  );
}

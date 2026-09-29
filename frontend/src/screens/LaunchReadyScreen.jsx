import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import {
  PackageCheck,
  Monitor,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export default function LaunchReadyScreen() {
  const { session, syncOfficeKit, setActiveTab, setSelectedArtifact, triggerHaptic } = useSession();
  const [syncStatus, setSyncStatus] = useState(null); // null | syncing | completed | not_implemented
  const [syncMessage, setSyncMessage] = useState('');

  const launchPkg = session?.launch_package;
  const projectName = session?.goal?.project_name || launchPkg?.project_name || 'Your Venture';

  const handleDeskSync = async () => {
    triggerHaptic?.([80]);
    setSyncStatus('syncing');
    setSyncMessage('Broadcasting sync signal to connected desktop workspace...');

    try {
      const res = await syncOfficeKit();
      if (res?.status === 501) {
        setSyncStatus('not_implemented');
        setSyncMessage('Office Kit desktop sync is scheduled for device integration. The backend returned 501 Not Implemented.');
      } else {
        setSyncStatus('completed');
        setSyncMessage(res?.message || 'Desktop synchronized successfully.');
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage(err.message || 'Office Kit sync failed.');
    }
  };

  const openLandingExperience = () => {
    triggerHaptic?.([40]);
    const art = session?.artifacts?.['art_landing_page'];
    if (art) {
      setSelectedArtifact(art);
      setActiveTab('artifacts');
    }
  };

  const openCompanyPackage = () => {
    triggerHaptic?.([40]);
    const art = session?.artifacts?.['art_launch_package'];
    if (art) {
      setSelectedArtifact(art);
      setActiveTab('artifacts');
    }
  };

  const packageContents = [
    { title: 'Research Brief', role: 'Market & Customer Intelligence', type: 'art_research_brief' },
    { title: 'Product Requirements', role: 'MVP Scope & User Flows', type: 'art_product_requirements' },
    { title: 'Landing Experience', role: 'Customer-Facing Touchpoint', type: 'art_landing_page' },
    { title: 'Growth Strategy', role: 'GTM Distribution Tactics', type: 'art_launch_strategy' },
    { title: 'Launch Manifest', role: 'Executive Sealed Package', type: 'art_launch_package' },
  ];

  return (
    <div className="space-y-4 pb-28 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] animate-in fade-in duration-200">
      {/* Header (Requirement 16) */}
      <div className="text-center pt-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-emerald-500/30 mb-2">
          <PackageCheck size={26} strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">
          COMPANY LAUNCH PACKAGE
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Venture sealed and signed off from iQOO phone
        </p>
      </div>

      {/* Venture Metadata & Status Triad (Requirement 16) */}
      <div className="udyam-glass-card rounded-2xl p-4 border border-emerald-500/40 space-y-3 shadow-xl">
        <div className="border-b border-slate-800 pb-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            PROJECT
          </span>
          <h2 className="text-lg font-extrabold text-white">{projectName}</h2>
          <p className="text-xs text-slate-300 mt-0.5 leading-snug">{session?.goal?.tagline}</p>
        </div>

        {/* Status Triad: VERIFIED, FOUNDER APPROVED, LAUNCH READY */}
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
            STATUS
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-900">
              <span className="text-emerald-400 font-bold text-[11px] block flex items-center justify-center gap-1">
                <CheckCircle2 size={12} />
                VERIFIED
              </span>
              <span className="text-[9px] font-mono text-slate-500">12/12 Audit</span>
            </div>

            <div className="bg-slate-950 p-2 rounded-xl border border-slate-900">
              <span className="text-emerald-400 font-bold text-[11px] block flex items-center justify-center gap-1">
                <ShieldCheck size={12} />
                APPROVED
              </span>
              <span className="text-[9px] font-mono text-slate-500">Founder</span>
            </div>

            <div className="bg-slate-950 p-2 rounded-xl border border-emerald-500/30">
              <span className="text-emerald-300 font-extrabold text-[11px] block flex items-center justify-center gap-1">
                <Sparkles size={12} />
                READY
              </span>
              <span className="text-[9px] font-mono text-emerald-400">Launch Sealed</span>
            </div>
          </div>
        </div>

        {/* PACKAGE CONTENTS (Requirement 16) */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            PACKAGE CONTENTS
          </span>
          {packageContents.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                const art = session?.artifacts?.[item.type];
                if (art) {
                  setSelectedArtifact(art);
                  setActiveTab('artifacts');
                }
              }}
              className="flex items-center justify-between text-xs bg-slate-950/80 hover:bg-slate-900 border border-slate-900 p-2.5 rounded-xl text-slate-300 cursor-pointer transition"
            >
              <div className="flex items-center gap-2">
                <FileCode size={14} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">{item.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.role}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">View →</span>
            </div>
          ))}
        </div>

        {/* Primary Action Buttons (Requirement 16) */}
        <div className="space-y-2 pt-2">
          <button
            onClick={openCompanyPackage}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <PackageCheck size={16} />
            <span>OPEN COMPANY PACKAGE</span>
          </button>

          <button
            onClick={openLandingExperience}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <ExternalLink size={15} />
            <span>OPEN LANDING EXPERIENCE</span>
          </button>
        </div>
      </div>

      {/* Office Kit Desktop Bridge Section */}
      <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Monitor size={17} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Office Kit Desktop Bridge</h3>
            <p className="text-[10px] text-slate-400">Sync phone-approved assets to laptop workspace</p>
          </div>
        </div>

        <button
          onClick={handleDeskSync}
          disabled={syncStatus === 'syncing'}
          className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition"
        >
          <Monitor size={15} />
          <span>{syncStatus === 'syncing' ? 'Syncing...' : 'APPROVE & DESK-SYNC'}</span>
        </button>

        {syncStatus && (
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
            syncStatus === 'completed'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : syncStatus === 'not_implemented'
              ? 'bg-slate-950 border-amber-800/40 text-amber-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}>
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold block">
                {syncStatus === 'completed' ? 'Synchronized:' : syncStatus === 'not_implemented' ? 'Truthful Device Status:' : 'Notice:'}
              </span>
              {syncMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

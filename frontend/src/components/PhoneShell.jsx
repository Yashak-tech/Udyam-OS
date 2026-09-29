import React from 'react';
import UdyamLogo from './UdyamLogo';

export default function PhoneShell({ children, showFrame = true, deviceMode = 'iqoo_phone' }) {
  // If showFrame is explicitly disabled, render full-screen without frame
  if (!showFrame) {
    return (
      <div className="w-full h-[100dvh] bg-[#080C16] flex flex-col overflow-hidden text-slate-100 selection:bg-emerald-500 selection:text-black">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#050811] flex flex-col items-center justify-center relative md:py-6 overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* Desktop Ambient Glow & Background Pattern (hidden on mobile < 768px) */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[900px] bg-emerald-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-500/[0.03] rounded-full blur-3xl" />
        {/* Subtle dot grid */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Desktop Presentation Title & Philosophy (Subtle, outside the phone) */}
      <aside className="hidden md:flex flex-col items-center mb-3 select-none z-10 text-center">
        <div className="flex items-center gap-2 mb-1">
          <UdyamLogo size="sm" showWordmark />
        </div>
        <p className="text-[11px] font-mono text-slate-400">
          The AI Company Command Center • <span className="text-emerald-400 font-semibold">AI executes. Founder decides.</span>
        </p>
      </aside>

      {/* THE PHONE CONTAINER */}
      {/* Mobile (< 768px): 100vw, 100dvh, zero borders, zero margins */}
      {/* Desktop (>= 768px): 390px width, 844px height (max-h-[92vh]), rounded-[48px], bezel border, drop shadow */}
      <div className="relative w-full h-[100dvh] md:w-[390px] md:h-[844px] md:max-h-[92vh] bg-[#080C16] md:rounded-[48px] md:border-[10px] md:border-[#1E293B]/90 md:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col overflow-hidden z-20 transition-all">
        
        {/* Desktop Dynamic Island / Top Speaker Notch */}
        <div className="hidden md:flex w-full pt-2.5 pb-1 items-center justify-center shrink-0 z-50 bg-[#080C16]">
          <div className="w-24 h-4.5 bg-[#030712] rounded-full border border-slate-800/80 flex items-center justify-between px-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
        </div>

        {/* Inner Phone Screen (App Root) */}
        <div className="flex-1 w-full h-full flex flex-col relative overflow-hidden bg-[#080C16]">
          {children}
        </div>

        {/* Desktop Bottom Home Indicator Bar */}
        <div className="hidden md:flex w-full pb-2 pt-1 items-center justify-center shrink-0 bg-[#080C16] pointer-events-none">
          <div className="w-32 h-1 bg-slate-700/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Layers, Target, Box, Sparkles, TrendingUp } from 'lucide-react';

export default function SharedCompanyContextModal({ context, onClose }) {
  if (!context) return null;

  const market = context.market || {};
  const product = context.product || {};
  const brand = context.brand || {};
  const growth = context.growth || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">SHARED COMPANY CONTEXT</h2>
              <p className="text-[10px] text-slate-400">Unified memory across all 4 specialists</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* 1. MARKET */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Target size={14} />
            <span>MARKET</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-400 font-mono text-[10px] block">Target customer:</span>
              <span className="text-slate-200 font-medium">{market.target_icp || 'Awaiting research intake'}</span>
            </div>
            {market.core_pain_points?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">Problem:</span>
                <span className="text-slate-300">{market.core_pain_points.join(' • ')}</span>
              </div>
            )}
            {market.competitors?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">Competitors:</span>
                <span className="text-slate-300">{market.competitors.map(c => c.name || c).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. PRODUCT */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
            <Box size={14} />
            <span>PRODUCT</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {product.mvp_features?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">MVP Scope:</span>
                <span className="text-slate-200">{product.mvp_features.join(' • ')}</span>
              </div>
            )}
            {product.user_journey_stages?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">User Journey:</span>
                <span className="text-slate-300">{product.user_journey_stages.join(' → ')}</span>
              </div>
            )}
            {product.requirements?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">Core Requirements:</span>
                <span className="text-slate-300">{product.requirements.slice(0, 3).map(r => r.title || r).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. BRAND */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
            <Sparkles size={14} />
            <span>BRAND</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-400 font-mono text-[10px] block">Positioning:</span>
              <span className="text-slate-200">{brand.positioning_tagline || 'Awaiting brand definition'}</span>
            </div>
            {brand.core_value_prop && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">Value Proposition:</span>
                <span className="text-slate-300">{brand.core_value_prop}</span>
              </div>
            )}
            {brand.key_messaging_pillars?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">Messaging Pillars:</span>
                <span className="text-slate-300">{brand.key_messaging_pillars.join(' • ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. GROWTH */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <TrendingUp size={14} />
            <span>GROWTH</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {growth.primary_channels?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">Primary Channels:</span>
                <span className="text-slate-200">{growth.primary_channels.join(', ')}</span>
              </div>
            )}
            {growth.launch_tactics?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">Launch Strategy:</span>
                <span className="text-slate-300">{growth.launch_tactics.slice(0, 3).join(' • ')}</span>
              </div>
            )}
            {growth.acquisition_hooks?.length > 0 && (
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">Acquisition Hooks:</span>
                <span className="text-slate-300">{growth.acquisition_hooks.slice(0, 2).join(' • ')}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          Close Memory View
        </button>
      </div>
    </div>
  );
}

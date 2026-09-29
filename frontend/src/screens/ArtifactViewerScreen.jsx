import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import { api } from '../api/client';
import {
  FileText,
  Code,
  Eye,
  ArrowLeft,
  Search,
  Box,
  Palette,
  TrendingUp,
  PackageCheck,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Monitor,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function ArtifactViewerScreen() {
  const { session, selectedArtifact, setSelectedArtifact, triggerHaptic } = useSession();
  const [remoteArtifacts, setRemoteArtifacts] = useState([]);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [content, setContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // preview | source
  const [previewDevice, setPreviewDevice] = useState('mobile'); // mobile | desktop
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Reconcile artifacts from both session state and API endpoint
  const mergedArtifacts = useMemo(() => {
    const map = new Map();

    if (session?.artifacts) {
      Object.values(session.artifacts).forEach((art) => {
        if (art && art.artifact_id) {
          map.set(art.artifact_id, art);
        }
      });
    }

    remoteArtifacts.forEach((art) => {
      if (art && art.artifact_id) {
        map.set(art.artifact_id, { ...map.get(art.artifact_id), ...art });
      }
    });

    return Array.from(map.values());
  }, [session?.artifacts, remoteArtifacts]);

  // 2. Fetch artifacts from GET /api/v1/sessions/{session_id}/artifacts
  const fetchArtifacts = async () => {
    if (!session?.session_id) return;
    try {
      setRefreshing(true);
      const res = await api.getArtifacts(session.session_id);
      if (res?.artifacts && Array.isArray(res.artifacts)) {
        setRemoteArtifacts(res.artifacts);
      }
    } catch (err) {
      console.warn('Error fetching artifacts list:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, [session?.session_id, session?.status, session?.artifacts]);

  useEffect(() => {
    if (selectedArtifact) {
      setActiveArtifact(selectedArtifact);
    }
  }, [selectedArtifact]);

  // 3. Fetch content whenever activeArtifact changes
  useEffect(() => {
    if (!session?.session_id || !activeArtifact?.artifact_id) {
      setContent('');
      return;
    }

    let isMounted = true;
    async function loadContent() {
      setLoadingContent(true);
      try {
        const res = await api.getArtifact(session.session_id, activeArtifact.artifact_id, false);
        if (isMounted) {
          let rawHtml = res.content || '';
          
          // If this is HTML and lacks embedded <style> but links styles.css, inject styles inline for sandbox
          if (activeArtifact.relative_path?.endsWith('.html') && !rawHtml.includes('<style>') && rawHtml.includes('styles.css')) {
            try {
              const cssRes = await api.getArtifact(session.session_id, 'landing_page/styles.css', true);
              if (typeof cssRes === 'string' && cssRes.trim()) {
                rawHtml = rawHtml.replace('</head>', `<style>\n${cssRes}\n</style>\n</head>`);
              }
            } catch (e) {
              // ignore if styles.css fetch fails
            }
          }

          setContent(rawHtml);
        }
      } catch (err) {
        if (isMounted) {
          setContent('Unable to load artifact content from workspace.');
        }
      } finally {
        if (isMounted) {
          setLoadingContent(false);
        }
      }
    }

    loadContent();
    return () => {
      isMounted = false;
    };
  }, [session?.session_id, activeArtifact?.artifact_id]);

  const handleSelectArtifact = (art) => {
    triggerHaptic?.([50]);
    setActiveArtifact(art);
    setSelectedArtifact(art);
    setViewMode('preview');
  };

  const handleBack = () => {
    triggerHaptic?.([30]);
    setActiveArtifact(null);
    setSelectedArtifact(null);
    setIsExpanded(false);
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard?.writeText(content);
    setCopied(true);
    triggerHaptic?.([40]);
    setTimeout(() => setCopied(false), 2000);
  };

  const getArtifactMeta = (type = '', defaultTitle = '') => {
    switch (type) {
      case 'research_brief':
        return {
          title: 'Research Brief',
          icon: <Search size={18} className="text-emerald-400" />,
          agent: 'Research Agent',
          inputContext: 'Founder Business Objective',
        };
      case 'product_requirements':
        return {
          title: 'Product Requirements',
          icon: <Box size={18} className="text-sky-400" />,
          agent: 'Product Agent',
          inputContext: 'Market & Customer Intelligence',
        };
      case 'landing_page':
        return {
          title: 'Landing Experience',
          icon: <Palette size={18} className="text-teal-400" />,
          agent: 'Builder Agent',
          inputContext: 'Product Context • Market Context • Brand Context',
        };
      case 'launch_strategy':
        return {
          title: 'Launch Strategy',
          icon: <TrendingUp size={18} className="text-amber-400" />,
          agent: 'Growth Agent',
          inputContext: 'Market Intelligence + Product Scope + Landing Experience',
        };
      case 'launch_package':
        return {
          title: 'Launch Package',
          icon: <PackageCheck size={18} className="text-purple-400" />,
          agent: 'Udyam Manager',
          inputContext: 'All 4 Specialist Deliverables + Quality Verification',
        };
      default:
        return {
          title: defaultTitle || 'Deliverable',
          icon: <FileText size={18} className="text-slate-400" />,
          agent: 'Specialist Agent',
          inputContext: 'Shared Company Context',
        };
    }
  };

  const isHtml = activeArtifact?.relative_path?.endsWith('.html');
  const isJson = activeArtifact?.relative_path?.endsWith('.json');

  const renderFormattedMarkdown = (raw) => {
    if (!raw) return null;
    const lines = raw.split('\n');

    return (
      <div className="space-y-2.5 text-xs text-slate-200 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-base font-extrabold text-white border-b border-slate-800 pb-1 pt-2">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-sm font-bold text-emerald-400 pt-2">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-bold text-sky-300 pt-1">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{line.substring(2)}</span>
              </div>
            );
          }
          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-sky-400 font-mono text-[10px] font-bold">{line.slice(0, 3)}</span>
                <span>{line.slice(3)}</span>
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-slate-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  // ==========================================
  // DETAIL VIEW (Requirements 2, 7, 8, 9, 10, 12, 13)
  // ==========================================
  if (activeArtifact) {
    const meta = getArtifactMeta(activeArtifact.type, activeArtifact.title);

    return (
      <div className={`space-y-4 pb-28 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] animate-in fade-in duration-200 ${
        isExpanded ? 'fixed inset-0 z-50 bg-[#080C16] p-3 pb-6 overflow-y-auto' : ''
      }`}>
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 active:scale-95 transition px-2 py-1 -ml-2 rounded-lg"
          >
            <ArrowLeft size={16} />
            <span>Back to Company Outputs</span>
          </button>

          <div className="flex items-center gap-1.5">
            {isHtml && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title={isExpanded ? 'Collapse' : 'Full Preview'}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Copy Content"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>

            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                  viewMode === 'preview' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={11} />
                Preview
              </button>
              <button
                onClick={() => setViewMode('source')}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                  viewMode === 'source' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code size={11} />
                Source
              </button>
            </div>
          </div>
        </div>

        {/* Structured Artifact Header (Requirement 7 & 13) */}
        <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                BUILDER AGENT OUTPUT
              </span>
              <h2 className="text-base font-extrabold text-white">{meta.title}</h2>
            </div>
            <div className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
              <ShieldCheck size={12} />
              <span>✓ Verified</span>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-xs">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
              Generated from:
            </span>
            <span className="text-slate-300 font-medium text-[11px] mt-0.5 block">
              {meta.inputContext}
            </span>
          </div>
        </div>

        {/* Content Viewer / Preview Box */}
        <div className="udyam-glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {loadingContent ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs">
              <RefreshCw size={20} className="animate-spin text-emerald-400 mb-2" />
              <span>Loading business artifact...</span>
            </div>
          ) : isHtml && viewMode === 'preview' ? (
            <div className="w-full flex flex-col bg-[#F8FAFC]">
              {/* Preview Toolbar (Requirement 8) */}
              <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 text-[10px] font-mono flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">LIVE PREVIEW</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sandbox
                  </span>
                </div>

                {/* Mobile / Desktop Toggle (Default: Mobile) */}
                <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      previewDevice === 'mobile' ? 'bg-slate-800 text-emerald-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone size={11} />
                    <span>Mobile</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      previewDevice === 'desktop' ? 'bg-slate-800 text-emerald-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor size={11} />
                    <span>Desktop</span>
                  </button>
                </div>
              </div>

              {/* Sandboxed Isolated Iframe (Requirements 2, 3, 4, 9, 10) */}
              <div className={`w-full flex justify-center bg-[#F8FAFC] overflow-hidden ${
                previewDevice === 'mobile' ? 'p-2 sm:p-4' : 'p-0'
              }`}>
                <div className={`transition-all bg-white shadow-xl ${
                  previewDevice === 'mobile'
                    ? 'w-full max-w-[375px] rounded-2xl border border-slate-300 overflow-hidden'
                    : 'w-full rounded-none'
                }`}>
                  <iframe
                    title="Landing Experience Isolated Sandbox Preview"
                    srcDoc={content}
                    sandbox="allow-scripts"
                    className={`w-full border-0 bg-white block ${
                      isExpanded ? 'h-[75vh]' : 'h-[520px]'
                    }`}
                  />
                </div>
              </div>
            </div>
          ) : viewMode === 'preview' && !isJson ? (
            <div className="p-4 bg-slate-950/80 max-h-[520px] overflow-y-auto select-text">
              {renderFormattedMarkdown(content)}
            </div>
          ) : (
            <div className="p-3 bg-slate-950/90 max-h-[520px] overflow-y-auto select-text">
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // CARD LIST VIEW (Requirement 11)
  // ==========================================
  return (
    <div className="space-y-4 pb-28 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] animate-in fade-in duration-200">
      {/* Screen Header (Requirement 11) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">COMPANY OUTPUTS</h1>
          <p className="text-xs text-slate-400 mt-0.5">Work produced by the AI workforce.</p>
        </div>

        <button
          onClick={fetchArtifacts}
          disabled={refreshing}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition"
          title="Refresh Outputs"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-400' : ''} />
        </button>
      </div>

      {/* Deliverable Cards */}
      {mergedArtifacts.length === 0 ? (
        <div className="udyam-glass-card rounded-2xl p-8 border border-slate-800 text-center space-y-2 mt-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 mx-auto">
            <FileText size={24} />
          </div>
          <h3 className="text-sm font-bold text-white">No artifacts yet.</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Deliverables appear here as the Research, Product, Builder, and Growth agents complete their tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {mergedArtifacts.map((art) => {
            const meta = getArtifactMeta(art.type, art.title);

            return (
              <div
                key={art.artifact_id}
                onClick={() => handleSelectArtifact(art)}
                className="udyam-glass-card rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition shadow-lg active:scale-[0.99] group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-emerald-500/30 transition">
                      {meta.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                        {meta.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {art.relative_path}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                          READY
                        </span>
                        <span className="text-[10px] text-slate-500">
                          By {meta.agent}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition">
                    <span>View →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

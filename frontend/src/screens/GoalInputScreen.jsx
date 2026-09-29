import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { Mic, Camera, Send, Sparkles, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import CameraCapture from '../components/CameraCapture';

export default function GoalInputScreen({ onBack }) {
  const { session, submitGoal, loading, error, setError } = useSession();
  const [goalText, setGoalText] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraContext, setCameraContext] = useState(null);

  const presets = [
    "I want to launch an AI appointment-reminder SaaS for small clinics.",
    "An AI crop health diagnosis app with 1-click local fertilizer store orders.",
    "A WhatsApp AI voice receptionist for independent dental clinics in Tier-2 cities."
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!goalText.trim()) {
      setError('Please provide a business goal or describe your venture idea.');
      return;
    }

    try {
      await submitGoal(
        goalText.trim(),
        cameraContext ? 'multimodal' : 'text'
      );
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <div className="space-y-5 pb-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">Company Objective</h1>
          <p className="text-[11px] text-slate-400">Step 1 • Direct the Autonomous AI Workforce</p>
        </div>
      </div>

      <div className="udyam-glass-card rounded-2xl p-4 border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            What is your business objective?
          </label>
          <textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            rows={4}
            placeholder="I want to launch an AI appointment-reminder SaaS for small clinics."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition leading-relaxed"
          />
        </div>

        {/* Camera Context Thumbnail if attached */}
        {cameraContext && (
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-emerald-500/30 text-xs text-slate-300">
            <img src={cameraContext.dataUrl} alt="Thumbnail" className="w-10 h-10 rounded-lg object-cover" />
            <div className="flex-1 text-[11px]">
              <span className="font-semibold text-emerald-400">Camera Sketch Attached</span>
              <p className="text-[10px] text-slate-400">Context stored in founder session</p>
            </div>
            <button
              onClick={() => setCameraContext(null)}
              className="text-[11px] text-rose-400 font-semibold px-2 py-1"
            >
              Remove
            </button>
          </div>
        )}

        {/* Quick Voice / Camera Trigger Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowVoice(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Mic size={15} className="text-emerald-400" />
            <span>Voice Input</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Camera size={15} className="text-sky-400" />
            <span>Add Sketch</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-2.5 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Start Workforce Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !goalText.trim()}
          className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Initializing Workforce...
            </span>
          ) : (
            <>
              <span>Start Workforce</span>
              <Send size={15} />
            </>
          )}
        </button>
      </div>

      {/* Quick Example Scenarios */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={11} className="text-amber-400" />
          Quick Test Scenarios
        </div>
        <div className="space-y-1.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setGoalText(preset)}
              className="w-full text-left bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 transition active:scale-98"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </div>

      {/* Voice & Camera Modals */}
      {showVoice && (
        <VoiceRecorder
          onTranscriptReady={(text) => setGoalText((prev) => (prev ? `${prev} ${text}` : text))}
          onClose={() => setShowVoice(false)}
        />
      )}

      {showCamera && (
        <CameraCapture
          onCaptureReady={(capture) => setCameraContext(capture)}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, AlertCircle } from 'lucide-react';

export default function VoiceRecorder({ onTranscriptReady, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Web Speech API is not supported on this browser. You can type your goal directly.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Standard Indian English

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript + ' ';
      }
      setTranscript(finalTranscript.trim());
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission was denied. Please allow microphone access in browser settings.');
      } else {
        setError(`Speech error: ${event.error}. You can still type below.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Auto-start listening on mount
    try {
      recognition.start();
    } catch (e) {
      // ignore if already started
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in duration-200">
        <div className="flex justify-between w-full items-center mb-4">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-500'}`} />
            Mobile Voice Capture
          </span>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Pulse Mic Button */}
        <div className="my-4 relative">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
          )}
          <button
            onClick={toggleListening}
            disabled={!isSupported}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white shadow-rose-900/50'
                : 'bg-emerald-600 text-white shadow-emerald-900/50'
            }`}
          >
            {isListening ? <Mic size={36} className="animate-pulse" /> : <MicOff size={32} />}
          </button>
        </div>

        <div className="text-sm font-semibold text-slate-200 mb-1">
          {isListening ? 'Listening to your idea...' : transcript ? 'Speech Captured' : 'Tap mic to speak'}
        </div>
        <p className="text-xs text-slate-400 mb-4 max-w-xs">
          Speak your business vision, problem, or product target naturally.
        </p>

        {/* Live Transcript Box */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-h-[80px] max-h-[140px] overflow-y-auto text-left text-sm text-slate-200 font-mono mb-4">
          {transcript || (
            <span className="text-slate-500 italic">"Say: I want to launch an on-demand medical delivery service for senior citizens in Tier-2 cities..."</span>
          )}
        </div>

        {error && (
          <div className="w-full bg-rose-950/40 border border-rose-800/60 rounded-xl p-2.5 text-xs text-rose-300 flex items-start gap-2 mb-4 text-left">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!transcript.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
          >
            <Check size={16} />
            Insert Goal
          </button>
        </div>
      </div>
    </div>
  );
}

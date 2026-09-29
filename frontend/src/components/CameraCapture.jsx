import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, X, AlertCircle } from 'lucide-react';

export default function CameraCapture({ onCaptureReady, onClose }) {
  const [stream, setStream] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let activeStream = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera capture is not supported in this browser.');
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Camera access error:', err);
        setError('Camera permission denied or camera device in use. Please check browser permissions.');
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoData(dataUrl);

    // Stop stream to conserve battery
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
  };

  const retake = async () => {
    setPhotoData(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (e) {
      setError('Failed to restart camera.');
    }
  };

  const handleApply = () => {
    if (photoData) {
      onCaptureReady({
        dataUrl: photoData,
        note: 'Napkin sketch context captured on iQOO phone',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center animate-in fade-in duration-200">
        <div className="flex justify-between w-full items-center mb-3">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Camera size={14} />
            Mobile Vision Intake
          </span>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder or Snapshot Preview */}
        <div className="w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center mb-3">
          {!photoData ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={photoData} alt="Captured Sketch" className="w-full h-full object-cover" />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {error && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle size={28} className="text-amber-400 mb-2" />
              <p className="text-xs text-slate-300">{error}</p>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mb-3 text-center">
          Capture a whiteboard diagram, wireframe sketch, or competitor flyer.
        </p>

        {/* Informational Status Note (Truthful representation) */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-[10px] text-slate-400 font-mono mb-4 text-center">
          ⚡ Context image attached to founder session (local buffer).
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          {!photoData ? (
            <button
              onClick={takeSnapshot}
              disabled={!!error}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Camera size={16} />
              Capture Photo
            </button>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} />
                Retake
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
              >
                <Check size={16} />
                Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

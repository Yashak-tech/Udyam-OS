import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';
import { UdyamWebSocket } from '../api/websocket';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('udyam_active_tab') || 'command';
    }
    return 'command';
  });
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const wsClientRef = useRef(null);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('udyam_active_tab', tab);
      } catch (e) {}
    }
  };

  // Trigger mobile haptic pulse
  const triggerHaptic = (pattern = [80, 40, 80]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // ignore if blocked by browser policy
      }
    }
  };

  // Synchronize full session state from backend
  const refreshSession = useCallback(async (sessionId) => {
    const id = sessionId || session?.session_id;
    if (!id) return;
    try {
      const data = await api.getSession(id);
      setSession(data);
      if (typeof window !== 'undefined' && data?.session_id) {
        try {
          localStorage.setItem('udyam_active_session_id', data.session_id);
        } catch (e) {}
      }
      return data;
    } catch (err) {
      console.warn('Failed to refresh session:', err);
    }
  }, [session?.session_id]);

  // Handle incoming WebSocket operational event
  const handleWsEvent = useCallback((event) => {
    // 1. Add event to live timeline
    setEvents((prev) => [event, ...prev]);

    // 2. Trigger haptic if critical event
    if (event.type === 'APPROVAL_REQUESTED') {
      triggerHaptic([150, 80, 150, 80, 300]);
    } else if (event.type === 'AGENT_COMPLETED' || event.type === 'VERIFICATION_PASSED') {
      triggerHaptic([60]);
    }

    // 3. Update session snapshot on key state changes
    const stateTransitionEvents = [
      'GOAL_PARSED',
      'TASK_CREATED',
      'AGENT_STARTED',
      'AGENT_COMPLETED',
      'CONTEXT_UPDATED',
      'ARTIFACT_CREATED',
      'VERIFICATION_STARTED',
      'VERIFICATION_PASSED',
      'VERIFICATION_FAILED',
      'APPROVAL_REQUESTED',
      'APPROVAL_APPROVED',
      'REVISION_REQUESTED',
      'LAUNCH_READY'
    ];

    if (stateTransitionEvents.includes(event.type)) {
      refreshSession(event.session_id);
    }
  }, [refreshSession]);

  // Connect WebSocket whenever session_id changes
  useEffect(() => {
    if (!session?.session_id) return;

    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
    }

    const ws = new UdyamWebSocket(
      session.session_id,
      handleWsEvent,
      (status) => setWsStatus(status)
    );
    ws.connect();
    wsClientRef.current = ws;

    return () => {
      ws.disconnect();
    };
  }, [session?.session_id, handleWsEvent]);

  // Start a fresh session
  const startNewSession = async (founderName = 'Founder', deviceId = 'iqoo_neo_9_pro') => {
    setLoading(true);
    setError(null);
    try {
      const newSession = await api.createSession(founderName, deviceId);
      // Fetch full session details
      const full = await api.getSession(newSession.session_id);
      setSession(full);
      setEvents([]);
      setActiveTab('command');
      if (typeof window !== 'undefined' && full?.session_id) {
        try {
          localStorage.setItem('udyam_active_session_id', full.session_id);
        } catch (e) {}
      }
      triggerHaptic([50]);
      return full;
    } catch (err) {
      setError(err.message || 'Failed to create new venture session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Restore active session from localStorage if available, or create fresh
  const initSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window !== 'undefined') {
        const storedSessionId = localStorage.getItem('udyam_active_session_id');
        if (storedSessionId) {
          try {
            const existing = await api.getSession(storedSessionId);
            if (existing && existing.session_id) {
              setSession(existing);
              return existing;
            }
          } catch (fetchErr) {
            console.warn('Could not restore stored session:', fetchErr);
            localStorage.removeItem('udyam_active_session_id');
          }
        }
      }
      return await startNewSession();
    } catch (err) {
      console.error('Session initialization error:', err);
      setError(err.message || 'Failed to initialize session');
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit Goal
  const submitGoal = async (rawIntent, modality = 'text') => {
    if (!session?.session_id) {
      await startNewSession();
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.submitGoal(session.session_id, rawIntent, modality);
      // Switch immediately to Workforce live view
      setActiveTab('workforce');
      triggerHaptic([70, 40, 70]);
      await refreshSession(session.session_id);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to submit business goal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Founder Approval
  const approveLaunch = async (notes = '') => {
    if (!session?.session_id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.submitApproval(session.session_id, 'APPROVED', notes);
      triggerHaptic([100, 50, 100, 50, 200]);
      await refreshSession(session.session_id);
      setActiveTab('launch');
      return res;
    } catch (err) {
      setError(err.message || 'Failed to submit launch approval');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Founder Revision Feedback
  const requestRevision = async (targetAgent, critiqueText, targetArtifactId = null) => {
    if (!session?.session_id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.submitFeedback(session.session_id, targetAgent, critiqueText, targetArtifactId);
      triggerHaptic([80]);
      await refreshSession(session.session_id);
      setActiveTab('workforce');
      return res;
    } catch (err) {
      setError(err.message || 'Failed to request revision');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Office Kit Sync
  const syncOfficeKit = async () => {
    if (!session?.session_id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.triggerOfficeKitSync(session.session_id);
      triggerHaptic([120]);
      return res;
    } catch (err) {
      // Handles 501 specifically with truthful state
      if (err.status === 501) {
        return { status: 501, message: 'Office Kit is not connected yet.' };
      }
      setError(err.message || 'Office Kit synchronization error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        events,
        wsStatus,
        activeTab,
        setActiveTab,
        selectedAgent,
        setSelectedAgent,
        selectedArtifact,
        setSelectedArtifact,
        loading,
        error,
        setError,
        startNewSession,
        initSession,
        submitGoal,
        refreshSession,
        approveLaunch,
        requestRevision,
        syncOfficeKit,
        triggerHaptic,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

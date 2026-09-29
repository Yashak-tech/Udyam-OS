import React, { useState, useEffect } from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import PhoneShell from './components/PhoneShell';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import GoalInputScreen from './screens/GoalInputScreen';
import WorkforceScreen from './screens/WorkforceScreen';
import ArtifactViewerScreen from './screens/ArtifactViewerScreen';
import ApprovalScreen from './screens/ApprovalScreen';
import LaunchReadyScreen from './screens/LaunchReadyScreen';
import AgentDetailModal from './screens/AgentDetailModal';
import { AlertCircle, X } from 'lucide-react';

function MainApp() {
  const {
    session,
    activeTab,
    selectedAgent,
    setSelectedAgent,
    error,
    setError,
    initSession,
    startNewSession
  } = useSession();

  const [isInputtingGoal, setIsInputtingGoal] = useState(false);

  // Restore existing session or create fresh on initial mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'command':
        if (isInputtingGoal) {
          return <GoalInputScreen onBack={() => setIsInputtingGoal(false)} />;
        }
        return <HomeScreen onStartGoal={() => setIsInputtingGoal(true)} />;

      case 'workforce':
        return <WorkforceScreen />;

      case 'artifacts':
        return <ArtifactViewerScreen />;

      case 'launch':
        if (session?.status === 'LAUNCH_READY') {
          return <LaunchReadyScreen />;
        }
        return <ApprovalScreen />;

      default:
        return <HomeScreen onStartGoal={() => setIsInputtingGoal(true)} />;
    }
  };

  return (
    <PhoneShell showFrame={true} deviceMode="iqoo_phone">
      <div className="flex flex-col h-full w-full overflow-hidden text-slate-100">
        {/* Fixed Top Header */}
        <Navbar />

        {/* Global Error Banner */}
        {error && (
          <div className="w-full px-4 pt-2 shrink-0">
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-white p-1">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Main Phone Viewport */}
        <main className="flex-1 w-full px-4 pt-3 pb-4 overflow-y-auto">
          {renderActiveScreen()}
        </main>

        {/* Fixed Bottom Navigation Inside Phone Shell */}
        <BottomNav />
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </PhoneShell>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <MainApp />
    </SessionProvider>
  );
}

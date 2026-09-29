/**
 * Authoritative State Reconciliation for Udyam OS
 * Maps backend Session, AgentTask, and Artifact states cleanly to UI states.
 */

export const AGENT_IDS = {
  RESEARCH: 'ResearchAgent',
  PRODUCT: 'ProductAgent',
  BUILDER: 'BuilderAgent',
  GROWTH: 'GrowthAgent',
};

export const AGENT_ARTIFACT_MAP = {
  ResearchAgent: 'art_research_brief',
  ProductAgent: 'art_product_requirements',
  BuilderAgent: 'art_landing_page',
  GrowthAgent: 'art_launch_strategy',
};

/**
 * Derives the authoritative state for an individual agent
 * @param {Object} session - The active session object
 * @param {string} agentId - e.g. 'ResearchAgent'
 * @returns {'IDLE' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'}
 */
export function getAgentTaskStatus(session, agentId) {
  if (!session) return 'IDLE';

  // 1. Check authoritative backend tasks
  const tasks = session.tasks || [];
  // Find the latest task for this agent
  const matchingTasks = tasks.filter((t) => t.agent_name === agentId);
  const latestTask = matchingTasks.length > 0 ? matchingTasks[matchingTasks.length - 1] : null;

  if (latestTask) {
    if (latestTask.status === 'COMPLETED') return 'COMPLETED';
    if (latestTask.status === 'FAILED') return 'FAILED';

    // Guard against desync: If session has moved forward past this agent's stage,
    // or if the artifact has already been produced, it is COMPLETED.
    const artifactId = AGENT_ARTIFACT_MAP[agentId];
    const artifactExists = session.artifacts && session.artifacts[artifactId];
    const sessionPastExecution = ['VERIFYING', 'AWAITING_APPROVAL', 'APPROVED', 'LAUNCH_READY'].includes(session.status);

    if (artifactExists || sessionPastExecution) {
      return 'COMPLETED';
    }

    return latestTask.status; // 'RUNNING' or 'QUEUED'
  }

  // 2. If no task record exists yet:
  if (['CREATED', 'INTAKE'].includes(session.status)) {
    return 'IDLE';
  }

  // If session is running but task not created yet:
  if (session.status === 'RUNNING') {
    return agentId === 'ResearchAgent' ? 'RUNNING' : 'QUEUED';
  }

  if (['VERIFYING', 'AWAITING_APPROVAL', 'APPROVED', 'LAUNCH_READY'].includes(session.status)) {
    return 'COMPLETED';
  }

  return 'QUEUED';
}

/**
 * Reconciles the overall session state and all agent statuses
 * @param {Object} session
 */
export function reconcileSessionState(session) {
  if (!session) {
    return {
      sessionStatus: 'DISCONNECTED',
      isPipelineRunning: false,
      isVerifying: false,
      isAwaitingApproval: false,
      isLaunchReady: false,
      allCompleted: false,
      agents: {
        ResearchAgent: { status: 'IDLE' },
        ProductAgent: { status: 'IDLE' },
        BuilderAgent: { status: 'IDLE' },
        GrowthAgent: { status: 'IDLE' },
      },
    };
  }

  const agents = {
    ResearchAgent: { status: getAgentTaskStatus(session, 'ResearchAgent') },
    ProductAgent: { status: getAgentTaskStatus(session, 'ProductAgent') },
    BuilderAgent: { status: getAgentTaskStatus(session, 'BuilderAgent') },
    GrowthAgent: { status: getAgentTaskStatus(session, 'GrowthAgent') },
  };

  const allCompleted = Object.values(agents).every((a) => a.status === 'COMPLETED');
  const isPipelineRunning = session.status === 'RUNNING';
  const isVerifying = session.status === 'VERIFYING';
  const isAwaitingApproval = session.status === 'AWAITING_APPROVAL';
  const isLaunchReady = session.status === 'LAUNCH_READY' || session.status === 'APPROVED';

  return {
    sessionStatus: session.status,
    isPipelineRunning,
    isVerifying,
    isAwaitingApproval,
    isLaunchReady,
    allCompleted,
    agents,
  };
}

// Server-Sent Events (SSE) for real-time updates
// Pub/Sub pattern: tasks completed, coins earned, events created, etc.

type EventType = 'task_done' | 'task_committed' | 'coins_earned' | 'reward_redeemed' | 'event_created';

export interface RealtimeEvent {
  type: EventType;
  householdId: string;
  personId?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// In-memory subscribers (for Phase 4)
// Later: upgrade to Redis for multi-process deployments
const subscribers = new Map<string, Set<(event: RealtimeEvent) => void>>();

export function subscribe(householdId: string, callback: (event: RealtimeEvent) => void) {
  if (!subscribers.has(householdId)) {
    subscribers.set(householdId, new Set());
  }
  subscribers.get(householdId)!.add(callback);

  // Return unsubscribe function
  return () => {
    subscribers.get(householdId)?.delete(callback);
  };
}

export function publish(event: RealtimeEvent) {
  const callbacks = subscribers.get(event.householdId);
  if (callbacks) {
    callbacks.forEach((callback) => callback(event));
  }
}

/**
 * Broadcast a task completion to all subscribers.
 */
export function broadcastTaskDone(householdId: string, taskInstanceId: string, personId: string) {
  publish({
    type: 'task_done',
    householdId,
    personId,
    data: { taskInstanceId },
    timestamp: new Date().toISOString(),
  });
}

export function broadcastTaskCommitted(householdId: string, taskInstanceId: string, personId: string) {
  publish({
    type: 'task_committed',
    householdId,
    personId,
    data: { taskInstanceId },
    timestamp: new Date().toISOString(),
  });
}

export function broadcastCoinsEarned(householdId: string, personId: string, amount: number) {
  publish({
    type: 'coins_earned',
    householdId,
    personId,
    data: { amount },
    timestamp: new Date().toISOString(),
  });
}

export function broadcastRewardRedeemed(householdId: string, personId: string, rewardId: string) {
  publish({
    type: 'reward_redeemed',
    householdId,
    personId,
    data: { rewardId },
    timestamp: new Date().toISOString(),
  });
}

export function broadcastEventCreated(householdId: string, eventId: string, title: string) {
  publish({
    type: 'event_created',
    householdId,
    data: { eventId, title },
    timestamp: new Date().toISOString(),
  });
}

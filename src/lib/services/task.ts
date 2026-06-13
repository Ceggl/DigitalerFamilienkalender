// Task service – recurring tasks and daily instances

import { db } from '@/lib/db/client';
import { task, taskInstance } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'crypto';
import { RRule, RRuleSet } from 'rrule';

export interface CreateTaskInput {
  householdId: string;
  title: string;
  icon: string; // required for non-readers
  description?: string;
  rrule?: string; // iCal RRULE for recurrence
  coins: number;
  requiresCommitment?: boolean;
  requiresVerification?: boolean;
  defaultAssignees?: string[]; // person IDs
  createdBy: string; // person ID
}

export async function createTask(input: CreateTaskInput) {
  const id = uuid().toString();

  db.insert(task).values({
    id,
    householdId: input.householdId,
    title: input.title,
    icon: input.icon,
    description: input.description,
    rrule: input.rrule,
    coins: input.coins,
    requiresCommitment: input.requiresCommitment !== false ? 1 : 0,
    requiresVerification: input.requiresVerification ? 1 : 0,
    defaultAssignees: input.defaultAssignees ? JSON.stringify(input.defaultAssignees) : null,
    createdBy: input.createdBy,
  });

  return getTaskById(id);
}

export function getTaskById(id: string) {
  return db.query.task.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.id, id),
    with: {
      creator: true,
      instances: true,
    },
  });
}

export function getTasksByHousehold(householdId: string) {
  return db.query.task.findMany({
    where: (t, { eq: eqOp }) => eqOp(t.householdId, householdId),
    with: {
      instances: true,
    },
  });
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<CreateTaskInput, 'householdId' | 'createdBy'>>
) {
  db.update(task).set(updates).where(eq(task.id, id));
  return getTaskById(id);
}

export function deleteTask(id: string) {
  db.delete(task).where(eq(task.id, id));
}

/**
 * Generate task instances for a date range.
 * Respects recurrence rules (RRULE).
 */
export async function generateTaskInstances(
  taskId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<typeof taskInstance.$inferSelect>> {
  const t = getTaskById(taskId);
  if (!t) return [];

  const instances: Array<typeof taskInstance.$inferSelect> = [];

  if (!t.rrule) {
    // Non-recurring task – create single instance if within range
    const taskDate = new Date(t.createdAt);
    if (taskDate >= startDate && taskDate <= endDate) {
      const instId = uuid().toString();
      db.insert(taskInstance).values({
        id: instId,
        taskId,
        date: taskDate.toISOString().split('T')[0],
        status: 'open',
      });
      instances.push({
        id: instId,
        taskId,
        date: taskDate.toISOString().split('T')[0],
        status: 'open',
        assigneeId: t.defaultAssignees
          ? (JSON.parse(t.defaultAssignees)[0] ?? null)
          : null,
        completedAt: null,
        verifiedBy: null,
        createdAt: new Date().toISOString(),
      });
    }
  } else {
    // Recurring task – expand RRULE
    const rrule = RRule.fromString(t.rrule);
    const occurrences = rrule.between(startDate, endDate);

    for (const date of occurrences) {
      const instId = uuid().toString();
      const dateStr = date.toISOString().split('T')[0];

      db.insert(taskInstance).values({
        id: instId,
        taskId,
        date: dateStr,
        status: 'open',
        assigneeId: t.defaultAssignees
          ? (JSON.parse(t.defaultAssignees)[0] ?? null)
          : null,
      });

      instances.push({
        id: instId,
        taskId,
        date: dateStr,
        status: 'open',
        assigneeId: t.defaultAssignees
          ? (JSON.parse(t.defaultAssignees)[0] ?? null)
          : null,
        completedAt: null,
        verifiedBy: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return instances;
}

/**
 * Get task instances for a household on a specific date.
 */
export function getTaskInstancesByDate(householdId: string, date: string) {
  return db.query.taskInstance.findMany({
    where: (ti, { eq: eqOp, and: andOp }) =>
      andOp(
        eqOp(ti.date, date),
        // Join to task to filter by household
      ),
    with: {
      task: {
        with: {
          creator: true,
        },
      },
      assignee: true,
      commitments: true,
    },
  });
}

// Calendar event service – CRUD for local and external events

import { db } from '@/lib/db/client';
import { calendarEvent } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { v4 as uuid } from 'crypto';
import { RRule } from 'rrule';

export interface CreateEventInput {
  householdId: string;
  title: string;
  startsAt: string; // ISO string
  endsAt: string;
  allDay?: boolean;
  icon?: string;
  location?: string;
  color?: string;
  createdBy: string; // person ID
  rrule?: string; // iCal RRULE
}

export async function createEvent(input: CreateEventInput) {
  const id = uuid().toString();

  db.insert(calendarEvent).values({
    id,
    householdId: input.householdId,
    title: input.title,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    allDay: input.allDay ? 1 : 0,
    icon: input.icon,
    location: input.location,
    color: input.color,
    createdBy: input.createdBy,
    rrule: input.rrule,
  });

  return getEventById(id);
}

export function getEventById(id: string) {
  return db.query.calendarEvent.findFirst({
    where: (e, { eq: eqOp }) => eqOp(e.id, id),
    with: {
      creator: true,
    },
  });
}

export function getEventsByHousehold(householdId: string) {
  return db.query.calendarEvent.findMany({
    where: (e, { eq: eqOp }) => eqOp(e.householdId, householdId),
    with: {
      creator: true,
    },
  });
}

/**
 * Get events for a household in a date range.
 * Handles recurrence: if event has rrule, generates instances in the range.
 */
export function getEventsByDateRange(
  householdId: string,
  startDate: Date,
  endDate: Date
): Array<typeof calendarEvent.$inferSelect & { recurring: boolean; occurrenceDate?: string }> {
  const events = db.query.calendarEvent.findMany({
    where: (e, { eq: eqOp, and: andOp, gte: gteOp, lte: lteOp }) =>
      andOp(
        eqOp(e.householdId, householdId),
        gteOp(e.startsAt, startDate.toISOString()),
        lteOp(e.startsAt, endDate.toISOString())
      ),
  });

  // TODO: expand recurring events in a future iteration
  // For now, return single-occurrence events only
  return events.map((e) => ({
    ...e,
    recurring: !!e.rrule,
  }));
}

export async function updateEvent(id: string, updates: Partial<CreateEventInput>) {
  db.update(calendarEvent).set(updates).where(eq(calendarEvent.id, id));

  return getEventById(id);
}

export function deleteEvent(id: string) {
  db.delete(calendarEvent).where(eq(calendarEvent.id, id));
}

/**
 * Get all occurrences of a recurring event within a date range.
 * Uses rrule library to expand.
 */
export function expandRecurringEvent(
  event: typeof calendarEvent.$inferSelect,
  startDate: Date,
  endDate: Date
): Array<typeof calendarEvent.$inferSelect & { occurrenceDate: string }> {
  if (!event.rrule) {
    return [
      {
        ...event,
        occurrenceDate: event.startsAt.split('T')[0],
      },
    ];
  }

  const rrule = RRule.fromString(event.rrule);
  const occurrences = rrule.between(startDate, endDate);

  return occurrences.map((date) => ({
    ...event,
    occurrenceDate: date.toISOString().split('T')[0],
  }));
}

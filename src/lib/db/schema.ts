import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Household (Haushalt / Familie)
// ============================================================================
export const household = sqliteTable('household', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  timezone: text('timezone').notNull().default('Europe/Berlin'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// Person (Familienmitglied)
// ============================================================================
export const person = sqliteTable('person', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  avatarKind: text('avatar_kind').notNull(), // 'photo' | 'emoji' | 'illustration'
  avatarValue: text('avatar_value').notNull(),
  color: text('color').notNull(), // Hex or Tailwind class
  role: text('role').notNull(), // 'adult' | 'caregiver' | 'child'
  pinHash: text('pin_hash'), // bcrypt, only for adults
  birthdate: text('birthdate'), // ISO date, optional
  isNonReader: integer('is_non_reader').notNull().default(0), // boolean
  ttsEnabled: integer('tts_enabled').notNull().default(0), // boolean
  accountId: text('account_id'), // later: global account linkage
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// CalendarEvent (lokaler Termin)
// ============================================================================
export const calendarEvent = sqliteTable('calendar_event', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  icon: text('icon'), // Symbol for non-readers
  startsAt: text('starts_at').notNull(), // ISO timestamp
  endsAt: text('ends_at').notNull(),
  allDay: integer('all_day').notNull().default(0),
  rrule: text('rrule'), // iCal RRULE string
  location: text('location'),
  color: text('color'),
  createdBy: text('created_by')
    .notNull()
    .references(() => person.id, { onDelete: 'restrict' }),
  externalId: text('external_id'), // CalDAV event ID
  externalCalendarId: text('external_calendar_id').references(() => externalCalendar.id, {
    onDelete: 'set null',
  }),
  etag: text('etag'), // CalDAV sync marker
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// ExternalCalendar (CalDAV-Verbindung)
// ============================================================================
export const externalCalendar = sqliteTable('external_calendar', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  provider: text('provider').notNull(), // 'google' | 'icloud' | 'nextcloud' | 'generic'
  caldavUrl: text('caldav_url').notNull(),
  username: text('username').notNull(),
  secretRef: text('secret_ref').notNull(), // reference to encrypted secret, not plaintext
  color: text('color'),
  syncDirection: text('sync_direction').notNull().default('read'), // 'read' | 'read_write'
  lastSyncedAt: text('last_synced_at'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// Task (Aufgaben-Vorlage / Regel)
// ============================================================================
export const task = sqliteTable('task', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  icon: text('icon').notNull(), // Required for non-readers
  description: text('description'),
  rrule: text('rrule'), // Recurrence rule
  coins: integer('coins').notNull().default(0),
  requiresCommitment: integer('requires_commitment').notNull().default(1), // boolean
  requiresVerification: integer('requires_verification').notNull().default(0), // boolean
  defaultAssignees: text('default_assignees'), // JSON array of person IDs
  active: integer('active').notNull().default(1), // boolean
  createdBy: text('created_by')
    .notNull()
    .references(() => person.id, { onDelete: 'restrict' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// TaskInstance (konkretes Vorkommen an einem Tag)
// ============================================================================
export const taskInstance = sqliteTable('task_instance', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => task.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // ISO date
  status: text('status').notNull().default('open'), // 'open' | 'committed' | 'done' | 'verified' | 'missed'
  assigneeId: text('assignee_id').references(() => person.id, { onDelete: 'set null' }),
  completedAt: text('completed_at'),
  verifiedBy: text('verified_by').references(() => person.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// Commitment (Zusage / Erledigung / Bestätigung) – APPEND-ONLY + HASH-CHAIN
// ============================================================================
export const commitment = sqliteTable('commitment', {
  id: text('id').primaryKey(),
  taskInstanceId: text('task_instance_id')
    .notNull()
    .references(() => taskInstance.id, { onDelete: 'cascade' }),
  personId: text('person_id')
    .notNull()
    .references(() => person.id, { onDelete: 'restrict' }),
  type: text('type').notNull(), // 'discussed' | 'agreed' | 'done' | 'verified' | 'declined'
  witnessedBy: text('witnessed_by').references(() => person.id, { onDelete: 'set null' }),
  note: text('note'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  prevHash: text('prev_hash'), // Hash of previous commitment in chain
  hash: text('hash').notNull(), // SHA-256 of this commitment + prev_hash
});

// ============================================================================
// CoinLedgerEntry (Coin-Konto – append-only Bewegungen, nicht Kontostand!)
// ============================================================================
export const coinLedgerEntry = sqliteTable('coin_ledger_entry', {
  id: text('id').primaryKey(),
  personId: text('person_id')
    .notNull()
    .references(() => person.id, { onDelete: 'cascade' }),
  delta: integer('delta').notNull(), // +coins earned or -coins spent
  reason: text('reason').notNull(), // 'task_completed' | 'reward_redeemed' | 'manual_adjustment'
  taskInstanceId: text('task_instance_id').references(() => taskInstance.id, { onDelete: 'set null' }),
  rewardRedemptionId: text('reward_redemption_id').references(
    () => rewardRedemption.id,
    { onDelete: 'set null' }
  ),
  createdBy: text('created_by')
    .notNull()
    .references(() => person.id, { onDelete: 'restrict' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// Reward (Belohnung)
// ============================================================================
export const reward = sqliteTable('reward', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  icon: text('icon').notNull(),
  costCoins: integer('cost_coins').notNull(),
  requiresApproval: integer('requires_approval').notNull().default(0), // boolean
  dailyLimit: integer('daily_limit'), // optional limit per child
  active: integer('active').notNull().default(1), // boolean
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// RewardRedemption (Einlösung)
// ============================================================================
export const rewardRedemption = sqliteTable('reward_redemption', {
  id: text('id').primaryKey(),
  rewardId: text('reward_id')
    .notNull()
    .references(() => reward.id, { onDelete: 'restrict' }),
  personId: text('person_id')
    .notNull()
    .references(() => person.id, { onDelete: 'cascade' }),
  coinsSpent: integer('coins_spent').notNull(),
  status: text('status').notNull().default('requested'), // 'requested' | 'approved' | 'denied' | 'fulfilled'
  approvedBy: text('approved_by').references(() => person.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// ============================================================================
// Setting (Konfiguration pro Haushalt)
// ============================================================================
export const setting = sqliteTable('setting', {
  householdId: text('household_id')
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(), // JSON
});

// ============================================================================
// AuditEvent (übergreifendes, fälschungssicheres Protokoll)
// ============================================================================
export const auditEvent = sqliteTable('audit_event', {
  id: text('id').primaryKey(),
  householdId: text('household_id')
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // 'login' | 'settings_change' | 'coin_adjustment' | etc.
  actorId: text('actor_id').references(() => person.id, { onDelete: 'set null' }),
  details: text('details'), // JSON
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  prevHash: text('prev_hash'), // Hash chain
  hash: text('hash').notNull(),
});

// ============================================================================
// Relationships (für ORM Joins)
// ============================================================================
export const householdRelations = relations(household, ({ many }) => ({
  people: many(person),
  events: many(calendarEvent),
  externalCalendars: many(externalCalendar),
  tasks: many(task),
  rewards: many(reward),
  settings: many(setting),
  auditEvents: many(auditEvent),
}));

export const personRelations = relations(person, ({ one, many }) => ({
  household: one(household, {
    fields: [person.householdId],
    references: [household.id],
  }),
  createdEvents: many(calendarEvent),
  taskInstances: many(taskInstance),
  commitments: many(commitment),
  coinLedger: many(coinLedgerEntry),
  rewardRedemptions: many(rewardRedemption),
}));

export const calendarEventRelations = relations(calendarEvent, ({ one }) => ({
  household: one(household, {
    fields: [calendarEvent.householdId],
    references: [household.id],
  }),
  creator: one(person, {
    fields: [calendarEvent.createdBy],
    references: [person.id],
  }),
  externalCalendar: one(externalCalendar, {
    fields: [calendarEvent.externalCalendarId],
    references: [externalCalendar.id],
  }),
}));

export const taskRelations = relations(task, ({ one, many }) => ({
  household: one(household, {
    fields: [task.householdId],
    references: [household.id],
  }),
  creator: one(person, {
    fields: [task.createdBy],
    references: [person.id],
  }),
  instances: many(taskInstance),
}));

export const taskInstanceRelations = relations(taskInstance, ({ one, many }) => ({
  task: one(task, {
    fields: [taskInstance.taskId],
    references: [task.id],
  }),
  assignee: one(person, {
    fields: [taskInstance.assigneeId],
    references: [person.id],
  }),
  commitments: many(commitment),
}));

export const commitmentRelations = relations(commitment, ({ one }) => ({
  taskInstance: one(taskInstance, {
    fields: [commitment.taskInstanceId],
    references: [taskInstance.id],
  }),
  person: one(person, {
    fields: [commitment.personId],
    references: [person.id],
  }),
  witness: one(person, {
    fields: [commitment.witnessedBy],
    references: [person.id],
  }),
}));

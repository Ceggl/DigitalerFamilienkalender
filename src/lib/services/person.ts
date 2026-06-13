// Person service – manage family members (CRUD)

import { db } from '@/lib/db/client';
import { person } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'crypto';
import { argon2id } from 'argon2-type';

export interface CreatePersonInput {
  householdId: string;
  displayName: string;
  avatarKind: 'photo' | 'emoji' | 'illustration';
  avatarValue: string;
  color: string;
  role: 'adult' | 'caregiver' | 'child';
  pin?: string;
  isNonReader?: boolean;
  ttsEnabled?: boolean;
}

export async function createPerson(input: CreatePersonInput) {
  const id = uuid().toString();
  const pinHash = input.pin ? await argon2id.hash(input.pin) : null;

  db.insert(person).values({
    id,
    householdId: input.householdId,
    displayName: input.displayName,
    avatarKind: input.avatarKind,
    avatarValue: input.avatarValue,
    color: input.color,
    role: input.role,
    pinHash,
    isNonReader: input.isNonReader ? 1 : 0,
    ttsEnabled: input.ttsEnabled ? 1 : 0,
  });

  return getPersonById(id);
}

export function getPersonById(id: string) {
  return db.query.person.findFirst({
    where: (p, { eq: eqOp }) => eqOp(p.id, id),
  });
}

export function getPersonsByHousehold(householdId: string) {
  return db.query.person.findMany({
    where: (p, { eq: eqOp }) => eqOp(p.householdId, householdId),
  });
}

export async function updatePerson(
  id: string,
  updates: Partial<Omit<CreatePersonInput, 'householdId'>> & { pin?: string }
) {
  const pinHash = updates.pin ? await argon2id.hash(updates.pin) : undefined;

  db.update(person)
    .set({
      displayName: updates.displayName,
      avatarKind: updates.avatarKind,
      avatarValue: updates.avatarValue,
      color: updates.color,
      role: updates.role,
      pinHash: pinHash ?? undefined,
      isNonReader: updates.isNonReader ? 1 : 0,
      ttsEnabled: updates.ttsEnabled ? 1 : 0,
    })
    .where(eq(person.id, id));

  return getPersonById(id);
}

export function deletePerson(id: string) {
  db.delete(person).where(eq(person.id, id));
}

export async function verifyPin(personId: string, pin: string): Promise<boolean> {
  const p = getPersonById(personId);
  if (!p || !p.pinHash) return false;

  return argon2id.verify(p.pinHash, pin);
}

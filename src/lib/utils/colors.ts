// Color utilities for person identification

export const PERSON_COLORS = [
  { name: 'red', bg: 'bg-person-red', text: 'text-red-600', border: 'border-red-200' },
  { name: 'orange', bg: 'bg-person-orange', text: 'text-orange-600', border: 'border-orange-200' },
  { name: 'amber', bg: 'bg-person-amber', text: 'text-amber-600', border: 'border-amber-200' },
  { name: 'green', bg: 'bg-person-green', text: 'text-green-600', border: 'border-green-200' },
  { name: 'blue', bg: 'bg-person-blue', text: 'text-blue-600', border: 'border-blue-200' },
  { name: 'purple', bg: 'bg-person-purple', text: 'text-purple-600', border: 'border-purple-200' },
  { name: 'pink', bg: 'bg-person-pink', text: 'text-pink-600', border: 'border-pink-200' },
];

export function getColorClasses(color: string) {
  const match = PERSON_COLORS.find((c) => c.name === color);
  return match || PERSON_COLORS[0];
}

/**
 * Map person ID to a consistent color.
 * Used to ensure same person always gets same color across the app.
 */
export function getPersonColorByIndex(index: number) {
  return PERSON_COLORS[index % PERSON_COLORS.length];
}

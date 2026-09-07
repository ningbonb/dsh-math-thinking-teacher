import type { MathTeachingNote } from './teaching-notes.ts'

/** Aggregate repeated per-turn observations into a current-session learning profile. */
export function rankedTopics(
  notes: readonly MathTeachingNote[],
  field: 'weaknesses' | 'strengths',
): string[] {
  const counts = new Map<string, number>()
  for (const note of notes) {
    for (const topic of note[field]) {
      counts.set(topic, (counts.get(topic) ?? 0) + 1)
    }
  }
  return [...counts]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-CN'))
    .slice(0, 4)
    .map(([topic]) => topic)
}

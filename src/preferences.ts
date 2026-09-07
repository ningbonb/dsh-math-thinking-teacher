/** Durable namespace for learner-facing mathematics-teacher preferences. */
export const SETTINGS_NAMESPACE = 'math-thinking-teacher'

/** Configurable directness of local hints. */
export type HintStrength = 'minimal' | 'balanced' | 'explicit'

/** Preferences a learner may change from DSH Settings. */
export interface MathTeacherPreferences {
  /** Learner stage used to choose examples and language. */
  gradeLevel: string
  /** Tone used for adaptive teaching interventions. */
  teacherTone: string
  /** Maximum directness of a hint before an attempt. */
  hintStrength: HintStrength
}

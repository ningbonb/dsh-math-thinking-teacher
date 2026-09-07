/** Browser-safe configuration for the mathematics teacher presentation. */
import type { MathProblem } from '../questions.ts'

export interface MathTeacherClientConfig {
  /** Preset id that enables the mathematics-only presentation. */
  presetId: string
  /** Display name shown in the mathematics-only presentation. */
  teacherName: string
  /** Questions a learner may select before their first message. */
  questionBank: MathProblem[]
}

/** Default browser configuration when the Host injected no override. */
export const DEFAULT_CONFIG: MathTeacherClientConfig = {
  presetId: 'math-thinking-teacher',
  teacherName: 'AI 高中数学思维老师',
  questionBank: [],
}

function isMathProblem(value: unknown): value is MathProblem {
  if (value === null || typeof value !== 'object') return false
  const candidate = value as Partial<MathProblem>
  return typeof candidate.source === 'string'
    && typeof candidate.title === 'string'
    && typeof candidate.statement === 'string'
}

/** Normalize the Host-injected configuration before rendering. */
export function normalizeConfig(value: Partial<MathTeacherClientConfig> | undefined): MathTeacherClientConfig {
  return {
    presetId: typeof value?.presetId === 'string' && value.presetId.trim().length > 0
      ? value.presetId.trim()
      : DEFAULT_CONFIG.presetId,
    teacherName: typeof value?.teacherName === 'string' && value.teacherName.trim().length > 0
      ? value.teacherName.trim()
      : DEFAULT_CONFIG.teacherName,
    questionBank: Array.isArray(value?.questionBank)
      ? value.questionBank.filter(isMathProblem)
      : DEFAULT_CONFIG.questionBank,
  }
}

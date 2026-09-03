/** Browser-safe configuration injected by the host plugin. */
import { DEFAULT_QUESTION_BANK } from '../questions.ts'

export interface MathTeacherConfig {
  presetId: string
  teacherName: string
  questionBank: Array<{
    source: string
    title: string
    statement: string
    openingQuestion: string
    learningGoals: string[]
  }>
}

/** Fallback visible before a host config is injected. */
export const DEFAULT_CONFIG: MathTeacherConfig = {
  presetId: 'math-thinking-teacher',
  teacherName: 'AI 高中数学思维老师',
  questionBank: DEFAULT_QUESTION_BANK,
}

/** Accept only a complete host configuration, otherwise retain a usable demonstration card. */
export function normalizeConfig(value: Partial<MathTeacherConfig> | undefined): MathTeacherConfig {
  if (
    typeof value?.presetId !== 'string'
    || typeof value.teacherName !== 'string'
    || !Array.isArray(value.questionBank)
    || !value.questionBank.every(problem =>
      typeof problem?.source === 'string'
      && typeof problem.title === 'string'
      && typeof problem.statement === 'string'
      && typeof problem.openingQuestion === 'string'
      && Array.isArray(problem.learningGoals)
      && problem.learningGoals.every(goal => typeof goal === 'string'))
  ) return DEFAULT_CONFIG
  return {
    presetId: value.presetId.trim() || DEFAULT_CONFIG.presetId,
    teacherName: value.teacherName.trim() || DEFAULT_CONFIG.teacherName,
    questionBank: value.questionBank.map(problem => ({
      source: problem.source.trim(),
      title: problem.title.trim(),
      statement: problem.statement.trim(),
      openingQuestion: problem.openingQuestion.trim(),
      learningGoals: problem.learningGoals.map(goal => goal.trim()).filter(Boolean),
    })),
  }
}

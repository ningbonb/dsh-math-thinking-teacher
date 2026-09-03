import z from '@deepseek-ai/schemastery'
import { DEFAULT_QUESTION_BANK } from './questions.ts'

/** One configured source problem. */
export interface MathProblem {
  /** Human-readable provenance shown to the learner. */
  source: string
  /** Short name used in the task card. */
  title: string
  /** Problem statement, with inline LaTeX supported by the chat renderer. */
  statement: string
  /** First question the teacher asks instead of revealing a solution. */
  openingQuestion: string
  /** Abilities the session deliberately exercises. */
  learningGoals: string[]
}

/** Deployment-owned configuration. */
export interface Config {
  /** Stable agent-preset id selected from DSH's native new-session control. */
  presetId: string
  /** Teacher name presented in the task card and teaching output. */
  teacherName: string
  /** Curated questions offered before the learner starts a mathematics session. */
  questionBank: MathProblem[]
}

const MathProblemConfig: z<MathProblem> = z.object({
  source: z.string().required(),
  title: z.string().required(),
  statement: z.string().required(),
  openingQuestion: z.string().required(),
  learningGoals: z.array(z.string()).required(),
})

/** Runtime schema for both the Web bundle and the preset policy row. */
export const Config: z<Config> = z.object({
  presetId: z.string().default('math-thinking-teacher'),
  teacherName: z.string().default('AI 高中数学思维老师'),
  questionBank: z.array(MathProblemConfig).default(DEFAULT_QUESTION_BANK),
})

/** Refuse preset ids that cannot be represented as one preset directory. */
export function assertPresetId(presetId: string): void {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(presetId)) {
    throw new Error('dsh-math-thinking-teacher: presetId must match [a-z0-9][a-z0-9-]*')
  }
}

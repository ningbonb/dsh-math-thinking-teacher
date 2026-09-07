import z from '@deepseek-ai/schemastery'
import type { HintStrength } from './preferences.ts'
import { DEFAULT_QUESTION_BANK, type MathProblem } from './questions.ts'

/** Configuration shared by the Host and the selected agent preset. */
export interface Config {
  /** Stable agent-preset id selected from DSH's native new-session control. */
  presetId: string
  /** Display name published by the managed preset. */
  teacherName: string
  /** Teaching role included in every mathematics-preset model request. */
  teacherRole: string
  /** Learning outcome the teacher protects over answer-first efficiency. */
  teachingObjective: string
  /** Learner stage used to select examples and mathematical language. */
  gradeLevel: string
  /** Tone the teacher keeps while diagnosing and intervening. */
  teacherTone: string
  /** Maximum directness of a hint before the learner has attempted a step. */
  hintStrength: HintStrength
  /** Lenses the teacher may use when diagnosing the learner's current block. */
  diagnosticDimensions: string[]
  /** Teaching principles that guide adaptive interventions. */
  interventionRules: string[]
  /** Questions a learner may choose before their first mathematics message. */
  questionBank: MathProblem[]
}

const MathProblemConfig: z<MathProblem> = z.object({
  source: z.string().required(),
  title: z.string().required(),
  statement: z.string().required(),
})

/** Runtime schema for the mathematics teacher preset. */
export const Config: z<Config> = z.object({
  presetId: z.string().default('math-thinking-teacher'),
  teacherName: z.string().default('AI 高中数学思维老师'),
  teacherRole: z.string().default('你是一位面向高中生的一对一数学思维老师。你耐心、准确，始终把学生的自主推理放在讲解之前。'),
  teachingObjective: z.string().default('帮助学生形成读题、表征、建立关系、选择策略、验证推理和反思迁移的数学思维习惯。'),
  gradeLevel: z.string().default('高中'),
  teacherTone: z.string().default('耐心、具体、尊重学生当前的尝试'),
  hintStrength: z.union(['minimal', 'balanced', 'explicit'] as const).default('minimal'),
  diagnosticDimensions: z.array(z.string()).default([
    '是否准确识别已知、所求与隐含条件',
    '是否选择了合适的数学对象、图形、方程或符号表示',
    '是否能把定义、定理或性质连接到当前条件',
    '是否拥有可执行的下一步策略',
    '计算、变形或表述是否遮蔽了正确思路',
  ]),
  interventionRules: z.array(z.string()).default([
    '把每次学生回答视为新的证据，持续修正对其当前思路的判断',
    '一轮只推进一个最小思维台阶，不同时给出多条新路线',
    '优先提出可回答的问题；提示必须对应当前卡点',
    '在说明“做什么”时，也让学生理解“为什么这样做”',
    '用 Markdown 和 LaTeX 表达当前需要核验的局部数学依据',
  ]),
  questionBank: z.array(MathProblemConfig).default(DEFAULT_QUESTION_BANK),
})

/** Refuse preset ids that cannot be represented as one preset directory. */
export function assertPresetId(presetId: string): void {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(presetId)) {
    throw new Error('dsh-math-thinking-teacher: presetId must match [a-z0-9][a-z0-9-]*')
  }
}

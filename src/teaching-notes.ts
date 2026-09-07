import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-session-projection'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { z } from 'zod'

/** One student-facing summary of a substantive mathematics teaching intervention. */
export interface MathTeachingNote {
  /** Turn whose teaching intervention produced this note. */
  turn: number
  /** Evidence-based observation of the learner's current reasoning. */
  diagnosis: string
  /** Mathematical thinking operation the learner is practising now. */
  trainingGoal: string
  /** One learner-owned next action. */
  nextStep: string
  /** Current place in the learner's problem-solving process. */
  stage: LearningStage
  /** Agent's current evidence-based view of the learner's progress. */
  mastery: MasteryState
  /** Knowledge points that currently need more learner-owned practice. */
  weaknesses: string[]
  /** Knowledge points the learner has supported with visible evidence. */
  strengths: string[]
  /** Optional local hint when the learner needs one. */
  hint?: string
}

const LEARNING_STAGES = ['understand', 'represent', 'plan', 'solve', 'verify', 'reflect'] as const
const MASTERY_STATES = ['exploring', 'stuck', 'progressing', 'confident'] as const

/** Broad problem-solving stages that remain useful across mathematics topics. */
export type LearningStage = typeof LEARNING_STAGES[number]

/** Current progress labels inferred from the learner's visible work. */
export type MasteryState = typeof MASTERY_STATES[number]

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /** Legacy complete teaching-note state retained only to read earlier local logs. */
    'math-thinking/notes': { notes: MathTeachingNote[] }
  }
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap {
    mathTeachingNotes: MathTeachingNote[]
  }
  interface SessionProjectionMap {
    /** Latest complete teaching note per mathematics turn. */
    mathTeachingNotes: MathTeachingNote[]
  }
}

const noteSchema = z.object({
  turn: z.number().int().positive(),
  diagnosis: z.string(),
  trainingGoal: z.string(),
  nextStep: z.string(),
  stage: z.enum(LEARNING_STAGES),
  mastery: z.enum(MASTERY_STATES),
  weaknesses: z.array(z.string()),
  strengths: z.array(z.string()),
  hint: z.string().optional(),
})

const notesSchema = z.array(noteSchema)

/** Read one teaching note from the durable metadata attached to a known tool-result event. */
export function noteFromToolMeta(meta: unknown): MathTeachingNote | undefined {
  if (meta === null || typeof meta !== 'object') return undefined
  const record = meta as { kind?: unknown; note?: unknown }
  if (record.kind !== 'math-thinking/note') return undefined
  const parsed = noteSchema.safeParse(record.note)
  return parsed.success ? parsed.data : undefined
}

/** Replace one turn's note while retaining the complete replayable history. */
export function replaceTeachingNote(notes: readonly MathTeachingNote[], note: MathTeachingNote): MathTeachingNote[] {
  return [...notes.filter(candidate => candidate.turn !== note.turn), note]
}

/** Register the durable teaching-note projection before history reads any mathematics session. */
export function installTeachingNoteProjection(ctx: Context): void {
  ctx.sessionProjections.register({
    key: 'mathTeachingNotes',
    stateSchema: notesSchema,
    init: () => [],
    apply: (state, event) => {
      if (event.type === 'math-thinking/notes') return event.data.notes
      if (event.type !== 'tool/result') return state
      const note = noteFromToolMeta(event.data.meta)
      return note === undefined ? state : replaceTeachingNote(state, note)
    },
    wire: { viewSchema: notesSchema, view: state => state },
    stateVersion: 1,
  })
}

/** Register the model-facing recorder inside the mathematics agent preset. */
export function installTeachingNoteTool(ctx: Context): void {
  ctx.tools.register(defineTool({
    name: 'record_math_teaching_note',
    description: 'Record one concise, student-facing note after you make a substantive mathematics teaching intervention. '
      + 'Call it at most once in a learner turn, before your natural-language reply. The note must agree with that reply, '
      + 'cite learner-visible evidence in the diagnosis, name one current thinking operation, give one learner-owned next step, '
      + 'and list only knowledge points supported by the learner’s visible work. '
      + 'Use hint only when you actually gave or intend to give a local hint. Do not use this tool for greetings, non-mathematics requests, '
      + 'or speculative hidden reasoning.',
    parameters: {
      diagnosis: { type: 'string', required: true, description: 'Brief evidence-based observation of the learner’s current reasoning.' },
      training_goal: { type: 'string', required: true, description: 'One mathematical thinking operation the learner is practising.' },
      next_step: { type: 'string', required: true, description: 'One next action the learner can perform independently.' },
      stage: { type: 'string', required: true, enum: LEARNING_STAGES, description: 'understand | represent | plan | solve | verify | reflect' },
      mastery: { type: 'string', required: true, enum: MASTERY_STATES, description: 'exploring | stuck | progressing | confident' },
      weaknesses: { type: 'array', required: true, items: { type: 'string' }, description: 'Knowledge points needing more practice; use [] when none is evidenced.' },
      strengths: { type: 'array', required: true, items: { type: 'string' }, description: 'Knowledge points supported by visible learner work; use [] when none is evidenced.' },
      hint: { type: 'string', description: 'Optional local hint, only when it is needed for the next step.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          note: {
            type: 'object',
            required: true,
            additionalProperties: false,
            properties: {
              turn: { type: 'integer', required: true },
              diagnosis: { type: 'string', required: true },
              trainingGoal: { type: 'string', required: true },
              nextStep: { type: 'string', required: true },
              stage: { type: 'string', required: true, enum: LEARNING_STAGES },
              mastery: { type: 'string', required: true, enum: MASTERY_STATES },
              weaknesses: { type: 'array', required: true, items: { type: 'string' } },
              strengths: { type: 'array', required: true, items: { type: 'string' } },
              hint: { type: 'string' },
            },
          },
        },
      },
      render: () => [{ type: 'text', text: 'Teaching note recorded.' }],
      presentationMeta: (_args, value) => ({
        kind: 'math-thinking/note',
        note: (value as { note: MathTeachingNote }).note,
      }),
    },
    execute(args, exec) {
      const agent = exec.agent
      if (agent === undefined) throw new Error('record_math_teaching_note requires an owning agent session')
      const boundary = ctx.sessionProjections.stateOf(agent.session, 'turnBoundary')
      if (boundary === undefined || boundary.openTurnStartSeq === null || boundary.lastTurn < 1) {
        throw new Error('record_math_teaching_note requires an active learner turn')
      }
      const note: MathTeachingNote = {
        turn: boundary.lastTurn,
        diagnosis: args.diagnosis,
        trainingGoal: args.training_goal,
        nextStep: args.next_step,
        stage: args.stage,
        mastery: args.mastery,
        weaknesses: args.weaknesses,
        strengths: args.strengths,
        ...args.hint === undefined ? {} : { hint: args.hint },
      }
      return Promise.resolve({ note })
    },
    presentCall: () => ({ card: 'generic', title: '整理本轮学习要点', kind: 'other' }),
    presentResult: () => ({ card: 'generic', content: [] }),
  }))
}

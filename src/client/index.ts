import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { DEFAULT_CONFIG, normalizeConfig, type MathTeacherConfig } from './config.ts'
import { MathThinkingDock } from './MathThinkingDock.tsx'

/** Global injected by the host bundle before browser modules execute. */
export const MATH_TEACHER_GLOBAL = '__NINGBO_DSH_MATH_THINKING_TEACHER__'

declare global {
  interface Window {
    __NINGBO_DSH_MATH_THINKING_TEACHER__?: Partial<MathTeacherConfig>
  }
}

/** Required client services. */
export const inject = ['slots', 'sessions']

/** Register the task card only for sessions already composed with the mathematics preset. */
export function installMathThinkingTeacher(ctx: ClientContext, config: MathTeacherConfig = DEFAULT_CONFIG): void {
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'math-thinking-teacher',
    order: -10,
    inject: (sessionId) => ({
      config,
      isBlankSession: () => ctx.sessions.list.getSnapshot().byId[sessionId]?.blank === true,
      isMathSession: () => ctx.sessions.list.getSnapshot().byId[sessionId]?.agentPreset === config.presetId,
    }),
  }, MathThinkingDock))
}

/** Read the host configuration and install the mathematics-session-only task card. */
export function apply(ctx: ClientContext): void {
  installMathThinkingTeacher(ctx, normalizeConfig(window[MATH_TEACHER_GLOBAL]))
}

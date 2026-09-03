/** Agent-preset half: registers the teacher policy only for selected sessions. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { Config, type Config as TeacherConfig } from './config.ts'
import { teacherPrompt } from './policy.ts'

export { Config }

/** Required agent-plane service. */
export const inject = ['systemPrompt']

/** Register the teaching policy in this preset's agent scope. */
export function apply(ctx: Context, config: TeacherConfig): void {
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'math-thinking-teacher:policy',
    order: 20,
    text: teacherPrompt(config),
  }), 'math-thinking-teacher: teaching policy')
}

/** Agent-preset half for the selectable mathematics teacher shell. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { Config, type Config as TeacherConfig } from './config.ts'
import { teacherPrompt } from './policy.ts'
import type {} from './settings.ts'
import { installTeachingNoteTool } from './teaching-notes.ts'

export { Config }

/** Required agent-plane service. */
export const inject = ['systemPrompt', 'tools', 'sessionProjections', 'mathTeacherSettings']

/** Register the configurable teaching policy in this preset's agent scope. */
export function apply(ctx: Context, config: TeacherConfig): void {
  installTeachingNoteTool(ctx)
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'math-thinking-teacher:policy',
    order: 20,
    text: () => teacherPrompt(config, ctx.mathTeacherSettings.get()),
  }), 'math-thinking-teacher: teaching policy')
}

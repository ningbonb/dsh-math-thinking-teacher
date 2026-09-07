import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { MathTeacherDock } from './MathTeacherDock.tsx'
import { normalizeConfig, type MathTeacherClientConfig } from './config.ts'
import { TeacherSettingsSection } from './TeacherSettingsSection.tsx'
import { SETTINGS_NAMESPACE, type MathTeacherPreferences } from '../preferences.ts'

/** Global injected by the Host bundle before browser modules execute. */
export const MATH_TEACHER_GLOBAL = '__NINGBO_DSH_MATH_THINKING_TEACHER__'

declare global {
  interface Window {
    __NINGBO_DSH_MATH_THINKING_TEACHER__?: Partial<MathTeacherClientConfig>
  }
}

/** Required client services. */
export const inject = ['slots', 'settingsScope']

/** Register a presentation that renders only for mathematics-preset sessions. */
export function installMathTeacherDock(ctx: ClientContext, config: MathTeacherClientConfig): void {
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'math-thinking-teacher',
    order: -10,
    inject: () => ({ config }),
  }, MathTeacherDock))
}

/** Read Host configuration and register the mathematics-only presentation. */
export function apply(ctx: ClientContext): void {
  installMathTeacherDock(ctx, normalizeConfig(window[MATH_TEACHER_GLOBAL]))
  const settings = ctx.settingsScope.bind<MathTeacherPreferences>({ namespace: SETTINGS_NAMESPACE })
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'math-thinking-teacher',
    order: 80,
    label: '数学思维老师',
    inject: () => ({ settings }),
  }, TeacherSettingsSection))
}

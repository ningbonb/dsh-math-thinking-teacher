import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-settings'
import type { Config } from './config.ts'
import { SETTINGS_NAMESPACE, type MathTeacherPreferences } from './preferences.ts'

export { SETTINGS_NAMESPACE, type MathTeacherPreferences } from './preferences.ts'

/** Schema shared by Host persistence and the browser settings editor. */
export const MathTeacherPreferencesSchema: z<MathTeacherPreferences> = z.object({
  gradeLevel: z.string().default('高中'),
  teacherTone: z.string().default('耐心、具体、尊重学生当前的尝试'),
  hintStrength: z.union(['minimal', 'balanced', 'explicit'] as const).default('minimal'),
})

/** Live reader over the latest resolved user preferences. */
export interface MathTeacherSettings {
  /** Read the latest persisted user preferences layered over profile configuration. */
  get(): MathTeacherPreferences
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    mathTeacherSettings: MathTeacherSettings
  }
}

/** Provide a live settings reader and register its durable user namespace. */
export function installMathTeacherSettings(ctx: Context, config: Config): void {
  const base: MathTeacherPreferences = {
    gradeLevel: config.gradeLevel,
    teacherTone: config.teacherTone,
    hintStrength: config.hintStrength,
  }
  let read = (): MathTeacherPreferences => base
  ctx.provide('mathTeacherSettings', { get: () => read() })
  ctx.inject(['settings'], (settingsCtx) => {
    const scope = settingsCtx.settings.register(
      SETTINGS_NAMESPACE,
      MathTeacherPreferencesSchema,
      { base },
    )
    read = () => scope.get()
  })
}

import { useSyncExternalStore } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings'
import type { MathTeacherPreferences } from '../preferences.ts'

/** Runtime dependencies injected into the mathematics-teacher settings page. */
export interface TeacherSettingsSectionInjected {
  /** Durable user preferences mirrored from the Host settings namespace. */
  settings: SettingsScope<MathTeacherPreferences>
}

const fieldStyle = {
  background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8,
  color: 'var(--dsw-alias-label-primary)', font: 'inherit', padding: '8px 10px', width: '100%',
}

/** Render learner-facing mathematics-teacher preferences inside DSH Settings. */
export function TeacherSettingsSection({ settings }: PropsRuntime<'settings.section'> & TeacherSettingsSectionInjected) {
  const snapshot = useSyncExternalStore(
    listener => settings.subscribe(listener),
    () => settings.getSnapshot(),
  )
  const preferences = snapshot.value
  if (snapshot.status === 'loading') return <p>正在读取数学思维老师设置。</p>
  if (preferences === undefined) return <p>当前 DSH 配置未开放数学思维老师设置。</p>

  return (
    <section style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gap: 5 }}>
        <strong>数学思维老师</strong>
        <span style={{ color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5 }}>这些设置会在下一次数学模式回复时生效，不影响标准模式。</span>
      </div>
      <label style={{ display: 'grid', gap: 6 }}>
        <strong>学习阶段</strong>
        <input onChange={event => { void settings.set('gradeLevel', event.target.value) }} style={fieldStyle} value={preferences.gradeLevel} />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <strong>老师语气</strong>
        <input onChange={event => { void settings.set('teacherTone', event.target.value) }} style={fieldStyle} value={preferences.teacherTone} />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <strong>提示强度</strong>
        <select onChange={event => { void settings.set('hintStrength', event.target.value) }} style={fieldStyle} value={preferences.hintStrength}>
          <option value="minimal">最小提示</option>
          <option value="balanced">适度提示</option>
          <option value="explicit">明确提示</option>
        </select>
      </label>
      {!snapshot.writable && <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>当前连接不支持保存设置，请通过 profile 配置。</span>}
    </section>
  )
}

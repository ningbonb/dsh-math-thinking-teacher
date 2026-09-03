import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { MathTeacherConfig } from './config.ts'

/** Fixed learning-task card shown directly above the existing DSH composer. */
export function MathThinkingDock({ config }: PropsRuntime<'conversation.input.dock'> & { config: MathTeacherConfig }) {
  const { problem } = config
  return (
    <section
      aria-label={`${config.teacherName} 当前题目`}
      data-math-thinking-teacher
      style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(14, 165, 233, 0.08))',
        border: '1px solid rgba(99, 102, 241, 0.32)',
        borderRadius: 12,
        color: 'inherit',
        margin: '0 0 10px',
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 6 }}>
        <strong>{config.teacherName}</strong>
        <span style={{ color: '#4f46e5', fontSize: 12, fontWeight: 700 }}>思维训练中</span>
      </div>
      <div style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>{problem.source}</div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{problem.title}</div>
      <div style={{ lineHeight: 1.55, marginBottom: 8 }}>{problem.statement}</div>
      <div style={{ borderLeft: '3px solid #6366f1', lineHeight: 1.5, paddingLeft: 10 }}>
        <strong>起始追问：</strong>{problem.openingQuestion}
      </div>
      <div style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>
        训练目标：{problem.learningGoals.join(' · ')}
      </div>
    </section>
  )
}

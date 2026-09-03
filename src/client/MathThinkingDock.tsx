import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { MathTeacherConfig } from './config.ts'

type MathProblem = MathTeacherConfig['questionBank'][number]

const buttonBase = {
  alignItems: 'center', borderRadius: 18, color: 'var(--dsw-alias-label-primary)', cursor: 'pointer', display: 'inline-flex', fontSize: 14,
  gap: 4, justifyContent: 'flex-start', lineHeight: '22px', minHeight: 36, padding: '7px 14px', textAlign: 'left' as const,
}

/** Serialize one curated question as the durable first learner message. */
export function questionSelectionMessage(problem: MathProblem): string {
  return `# 数学训练题目

来源：${problem.source}

## ${problem.title}

${problem.statement}

训练目标：${problem.learningGoals.join('；')}

请从这个起始追问开始：${problem.openingQuestion}`
}

/** Seed the composer before a learner attaches their own problem image. */
export const UPLOAD_QUESTION_DRAFT = '# 数学训练题目\n\n我将上传一道自定义题目。请先确认你从附件识别到的题干、条件与所求；不清楚时请追问，不要开始解答。'

/** First-step selector displayed only while a mathematics session is blank. */
export function MathThinkingDock({ config, inputActions, isBlankSession, isMathSession }: PropsRuntime<'conversation.input.dock'> & {
  config: MathTeacherConfig
  isBlankSession: () => boolean
  isMathSession: () => boolean
}) {
  if (!isMathSession() || !isBlankSession()) return null

  const chooseQuestion = (problem: MathProblem): void => {
    inputActions.setDraft(questionSelectionMessage(problem))
    inputActions.submit()
  }

  return (
    <section
      aria-label={`${config.teacherName} 选题`}
      data-math-thinking-teacher
      style={{
        background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16,
        boxSizing: 'border-box', margin: '0 auto 12px', maxWidth: 'var(--dsh-composer-card-max-width)', padding: 16,
        width: 'calc(100% - 2 * var(--dsh-composer-side-clearance))',
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>{config.teacherName}</strong>
        <span style={{ background: 'var(--dsw-alias-bg-layer-2)', borderRadius: 12, color: 'var(--dsw-alias-label-secondary)', fontSize: 12, lineHeight: '18px', padding: '3px 8px' }}>开始训练</span>
      </div>
      <p style={{ lineHeight: 1.5, margin: '0 0 14px' }}>选择题库练习，或上传自己的题目。老师会从你的第一步尝试开始引导。</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {config.questionBank.map(problem => (
          <button
            key={`${problem.source}:${problem.title}`}
            onClick={() => { chooseQuestion(problem) }}
            style={{ ...buttonBase, background: 'transparent', border: '1px solid var(--dsw-alias-border-l2)', height: 'auto', width: '100%' }}
            type="button"
          >
            <span style={{ display: 'grid', gap: 3 }}>
              <strong>{problem.title}</strong>
              <span style={{ fontSize: 12, opacity: 0.72 }}>{problem.source}</span>
            </span>
          </button>
        ))}
        {config.questionBank.length === 0 && <span style={{ fontSize: 13, opacity: 0.72 }}>题库暂未配置，可以先上传自己的题目。</span>}
        <button
          onClick={() => { inputActions.setDraft(UPLOAD_QUESTION_DRAFT) }}
          style={{ ...buttonBase, background: 'transparent', border: 0, height: 'auto', width: '100%' }}
          type="button"
        >
          <span style={{ display: 'grid', gap: 3 }}>
            <strong>上传自己的题目</strong>
            <span style={{ fontSize: 12, opacity: 0.72 }}>在下方原生输入框添加图片或题干后，发送第一条消息。</span>
          </span>
        </button>
      </div>
    </section>
  )
}

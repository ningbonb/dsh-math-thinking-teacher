import { useState } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { rankedTopics } from '../learning-profile.ts'
import { questionSelectionMessage } from '../questions.ts'
import type { MathTeachingNote } from '../teaching-notes.ts'
import type { MathTeacherClientConfig } from './config.ts'

type EntryChoice = 'start' | 'question-bank' | 'upload'
type PanelTab = 'current' | 'progress' | 'profile'

const STAGE_LABEL = {
  understand: '理解题意',
  represent: '建立表示',
  plan: '选择策略',
  solve: '推进求解',
  verify: '核验结果',
  reflect: '反思迁移',
} as const

const MASTERY_LABEL = {
  exploring: '正在探索',
  stuck: '遇到卡点',
  progressing: '正在推进',
  confident: '可以检验',
} as const

const STAGES = Object.keys(STAGE_LABEL) as MathTeachingNote['stage'][]

const cardStyle = {
  background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12,
  boxSizing: 'border-box' as const, margin: '0 auto 12px', maxWidth: 'var(--dsh-composer-card-max-width)',
  padding: '16px', width: 'calc(100% - 2 * var(--dsh-composer-side-clearance))',
}

const buttonStyle = {
  background: 'transparent', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 10,
  color: 'var(--dsw-alias-label-primary)', cursor: 'pointer', font: 'inherit', padding: '12px', textAlign: 'left' as const,
}

const signalButtonStyle = {
  ...buttonStyle,
  fontSize: 13,
  padding: '7px 10px',
}

const tabStyle = (active: boolean) => ({
  background: active ? 'var(--dsw-alias-bg-layer-2)' : 'transparent', border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: 10, color: 'var(--dsw-alias-label-primary)', cursor: 'pointer', font: 'inherit', fontSize: 13, padding: '6px 10px',
})

const topicStyle = (emphasized: boolean) => ({
  background: emphasized ? 'var(--dsw-alias-bg-layer-2)' : 'transparent', border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: 10, color: 'var(--dsw-alias-label-primary)', fontSize: 12, padding: '3px 7px',
})

/** Mathematics-only notice displayed above the native composer. */
export function MathTeacherDock({
  config, inputActions, sessionId, useSessions,
}: PropsRuntime<'conversation.input.dock'> & { config: MathTeacherClientConfig }) {
  const session = useSessions(state => state.byId[sessionId])
  const [entryChoice, setEntryChoice] = useState<EntryChoice>('start')
  const [questionSource, setQuestionSource] = useState<string | undefined>(undefined)
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [panelTab, setPanelTab] = useState<PanelTab>('current')
  if (session?.projectionValues?.agentPreset !== config.presetId) return null

  const teachingNotes = session.projectionValues.mathTeachingNotes ?? []
  const latestNote = teachingNotes.at(-1)
  const weaknesses = rankedTopics(teachingNotes, 'weaknesses')
  const strengths = rankedTopics(teachingNotes, 'strengths')
  const sources = [...new Set(config.questionBank.map(problem => problem.source))]
  const visibleQuestions = questionSource === undefined
    ? config.questionBank
    : config.questionBank.filter(problem => problem.source === questionSource)

  const sendLearningSignal = (message: string): void => {
    inputActions.setDraft(message)
    inputActions.submit()
  }

  if (!session.blank) {
    const currentStageIndex = latestNote === undefined ? -1 : STAGES.indexOf(latestNote.stage)
    const summary = latestNote === undefined
      ? '继续写下你的推理过程或卡住的位置。'
      : `下一步：${latestNote.nextStep}`
    return (
      <section aria-label={`${config.teacherName} 模式`} data-math-thinking-teacher style={{ ...cardStyle, padding: '12px 16px' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <div style={{ display: 'grid', gap: 3, minWidth: 0 }}>
              <strong>{latestNote === undefined ? config.teacherName : `${STAGE_LABEL[latestNote.stage]} · ${MASTERY_LABEL[latestNote.mastery]}`}</strong>
              <span style={{ color: 'var(--dsw-alias-label-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
            </div>
            <button aria-expanded={panelExpanded} onClick={() => { setPanelExpanded(value => !value) }} style={signalButtonStyle} type="button">{panelExpanded ? '收起' : '展开'}</button>
          </div>
          {!panelExpanded && <button onClick={() => { sendLearningSignal('我现在卡住了。请根据我刚才的尝试，帮我找到一个最小的下一步。') }} style={{ ...signalButtonStyle, justifySelf: 'start' }} type="button">我卡住了</button>}
          {panelExpanded && (
            <>
              <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <button aria-selected={panelTab === 'current'} onClick={() => { setPanelTab('current') }} role="tab" style={tabStyle(panelTab === 'current')} type="button">本轮</button>
                <button aria-selected={panelTab === 'progress'} onClick={() => { setPanelTab('progress') }} role="tab" style={tabStyle(panelTab === 'progress')} type="button">进度</button>
                <button aria-selected={panelTab === 'profile'} onClick={() => { setPanelTab('profile') }} role="tab" style={tabStyle(panelTab === 'profile')} type="button">档案</button>
              </div>
              {panelTab === 'current' && (
                latestNote === undefined
                  ? <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>老师会在形成实质教学判断后更新本轮学习要点。</span>
                  : <div style={{ display: 'grid', gap: 8 }}>
                      <span><strong>观察：</strong>{latestNote.diagnosis}</span>
                      <span><strong>正在练习：</strong>{latestNote.trainingGoal}</span>
                      <span><strong>下一步：</strong>{latestNote.nextStep}</span>
                      {latestNote.hint !== undefined && <span><strong>提示：</strong>{latestNote.hint}</span>}
                    </div>
              )}
              {panelTab === 'progress' && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>当前环节会随你的作答更新，不表示线性完成百分比。</span>
                  <div aria-label="解题阶段" style={{ alignItems: 'center', display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
                    {STAGES.map((stage, index) => (
                      <div key={stage} style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                        {index > 0 && <span style={{ background: 'var(--dsw-alias-border-l2)', height: 1, width: 12 }} />}
                        <span style={{ alignItems: 'center', background: index === currentStageIndex ? 'var(--dsw-alias-bg-layer-2)' : 'transparent', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, display: 'inline-flex', fontSize: 12, height: 24, justifyContent: 'center', minWidth: 24, padding: '0 6px', whiteSpace: 'nowrap' }}>{STAGE_LABEL[stage]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {panelTab === 'profile' && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <strong>待加强</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{weaknesses.length === 0 ? <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>继续收集你的作答证据。</span> : weaknesses.map(topic => <span key={topic} style={topicStyle(true)}>{topic}</span>)}</div>
                  </div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <strong>已形成</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{strengths.length === 0 ? <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>继续用下一步验证。</span> : strengths.map(topic => <span key={topic} style={topicStyle(false)}>{topic}</span>)}</div>
                  </div>
                  {teachingNotes.length > 1 && (
                    <details>
                      <summary>查看本题学习记录</summary>
                      <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                        {teachingNotes.slice(0, -1).map(note => <span key={note.turn}>第 {note.turn} 轮 · {STAGE_LABEL[note.stage]} · {note.nextStep}</span>)}
                      </div>
                    </details>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button onClick={() => { sendLearningSignal('我现在卡住了。请根据我刚才的尝试，帮我找到一个最小的下一步。') }} style={signalButtonStyle} type="button">我卡住了</button>
                <button onClick={() => { sendLearningSignal('我认为我理解了这一步。请让我用自己的话说明或完成下一步来验证。') }} style={signalButtonStyle} type="button">我理解了</button>
                <button onClick={() => { sendLearningSignal('请基于当前题目给我一个相近但不相同的小练习，用来检验我是否掌握。') }} style={signalButtonStyle} type="button">再练一次</button>
              </div>
            </>
          )}
        </div>
      </section>
    )
  }

  const chooseProblem = (index: number): void => {
    const problem = config.questionBank[index]
    if (problem === undefined) return
    inputActions.setDraft(questionSelectionMessage(problem))
    inputActions.submit()
  }

  const beginUpload = (): void => {
    setEntryChoice('upload')
  }

  return (
    <section aria-label={`${config.teacherName} 开始学习`} data-math-thinking-teacher style={cardStyle}>
      <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
        <strong>{config.teacherName}</strong>
        <span style={{ color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5 }}>先选一道题，再从你的第一步想法开始。</span>
      </div>
      {entryChoice === 'start' && (
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <button onClick={() => { setEntryChoice('question-bank') }} style={buttonStyle} type="button"><strong>从题库选题</strong><br /><span style={{ color: 'var(--dsw-alias-label-secondary)', fontSize: 13 }}>选择一道练习题开始推理</span></button>
          <button onClick={beginUpload} style={buttonStyle} type="button"><strong>上传自己的题目</strong><br /><span style={{ color: 'var(--dsw-alias-label-secondary)', fontSize: 13 }}>添加图片或直接输入题干</span></button>
        </div>
      )}
      {entryChoice === 'question-bank' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {sources.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button onClick={() => { setQuestionSource(undefined) }} style={signalButtonStyle} type="button">全部</button>
              {sources.map(source => <button key={source} onClick={() => { setQuestionSource(source) }} style={signalButtonStyle} type="button">{source}</button>)}
            </div>
          )}
          {visibleQuestions.map(problem => {
            const index = config.questionBank.indexOf(problem)
            return (
            <button key={`${problem.source}:${problem.title}`} onClick={() => { chooseProblem(index) }} style={buttonStyle} type="button">
              <strong>{problem.title}</strong><br /><span style={{ color: 'var(--dsw-alias-label-secondary)', fontSize: 13 }}>{problem.source}</span>
            </button>
            )
          })}
          {config.questionBank.length === 0 && <span style={{ color: 'var(--dsw-alias-label-secondary)' }}>题库暂未配置，请上传自己的题目。</span>}
          <button onClick={() => { setEntryChoice('start') }} style={{ ...buttonStyle, border: 0, padding: '4px 0' }} type="button">返回</button>
        </div>
      )}
      {entryChoice === 'upload' && (
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5 }}>请在下方原生输入框添加题目图片或补充题干，再发送第一条消息。</span>
          <button onClick={() => { setEntryChoice('start') }} style={{ ...buttonStyle, border: 0, padding: '4px 0' }} type="button">返回</button>
        </div>
      )}
    </section>
  )
}

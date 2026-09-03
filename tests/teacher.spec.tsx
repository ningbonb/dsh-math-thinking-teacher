// @vitest-environment jsdom
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Config } from '../src/config.ts'
import { assertPresetId, ensurePreset, renderPreset } from '../src/index.ts'
import { teacherPrompt } from '../src/policy.ts'
import { normalizeConfig } from '../src/client/config.ts'
import { MathThinkingDock, questionSelectionMessage, UPLOAD_QUESTION_DRAFT } from '../src/client/MathThinkingDock.tsx'

afterEach(cleanup)

describe('math thinking teacher', () => {
  it('requires a diagnosis-first teaching policy after the learner supplies a question', () => {
    const config = Config({})
    const policy = teacherPrompt(config)
    expect(policy).toContain('首条消息中选择或上传的题目')
    expect(policy).toContain('先确认题干、条件与所求')
    expect(policy).toContain('先诊断学生刚刚的输入')
    expect(policy).toContain('一轮只推进一个最小思维台阶')
    expect(policy).toContain('不是隐藏推理过程')
    expect(policy).toContain('不直接给出完整解答')
  })

  it('keeps an upload path when the host question bank is malformed', () => {
    const config = normalizeConfig({ teacherName: '老师', questionBank: [{ title: '坏数据' }] as never })
    const view = render(<MathThinkingDock config={config} inputActions={{} as never} isBlankSession={() => true} isMathSession={() => true} />)
    expect(view.getByText('AI 高中数学思维老师')).toBeTruthy()
    expect(view.getByText('上传自己的题目')).toBeTruthy()
  })

  it('submits a curated question as the first learner message', () => {
    const setDraft = vi.fn()
    const submit = vi.fn()
    const question = {
      source: '题库 / 1', title: '函数题', statement: '求 $f(x)$ 的单调性。',
      openingQuestion: '先看什么？', learningGoals: ['导数'],
    }
    const config = { ...normalizeConfig(undefined), questionBank: [question] }
    const view = render(<MathThinkingDock config={config} inputActions={{ setDraft, submit } as never} isBlankSession={() => true} isMathSession={() => true} />)
    fireEvent.click(view.getByText('函数题'))
    expect(setDraft).toHaveBeenCalledWith(questionSelectionMessage(question))
    expect(submit).toHaveBeenCalledOnce()
  })

  it('seeds but does not submit the upload instruction before an image is attached', () => {
    const setDraft = vi.fn()
    const submit = vi.fn()
    const config = normalizeConfig(undefined)
    const view = render(<MathThinkingDock config={config} inputActions={{ setDraft, submit } as never} isBlankSession={() => true} isMathSession={() => true} />)
    fireEvent.click(view.getByText('上传自己的题目'))
    expect(setDraft).toHaveBeenCalledWith(UPLOAD_QUESTION_DRAFT)
    expect(submit).not.toHaveBeenCalled()
  })

  it('ships the policy only through a dedicated preset composition', () => {
    const composition = renderPreset(Config({}))
    expect(composition).toContain('name: dsh-math-thinking-teacher/preset')
    expect(composition).toContain('inject: [systemPrompt]')
    expect(composition).not.toContain('webServer')
  })

  it('accepts only directory-safe preset ids', () => {
    expect(() => assertPresetId('math-thinking-teacher')).not.toThrow()
    expect(() => assertPresetId('../outside')).toThrow('presetId must match')
  })

  it('updates only its own managed preset files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-math-preset-'))
    const config = Config({})
    await ensurePreset(config, root)
    const composition = join(root, config.presetId, 'agent.cordis.yml')
    await expect(readFile(composition, 'utf8')).resolves.toContain('dsh-math-thinking-teacher/preset')
    await writeFile(composition, '- id: user-owned\n  name: example\n')
    await expect(ensurePreset(config, root)).rejects.toThrow('already owned')
  })
})

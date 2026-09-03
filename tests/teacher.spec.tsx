// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Config, teacherPrompt } from '../src/index.ts'
import { normalizeConfig } from '../src/client/config.ts'
import { MathThinkingDock } from '../src/client/MathThinkingDock.tsx'

describe('math thinking teacher', () => {
  it('requires a diagnosis-first teaching policy without exposing hidden reasoning', () => {
    const config = Config({})
    const policy = teacherPrompt(config)
    expect(policy).toContain('先诊断学生刚刚的输入')
    expect(policy).toContain('一轮只推进一个最小思维台阶')
    expect(policy).toContain('不是隐藏推理过程')
    expect(policy).toContain('不直接给出完整解答')
  })

  it('keeps a complete demonstration card when host data is malformed', () => {
    const config = normalizeConfig({ teacherName: '老师', problem: { title: '坏数据' } as never })
    const view = render(<MathThinkingDock config={config} />)
    expect(view.getByText('AI 高中数学思维老师')).toBeTruthy()
    expect(view.getByText('起始追问：', { exact: false })).toBeTruthy()
  })
})

import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Config } from '../src/config.ts'
import { assertPresetId, ensurePreset, renderPreset } from '../src/index.ts'
import { rankedTopics } from '../src/learning-profile.ts'
import { teacherPrompt } from '../src/policy.ts'
import { questionSelectionMessage } from '../src/questions.ts'
import { replaceTeachingNote } from '../src/teaching-notes.ts'

describe('mathematics teacher preset shell', () => {
  it('renders a selectable composition with its configurable teacher policy', () => {
    const composition = renderPreset(Config({}))

    expect(composition).toContain('name: dsh-math-thinking-teacher/preset')
    expect(composition).toContain('inject: [systemPrompt, tools, sessionProjections, mathTeacherSettings]')
    expect(composition).toContain('questionBank')
  })

  it('publishes a configurable teacher and question bank', () => {
    expect(Config({})).toMatchObject({
      presetId: 'math-thinking-teacher',
      teacherName: 'AI 高中数学思维老师',
      teacherRole: expect.any(String),
      teachingObjective: expect.any(String),
    })
    expect(Config({}).questionBank).not.toHaveLength(0)
  })

  it('builds an adaptive teaching policy', () => {
    const policy = teacherPrompt(Config({ teacherRole: '自定义角色', diagnosticDimensions: ['读题'], interventionRules: ['一次只问一个问题'] }))

    expect(policy).toContain('自定义角色')
    expect(policy).toContain('读题')
    expect(policy).toContain('一次只问一个问题')
    expect(policy).toContain('学生的第一条消息不一定是题目')
    expect(policy).toContain('不要机械套用固定回复标题或固定轮次')
    expect(policy).toContain('DSH Agent 的完整推理、对话和工具能力')
    expect(policy).toContain('把每一次与学习有关的学生回答都视为新的诊断证据')
    expect(policy).toContain('先选择与当前短板相匹配、且强度足够小的教学动作')
    expect(policy).toContain('把解题推进权尽可能留给学生')
    expect(policy).toContain('record_math_teaching_note')
  })

  it('sends only the selected problem statement as the first learner message', () => {
    const problem = Config({}).questionBank[0]
    expect(problem).toBeDefined()
    expect(questionSelectionMessage(problem!)).toBe(problem!.statement)
  })

  it('keeps one latest teaching note per turn', () => {
    const first = { turn: 1, diagnosis: '读题完整。', trainingGoal: '建立关系。', nextStep: '写出方程。', stage: 'represent' as const, mastery: 'exploring' as const, weaknesses: ['列方程'], strengths: ['读题'] }
    const replacement = { turn: 1, diagnosis: '方程已建立。', trainingGoal: '解方程。', nextStep: '继续化简。', stage: 'solve' as const, mastery: 'progressing' as const, weaknesses: ['计算'], strengths: ['列方程'] }

    expect(replaceTeachingNote([first], replacement)).toEqual([replacement])
  })

  it('aggregates evidence-backed knowledge points into a learning profile', () => {
    const notes = [
      { turn: 1, diagnosis: 'a', trainingGoal: 'b', nextStep: 'c', stage: 'understand' as const, mastery: 'exploring' as const, weaknesses: ['定义域'], strengths: ['读题'] },
      { turn: 2, diagnosis: 'a', trainingGoal: 'b', nextStep: 'c', stage: 'represent' as const, mastery: 'progressing' as const, weaknesses: ['定义域', '配方法'], strengths: ['读题'] },
    ]

    expect(rankedTopics(notes, 'weaknesses')).toEqual(['定义域', '配方法'])
    expect(rankedTopics(notes, 'strengths')).toEqual(['读题'])
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
    const metadata = join(root, config.presetId, 'preset.yml')

    await expect(readFile(composition, 'utf8')).resolves.toContain('dsh-math-thinking-teacher/preset')
    await expect(readFile(metadata, 'utf8')).resolves.toContain('AI 高中数学思维老师')
    await writeFile(composition, '- id: user-owned\n  name: example\n')
    await expect(ensurePreset(config, root)).rejects.toThrow('already owned')
  })
})

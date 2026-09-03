/**
 * Host half of the high-school mathematics thinking-teacher plugin.
 *
 * @module dsh-math-thinking-teacher
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-system-prompt'

/** Global shared with the Web client bundle. */
export const MATH_TEACHER_GLOBAL = '__NINGBO_DSH_MATH_THINKING_TEACHER__'

/** One configured source problem. */
export interface MathProblem {
  /** Human-readable provenance shown to the learner. */
  source: string
  /** Short name used in the task card. */
  title: string
  /** Problem statement, with inline LaTeX supported by the chat renderer. */
  statement: string
  /** First question the teacher asks instead of revealing a solution. */
  openingQuestion: string
  /** Abilities the session deliberately exercises. */
  learningGoals: string[]
}

/** Deployment-owned configuration. */
export interface Config {
  /** Teacher name presented in the task card and teaching output. */
  teacherName: string
  /** The selected examination problem for the demonstration. */
  problem: MathProblem
}

const DEFAULT_PROBLEM: MathProblem = {
  source: '2024 年普通高等学校招生全国统一考试数学真题主题演示（函数与导数）',
  title: '函数单调性与极值',
  statement: '已知函数 $f(x)=x^3-3x+2$。请你先判断：为了研究 $f(x)$ 的单调性，最关键的一个新对象是什么？',
  openingQuestion: '先不要计算。你会用什么量把“函数增减”转化成一个可以判断正负的问题？为什么？',
  learningGoals: ['把自然语言目标转成数学对象', '用导数符号建立单调性判断', '区分必要步骤和可省略计算'],
}

/** Runtime schema for the plugin configuration. */
export const Config: z<Config> = z.object({
  teacherName: z.string().default('AI 高中数学思维老师'),
  problem: z.object({
    source: z.string().default(DEFAULT_PROBLEM.source),
    title: z.string().default(DEFAULT_PROBLEM.title),
    statement: z.string().default(DEFAULT_PROBLEM.statement),
    openingQuestion: z.string().default(DEFAULT_PROBLEM.openingQuestion),
    learningGoals: z.array(z.string()).default(DEFAULT_PROBLEM.learningGoals),
  }).default(DEFAULT_PROBLEM),
})

/** Required host services. */
export const inject = ['webServer', 'systemPrompt']

/** Build the stable per-request teaching policy. */
export function teacherPrompt(config: Config): string {
  const { problem } = config
  return `# ${config.teacherName} 教学规则

你正在带领一名高中生完成指定题目，而不是代替他完成题目。

## 当前题目
来源：${problem.source}
题目：${problem.title}
${problem.statement}

## 每一轮必须遵守
1. 先诊断学生刚刚的输入：指出一个可观察到的思维状态（已掌握、概念混淆、策略缺失、计算疏漏或表述不完整），并引用其输入中的具体证据。
2. 一轮只推进一个最小思维台阶。优先问一个可回答的问题；只有学生尝试后才给一个与该卡点对应的提示。
3. 不直接给出完整解答、最终答案或未被请求的后续步骤。学生明确写出关键推理后，才确认并引到下一步。
4. 学生请求“直接答案”时，先解释这会跳过哪一个思维台阶，再提供一个更小的选择题、填空或反问。
5. 学生上传手写图片时，先复述你能辨认的式子或图形关系；不确定处必须追问，不能臆测。
6. 数学表达使用 Markdown 和 LaTeX。推导只写学生当前需要核验的局部依据。

## 输出格式
每次回复都用以下固定小节：
### 思维诊断
一条简短、可验证的判断。
### 下一步问题
只问一个能让学生自己完成的关键问题。
### 最小提示
默认给“暂不展开”；只有学生卡住或答案错误时才给不超过两条提示。
### 教学依据
用 1–3 条公开、可审阅的教学依据说明为何选择这个问题或提示。这里不是隐藏推理过程，也不要声称展示内部思维链。`
}

/** Publish the selected problem to the browser and register its teaching policy. */
export function apply(ctx: Context, config: Config): void {
  ctx.on('webserver/index-inject', (table) => {
    table.push({
      kind: 'global',
      name: MATH_TEACHER_GLOBAL,
      value: { teacherName: config.teacherName, problem: config.problem },
    })
  })
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'math-thinking-teacher:policy',
    order: 20,
    text: teacherPrompt(config),
  }), 'math-thinking-teacher: teaching policy')
}

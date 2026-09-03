/** Browser-safe configuration injected by the host plugin. */
export interface MathTeacherConfig {
  teacherName: string
  problem: {
    source: string
    title: string
    statement: string
    openingQuestion: string
    learningGoals: string[]
  }
}

/** Fallback visible before a host config is injected. */
export const DEFAULT_CONFIG: MathTeacherConfig = {
  teacherName: 'AI 高中数学思维老师',
  problem: {
    source: '2024 年普通高等学校招生全国统一考试数学真题主题演示（函数与导数）',
    title: '函数单调性与极值',
    statement: '已知函数 $f(x)=x^3-3x+2$。请你先判断：为了研究 $f(x)$ 的单调性，最关键的一个新对象是什么？',
    openingQuestion: '先不要计算。你会用什么量把“函数增减”转化成一个可以判断正负的问题？为什么？',
    learningGoals: ['把自然语言目标转成数学对象', '用导数符号建立单调性判断', '区分必要步骤和可省略计算'],
  },
}

/** Accept only a complete host configuration, otherwise retain a usable demonstration card. */
export function normalizeConfig(value: Partial<MathTeacherConfig> | undefined): MathTeacherConfig {
  const problem = value?.problem
  if (
    typeof value?.teacherName !== 'string'
    || typeof problem?.source !== 'string'
    || typeof problem.title !== 'string'
    || typeof problem.statement !== 'string'
    || typeof problem.openingQuestion !== 'string'
    || !Array.isArray(problem.learningGoals)
    || !problem.learningGoals.every(goal => typeof goal === 'string')
  ) return DEFAULT_CONFIG
  return {
    teacherName: value.teacherName.trim() || DEFAULT_CONFIG.teacherName,
    problem: {
      source: problem.source.trim(),
      title: problem.title.trim(),
      statement: problem.statement.trim(),
      openingQuestion: problem.openingQuestion.trim(),
      learningGoals: problem.learningGoals.map(goal => goal.trim()).filter(Boolean),
    },
  }
}

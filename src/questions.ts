/** One mathematics problem a learner may choose before starting a session. */
export interface MathProblem {
  /** Human-readable provenance shown in the question picker. */
  source: string
  /** Short title displayed in the question picker. */
  title: string
  /** Full problem statement, with inline LaTeX supported by the chat renderer. */
  statement: string
}

/** Built-in practice choices. None is selected until the learner chooses it. */
export const DEFAULT_QUESTION_BANK: MathProblem[] = [
  {
    source: '函数与导数',
    title: '函数单调性',
    statement: '已知函数 $f(x)=x^3-3x+2$。研究 $f(x)$ 的单调性。',
  },
  {
    source: '数列',
    title: '等差数列的通项',
    statement: '等差数列 $a_n$ 满足 $a_1=2$，$a_3=6$。求 $a_{10}$。',
  },
  {
    source: '解析几何',
    title: '圆的标准方程',
    statement: '已知圆 $C: x^2+y^2-4x+2y-4=0$，求圆心坐标和半径。',
  },
]

/** Serialize a selected question as the durable first learner message. */
export function questionSelectionMessage(problem: MathProblem): string {
  return problem.statement
}

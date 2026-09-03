import type { MathProblem } from './config.ts'

/** Small starter bank used when the deployment has not supplied a competition question set. */
export const DEFAULT_QUESTION_BANK: MathProblem[] = [
  {
    source: '内置练习题 · 函数与导数',
    title: '函数单调性',
    statement: '已知函数 $f(x)=x^3-3x+2$。研究 $f(x)$ 的单调性。',
    openingQuestion: '要判断函数的增减，应该先构造哪个新的函数或表达式？',
    learningGoals: ['把问题转化为导数符号判断', '用区间表述单调性'],
  },
  {
    source: '内置练习题 · 数列',
    title: '等差数列的通项',
    statement: '等差数列 $\{a_n\}$ 满足 $a_1=2$，$a_3=6$。求 $a_{10}$。',
    openingQuestion: '已知首项和第三项时，怎样先确定公差？',
    learningGoals: ['识别等差数列结构', '从已知项建立方程'],
  },
  {
    source: '内置练习题 · 解析几何',
    title: '圆的标准方程',
    statement: '已知圆 $C: x^2+y^2-4x+2y-4=0$，求圆心坐标和半径。',
    openingQuestion: '怎样把含有 $x$、$y$ 一次项的方程整理为圆的标准方程？',
    learningGoals: ['配方法', '从标准方程读取几何信息'],
  },
]

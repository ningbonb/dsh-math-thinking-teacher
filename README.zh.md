# dsh-math-thinking-teacher

[English](README.md)

面向 DeepSeek Harness Web 的非侵入式“AI 高中数学思维老师”插件。它保留 DSH 原有聊天输入框、Markdown、图片附件与 LaTeX 回复能力，并新增一道选定题目的任务卡和“先诊断、再追问、给最小提示”的教学规则。

## 现场演示

- 输入学生的解题尝试，老师会先指出可观察的思维状态。
- 每轮只推进一个思维台阶，优先让学生自己作答。
- 手写过程图片沿用 DSH 既有图片附件能力；不清晰时老师会先确认识别内容。
- 回复中的“教学依据”是可审阅的干预理由，不展示或伪装模型隐藏推理。

## 安装

```sh
dsh plugin --profile web add dsh-math-thinking-teacher
```

安装后重启 `dsh web`。默认配置包含一个函数与导数真题主题演示题；比赛提供题库后可通过 Web profile 的 `cordis.patch.yml` 替换为指定原题。

## 配置

在 profile 的 `cordis.patch.yml` 里覆盖插件行：

```yaml
- id: dsh-math-thinking-teacher
  config:
    teacherName: AI 高中数学思维老师
    problem:
      source: 2026 AI 大赛提供题库 / 题目编号
      title: 题目标题
      statement: '题目正文，支持 $LaTeX$'
      openingQuestion: 先写出你想到的第一个数学对象，并说明理由。
      learningGoals:
        - 识别已知与待求
        - 选择有效的数学表示
```

## 模型体验

### 系统提示词

插件会把教学规则与当前题目加入每次模型请求，并固定要求输出“思维诊断”“下一步问题”“最小提示”“教学依据”。

### Token 影响

教学规则和题目会在每次请求中重复。建议将比赛题库中的题干保持精炼。

### KV Cache 影响

教师名称与题目配置不变时，提示词前缀稳定；更新任一配置会改变前缀。

## 许可证

MIT

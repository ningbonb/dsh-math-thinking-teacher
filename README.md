# dsh-math-thinking-teacher

[中文](README.zh.md)

A non-invasive DeepSeek Harness Web plugin for a live high-school mathematics tutoring demonstration. Choose its dedicated mathematics preset from DSH's native new-session page, while ordinary DSH sessions keep their original capability set and prompt.

## What it demonstrates

- The native new-session preset control opens a choice card before the dedicated mathematics session starts.
- Learners choose a curated question or attach their own problem through the native composer.
- The teacher diagnoses the learner's latest attempt, asks one next question, and supplies the smallest useful hint.
- Markdown, LaTeX, and handwritten-image input remain handled by the installed DSH Web client.
- Every response ends with short, reviewable teaching evidence. This is a teaching rationale, not hidden model reasoning.

## Install

```sh
dsh plugin --profile web add dsh-math-thinking-teacher
```

Restart `dsh web` after installation. The plugin manages its own `math-thinking-teacher` preset in the DSH user-preset root; select it from DSH's native new-session preset control. No question is selected by default.

## Configure a supplied question set

Add a later row to your Web profile's `cordis.patch.yml`:

```yaml
- id: dsh-math-thinking-teacher
  config:
    presetId: math-thinking-teacher
    teacherName: AI 高中数学思维老师
    questionBank:
      - source: 2026 AI 大赛提供题库 / 题目编号
        title: 题目标题
        statement: '题目正文，支持 $LaTeX$'
        openingQuestion: 先写出你想到的第一个数学对象，并说明理由。
        learningGoals:
          - 识别已知与待求
          - 选择有效的数学表示
```

## Model Experience

### System prompt

The mathematics preset adds a stable teaching-policy section to its model requests. A curated choice or uploaded problem enters the session as the first user message. Ordinary DSH sessions do not load this section. Mathematics responses use the visible sections `思维诊断`, `下一步问题`, `最小提示`, and `教学依据`.

### Token effect

The selected-problem text and policy repeat on each request. Keep supplied questions concise.

### KV Cache effect

The prefix is stable while the plugin configuration is unchanged. Updating the teacher or problem changes the prompt prefix.

## License

MIT

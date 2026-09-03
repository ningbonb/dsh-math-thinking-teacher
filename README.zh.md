# dsh-math-thinking-teacher

[English](README.md)

面向 DeepSeek Harness Web 的非侵入式“AI 高中数学思维老师”插件。用户在 DSH 原生新建会话页选择专属数学 preset；普通 DSH 会话保持原有能力与提示词不变。

## 现场演示

- 在 DSH 原生新建会话页选择“AI 高中数学思维老师”，先从题库选题或上传自己的题目，再进入原生聊天布局。
- 输入学生的解题尝试，老师会先指出可观察的思维状态。
- 每轮只推进一个思维台阶，优先让学生自己作答。
- 手写过程图片沿用 DSH 既有图片附件能力；不清晰时老师会先确认识别内容。
- 回复中的“教学依据”是可审阅的干预理由，不展示或伪装模型隐藏推理。

## 安装

```sh
dsh plugin --profile web add dsh-math-thinking-teacher
```

安装后重启 `dsh web`。插件会在 DSH 用户 preset 根目录创建并维护 `math-thinking-teacher` preset；在原生新建会话页选择它即可。内置少量练习题，但不会自动选题；比赛提供题库后可通过 Web profile 的 `cordis.patch.yml` 覆盖题库。

## 配置

在 profile 的 `cordis.patch.yml` 里覆盖插件行：

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

## 模型体验

### 系统提示词

只有数学 preset 会把教学规则加入模型请求。学生从题库选择的题目，或其上传图片和题干，会作为首条用户消息进入会话；普通 DSH 会话不加载这段规则。

### Token 影响

教学规则会在每次请求中重复；题目作为普通会话历史随后的请求一起传递。建议将比赛题库中的题干保持精炼。

### KV Cache 影响

教师名称与题目配置不变时，提示词前缀稳定；更新任一配置会改变前缀。

## 许可证

MIT

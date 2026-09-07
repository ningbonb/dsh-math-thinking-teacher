# dsh-math-thinking-teacher

[English](README.md)

面向 DeepSeek Harness 的“AI 高中数学思维老师”Agent 预设骨架。用户在 DSH 原生新建会话页选择专属数学 preset；普通 DSH 会话保持原有能力与提示词不变。

## 当前范围

- 安装后提供可选择的“AI 高中数学思维老师”Agent 预设。
- 数学预设会注册开放式、诊断优先的教学引导，并在空白会话中提供“题库选题 / 上传自己的题目”入口。
- 题库题目只有在学生主动选择后才会以题目正文作为首条用户消息提交；上传入口不会写入草稿或消息，仍由学生添加附件或题干后发送。
- Agent 在形成实质教学干预时会记录学生可见的本轮学习要点；数学会话输入框上方显示最新的观察、训练目标、下一步与可选提示。
- 普通会话继续使用 `standard`，插件不会修改用户的默认预设。

## 安装

```sh
dsh plugin --profile web add dsh-math-thinking-teacher
```

安装后重启 DSH。插件会在 DSH 用户 preset 根目录创建并维护 `math-thinking-teacher` preset；在原生新建会话页选择它即可。

## 配置

在 profile 的 `cordis.patch.yml` 里覆盖插件行：

```yaml
- id: dsh-math-thinking-teacher
  config:
    presetId: math-thinking-teacher
    teacherName: AI 高中数学思维老师
    teacherRole: 你是一位面向高中生的一对一数学思维老师。
    teachingObjective: 帮助学生形成读题、表征、建立关系、选择策略、验证推理和反思迁移的数学思维习惯。
    gradeLevel: 高中
    teacherTone: 耐心、具体、尊重学生当前的尝试
    hintStrength: minimal
    diagnosticDimensions:
      - 是否准确识别已知、所求与隐含条件
      - 是否选择了合适的数学对象、图形、方程或符号表示
    interventionRules:
      - 把每次学生回答视为新的证据，持续修正对其当前思路的判断
      - 一轮只推进一个最小思维台阶，不同时给出多条新路线
      - 优先提出可回答的问题；提示必须对应当前卡点
    questionBank:
      - source: 函数与导数
        title: 函数单调性
        statement: 已知函数 $f(x)=x^3-3x+2$。研究 $f(x)$ 的单调性。
```

插件维护的预设文件属于插件；不要直接编辑。老师角色、教学目标、诊断维度、干预规则和题库都可通过该配置覆盖。

### 设置弹窗

DSH 设置弹窗中的“数学思维老师”页面可持久化学习阶段、老师语气和提示强度。这三项会覆盖 profile 的对应基础值，并在下一次数学模式回复时生效；题库与核心教学规则仍由 profile 配置管理。

## 开发

修改插件后运行 `pnpm build`，再重启 DSH Web 让 `lib/` 产物生效。代码修改还应运行 `pnpm test` 与 `git diff --check`。

## 许可证

MIT

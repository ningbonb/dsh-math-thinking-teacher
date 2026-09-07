# AGENTS.md

## Scope

This repository is an external DeepSeek Harness Web plugin. Preserve the `standard` preset and normal DSH sessions. Mathematics-only behavior must stay gated by `agentPreset === math-thinking-teacher`.

## Product behavior

- Never change `agent-presets.default`. The mathematics preset is selected deliberately from DSH's native new-session control; its generated `preset.yml` order does not own the user default.
- The plugin-managed preset directory is `$DSH_HOME/.agent-presets/math-thinking-teacher/`. Keep the ownership marker and refuse to overwrite a same-named user-owned preset.
- Do not preselect a built-in question. A learner chooses a question or chooses to upload their own problem.
- A selected built-in question's first user message contains only the problem statement. Do not expose source labels, editor goals, opening prompts, Markdown scaffolding, or hidden metadata in that message.
- Choosing “upload your own problem” only changes the UI guidance. It must not set a draft or send a message; the learner supplies the actual text and/or attachment.

## Teaching policy

- DSH already owns the Agent's reasoning and tool capability. The mathematics preset supplies educational direction, not a scripted solver or a fixed response template.
- The first learner message is not assumed to be a mathematics problem. The Agent first interprets whether it is a complete problem, incomplete material, a learning goal, a usage question, or another request.
- Each learning-related learner response is new evidence. Diagnose only evidence-backed current reasoning, select one proportionate intervention, and keep the next meaningful step learner-owned.
- Do not infer a permanent weakness from one error. Learning notes and the session profile may name only knowledge points supported by visible work.
- Do not require fixed headings in natural-language replies. Structured teaching notes are a separate, student-facing record and must agree with the reply; they are never hidden reasoning traces.

## Build and validation

- After every change, run `pnpm build`; DSH Web loads `lib/`, not `src/`.
- For code changes, also run `pnpm test` and `git diff --check`.
- Do not restart `dsh web` unless the user explicitly asks. Tell the user when a restart is needed to load the rebuilt package.

## Client and Host boundary

- Browser entry modules may import React and DSH client packages only. Never import Host modules, Node APIs, `@deepseek-ai/schemastery`, Host settings registration, or any module that imports them.
- Put values shared by Host and browser code in a pure module with no runtime dependencies, such as `src/preferences.ts`.
- Keep Host settings registration in `src/settings.ts`; the browser reads the same namespace through `ctx.settingsScope`.
- When passing `SettingsScope` methods to React hooks, wrap them in closures. Passing `settings.subscribe` or `settings.getSnapshot` unbound loses their `this` receiver.

## Mathematics UI

- The custom UI is mathematics-session-only. Returning `null` for every other `agentPreset` restores the untouched standard experience.
- The blank-session dock offers only two first actions: choose a built-in problem or upload a learner-owned problem.
- After a mathematics session starts, keep the learning dock collapsed by default. The collapsed summary shows the current stage/status, one next action, and the primary “I am stuck” control.
- The expanded dock separates `current`, `progress`, and `profile` views. Highlight only the current problem-solving stage; do not fake a linear completion percentage.
- Keep `I am stuck`, `I understand`, and `practise again` available for every started mathematics session, even before an Agent teaching note exists. These controls submit ordinary learner messages so the intent is durable.
- Use the dock for the current-session learning record. Do not claim that the whole `sidebar` or `conversation.chat.turnTail` is safely additive: the sidebar has no suitable additive content seat, and turn-tail selection lacks a session identity for a safe mathematics-only claim.
- Other additive surfaces may be used only when their owner props can safely identify the session. Never replace the native preset picker, model selector, attachment control, plan control, or whole sidebar.

## Durable learning state

- New plugin state must use DSH-known durable carriers. Store teaching-note presentation data in `tool/result.meta`; do not append new custom session event types.
- `math-thinking/notes` exists only as a legacy read path. Any old log carrying it must be envelope-marked `ignorable: true` before a stock DSH persistence reader can load it.
- Never place model-visible question metadata or learning state in unlogged browser state or hidden prompt text. Use a durable carrier first.
- The learning panel may aggregate only evidence-backed notes. Do not turn one error into a permanent learner label.
- New note fields include the current stage, mastery state, weaknesses, and strengths. The UI aggregates these only within the current session; cross-session learner profiles need a separately designed persistence model.

## Session-log safety

- Never recompress a DSH `.zstd` session log as one stream. Its first Zstandard frame must contain exactly one header line; append records use independently decodable frames.
- Before repairing a local session log, make a timestamped backup. Prefer product APIs; if manual recovery is unavoidable, preserve one Zstandard frame per JSONL record and change only the required envelope field.

## UI

- Extend additive DSH slots only. Do not replace the preset selector, model selector, attachment control, plan control, or whole sidebar.
- Keep the mathematics dock collapsed by default after a session starts. Show the current stage, status, next action, and the primary “I am stuck” action while collapsed; show detailed current-turn, progress, and profile views only after expansion.
- Maintain the distinction between current-session learning records and a future cross-session learner profile.

## Documentation

- Keep `README.md` and `README.zh.md` accurate for user-visible behavior and profile configuration.
- Keep `TODO.md` focused on actionable work. Move work blocked by DSH public extension points or missing product data to `延后决策` with the reason.

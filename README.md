# dsh-math-thinking-teacher

[中文](README.zh.md)

A selectable high-school mathematics teacher Agent preset shell for DeepSeek Harness. Choose its dedicated mathematics preset from DSH's native new-session page, while ordinary DSH sessions keep their original capability set and prompt.

## Current scope

- Installation provides a selectable `AI 高中数学思维老师` Agent preset.
- The preset registers an open, diagnosis-first tutoring guide and shows `Choose from questions` / `Upload your own problem` for a blank mathematics session.
- A curated problem becomes the first learner message only after the learner selects it, and that message contains only the problem statement. The upload route writes neither a draft nor a message; the learner attaches or types a problem before sending.
- After a substantive teaching intervention, the Agent records a student-facing learning note. The mathematics dock displays its latest observation, training goal, next step, and optional hint.
- Ordinary sessions remain on `standard`; this plugin never changes a user's default preset.

## Install

```sh
dsh plugin --profile web add dsh-math-thinking-teacher
```

Restart DSH after installation. The plugin manages its own `math-thinking-teacher` preset in the DSH user-preset root; select it from DSH's native new-session preset control.

## Configure

Add a later row to your Web profile's `cordis.patch.yml`:

```yaml
- id: dsh-math-thinking-teacher
  config:
    presetId: math-thinking-teacher
    teacherName: AI 高中数学思维老师
    teacherRole: You are a one-to-one high-school mathematics thinking teacher.
    teachingObjective: Help learners practise mathematical representation, strategy selection, verification, and reflection.
    gradeLevel: High school
    teacherTone: Patient, specific, and respectful of the learner's attempt.
    hintStrength: minimal
    diagnosticDimensions:
      - Whether the learner identifies the givens and target correctly
      - Whether the learner chooses a useful mathematical representation
    interventionRules:
      - Advance one smallest reasoning step per response
      - Ask an answerable question before giving a hint
    questionBank:
      - source: Functions and derivatives
        title: Function monotonicity
        statement: 'Given $f(x)=x^3-3x+2$, study its monotonicity.'
```

The generated preset files are plugin-owned. Override the teacher role, objective, diagnostic dimensions, intervention rules, and question bank through this configuration rather than editing them directly.

### Settings dialog

The `数学思维老师` page in DSH Settings persists the learner stage, teacher tone, and hint strength. These values override the matching profile defaults for the next mathematics-mode response; the question bank and core teaching rules remain profile-managed.

## Development

After changing the plugin, run `pnpm build` and restart DSH Web to load the generated `lib/` files. Code changes should also run `pnpm test` and `git diff --check`.

## License

MIT

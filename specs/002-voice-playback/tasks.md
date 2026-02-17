# Tasks: 语音播放功能

**Feature Branch**: `002-voice-playback`
**Generated**: 2026-02-17
**Plan**: [plan.md](plan.md)
**Spec**: [spec.md](spec.md)

## Implementation Strategy

MVP scope: User Story 1 (数字语音播报) - 实现核心语音播报功能

Incremental delivery:
1. Phase 1: Foundational - 语音服务基础设施
2. Phase 2: User Story 1 - 数字语音播报
3. Phase 3: User Story 2 - 答案语音确认
4. Phase 4: User Story 3 - 语音设置控制

## Dependencies

```
Phase 1 (Foundational)
    ↓
Phase 2 (US1) → Phase 3 (US2) → Phase 4 (US3)
```

## Phase 1: Foundational

- [X] T001 Define VoiceConfig type in src/types/index.ts (enabled, rate, pitch, volume, voiceLang)
- [X] T002 Add voice config storage keys to src/services/storage.ts
- [X] T003 Create speech synthesis service in src/services/speechSynthesis.ts
- [X] T004 Create useSpeechSynthesis hook in src/hooks/useSpeechSynthesis.ts

## Phase 2: User Story 1 - 数字语音播报 (P1)

**Independent Test**: 播放语音后验证音频是否正确输出

### Tests First (TDD per Constitution)

- [ ] T005 [P] [US1] Write unit tests for speechSynthesis service in src/services/speechSynthesis.test.ts

### Implementation

- [X] T006 [US1] Integrate speech hook into NumberDisplay component
- [X] T007 [US1] Add stop button to NumberDisplay during speech
- [X] T008 [US1] Test complete flow: show digits → speak → stop

## Phase 3: User Story 2 - 答案语音确认 (P2)

**Independent Test**: 提交答案后验证语音输出

### Implementation

- [X] T009 [US2] Add result speech feedback in TrainingView result screen
- [X] T010 [US2] Implement correct/incorrect speech messages
- [X] T011 [US2] Test result speech: correct → "正确", incorrect → "错误"

## Phase 4: User Story 3 - 语音设置控制 (P3)

**Independent Test**: 修改设置后验证语音行为变化

### Implementation

- [X] T012 [US3] Add voice settings section in SettingsView.tsx
- [X] T013 [US3] Add voice toggle switch
- [X] T014 [US3] Add speech rate slider (0.5-2.0)
- [X] T015 [US3] Add browser support detection and warning
- [X] T016 [US3] Test settings: toggle on/off, rate change

## Phase 5: Polish & Edge Cases

- [X] T017 Add page unload handler to stop speech on navigation
- [X] T018 Handle multiple rapid digit speech correctly
- [X] T019 Verify offline functionality

## Parallel Execution Opportunities

| Tasks | Reason |
|-------|--------|
| T001, T002 | Different files, no dependencies |
| T006, T007 | Different components |
| T012, T013 | Different settings controls |

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 19 |
| Phase 1 (Foundational) | 4 |
| Phase 2 (US1) | 4 |
| Phase 3 (US2) | 3 |
| Phase 4 (US3) | 5 |
| Phase 5 (Polish) | 3 |
| TDD Test Tasks | 1 |
| Parallelizable Tasks | 6 |
| Independent Test Criteria | 3 (one per user story) |

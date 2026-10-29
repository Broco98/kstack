# 다른 에이전트에서 읽기

kstack 스킬은 Claude Code의 말로 쓰였다. Codex · OpenCode처럼 다른 에이전트에서 돌 때는 본문의 이름을 아래 표로 바꿔 읽는다. 할 일 · 순서 · 증명 기준은 그대로다.

## 이름 바꿔 읽기

| 본문의 말 | 뜻 | 다른 에이전트에서 |
|---|---|---|
| `kstack:<이름>` · `/kstack:<이름>` | kstack 스킬 `<이름>` | 플러그인으로 깔았으면 Codex도 `kstack:<이름>` 그대로다. `npx skills`로 깔았으면 맨 이름 `<이름>`이다. Codex에서 사람은 `$`를 쳐서 고른다 |
| Skill tool로 부른다 | 그 스킬의 SKILL.md를 읽고 따른다 | 에이전트의 스킬 불러오기를 쓴다(OpenCode는 `skill` 도구). 못 찾으면 그 스킬 폴더의 SKILL.md를 직접 연다 |
| Agent tool · subagent · sub-agent · 하위 에이전트 | 맥락을 나눠 맡기는 별도 작업자 | Codex는 하위 에이전트에게 맡긴다. OpenCode는 `task` 도구 |
| `subagent_type: "Explore"` | 파일을 고치지 않는 탐색자 | Codex `explorer` · OpenCode `explore` |
| `subagent_type: "general-purpose"` | 파일을 읽고 쓰는 일반 작업자 | Codex `worker` · OpenCode `general` |
| `model: "opus"` | 가장 강한 추론 모델. 설계 · 보안 판단에 쓴다 | 고를 수 있는 가장 강한 모델 |
| `model: "sonnet"` | 표준 모델. 사실 대조에 쓴다 | 기본 모델 |
| 내장 `run` 스킬 | 실행 중인 앱에서 직접 확인한다 | 앱을 직접 띄우고 출력 · 화면을 확인한다 |

## 기능이 없을 때

- **하위 에이전트가 없으면** 같은 브리프로 차례로 직접 한다. 축이나 관점 하나를 끝내고 결과를 적은 뒤 다음으로 간다. 앞 결과를 보고 다음 판단을 바꾸지 않는다. 축을 나눈 까닭이 섞이지 않는 데 있다.
- **모델을 고를 수 없으면** 같은 모델로 한다. «서로 다른 모델 둘»은 같은 모델로 서로 모르게 둘을 돌린다.
- **동시에 띄울 수 없으면**(background · 한 메시지에서 함께) 차례로 띄운다. 순서만 바뀌고 할 일은 같다.
- **worktree를 쓸 수 없으면** 티켓을 integration branch에서 하나씩 차례로 짓는다.

## 경로

본문의 `references/…`는 SKILL.md가 있는 폴더를 기준으로 한다. 하위 에이전트에게 넘길 때는 절대 경로로 바꿔 넘긴다.

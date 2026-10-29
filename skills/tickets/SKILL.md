---
name: tickets
description: "plan · spec · 지금 대화를 tracer-bullet 티켓 묶음으로 쪼갠다(to tickets). 티켓마다 blocking edges(먼저 끝나야 할 티켓)를 밝히고 수용 기준마다 증명 명령을 붙여, 설정된 트래커에 올린다(로컬이면 티켓 하나에 파일 하나로 edge를 글로 적고, 실제 트래커면 고유한 blocking 링크로)."
disable-model-invocation: true
---

> Claude Code가 아닌 에이전트에서는 도구 · 모델 이름을 `references/agents.md`로 바꿔 읽는다.

# Tickets

plan · spec · 대화를 **티켓** 묶음으로 쪼갠다. 티켓은 tracer bullet(예광탄. 모든 층을 얇게 끝까지 관통하는 구현) 세로 조각이고, 저마다 자기를 **막는**(block) 티켓을 밝힌다.

이슈 트래커와 triage 라벨 어휘는 이미 주어졌어야 한다. 없으면 사용자에게 `/kstack:setup`을 실행하라고 알린다.

**리팩터 모드.** 원천 spec이나 계획에 `종류: 리팩터링(동작 변경 없음)`이 적혀 있으면 `references/refactor-gates.md`를 함께 따른다. 무엇이 바뀌는지는 맨 아래 «리팩터 모드»에 있다.

## 절차

### 1. 맥락을 모은다

대화 맥락에 이미 있는 것으로 일한다. 사용자가 인자로 참조(spec 경로, 이슈 번호나 URL)를 주면 가져와서 본문과 댓글을 전부 읽는다.

### 2. 코드베이스를 둘러본다 (선택)

아직 코드베이스를 보지 않았다면 지금 코드의 상태를 파악한다. 티켓 제목과 설명에는 프로젝트 도메인 용어집의 어휘를 쓰고, 건드리는 영역의 ADR을 존중한다.

구현이 쉬워지도록 코드를 먼저 고칠(prefactor) 기회를 찾는다. «바꾸기 쉽게 만든 다음, 쉬운 변경을 하라.»

### 3. 세로 조각 초안을 잡는다

일을 **tracer bullet** 티켓으로 쪼갠다.

<vertical-slice-rules>

- 조각마다 모든 층(schema, API, UI, tests)을 좁지만 **완전하게** 관통한다. 한 층만 자른 가로 조각이 아니라 세로 조각이다
- 끝난 조각은 혼자서 시연하거나 검증할 수 있다
- 조각 하나는 새 context window 하나에 들어갈 크기다
- prefactoring이 있으면 먼저 한다

</vertical-slice-rules>

티켓마다 **blocking edges**를 준다. 그 티켓을 시작하기 전에 끝나야 하는 다른 티켓들이다. blocker가 없는 티켓은 바로 시작할 수 있다.

**수용 기준마다 증명 명령을 한 줄 붙인다.** 그 기준이 채워졌음을 보여 줄 명령과, 통과할 때 나와야 할 출력이다. 증명은 `references/evidence-ladder.md`의 ④(실제 코드를 실행) 이상이다. 화면이 바뀌는 기준은 ⑤(실행 중인 앱에서 재현)까지 간다. 이때는 Claude Code 내장 `run` 스킬로 앱을 띄워 확인하는 것이 증명이다.

증명 명령을 정하지 못하는 기준은 **기준이 흐릿하다는 신호**다. 지우거나 대충 채우지 말고 «증명 없음»으로 표시해 두었다가 4단계에서 사용자에게 함께 보인다.

**wide refactor(넓은 리팩터링)는 세로 조각의 예외다.** wide refactor는 기계적인 변경 하나(컬럼 이름 바꾸기, 공유 심볼의 타입 바꾸기)인데, 그 **blast radius**(파급 범위)가 코드베이스 전체로 퍼진다. 그래서 수정 한 번에 수천 곳의 호출부가 한꺼번에 깨지고, 어떤 세로 조각도 green으로 들어갈 수 없다. tracer bullet에 억지로 끼우지 말고 **expand–contract**(넓혔다가 좁히기)로 순서를 짠다. 먼저 expand한다. 옛 형태 옆에 새 형태를 더해 아무것도 깨지지 않게 한다. 다음으로 호출부를 blast radius에 맞춘 묶음(패키지별, 디렉터리별)으로 옮긴다. 묶음마다 expand에 막힌 티켓 하나이고, 옛 형태가 아직 있으니 묶음에서 묶음으로 CI가 green을 유지한다. 마지막으로 contract한다. 호출부가 하나도 남지 않으면 옛 형태를 지운다. 이 티켓은 모든 migrate 묶음에 막힌다. 묶음조차 혼자서는 green을 유지할 수 없으면 순서는 그대로 두되, 묶음들이 integration branch 하나를 함께 쓰고 모두가 마지막 integrate-and-verify 티켓을 막게 한다. green은 거기서만 약속된다.

### 4. 사용자에게 퀴즈를 낸다

제안한 쪼개기를 번호 목록으로 보인다. 티켓마다 이것을 보인다.

- **제목**: 짧고 설명적인 이름
- **Blocked by**: 먼저 끝나야 하는 다른 티켓(있다면)
- **전하는 것**: 이 티켓이 동작하게 만드는 끝에서 끝까지의 동작
- **증명**: 수용 기준마다의 증명 명령. 정하지 못한 기준은 «증명 없음»으로 짚는다

사용자에게 묻는다.

- 쪼갠 크기가 맞나? (너무 굵다 / 너무 잘다)
- blocking edges가 맞나? 각 티켓이 정말 자기를 막는 티켓에만 기대나?
- 더 합치거나 더 쪼갤 티켓이 있나?

«증명 없음» 기준이 있으면 기준이 흐릿하다는 신호로 함께 보인다.

사용자가 쪼개기를 승인할 때까지 되풀이한다.

### 5. 설정된 트래커에 티켓을 publish한다

승인된 티켓을 publish한다. **어떻게**는 `/kstack:setup`이 설정한 트래커에 달렸다. 티켓은 어느 쪽이든 같고, blocking edges의 모양만 바뀐다.

- **로컬 파일** → 티켓마다 파일 하나를 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`에 쓴다. 의존 순서(blocker 먼저)대로 `01`부터 번호를 매긴다. 파일마다 "Blocked by"에 기대는 티켓의 번호/제목을 적는다. 아래 티켓별 파일 템플릿을 쓴다. 파일 하나에 티켓 하나다. 합친 파일 하나로 쓰지 않는다.
- **실제 이슈 트래커(GitHub, Linear, …)** → 티켓마다 이슈 하나를 의존 순서(blocker 먼저)대로 publish한다. 그래야 각 티켓의 blocking edges가 실제 식별자를 가리킬 수 있다. 플랫폼에 고유한 blocking 관계가 있으면 그것을 쓰고, 없으면 각 티켓의 "Blocked by"에 막는 이슈들을 적는다. 원천이 기존 이슈였다면 각 티켓을 그 이슈의 sub-issue로 만든다(트래커 문서의 operation). 따로 지시가 없으면 `ready-for-agent` triage 라벨을 붙인다. 티켓은 짜임새부터 에이전트가 집어 갈 수 있게 되어 있다.

**frontier**(경계. blocker가 모두 끝난 티켓 전부)를 따라 일한다. 순전히 한 줄로 이어진 사슬이면 위에서 아래로다.

부모 이슈는 닫거나 고치지 **않는다.**

<local-ticket-template>

# <NN>: <티켓 제목>

**What to build:** 이 티켓이 동작하게 만드는 끝에서 끝까지의 동작. 사용자 관점에서 쓰고, 층별 구현 목록으로 쓰지 않는다.

**Blocked by:** 이 티켓을 막는 티켓의 번호/제목, 또는 "None (can start immediately)".

**Status:** ready-for-agent

- [ ] 수용 기준 1
  - 증명: `<명령>` → <통과할 때 나와야 할 출력>
- [ ] 수용 기준 2
  - 증명: `<명령>` → <통과할 때 나와야 할 출력>

</local-ticket-template>

<issue-template>

## Parent

트래커에 있는 부모 이슈의 참조(원천이 기존 이슈였을 때만. 아니면 이 절을 뺀다).

## What to build

이 티켓이 동작하게 만드는 끝에서 끝까지의 동작. 사용자 관점에서 쓰고, 층별 구현으로 쓰지 않는다.

## Acceptance criteria

- [ ] 기준 1
  - 증명: `<명령>` → <통과할 때 나와야 할 출력>
- [ ] 기준 2
  - 증명: `<명령>` → <통과할 때 나와야 할 출력>

## Blocked by

- 막는 티켓마다 참조 하나, 또는 "None (can start immediately)". blocker를 고유 edge로 걸었으면 이 절을 뺀다.

</issue-template>

어느 꼴이든 구체적인 파일 경로나 코드 조각은 피한다. 금방 낡는다. 예외: 프로토타입이 만든 조각이 결정을 글보다 정확하게 담는다면(state machine, reducer, schema, type shape) 넣고, 프로토타입에서 왔다고 짧게 적는다. 동작하는 데모가 아니라 결정이 담긴 부분만 남기고, 중요한 부분만 추린다. 증명 명령도 예외다. 그대로 돌릴 수 있게 적는다.

## 리팩터 모드

원천에 `종류: 리팩터링(동작 변경 없음)`이 있으면 `refactor-gates.md`를 함께 따른다. 3단계가 이렇게 바뀐다.

- **첫 티켓은 pin이다**(G1). 구조를 건드리기 전에 지금 동작을 고정한다. pin 방식은 spec의 Testing Decisions에 있다. 나머지 티켓은 모두 이 티켓에 막힌다.
- 나머지 티켓의 순서는 G2를 따른다.
- pin 뒤 티켓들의 증명 명령은 pin 테스트다. 그 티켓을 끝낸 뒤에도 pin이 green이면 증명이다.
- 옛 API는 G3(«한 PR 안에서 green으로 끝나나?»)로 판정한다. 위의 expand–contract로 가면 **contract 티켓을 필수로 둔다.**

> 원본: mattpocock/skills@59db609 · skills/engineering/to-tickets/SKILL.md · MIT (THIRD_PARTY_NOTICES.md)

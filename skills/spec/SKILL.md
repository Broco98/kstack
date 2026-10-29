---
name: spec
description: "지금까지의 대화를 spec으로 종합해 프로젝트 이슈 트래커에 올린다(to spec). 인터뷰 없이 이미 나눈 내용만 정리한다. 구현 결정마다 Door를 표시하고, one-way 결정은 그것을 받치는 사실을 실행으로 증명한 뒤에 올린다. 동작을 바꾸지 않는 리팩터링 계획도 이 spec으로 받는다."
disable-model-invocation: true
---

이 스킬은 지금 대화의 맥락과 코드베이스에 대한 이해로 spec을 만든다. 사용자를 **인터뷰하지 않는다.** 이미 아는 것을 종합할 뿐이다.

이슈 트래커와 triage 라벨 어휘는 이미 주어졌어야 한다. 없으면 사용자에게 `/kstack:setup`을 실행하라고 알린다.

**종류.** 대화가 동작을 바꾸지 않는 구조 변경을 다뤘다면(예: `kstack:improve-codebase-architecture`에서 고른 후보) 이 spec은 리팩터링 계획이다. 템플릿 맨 위에 `종류: 리팩터링(동작 변경 없음)` 줄을 둔다. 이 줄이 있으면 `kstack:tickets` · `kstack:implement` · `kstack:inspect`가 `references/refactor-gates.md`를 함께 따른다.

## 절차

1. 아직 보지 않았다면 저장소를 둘러보고 코드베이스의 지금 상태를 파악한다. spec 전체에 프로젝트 도메인 용어집의 어휘를 쓰고, 건드리는 영역의 ADR을 존중한다.

2. 이 기능을 테스트할 **seam**(이음매. 안쪽을 건드리지 않고 동작을 관찰하는 공개 경계)을 그려 본다. 새 seam보다 기존 seam을 쓴다. 가능한 한 가장 높은 seam을 쓴다. 새 seam이 필요하면 가장 높은 곳에 제안한다. 코드베이스 전체에 seam은 적을수록 좋다. 이상적인 수는 하나다.

   리팩터링이면 이 seam이 곧 지금 동작을 **고정할(pin) 자리**다. seam마다 무엇을 기록해 고정할지 pin 후보를 함께 그린다(`refactor-gates.md`의 G1).

   이 seam들이 사용자의 기대와 맞는지 사용자에게 확인한다. 리팩터링이면 pin 후보도 함께 확인받는다.

3. 구현 결정마다 **Door**(되돌릴 수 있는 two-way인가, 되돌릴 수 없는 one-way인가)를 정한다. 판정 기준과 강도는 `references/door.md`를 따른다.
   - two-way 결정은 Door만 표시한다.
   - one-way 결정은 그 결정을 안전하게 만드는 **사실 하나**를 찾는다. 그 사실을 `references/evidence-ladder.md`의 ④(실제 코드를 실행)까지 올린다. 돌린 명령과 출력을 남긴다.
   - 사실이 거짓으로 드러나면 **publish하지 않고 멈춘다.** 어느 결정의 어느 사실이 무엇으로 드러났는지 명령과 출력으로 보고한다. 결정을 다시 해야 하니 `/kstack:grilling`으로 돌아가자고 한다. 결정은 사용자의 몫이다.

4. 아래 템플릿으로 spec을 쓰고 프로젝트 이슈 트래커에 publish한다. `ready-for-agent` triage 라벨을 붙인다. 따로 triage할 필요는 없다.

<spec-template>

종류: 리팩터링(동작 변경 없음)

(리팩터링 spec일 때만 이 줄을 맨 위에 둔다. 기능 spec이면 이 줄을 지운다.)

## Problem Statement

사용자가 겪는 문제. 사용자의 관점에서 쓴다.

## Solution

그 문제의 해결책. 사용자의 관점에서 쓴다.

## User Stories

길고 번호를 붙인 user story 목록. story마다 이 꼴로 쓴다.

1. <누구>로서, <기능>을 원한다. 그래야 <이익>.

<user-story-example>
1. 모바일 뱅킹 고객으로서, 내 계좌들의 잔액을 보고 싶다. 그래야 지출을 더 잘 판단할 수 있다.
</user-story-example>

이 목록은 아주 넓어야 하고, 기능의 모든 면을 덮어야 한다.

## Implementation Decisions

내려진 구현 결정의 목록. 이런 것이 들어갈 수 있다.

- 짓거나 고칠 모듈
- 고칠 모듈의 인터페이스
- 개발자가 밝힌 기술적 사항
- 아키텍처 결정
- 스키마 변경
- API 계약
- 구체적인 상호작용

결정마다 3단계에서 정한 Door를 붙인다. one-way면 근거 사실과 증명까지 적는다.

- <결정> — Door: two-way
- <결정> — Door: one-way · 근거 사실: <…> · 증명: `<명령>` → <출력 요약>

구체적인 파일 경로나 코드 조각은 넣지 **않는다.** 금방 낡을 수 있다.

예외: 프로토타입이 만든 조각이 결정을 글보다 정확하게 담는다면(state machine, reducer, schema, type shape) 그 결정 안에 넣고, 프로토타입에서 왔다고 짧게 적는다. 동작하는 데모가 아니라 결정이 담긴 부분만 남기고, 중요한 부분만 추린다.

Door 줄의 증명 명령도 예외다. 다시 돌릴 수 있게 명령을 그대로 적는다.

## Testing Decisions

내려진 테스트 결정의 목록. 이것을 넣는다.

- 좋은 테스트의 기준(구현 세부가 아니라 바깥 동작만 테스트한다)
- 테스트할 모듈
- 테스트의 선례(코드베이스에 있는 비슷한 테스트)

리팩터링이면 둘을 더 적는다. 무엇을 채울지는 `refactor-gates.md`를 따른다.

- pin 방식(G1): 지금 동작을 어느 seam에서 무엇으로 고정하나. 2단계에서 확인받은 pin 후보다.
- 가치 게이트의 30초 질문(G4): 끝난 뒤 이전 코드와 이후 코드에 똑같이 던져 비교할 질문들.

## Out of Scope

이 spec의 범위 밖인 것들.

## Further Notes

기능에 관한 그 밖의 메모.

</spec-template>

> 원본: mattpocock/skills@59db609 · skills/engineering/to-spec/SKILL.md · MIT (THIRD_PARTY_NOTICES.md)

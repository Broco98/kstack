---
name: implement
description: "/kstack:spec과 /kstack:tickets의 결과를 코드로 구현한다(implement spec). 티켓마다 증명 명령의 출력으로 완료를 판정하고, kstack:inspect로 리뷰한 뒤 kstack:catchup 형식으로 보고한다."
disable-model-invocation: true
---

> Claude Code가 아닌 에이전트에서는 도구 · 모델 이름을 `references/agents.md`로 바꿔 읽는다.

spec 하나가 주어졌다. 이 spec에는 구현 방법을 적은 티켓들이 딸려 있어야 한다.

이슈 트래커는 이미 주어졌어야 한다. 없으면 사용자에게 `/kstack:setup`을 실행하라고 알린다.

목표는 spec 전체를 **integration branch**(통합 브랜치) 하나에 구현하고, 모든 티켓을 이슈 트래커가 일을 닫는 방식대로 해결하는 것이다.

티켓은 단계 목록이 아니다. 티켓 사이에 blocking 관계가 있는 **task graph**(작업 그래프)다. 그래서 언제나 바로 집어 갈 수 있는 티켓들의 **frontier**(경계)가 있다.

하위 에이전트와 주고받는 말은 적어야 한다. 주로 **context pointer**(맥락을 가리키는 포인터)로 소통한다. spec, 티켓, 조사 노트, 이전 커밋을 가리킨다. 포인터로 이미 닿는 정보를 다시 옮겨 적지 않는다.

**implementer subagent**(구현 하위 에이전트)는 동시성을 최대로 끌어올리도록 되도록 background로 돌린다.

**리팩터 모드.** spec에 `종류: 리팩터링(동작 변경 없음)`이 적혀 있으면 맨 아래 «리팩터 모드»를 함께 따른다.

## 단계

1. spec과 티켓을 읽고 task graph를 파악한다.

2. (선택) 티켓이 요구하는 탐색(관련 코드베이스 파일이나 외부 문서)은 **exploration subagent**(탐색 하위 에이전트)로 한다. 탐색 하위 에이전트는 파일을 저장할 수 있어야 한다. 저장소 밖 디렉터리에 마크다운 노트를 남겨, 뒤에 올 모든 하위 에이전트가 읽게 한다. 그래야 implementer subagent가 탐색이 아니라 구현에 집중한다. 파일을 써야 하니 읽기 전용인 Explore가 아니라 general-purpose(sonnet)로 띄운다.

3. integration branch를 만든다. 이슈 트래커가 PR로 일을 닫거나 사용자가 PR을 원하면, 5단계의 첫 merge 뒤에 draft PR을 연다(main보다 앞선 커밋이 없는 branch로는 PR을 열 수 없다). 그 PR은 spec과 티켓을 닫는 것으로 표시한다.

4. 티켓마다 **implementer subagent**로 구현한다. 각자 자기 worktree에서 자기 branch로 일한다. 모델은 기본값을 쓰고, 여러 곳을 가로지르는 설계나 까다로운 동시성처럼 어려운 티켓만 opus로 띄운다. `references/evidence-ladder.md`와 `references/deslop.md`는 이 스킬 폴더 기준 절대 경로로 넘긴다. 각 implementer subagent는:
   - 시작하기 전에 자기 worktree가 integration branch를 바탕으로 하는지 확인하고, 아니면 그 위로 reset한다. 그리고 티켓의 증명 명령을 한 번 돌려 지금 출력(Before)을 남겨 둔다.
   - Skill tool로 `kstack:tdd`를 불러 티켓을 짓는다. seam은 spec에서 이미 사용자와 합의했으니 다시 묻지 않는다. **같은 전제를 공유하는 수정이 두 번 실패하면**, 다음 수정을 쓰기 전에 그 전제를 글로 적고 직접 시험한다.
   - 완료를 보고하기 전에 integration branch의 끝(tip)을 자기 branch로 merge한다.
   - 그 위에서 diff를 `deslop.md` 체크리스트로 다듬고, 티켓의 증명 명령을 돌려 출력(After)을 Before와 함께 보고에 붙인다. `evidence-ladder.md`의 ④ 이상이고, 화면 기준이면 ⑤까지 간다. 증명 출력이 없는 «완료»는 완료가 아니다.

5. implementer subagent가 끝나면 **merger subagent**(merge 하위 에이전트)로 그 일을 integration branch에 merge한다. merge가 끝나면 하위 에이전트의 요약을 그대로 믿지 않는다. integration branch에 들어간 **diff를 직접 보고**, 넘길 요약은 그 diff를 보고 직접 쓴다.

6. 이것으로 집어 갈 수 있는 티켓의 frontier가 바뀌면, 새 티켓에 implementer subagent를 더 띄운다. 그래서 동시성이 최대가 된다.

7. 모든 티켓이 끝나면 integration branch를 두고 Skill tool로 `kstack:inspect`를 부른다. 리뷰가 낸 지적을 implementer subagent 하나에서 모두 고친다. `## 의심` 목록은 재현되지 않은 것이라 고칠 거리가 아니다. 마지막 보고로 넘긴다.

8. draft PR이 있으면 ready for review로 바꾼다. 없으면 이슈 트래커가 일을 닫는 방식대로 티켓을 하나씩 해결하고, integration branch를 보고한다.

9. 모든 implementer subagent의 worktree를 정리한다.

10. 마지막 보고는 `kstack:catchup` 형식으로 쓴다. 형식은 `kstack:catchup` 스킬의 SKILL.md(이 스킬 폴더 옆 `../catchup/SKILL.md`)를 따른다.

## 리팩터 모드

spec에 `종류: 리팩터링(동작 변경 없음)`이 있으면 `references/refactor-gates.md`를 함께 따른다. implementer subagent에게도 이 경로를 절대 경로로 넘긴다.

- 티켓의 증명 명령이 곧 **pin 테스트**다. 첫 티켓(pin)이 merge된 뒤로는 merge마다 pin이 green으로 남아야 한다.
- 리팩터링 중에 버그나 빠진 기능이 드러나면 이번 실행에서 고치지 않는다. G5에 따라 별도 티켓으로 떼어 내고, 구조 변경은 고정된 동작 그대로 먼저 끝낸다.
- 7단계의 `kstack:inspect`도 같은 표시를 보고 리팩터 모드로 돈다.

> 원본: mattpocock/skills@59db609 · skills/engineering/implement-spec/SKILL.md · MIT (THIRD_PARTY_NOTICES.md)

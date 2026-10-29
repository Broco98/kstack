# Issue tracker: Local Markdown

이 저장소의 이슈와 spec은 `.scratch/` 안의 마크다운 파일로 산다.

## Conventions

- 기능 하나에 디렉터리 하나: `.scratch/<feature-slug>/`
- spec은 `.scratch/<feature-slug>/spec.md`
- 구현 이슈는 티켓마다 파일 하나로 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`에 두고, `01`부터 번호를 매기며, 티켓을 한데 모은 단일 파일은 만들지 않는다
- triage 상태는 각 이슈 파일 위쪽의 `Status:` 줄에 기록한다(역할 문자열은 `triage-labels.md`를 본다)
- 댓글과 대화 이력은 파일 맨 아래 `## Comments` 제목 밑에 덧붙인다

## When a skill says "publish to the issue tracker"

`.scratch/<feature-slug>/` 아래에 새 파일을 만든다(필요하면 디렉터리도 만든다).

## When a skill says "fetch the relevant ticket"

참조된 경로의 파일을 읽는다. 사용자는 보통 경로나 이슈 번호를 직접 넘긴다.

## Wayfinding operations

`/wayfinder`가 쓴다. **map**은 티켓마다 **child** 파일이 하나씩 딸린 파일이다.

- **Map**: `.scratch/<effort>/map.md` (Notes / Decisions-so-far / Fog 본문).
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, `01`부터 번호를 매기고 본문에 질문을 둔다. `Type:` 줄에 티켓 유형(`research`/`prototype`/`grilling`/`task`)을, `Status:` 줄에 `claimed`/`resolved`를 기록한다.
- **Blocking**: 위쪽의 `Blocked by: NN, NN` 줄. 티켓은 그 줄에 나열된 파일이 모두 `resolved`일 때 막힘이 풀린다.
- **Frontier**: `.scratch/<effort>/issues/`에서 열려 있고, 막히지 않았고, 아무도 맡지 않은 파일을 찾는다. 번호가 앞선 것이 이긴다.
- **Claim**: 어떤 작업보다 먼저 `Status: claimed`로 정하고 저장한다.
- **Resolve**: `## Answer` 제목 밑에 답을 덧붙이고 `Status: resolved`로 정한 다음, `map.md`의 Decisions-so-far에 컨텍스트 포인터(요지 + 링크)를 덧붙인다.

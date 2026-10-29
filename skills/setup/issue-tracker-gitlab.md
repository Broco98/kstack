# Issue tracker: GitLab

이 저장소의 이슈와 spec은 GitLab 이슈로 산다. 모든 작업에 [`glab`](https://gitlab.com/gitlab-org/cli) CLI를 쓴다.

## Conventions

- **Create an issue**: `glab issue create --title "..." --description "..."`. 여러 줄 설명은 heredoc을 쓴다. `--description -`을 주면 편집기가 열린다.
- **Read an issue**: `glab issue view <number> --comments`. 기계가 읽을 출력은 `-F json`을 쓴다.
- **List issues**: `glab issue list -O json`에 알맞은 `--label` 필터를 붙인다.
- **Comment on an issue**: `glab issue note <number> --message "..."`. GitLab은 댓글을 "notes"라고 부른다.
- **Apply / remove labels**: `glab issue update <number> --label "..."` / `--unlabel "..."`. 라벨 여럿은 쉼표로 잇거나 플래그를 반복해 줄 수 있다.
- **Close**: `glab issue close <number>`. `glab issue close`는 닫는 댓글을 받지 않으므로, 먼저 `glab issue note <number> --message "..."`로 설명을 올린 다음 닫는다.
- **Merge requests**: GitLab은 PR을 "merge requests"라고 부른다. `glab mr create`, `glab mr view`, `glab mr note` 등을 쓴다. `gh pr ...`과 같은 꼴이되 `pr` 자리에 `mr`을, `comment`/`--body` 자리에 `note`/`--message`를 쓴다.

저장소는 `git remote -v`에서 추론한다. 클론 안에서 실행하면 `glab`이 알아서 한다.

## Merge requests as a triage surface

**MRs as a request surface: no.** _(이 저장소가 외부 merge request를 기능 요청으로 다루면 `yes`로 바꾼다. `/triage`가 이 플래그를 읽는다.)_

`yes`로 하면 MR이 이슈와 같은 라벨과 상태를 거치며, `glab mr` 대응 명령을 쓴다.

- **Read an MR**: `glab mr view <number> --comments`, diff는 `glab mr diff <number>`.
- **List external MRs for triage**: `glab mr list -O json`을 한 뒤, 작성자가 프로젝트 멤버/오너가 아닌 MR만 남긴다(메인테이너의 진행 중 작업이 아니라 기여자의 MR).
- **Comment / label / close**: `glab mr note`, `glab mr update --label`/`--unlabel`, `glab mr close`.

GitHub와 달리 GitLab은 이슈와 MR의 번호를 따로 매기므로, 메인테이너가 어느 쪽을 뜻하는지 알면 `#42`는 모호하지 않다.

## When a skill says "publish to the issue tracker"

GitLab 이슈를 만든다.

## When a skill says "fetch the relevant ticket"

`glab issue view <number> --comments`를 실행한다.

## Wayfinding operations

`/wayfinder`가 쓴다. **map**은 **child** 이슈를 티켓으로 가진 이슈 하나다.

- **Map**: `wayfinder:map` 라벨이 붙은 이슈 하나로, Notes / Decisions-so-far / Fog 본문을 담는다. `glab issue create --label wayfinder:map`. (네이티브 epic이 있는 GitLab 요금제에서는 epic이 map을 담아도 되지만, 라벨 붙은 이슈는 어디서나 동작한다.)
- **Child ticket**: 설명 맨 위에 `Part of #<map>`을 적은 이슈로, map에 연결하고(`glab issue create --linked-issues <map> --link-type relates_to`) 라벨 `wayfinder:<type>`(`research`/`prototype`/`grilling`/`task`)을 붙인다. 맡으면 티켓은 진행하는 개발자에게 배정된다.
- **Blocking**: GitLab의 **네이티브 blocking link**가 표준이며 UI에서 보이는 표현이다. `/blocked_by #<n>` quick action을 note로 올려 추가한다(`glab issue note <child> --message "/blocked_by #<blocker>"`). 네이티브 blocking link는 Premium/Ultimate 기능이다. 무료 요금제(또는 쓸 수 없는 곳)에서는 설명 맨 위에 `Blocked by: #<n>, #<n>` 줄을 두는 것으로 대신한다. 티켓은 모든 blocker가 닫혔을 때 막힘이 풀린다.
- **Frontier query**: `glab api projects/:id/issues/<map>/links`로 map의 child를 나열하고, `wayfinder:<type>` 라벨이 붙은 열린 이슈만 남긴다. 열린 blocker가 있는 것(열린 이슈로 가는 네이티브 `blocked_by` 링크(`glab api projects/:id/issues/<child-iid>/links`), 또는 `Blocked by` 줄의 열린 이슈), 또는 담당자가 있는 것은 뺀다. map 순서로 앞선 것이 이긴다.
- **Claim**: `glab issue update <n> --assignee @me`, 세션의 첫 쓰기.
- **Resolve**: `glab issue note <n> --message "<answer>"`, 그다음 `glab issue close <n>`, 그다음 map의 Decisions-so-far에 컨텍스트 포인터(요지 + 링크)를 덧붙인다.

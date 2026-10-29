# Issue tracker: GitHub

이 저장소의 이슈와 spec은 GitHub 이슈로 산다. 모든 작업에 `gh` CLI를 쓴다.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. 여러 줄 본문은 heredoc을 쓴다.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`에 알맞은 `--label`과 `--state` 필터를 붙인다.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, 또는 나중에 `gh issue edit <parent> --add-sub-issue <child>`(`gh` 2.94+). 더 오래된 `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (아래 **Blocking**처럼 database id). sub-issue를 못 쓰면 child 본문 맨 위에 `Part of #<parent>`를 적는다.
- **Blocking**: GitHub의 **네이티브 issue dependencies**가 표준이며 UI에서 보이는 표현이다. `gh issue create --blocked-by <n>,<n> ...` 또는 `gh issue edit <child> --add-blocked-by <blocker>`(`gh` 2.94+)로 간선을 추가한다. 더 오래된 `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, 여기서 `<blocker-db-id>`는 blocker의 숫자 **database id**다(`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, `#number`나 `node_id`가 _아니다_). dependencies를 쓸 수 없는 곳에서는 child 본문 맨 위에 `Blocked by: #<n>, #<n>` 줄을 두는 것으로 대신한다. 티켓은 모든 blocker가 닫혔을 때 막힘이 풀린다.
- **Count open blockers**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (열린 blocker만 센다. 0이면 시작할 수 있다). `gh issue view <n> --json blockedBy`는 닫힌 blocker도 나열하므로 거른다: `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue comment <number> --body "..."`로 설명을 올린 다음 `gh issue close <number>`. 이미 닫힌 이슈에서 `gh issue close --comment`는 댓글을 버리고도 0으로 끝난다.

저장소는 `git remote -v`에서 추론한다. 클론 안에서 실행하면 `gh`가 알아서 한다.

이슈는 사용자 자신의 저장소에만 만든다. 사용자가 소유하지 않았다면 `mattpocock/skills`(이 스킬들이 나온 저장소)에는 절대 만들지 않는다. 포크에서는 `gh`가 기본값으로 upstream 부모를 고를 수 있으므로, 세션의 첫 `gh issue create` 전에 `gh repo view --json nameWithOwner`로 대상을 확인하고 사용자의 저장소가 아니면 사용자에게 확인받는다.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(이 저장소가 외부 PR을 기능 요청으로 다루면 `yes`로 바꾼다. `/triage`가 이 플래그를 읽는다.)_

`yes`로 하면 PR이 이슈와 같은 라벨과 상태를 거치며, `gh pr` 대응 명령을 쓴다.

- **Read a PR**: `gh pr view <number>`, 그다음 `gh pr view <number> --comments`(TTY가 아니면 `--comments`는 본문이 아니라 댓글만 출력한다), diff는 `gh pr diff <number>`.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub는 이슈와 PR이 번호 공간 하나를 공유하므로 맨 `#42`는 어느 쪽일 수도 있다. `gh pr view 42`로 풀어 보고, 안 되면 `gh issue view 42`로 돌아간다.

## When a skill says "publish to the issue tracker"

GitHub 이슈를 만든다.

## When a skill says "fetch the relevant ticket"

위 **Read an issue**처럼 읽는다.

## Wayfinding operations

`/wayfinder`가 쓴다. **map**은 **child** 이슈를 티켓으로 가진 이슈 하나다.

- **Map**: `wayfinder:map` 라벨이 붙은 이슈 하나로, Notes / Decisions-so-far / Fog 본문을 담는다. `gh issue create --label wayfinder:map`.
- **Child ticket**: GitHub sub-issue로 map에 연결된 이슈(**Make an issue a sub-issue of a parent**를 본다). sub-issue를 켜지 않은 곳에서는 child를 map 본문의 task list에 넣고 child 본문 맨 위에 `Part of #<map>`을 적는다. 라벨: `wayfinder:<type>`(`research`/`prototype`/`grilling`/`task`). 맡으면 티켓은 진행하는 개발자에게 배정된다.
- **Blocking**: Conventions 아래 **Blocking**을 본다.
- **Frontier query**: map의 열린 child를 나열한다(`gh issue list --state open`, map의 sub-issue / task list로 좁힌다). 열린 blocker가 있는 것(**Count open blockers**를 보거나, `Blocked by` 줄의 열린 이슈) 또는 담당자가 있는 것은 뺀다. map 순서로 앞선 것이 이긴다.
- **Claim**: `gh issue edit <n> --add-assignee @me`, 세션의 첫 쓰기.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, 그다음 `gh issue close <n>`, 그다음 map의 Decisions-so-far에 컨텍스트 포인터(gist + 링크)를 덧붙인다.

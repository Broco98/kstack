---
name: setup
description: "이 저장소를 엔지니어링 스킬용으로 설정한다. 이슈 트래커, triage 라벨 어휘, 도메인 문서 배치를 정한다(setup, issue tracker, triage labels, docs/agents). 다른 엔지니어링 스킬을 처음 쓰기 전에 한 번 실행한다."
disable-model-invocation: true
---

# Setup

엔지니어링 스킬들이 전제하는 저장소별 설정을 마련한다.

- **Issue tracker**: 이슈가 사는 곳(기본은 GitHub, 로컬 마크다운도 기본으로 지원한다)
- **Triage labels**: 다섯 가지 표준 triage 역할에 쓰는 문자열
- **Domain docs**: `GLOSSARY.md`와 ADR이 있는 곳, 그리고 그것을 읽는 소비 규칙

이것은 프롬프트로 움직이는 스킬이지 결정적 스크립트가 아니다. 탐색하고, 찾은 것을 보여 주고, 사용자에게 확인받은 다음 쓴다.

## 과정

### 1. 탐색

현재 저장소를 살펴 출발 상태를 파악한다. 있는 것은 읽고, 짐작하지 않는다.

- `git remote -v`와 `.git/config`: GitHub 저장소인가? 어느 것인가?
- 저장소 루트의 `AGENTS.md`와 `CLAUDE.md`: 둘 중 있는 것이 있는가? 둘 중 하나에 이미 `## Agent skills` 섹션이 있는가?
- 저장소 루트의 `GLOSSARY.md`와 `GLOSSARY-MAP.md`, 그리고 옛 `CONTEXT.md` / `CONTEXT-MAP.md`. 옛 파일이 있으면 `GLOSSARY` 이름으로 `git mv`하고 `docs/agents/domain.md` 안의 그 이름도 고쳐 쓰자고 제안한다.
- `docs/adr/`와 모든 `src/*/docs/adr/` 디렉터리
- `docs/agents/`: 이 스킬의 이전 결과물이 이미 있는가?
- `.scratch/`: 로컬 마크다운 이슈 트래커 관례가 이미 쓰이고 있다는 신호
- `triage` 스킬이 설치돼 있는가? (이 스킬 옆의 `triage` 스킬 폴더, 또는 쓸 수 있는 스킬 목록의 `triage`.) 이것이 B 섹션을 아예 실행할지 결정한다.
- 모노레포 신호: `pnpm-workspace.yaml`, `package.json`의 `workspaces` 필드, 또는 자체 `src/`가 있는 채워진 `packages/*`. 이런 것은 진짜로 큰 멀티 패키지 저장소에만 있다. 없으면 단일 컨텍스트이고, 거의 모든 저장소가 그렇다.

### 2. 찾은 것을 보여 주고 묻기

있는 것과 없는 것을 요약한다. 그다음 섹션을 순서대로 다룬다. 섹션 하나에 답 하나를 받고 다음으로 간다.

각 섹션은 추천 답으로 시작해서 사용자가 한마디로 받아들일 수 있게 한다. 선택이 정말로 갈릴 때만 한 줄 설명을 붙이고, 탐색에서 이미 정해졌으면 섹션을 통째로 건너뛴다(`triage`가 설치돼 있지 않으면 B 섹션, 모노레포가 아니면 C 섹션).

**A 섹션: Issue tracker.**

> 설명: "issue tracker"는 이 저장소의 이슈가 사는 곳이다. `kstack:tickets`, `triage`, `kstack:spec` 같은 스킬이 여기서 읽고 여기에 쓴다. `gh issue create`를 부를지, `.scratch/` 아래에 마크다운 파일을 쓸지, 네가 설명하는 다른 워크플로를 따를지 알아야 한다. 이 저장소의 작업을 실제로 추적하는 곳을 고른다.

기본 자세: 이 스킬들은 GitHub를 전제로 설계됐다. `git remote`가 GitHub를 가리키면 그것을 제안한다. `git remote`가 GitLab(`gitlab.com` 또는 자체 호스트)을 가리키면 GitLab을 제안한다. 그렇지 않거나 사용자가 원하면 다음을 내놓는다.

- **GitHub**: 이슈가 저장소의 GitHub Issues에 산다(`gh` CLI를 쓴다)
- **GitLab**: 이슈가 저장소의 GitLab Issues에 산다([`glab`](https://gitlab.com/gitlab-org/cli) CLI를 쓴다)
- **Local markdown**: 이슈가 이 저장소의 `.scratch/<feature>/` 아래 파일로 산다(혼자 하는 프로젝트나 원격이 없는 저장소에 좋다)
- **Other** (Jira, Linear 등): 사용자에게 워크플로를 한 문단으로 설명해 달라고 한다. 스킬은 그것을 자유로운 글로 기록한다

선택은 `docs/agents/issue-tracker.md`에 기록한다. GitHub · GitLab 템플릿에는 기본값이 **off**인 "PRs as a request surface" 플래그가 있다. 끄고 두며 꺼내지 않는다. triage 대기열에 외부 PR을 넣고 싶은 사용자가 나중에 파일에서 플래그를 바꾸면 된다.

GitHub나 GitLab 트래커는 닿을 수 있는 저장소가 필요하다. 사용자가 그것을 골랐는데 그 호스트를 가리키는 `git remote`가 없으면, 사용자에게서 저장소 URL을 받아 연결한 뒤(필요하면 `git init`, 그다음 `git remote add origin <url>`) 진행한다. 이 디렉터리 안에서 `gh repo view` / `glab repo view`가 프로젝트를 출력하면 끝난 것이다. 안 되면 멈추고 사용자에게 무엇이 빠졌는지 알린다.

**B 섹션: Triage label vocabulary.** `triage` 스킬이 설치돼 있지 않으면(탐색에서 알게 된다) 이 섹션을 통째로 건너뛴다. 설치되지 않은 스킬은 라벨이 필요 없다.

설치돼 있으면 질문을 정확히 하나만 한다.

> 기본 triage 라벨을 그대로 쓸까요? (추천: **yes**)

기본값은 다섯 가지 표준 역할이며, 각 라벨 문자열은 이름과 같다. `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. **yes**면 그대로 쓴다. 사용자가 no라고 할 때만(보통 트래커가 이미 다른 이름을 쓰기 때문이다. 예: `needs-triage` 대신 `bug:triage`) 덮어쓸 이름을 모아, `triage`가 중복을 만들지 않고 기존 라벨을 적용하게 한다.

**C 섹션: Domain docs.** 기본은 **single-context**(저장소 루트에 `GLOSSARY.md` 하나 + `docs/adr/`)다. 거의 모든 저장소에 맞으므로 묻지 않고 쓴다.

**multi-context**(루트의 `GLOSSARY-MAP.md`가 컨텍스트별 `GLOSSARY.md` 파일을 가리킨다)는 탐색에서 모노레포 신호가 나왔을 때만 제안한다. 그때 어느 배치를 원하는지 확인한다.

### 3. 확인하고 고치기

사용자에게 다음의 초안을 보여 준다.

- `CLAUDE.md` / `AGENTS.md` 중 고치는 쪽에 넣을 `## Agent skills` 블록(선택 규칙은 4단계를 본다)
- `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, `docs/agents/triage-labels.md`의 내용(마지막 것은 `triage`가 설치됐을 때만)

쓰기 전에 사용자가 고치게 한다.

### 4. 쓰기

**고칠 파일 고르기:**

- `CLAUDE.md`가 있으면 그것을 고친다.
- 아니고 `AGENTS.md`가 있으면 그것을 고친다.
- 둘 다 없으면 사용자에게 어느 쪽을 만들지 묻는다. 대신 고르지 않는다.

`CLAUDE.md`가 이미 있는데 `AGENTS.md`를 만들지 않는다(반대도 마찬가지). 늘 이미 있는 쪽을 고친다.

고른 파일에 `## Agent skills` 블록이 이미 있으면 중복해서 덧붙이지 말고 그 자리에서 내용을 고친다. 주변 섹션에 대한 사용자의 수정을 덮어쓰지 않는다.

블록:

```markdown
## Agent skills

### Issue tracker

[이슈를 어디서 추적하는지 한 줄 요약]. See `docs/agents/issue-tracker.md`.

### Triage labels

[라벨 어휘 한 줄 요약]. See `docs/agents/triage-labels.md`.

### Domain docs

[배치 한 줄 요약: "single-context" 또는 "multi-context"]. See `docs/agents/domain.md`.
```

`### Triage labels` 하위 블록을 넣고 `docs/agents/triage-labels.md`를 쓰는 것은 `triage`가 설치돼 있고 B 섹션이 실행됐을 때만이다. 아니면 둘 다 뺀다.

B 섹션이 GitHub나 GitLab에서 실행됐다면, 트래커에 없는 설정된 라벨을 하나씩 만든다(`gh label create` / `glab label create`).

그다음 이 스킬 폴더의 씨앗 템플릿을 출발점으로 삼아 docs 파일을 쓴다.

- [issue-tracker-github.md](./issue-tracker-github.md): GitHub 이슈 트래커
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md): GitLab 이슈 트래커
- [issue-tracker-local.md](./issue-tracker-local.md): 로컬 마크다운 이슈 트래커
- [triage-labels.md](./triage-labels.md): 라벨 매핑(`triage`가 설치돼 있을 때만)
- [domain.md](./domain.md): 도메인 문서 소비 규칙 + 배치

"other" 이슈 트래커는 사용자의 설명으로 `docs/agents/issue-tracker.md`를 처음부터 쓴다.

### 5. 끝

설정이 끝났음을 알리고, 이제 어떤 엔지니어링 스킬이 이 파일들을 읽는지 알려 준다. 나중에 `docs/agents/*.md`를 직접 고쳐도 된다고 말한다. 이슈 트래커를 바꾸거나 처음부터 다시 시작하고 싶을 때만 이 스킬을 다시 실행하면 된다.

> 원본: mattpocock/skills@59db609 · skills/engineering/setup-matt-pocock-skills/SKILL.md · MIT (THIRD_PARTY_NOTICES.md)

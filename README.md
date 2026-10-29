# kstack

Matt Pocock 스킬을 한국어로 옮기고, pstack의 검증 · 엔지니어링 아이디어를 녹인 스킬 모음. Claude Code · Codex · OpenCode에서 쓴다.

> 상태: 스킬 16개를 지었고, 직접 써 보며 다듬는 단계다. 흐름의 `/refactor-plan` · `/why`는 아직 없다.

## 흐름

```
기능      /grill-with-docs → /spec → /tickets → /implement → /inspect → /pr
리팩터링  /improve-codebase-architecture → /refactor-plan → /implement → /inspect → /pr
이해 해소 /how · /why · /catchup · /teach · /wait-what
```

## 설치

macOS · Windows 모두 같다.

### Claude Code

```
/plugin marketplace add Broco98/kstack
/plugin install kstack@kstack
```

### Codex

```
codex plugin marketplace add Broco98/kstack
codex plugin add kstack@kstack
```

Codex는 이 저장소의 `.claude-plugin/marketplace.json`을 그대로 읽는다. 설치한 뒤 새 세션을 연다. 스킬은 `$`를 쳐서 고른다.

### OpenCode · 그 밖의 에이전트

```
npx skills add Broco98/kstack -g -a opencode
```

`-a codex` · `-a claude-code`처럼 에이전트를 더 붙일 수 있다. 스킬은 `~/.agents/skills/`에 깔리고, OpenCode와 Codex가 둘 다 이 폴더를 읽는다.

## 에이전트마다 다른 것

| | Claude Code | Codex (플러그인) | `npx skills` |
|---|---|---|---|
| 스킬 이름 | `kstack:how` (`/how`로 친다) | `kstack:how` | `how` |
| 손으로만 부르는 8개(`spec` · `implement` 등) | `disable-model-invocation` | `agents/openai.yaml` | Codex는 `agents/openai.yaml`을 따른다. OpenCode에는 같은 설정이 없어 모델이 부를 수 있다 |

- 본문은 Claude Code의 말로 쓰였다. 다른 에이전트는 스킬 안 `references/agents.md`의 대응표로 도구 · 모델 이름을 바꿔 읽는다.
- `npx skills`로 깔면 이름공간이 없다. Matt 원본 스킬(`grilling` · `tdd` · `pr` 등)이 같은 자리에 깔려 있으면 같은 이름끼리 덮어쓴다.

## 고칠 때

스크립트를 돌리려면 Node가 있어야 한다.

- 공용 참조는 루트 `references/`가 원본이다. 고친 뒤 `node scripts/sync-refs.mjs`로 스킬 안 사본을 맞춘다. `npx skills`가 스킬 폴더를 하나씩 깔기 때문에, 스킬마다 사본을 지닌다.
- `node --test`가 frontmatter · 경로 · 사본 어긋남을 검사한다. CI가 Windows · macOS에서 같은 테스트를 돈다.

## 라이선스

MIT. Matt Pocock 스킬을 옮긴 번역본은 원본의 MIT 고지를 따른다 → [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

# kstack

Matt Pocock 스킬을 한국어로 옮기고, pstack의 검증 · 엔지니어링 아이디어를 녹인 Claude Code 플러그인.

> 상태: 설계를 마치고 짓기 시작하는 단계다. 아직 쓸 수 있는 스킬은 없다.

## 흐름

```
기능      /grill-with-docs → /k-spec → /k-tickets → /k-implement → /k-review → /pr
리팩터링  /improve-codebase-architecture → /k-refactor-plan → /k-implement → /k-review → /pr
이해 해소 /k-how · /why · /k-catchup · /teach · /wait-what
```

## 설치

macOS · Windows 모두 같다. 스크립트를 돌리려면 Node가 있어야 한다.

```
/plugin marketplace add Broco98/kstack
/plugin install kstack@kstack
```

## 라이선스

MIT. Matt Pocock 스킬을 옮긴 번역본은 원본의 MIT 고지를 따른다 → [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

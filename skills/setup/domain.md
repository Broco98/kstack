# Domain Docs

코드베이스를 탐색할 때 엔지니어링 스킬이 이 저장소의 도메인 문서를 어떻게 소비해야 하는지.

## Before exploring, read these

- 저장소 루트의 **`GLOSSARY.md`**, 또는
- 저장소 루트에 있다면 **`GLOSSARY-MAP.md`**: 컨텍스트마다 `GLOSSARY.md` 하나를 가리킨다. 주제와 관련된 것을 각각 읽는다.
- **`docs/adr/`**: 작업하려는 영역에 걸린 ADR을 읽는다. 멀티 컨텍스트 저장소에서는 컨텍스트별 결정을 위해 `src/<context>/docs/adr/`도 확인한다.

이 파일들이 없으면 **조용히 진행한다**. 없다고 알리지 않고, 미리 만들자고 제안하지도 않는다. `/kstack:domain-modeling` 스킬(`/kstack:grill-with-docs`와 `/kstack:improve-codebase-architecture`를 통해 닿는다)이 용어나 결정이 실제로 정리될 때 이 파일들을 그때 만든다.

## File structure

단일 컨텍스트 저장소(대부분의 저장소):

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

멀티 컨텍스트 저장소(루트에 `GLOSSARY-MAP.md`가 있다):

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use the glossary's vocabulary

출력이 도메인 개념을 이름 붙일 때(이슈 제목, 리팩터 제안, 가설, 테스트 이름) `GLOSSARY.md`에 정의된 대로 용어를 쓴다. 용어집이 명시적으로 피하라고 한 동의어로 흐트러지지 않는다.

필요한 개념이 아직 용어집에 없다면 그것이 신호다. 프로젝트가 쓰지 않는 말을 지어내고 있거나(다시 생각한다), 진짜 빈틈이 있다(`/kstack:domain-modeling`을 위해 적어 둔다).

## Flag ADR conflicts

출력이 기존 ADR과 모순되면 조용히 덮어쓰지 말고 분명히 드러낸다.

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_

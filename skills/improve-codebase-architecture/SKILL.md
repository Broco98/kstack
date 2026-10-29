---
name: improve-codebase-architecture
description: 코드베이스에서 deepening(모듈 깊게 만들기) 기회를 훑어 시각적 HTML 리포트로 보여 주고, 사용자가 고른 후보를 grilling으로 파고든다. 아키텍처 개선, 리팩터 후보 찾기, improve codebase architecture, deep module, 얕은 모듈을 찾을 때 사용한다.
disable-model-invocation: true
---

# Improve Codebase Architecture

아키텍처의 마찰을 드러내고 **deepening 기회**(얕은 모듈을 깊은 모듈로 바꾸는 리팩터)를 제안한다. 목표는 테스트하기 쉬움과 AI가 길을 찾기 쉬움이다.

이 명령은 프로젝트의 도메인 모델에서 _정보를 얻고_, 공용 설계 어휘 위에 선다.

- Skill tool로 `kstack:codebase-design`을 불러 아키텍처 어휘(**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**)와 원칙(deletion test, "interface가 곧 테스트 표면", "adapter 하나 = 가상의 seam, 둘 = 진짜 seam")을 가져온다. 모든 제안에서 이 용어를 그대로 쓰고, "component", "service", "API", "boundary"로 흐트러지지 않는다.
- `GLOSSARY.md`의 도메인 언어는 좋은 seam에 이름을 준다. `docs/adr/`의 ADR은 이 명령이 다시 따지지 않을 결정을 기록한다.

## 과정

### 1. 탐색

**훑기 전에 범위를 정한다: YAGNI.** 모듈을 깊게 만드는 일은 앞으로 그 모듈을 바꾸기 쉽게 만들어서 값을 한다. 그러니 최근에 바뀐 부분에 더 무게를 둔다. 보기 전에 *어디를* 볼지 정한다.

- 사용자가 방향(모듈, 하위 시스템, 불편한 지점)을 말했으면 그대로 따르고 아래 추론은 건너뛴다.
- 아니면 커밋 이력(`git log --oneline`)을 꽤 멀리 거슬러 올라가 코드베이스의 hot spot, 즉 계속 등장하는 파일과 영역을 찾고, 그 경로에 먼저 주의를 쏟는다. 변경이 흩어져 뚜렷한 hot spot이 없으면 그물을 넓힌다.

먼저 프로젝트의 도메인 용어집(`GLOSSARY.md`)과, 건드릴 영역의 ADR을 읽는다.

그다음 sub-agent를 띄워 코드베이스를 돌아보게 한다. 딱딱한 휴리스틱을 따르지 말고 자유롭게 탐색하며 마찰을 겪은 곳을 적는다.

- 개념 하나를 이해하려면 작은 모듈 여러 개를 오가야 하는 곳은 어디인가?
- interface가 구현만큼 복잡한, **얕은(shallow)** 모듈은 어디인가?
- 테스트하려고 순수 함수를 뽑아냈지만, 진짜 버그는 그 함수를 부르는 방식에 숨어 있는(**locality**가 없는) 곳은 어디인가?
- 강하게 결합된 모듈이 seam 너머로 새는 곳은 어디인가?
- 테스트가 없거나, 지금 interface로는 테스트하기 어려운 부분은 어디인가?

얕다고 의심되는 것에 **deletion test**를 적용한다. 지우면 복잡성이 한곳에 모이는가, 아니면 자리만 옮겨 가는가? "모인다"가 우리가 찾는 신호다.

### 2. 후보를 HTML 리포트로 보여 주기

저장소에 아무것도 남지 않도록 OS 임시 디렉터리에 자체 완결형 HTML 파일을 쓴다. 임시 디렉터리는 `$TMPDIR`에서 찾고, 없으면 `/tmp`(Windows는 `%TEMP%`)를 쓴다. 실행마다 새 파일이 되도록 `<tmpdir>/architecture-review-<timestamp>.html`에 쓴다. 사용자를 위해 파일을 열고(Linux는 `xdg-open <path>`, macOS는 `open <path>`, Windows는 `start <path>`) 절대 경로를 알려 준다.

리포트는 레이아웃과 스타일에 **CDN의 Tailwind**를, 그래프 · 흐름 · 시퀀스가 구조를 믿을 만하게 전달하는 곳의 다이어그램에 **CDN의 Mermaid**를 쓴다. Mermaid와 직접 만든 CSS/SVG 시각물을 섞는다. 관계가 그래프 모양일 때(호출 그래프, 의존성, 시퀀스)는 Mermaid를, 더 편집적인 것(질량 다이어그램, 단면도, 접힘 애니메이션)은 직접 만든 div/SVG를 쓴다. 후보마다 **before/after 시각물**을 둔다. 시각적으로 만든다.

후보마다 카드를 그린다.

- **Files**: 관련된 파일 · 모듈
- **Problem**: 지금 아키텍처가 왜 마찰을 일으키는가
- **Solution**: 무엇이 바뀌는지 쉬운 말로 설명
- **Benefits**: locality와 leverage의 말로 설명하고, 테스트가 어떻게 나아지는지
- **Before / After diagram**: 나란히 직접 그린 그림. 얕음과 deepening을 보여 준다
- **Recommendation strength**: `Strong`, `Worth exploring`, `Speculative` 중 하나를 배지로

리포트는 **Top recommendation** 섹션으로 끝낸다. 어느 후보를 먼저 다루겠는지와 이유를 쓴다.

**도메인에는 GLOSSARY.md 어휘를, 아키텍처에는 `kstack:codebase-design` 어휘를 쓴다.** `GLOSSARY.md`가 "Order"를 정의했다면 "FooBarHandler"나 "Order service"가 아니라 "Order intake module"이라고 말한다.

**ADR 충돌**: 후보가 기존 ADR과 어긋나면, ADR을 다시 열 만큼 마찰이 실제로 클 때만 드러낸다. 카드에 분명히 표시한다(예: 경고 callout. _"ADR-0007과 충돌하지만, 다시 열 만하다. 왜냐하면…"_). ADR이 금지하는 이론상의 리팩터를 전부 나열하지 않는다.

전체 HTML 뼈대, 다이어그램 패턴, 스타일 지침은 [HTML-REPORT.md](HTML-REPORT.md)를 본다.

아직 interface를 제안하지 않는다. 파일을 쓴 뒤 사용자에게 묻는다. "이 중 어느 것을 파고들어 볼까요?"

### 3. Grilling 루프

사용자가 후보를 고르면 Skill tool로 `kstack:grilling`을 불러 결정 트리를 함께 훑는다. 제약, 의존성, deepening된 모듈의 모양, seam 뒤에 무엇이 있는지, 어떤 테스트가 살아남는지를 다룬다.

결정이 굳어지는 대로 부수 작업을 그 자리에서 한다. Skill tool로 `kstack:domain-modeling`을 불러 도메인 모델을 계속 최신으로 유지한다.

- **`GLOSSARY.md`에 없는 개념으로 deepening된 모듈의 이름을 짓는가?** 그 용어를 `GLOSSARY.md`에 추가한다. 파일이 없으면 그때 만든다.
- **대화 중 흐릿한 용어를 다듬는가?** 바로 그 자리에서 `GLOSSARY.md`를 고친다.
- **사용자가 결정적인 이유로 후보를 거절하는가?** ADR을 제안한다. 이렇게 말한다. _"나중의 아키텍처 리뷰가 이걸 다시 제안하지 않도록 ADR로 남길까요?"_ 같은 것을 다시 제안하지 않으려면 미래의 탐색자에게 그 이유가 실제로 필요할 때만 제안한다. 일시적인 이유("지금은 그럴 가치가 없다")나 자명한 이유는 건너뛴다.
- **deepening된 모듈의 대안 interface를 탐색하고 싶은가?** Skill tool로 `kstack:codebase-design`을 불러 그 design-it-twice 병렬 sub-agent 패턴을 쓴다.

> 원본: mattpocock/skills@59db609 · skills/engineering/improve-codebase-architecture/SKILL.md · MIT (THIRD_PARTY_NOTICES.md)

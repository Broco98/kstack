# HTML 리포트 형식

아키텍처 리뷰는 OS 임시 디렉터리에 놓는 자체 완결형 HTML 파일 하나로 그린다. Tailwind와 Mermaid는 모두 CDN에서 온다. Mermaid는 그래프 모양 다이어그램을 믿을 만하게 그리고, 직접 만든 div와 인라인 SVG는 더 편집적인 시각물(질량 다이어그램, 단면도)을 맡는다. 둘을 섞는다. 모든 것을 Mermaid에 기대면 밋밋해 보이기 시작한다.

## 뼈대

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review for {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      /* small custom layer for things Tailwind doesn't cover cleanly:
         dashed seam lines, hand-drawn-feeling arrow heads, etc. */
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Header

저장소 이름, 날짜, 간결한 범례: 실선 상자 = module, 점선 = seam, 빨간 화살표 = leakage, 굵은 어두운 상자 = deep module. 소개 문단은 없다. 곧바로 후보로 들어간다.

## Candidate card

다이어그램이 무게를 진다. 글은 드물고 평범하며, 격식 없이 용어집 용어(`kstack:codebase-design` 스킬의 것)를 쓴다.

후보 하나가 `<article>` 하나다.

- **Title**: 짧게, deepening을 이름 붙인다(예: "Collapse the Order intake pipeline").
- **Badge row**: 추천 강도(`Strong` = emerald, `Worth exploring` = amber, `Speculative` = slate)와 의존성 범주 태그(`in-process`, `local-substitutable`, `ports & adapters`, `mock`).
- **Files**: 고정폭 목록, `font-mono text-sm`.
- **Before / After diagram**: 중심 시각물. 두 열을 나란히 놓는다. 패턴은 아래를 본다.
- **Problem**: 한 문장. 무엇이 아픈가.
- **Solution**: 한 문장. 무엇이 바뀌는가.
- **Wins**: 글머리표, 각 6단어 이하. 예: "Tests hit one interface", "Pricing logic stops leaking", "Delete 4 shallow wrappers".
- **ADR callout**(해당할 때): 호박색 바탕 상자 안에 한 줄.

설명 문단은 쓰지 않는다. 다이어그램을 이해하는 데 문단이 필요하면 다이어그램을 다시 그린다.

## 다이어그램 패턴

후보에 맞는 패턴을 고른다. 섞어 쓴다. 모든 다이어그램이 똑같아 보이게 만들지 않는다. 다양함도 요점의 일부다.

### Mermaid 그래프 (의존성 · 호출 흐름의 주력)

"X가 Y를 부르고 Y가 Z를 부르는데, 이 엉망을 봐라"가 요점일 때 Mermaid `flowchart`나 `graph`를 쓴다. 낙하산처럼 떨어진 느낌이 나지 않게 Tailwind 스타일 카드로 감싼다. classDef로 leakage 간선은 빨갛게, deep module은 어둡게 칠한다. 시퀀스 다이어그램은 "before: 왕복 6번, after: 1번"에 잘 맞는다.

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#dc2626,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### 직접 만든 상자와 화살표 (Mermaid 레이아웃과 싸울 때)

module을 테두리와 라벨이 있는 `<div>`로 그린다. 화살표는 relative 컨테이너 위에 absolute로 놓은 인라인 SVG `<line>`이나 `<path>`다. "after" 다이어그램을 안쪽이 흐려진, 테두리 굵은 deep module 하나처럼 보이게 하고 싶을 때 쓴다. Mermaid는 그 무게감을 제대로 그리지 못한다.

### 단면도 (층층의 얕음에 좋다)

가로 띠(`h-12 border-l-4`)를 쌓아 호출이 지나가는 층을 보여 준다. Before: 아무것도 안 하는 얇은 층 여섯 개. After: 통합된 책임을 라벨로 단 두꺼운 띠 하나.

### 질량 다이어그램 ("interface가 구현만큼 넓다"에 좋다)

module마다 사각형 두 개를 그린다. 하나는 interface 표면적, 하나는 implementation이다. Before: interface 사각형이 implementation 사각형만큼 높다(shallow). After: interface 사각형은 낮고 implementation 사각형은 높다(deep).

### 호출 그래프 접기

Before: 함수 호출 트리를 중첩 상자로 그린다. After: 같은 트리를 상자 하나로 접고, 이제 내부가 된 호출은 그 안에 흐리게 보인다.

## 스타일 지침

- 기업 대시보드가 아니라 편집물 쪽으로 기운다. 여백을 넉넉히 둔다. 제목에는 serif를 써도 좋다(`font-serif`가 stone/slate와 잘 어울린다).
- 색은 아끼며 쓴다. 강조색 하나(emerald 또는 indigo), leakage에 빨강, 경고에 호박색.
- before/after가 스크롤 없이 나란히 편하게 놓이도록 다이어그램을 ~320px 높이로 한다.
- 다이어그램 안의 module 라벨에는 `text-xs uppercase tracking-wider`를 써서 UI가 아니라 도식처럼 읽히게 한다.
- 스크립트는 Tailwind CDN과 Mermaid ESM import뿐이다. 리포트는 그 밖에는 정적이다. 앱 코드도, Mermaid 자체 렌더링 외의 상호작용도 없다.

## Top recommendation 섹션

큰 카드 하나. 후보 이름, 왜인지 한 문장, 그 카드로 가는 앵커 링크. 그게 전부다.

## 어조

쉬운 말로 간결하게 쓰되, 아키텍처 명사와 동사는 `kstack:codebase-design` 스킬에서 그대로 가져온다. 간결함이 어휘가 흐트러질 핑계가 되지 않는다.

**정확히 이 말을 쓴다:** module, interface, implementation, depth, deep, shallow, seam, adapter, leverage, locality.

**대신 쓰지 않는다:** component, service, unit(module 대신) · API, signature(interface 대신) · boundary(seam 대신) · layer, wrapper(module을 뜻할 때 module 대신).

**어울리는 표현:**

- "Order intake module is shallow: interface nearly matches the implementation."
- "Pricing leaks across the seam."
- "Deepen: one interface, one place to test."
- "Two adapters justify the seam: HTTP in prod, in-memory in tests."

**Wins 글머리표**는 이득을 용어집의 말로 적는다. *"locality: bugs concentrate in one module"*, *"leverage: one interface, N call sites"*, *"interface shrinks; implementation absorbs the wrappers"*. *"easier to maintain"*이나 *"cleaner code"*는 쓰지 않는다. 이런 말은 용어집에 없고 자리를 얻을 만하지 않다.

얼버무림도, 뜸 들이기도, "it's worth noting that…"도 없다. 문장이 글머리표가 될 수 있으면 글머리표로 만든다. 글머리표를 잘라낼 수 있으면 자른다. `kstack:codebase-design` 용어집에 없는 용어라면 새로 지어내기 전에 용어집에 있는 말을 먼저 찾는다.

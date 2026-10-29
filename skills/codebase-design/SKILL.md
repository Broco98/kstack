---
name: codebase-design
description: 깊은 모듈(deep modules)을 설계하기 위한 공용 어휘. 사용자가 모듈의 인터페이스를 설계하거나 개선하고 싶을 때, deepening 기회를 찾을 때, seam을 어디에 둘지 정할 때, 코드를 더 테스트하기 쉽게 또는 AI가 탐색하기 쉽게 만들고 싶을 때, 또는 다른 스킬이 deep-module 어휘를 필요로 할 때 사용한다.
---

# Codebase Design

**deep module**(깊은 모듈)을 설계한다. 작은 인터페이스 뒤에 많은 동작이 있고, 깔끔한 seam에 놓이며, 그 인터페이스를 통해 테스트할 수 있다. 코드를 설계하거나 재구성하는 모든 곳에서 이 언어와 원칙을 쓴다. 목표는 호출자에게는 leverage, 유지보수자에게는 locality, 모두에게는 테스트 용이성이다.

## 용어집

이 용어를 정확히 그대로 쓴다. "component", "service", "API", "boundary"로 바꿔 쓰지 않는다. 일관된 언어가 핵심이다.

**Module**: 인터페이스와 구현을 가진 모든 것. 일부러 규모에 중립적이다. 함수, 클래스, 패키지, 계층을 가로지르는 슬라이스 모두 해당한다. _Avoid_: unit, component, service.

**Interface**: 호출자가 모듈을 올바르게 쓰려고 알아야 하는 모든 것. 타입 시그니처뿐 아니라 불변식, 순서 제약, 에러 모드, 필요한 설정, 성능 특성까지 포함한다. _Avoid_: API, signature (너무 좁다. 타입 수준의 표면만 가리킨다).

**Implementation**: 모듈 안에 든 것, 곧 코드 본체. **Adapter**와 구분된다. 구현이 큰 작은 adapter(Postgres 리포지토리)도 있고, 구현이 작은 큰 adapter(인메모리 페이크)도 있다. seam이 주제일 때는 "adapter"를, 그 밖에는 "implementation"을 쓴다.

**Depth**: 인터페이스에서의 leverage. 호출자(또는 테스트)가 익혀야 하는 인터페이스 단위당 발휘할 수 있는 동작의 양. 작은 인터페이스 뒤에 많은 동작이 있으면 **deep**, 인터페이스가 구현만큼 복잡하면 **shallow**다.

**Seam** _(Michael Feathers)_: 그 자리를 편집하지 않고도 동작을 바꿀 수 있는 곳. 모듈의 인터페이스가 놓이는 *위치*. seam을 어디에 둘지는 그 뒤에 무엇을 둘지와 별개의 설계 결정이다. _Avoid_: boundary (DDD의 bounded context와 뜻이 겹친다).

**Adapter**: seam에서 인터페이스를 만족하는 구체적인 것. 내용물(안에 든 것)이 아니라 *역할*(채우는 자리)을 가리킨다.

**Leverage**: 호출자가 depth에서 얻는 것. 익힌 인터페이스 단위당 더 많은 능력. 구현 하나가 N개의 호출 지점과 M개의 테스트에서 값을 한다.

**Locality**: 유지보수자가 depth에서 얻는 것. 변경, 버그, 지식, 검증이 호출자 전반에 흩어지지 않고 한곳에 모인다. 한 번 고치면 어디서나 고쳐진다.

## Deep과 shallow

**Deep module** = 작은 인터페이스 + 많은 구현:

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**Shallow module** = 큰 인터페이스 + 적은 구현 (피한다):

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

인터페이스를 설계할 때 묻는다.

- 메서드 수를 줄일 수 있나?
- 파라미터를 단순하게 할 수 있나?
- 복잡성을 더 안에 숨길 수 있나?

## 원칙

- **Depth는 구현이 아니라 인터페이스의 속성이다.** deep module도 내부는 작고, 모킹할 수 있고, 바꿔 끼울 수 있는 부품으로 이루어질 수 있다. 그 부품들이 인터페이스의 일부가 아닐 뿐이다. 모듈은 인터페이스에 있는 **external seam**뿐 아니라 **internal seam**(구현에 private이고 모듈 자신의 테스트가 쓰는 것)도 가질 수 있다.
- **deletion test(삭제 테스트).** 모듈을 지운다고 상상한다. 복잡성이 사라지면 그것은 pass-through였다. 복잡성이 N개의 호출자에 다시 나타나면 제값을 하던 것이다.
- **인터페이스가 곧 테스트 표면이다.** 호출자와 테스트는 같은 seam을 건넌다. 인터페이스를 *지나서* 테스트하고 싶다면 그 모듈은 모양이 잘못됐을 가능성이 크다.
- **adapter가 하나면 가상의 seam이고, 둘이면 진짜 seam이다.** seam을 가로질러 실제로 달라지는 것이 없으면 seam을 도입하지 않는다.

## 테스트 용이성을 위한 설계

좋은 인터페이스는 테스트를 자연스럽게 만든다.

1. **의존성은 받고, 만들지 않는다.**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **결과를 돌려주고, 부수 효과를 만들지 않는다.**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **작은 표면적.** 메서드가 적으면 필요한 테스트가 적다. 파라미터가 적으면 테스트 준비가 단순하다.

## 관계

- **Module**은 정확히 하나의 **Interface**를 가진다 (호출자와 테스트에 내놓는 표면).
- **Depth**는 **Module**의 속성이며, 그 **Interface**에 견주어 측정한다.
- **Seam**은 **Module**의 **Interface**가 놓이는 곳이다.
- **Adapter**는 **Seam**에 앉아 **Interface**를 만족한다.
- **Depth**는 호출자에게 **Leverage**를, 유지보수자에게 **Locality**를 낳는다.

## 버린 틀

- **Depth를 구현 줄 수 대 인터페이스 줄 수의 비율로 보는 것** (Ousterhout): 구현을 부풀리는 것에 보상을 준다. 대신 depth-as-leverage를 쓴다.
- **"Interface"를 TypeScript의 `interface` 키워드나 클래스의 공개 메서드로 보는 것**: 너무 좁다. 여기서 interface는 호출자가 알아야 하는 모든 사실을 포함한다.
- **"Boundary"**: DDD의 bounded context와 뜻이 겹친다. **seam**이나 **interface**라고 말한다.

## 더 깊이

- **의존성을 고려해 클러스터를 deepening하기**: [DEEPENING.md](DEEPENING.md) 참고. 의존성 범주, seam 규율, 겹쌓지 말고 교체하는 테스트 방식.
- **대안 인터페이스 탐색하기**: [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md) 참고. 병렬 sub-agent를 띄워 인터페이스를 서로 근본적으로 다른 여러 방식으로 설계한 뒤, depth, locality, seam 위치로 비교한다.

> 원본: mattpocock/skills@59db609 · skills/engineering/codebase-design/SKILL.md · MIT (THIRD_PARTY_NOTICES.md)

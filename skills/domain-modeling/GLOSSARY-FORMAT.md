# GLOSSARY.md 형식

## 구조

```md
# {컨텍스트 이름}

{이 컨텍스트가 무엇이고 왜 존재하는지 한두 문장으로 설명한다.}

## Language

**Order**:
{용어를 한두 문장으로 설명한다}
_Avoid_: Purchase, transaction

**Invoice**:
배송 뒤에 고객에게 보내는 결제 요청.
_Avoid_: Bill, payment request

**Customer**:
주문을 하는 사람 또는 조직.
_Avoid_: Client, buyer, account
```

## 규칙

- **단호하게 고른다.** 같은 개념에 단어가 여럿이면 가장 좋은 하나를 고르고 나머지는 `_Avoid_` 아래에 적는다.
- **정의는 간결하게.** 최대 한두 문장. 그것이 무엇을 *하는지*가 아니라 무엇*인지*를 정의한다.
- **이 프로젝트의 컨텍스트에 고유한 용어만 넣는다.** 일반 프로그래밍 개념(타임아웃, 에러 타입, 유틸리티 패턴)은 프로젝트가 많이 쓰더라도 넣지 않는다. 용어를 더하기 전에 묻는다. 이 컨텍스트에만 있는 개념인가, 일반 프로그래밍 개념인가? 앞의 것만 넣는다.
- **자연스러운 묶음이 생기면 소제목으로 묶는다.** 모든 용어가 하나로 응집된 영역에 속하면 평평한 목록도 괜찮다.

## 단일 컨텍스트 저장소와 다중 컨텍스트 저장소

**단일 컨텍스트(대부분의 저장소):** 저장소 루트에 `GLOSSARY.md` 하나.

**다중 컨텍스트:** 저장소 루트의 `GLOSSARY-MAP.md`가 컨텍스트 목록, 각각의 위치, 서로의 관계를 적는다.

```md
# Glossary Map

## Contexts

- [Ordering](./src/ordering/GLOSSARY.md): 고객 주문을 받고 추적한다
- [Billing](./src/billing/GLOSSARY.md): 청구서를 만들고 결제를 처리한다
- [Fulfillment](./src/fulfillment/GLOSSARY.md): 창고 피킹과 배송을 관리한다

## Relationships

- **Ordering → Fulfillment**: Ordering이 `OrderPlaced` 이벤트를 내보내면 Fulfillment가 받아 피킹을 시작한다
- **Fulfillment → Billing**: Fulfillment가 `ShipmentDispatched` 이벤트를 내보내면 Billing이 받아 청구서를 만든다
- **Ordering ↔ Billing**: `CustomerId`와 `Money`의 공유 타입
```

스킬은 어느 구조인지 이렇게 추론한다.

- `GLOSSARY-MAP.md`가 있으면 읽어서 컨텍스트를 찾는다
- 루트 `GLOSSARY.md`만 있으면 단일 컨텍스트다
- 둘 다 없으면 첫 용어가 정리될 때 루트 `GLOSSARY.md`를 그때 만든다

컨텍스트가 여럿이면 지금 주제가 어느 것과 관련되는지 추론한다. 불분명하면 묻는다.

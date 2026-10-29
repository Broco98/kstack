# 언제 모킹하는가

**시스템 경계**에서만 모킹한다.

- 외부 API (결제, 이메일 등)
- 데이터베이스 (경우에 따라. 테스트 DB를 선호한다)
- 시간 · 난수
- 파일 시스템 (경우에 따라)

모킹하지 않는 것:

- 자기 클래스 · 모듈
- 내부 협력자
- 자기가 통제하는 모든 것

## 모킹하기 쉽게 설계하기

시스템 경계에서는 모킹하기 쉬운 인터페이스를 설계한다.

**1. 의존성 주입을 쓴다**

외부 의존성을 안에서 만들지 말고 밖에서 넘겨 준다.

```typescript
// Easy to mock
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to mock
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. 범용 fetcher보다 SDK 스타일 인터페이스를 선호한다**

조건 분기가 든 범용 함수 하나 대신, 외부 연산마다 구체적인 함수를 만든다.

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

SDK 방식의 이점:
- 목(mock)마다 구체적인 모양 하나만 돌려준다
- 테스트 준비에 조건 분기가 없다
- 테스트가 어떤 엔드포인트를 쓰는지 보기 쉽다
- 엔드포인트별 타입 안전성

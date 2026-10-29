# 좋은 테스트와 나쁜 테스트

## 좋은 테스트

**통합 스타일**: 내부 부품의 목이 아니라 실제 인터페이스를 통해 테스트한다.

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

특징:

- 사용자 · 호출자가 신경 쓰는 동작을 테스트한다
- 공개 API만 쓴다
- 내부 리팩터링에 살아남는다
- WHAT을 기술하고 HOW를 기술하지 않는다
- 테스트당 논리적 단언 하나

## 나쁜 테스트

**구현 세부 테스트**: 내부 구조에 결합되어 있다.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

위험 신호:

- 내부 협력자를 모킹한다
- private 메서드를 테스트한다
- 호출 횟수 · 순서를 단언한다
- 동작이 그대로인데 리팩터링하면 테스트가 깨진다
- 테스트 이름이 WHAT이 아니라 HOW를 기술한다
- 인터페이스가 아니라 외부 수단으로 검증한다

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

**동어반복 테스트**: 기대값이 구현을 그대로 되풀이하므로 구성상 통과한다.

```typescript
// BAD: Expected value is recomputed the way the code computes it
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: Expected value is an independent, known literal
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```

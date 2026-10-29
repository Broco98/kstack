# Deepening

의존성을 고려해 얕은 모듈의 클러스터를 안전하게 deepening하는 법. [SKILL.md](SKILL.md)의 어휘(**module**, **interface**, **seam**, **adapter**)를 전제한다.

## 의존성 범주

deepening 후보를 평가할 때 그 의존성을 분류한다. 범주에 따라 deepening된 모듈을 seam 너머로 어떻게 테스트할지가 정해진다.

### 1. In-process

순수 계산, 메모리 안의 상태, I/O 없음. 언제나 deepening할 수 있다. 모듈을 합치고 새 인터페이스를 통해 바로 테스트한다. adapter는 필요 없다.

### 2. Local-substitutable

로컬 테스트용 대역이 있는 의존성(Postgres에는 PGLite, 인메모리 파일시스템). 대역이 있으면 deepening할 수 있다. deepening된 모듈은 테스트 스위트 안에서 대역을 띄워 테스트한다. seam은 내부에 있고, 모듈의 external 인터페이스에는 port가 없다.

### 3. Remote but owned (Ports & Adapters)

네트워크 경계 너머에 있는 자기 서비스(마이크로서비스, 내부 API). seam에 **port**(인터페이스)를 정의한다. deep module이 로직을 소유하고, 전송 수단은 **adapter**로 주입한다. 테스트는 인메모리 adapter를 쓴다. 프로덕션은 HTTP/gRPC/큐 adapter를 쓴다.

권고의 꼴: *"seam에 port를 정의하고, 프로덕션용 HTTP adapter와 테스트용 인메모리 adapter를 구현한다. 그러면 네트워크 너머로 배포되더라도 로직은 deep module 하나에 있다."*

### 4. True external (Mock)

자기가 통제하지 못하는 서드파티 서비스(Stripe, Twilio 등). deepening된 모듈은 외부 의존성을 주입된 port로 받고, 테스트는 mock adapter를 제공한다.

## Seam 규율

- **adapter가 하나면 가상의 seam이고, 둘이면 진짜 seam이다.** 적어도 adapter 둘이 정당화되지 않으면(보통 프로덕션 + 테스트) port를 도입하지 않는다. adapter 하나뿐인 seam은 그저 간접 층이다.
- **Internal seam과 external seam.** deep module은 인터페이스에 있는 external seam뿐 아니라 internal seam(구현에 private이고 모듈 자신의 테스트가 쓰는 것)도 가질 수 있다. 테스트가 쓴다는 이유로 internal seam을 인터페이스로 드러내지 않는다.

## 테스트 전략: 겹쌓지 말고 교체한다

- deepening된 모듈의 인터페이스에 테스트가 생기면, 얕은 모듈의 옛 단위 테스트는 낭비가 된다. 지운다.
- 새 테스트는 deepening된 모듈의 인터페이스에 쓴다. **인터페이스가 곧 테스트 표면이다.**
- 테스트는 내부 상태가 아니라 인터페이스를 통해 관찰되는 결과를 단언한다.
- 테스트는 동작을 기술하고 구현을 기술하지 않으므로 내부 리팩터링에 살아남아야 한다. 구현이 바뀔 때 테스트도 바꿔야 한다면, 인터페이스를 지나서 테스트하고 있는 것이다.

# Door — 되돌릴 수 있나

Door(문)는 변경을 merge한 뒤 **되돌아 나올 수 있는지**를 가르는 말이다. kstack은 검증을 얼마나 세게 할지를 Door로 정한다. **two-way는 가볍게 지나가고, one-way에만 무거운 관문을 둔다.**

- **two-way door**(양방향 문): 지나간 뒤에도 되돌아 나올 수 있다. revert 한 번으로 merge 전 상태로 완전히 돌아간다.
- **one-way door**(일방향 문): 지나가면 돌아올 수 없다. 코드는 revert해도 이미 일어난 일이 남는다. 지운 데이터, 이미 돌아간 마이그레이션, 새 API에 이미 기댄 바깥 사용자 같은 것이다.

되돌리기 싼 변경일수록 위험이 낮다. 무거운 관문은 되돌릴 수 없는 자리에 쓴다.

## 판정

물음 하나로 가른다.

> **이 변경을 merge하고 배포한 뒤, revert 커밋 하나로 모든 것이 merge 전으로 돌아가나?**

돌아가면 two-way다. 코드 밖에 무엇이라도 남으면 one-way다.

### one-way 신호

아래에 걸리면 one-way일 수 있다. **신호는 후보일 뿐이고, 판정은 위 물음으로 한다.** 신호에 걸렸는데 two-way로 판정했으면 그 이유를 한 줄 적는다.

| 갈래 | 신호 | 왜 돌아오지 못하나 |
|---|---|---|
| 스키마 · 데이터 형식 | 마이그레이션, 스키마 파일, 컬럼 삭제 · 이름 바꾸기 · 타입 바꾸기, 저장 형식이나 wire format(주고받는 데이터의 모양) 변경 | 이미 바뀐 데이터는 revert로 돌아오지 않는다 |
| 공개 API | 공개 export, HTTP API 계약, CLI 인자, 설정 키, 바깥에서 쓰던 파일을 지움 | 저장소 밖 사용자가 이미 새 모양에 기댄다 |
| 인증 · 권한 | 인증 경로, 권한 검사, 토큰 · 비밀값을 다루는 코드 | revert로 구멍을 닫아도 그사이 새어 나간 것은 남는다 |
| 데이터 삭제 | 데이터를 지우거나 덮어쓰는 코드 | 지운 것은 돌아오지 않는다 |

- **애매하면 one-way로 다룬다.** 왜 애매한지 한 줄 적는다. 무거운 관문을 한 번 더 도는 값이 되돌릴 수 없는 사고보다 싸다.
- **diff 안에 one-way가 하나라도 있으면 그 diff 전체를 one-way 강도로 검증한다.**
- 동작을 바꾸지 않는 리팩터링은 대개 two-way다. 다만 공개 API의 이름을 바꾸거나 옛 API를 지우면 one-way 신호에 걸린다(`refactor-gates.md` G3).

## Blast radius

blast radius(폭발 반경)는 이 변경이 닿을 수 있는 범위다. 일어날 수 있는 것을 모두 떠올린다. 레이아웃이 밀리는 것, 이 코드를 쓰는 쪽이 깨지는 것, 모바일 화면이 망가지는 것 같은 것이다. Door가 «돌아올 수 있나»를 묻는다면 blast radius는 «얼마나 넓게 닿나»를 묻는다. 둘은 따로 적는다.

## 표시하는 꼴

```
Door: two-way
Door: one-way · 근거 사실: <안전을 받치는 사실> · 증명: `<명령>` → <출력 요약>
```

- one-way면 같은 폴더 `evidence-ladder.md`의 «안전을 받치는 단 하나의 사실»을 따라, 근거 사실을 **사다리 ④까지** 올린다.
- **근거 사실이 거짓으로 드러나면 거기서 멈추고 사람에게 보고한다.** 결정을 다시 해야 하고, 결정은 사람 몫이다.

## 단계별 강도

| 단계 | two-way | one-way |
|---|---|---|
| `kstack:spec` | Door만 표시한다 | 결정을 받치는 사실 하나를 사다리 ④까지 증명한다 |
| `kstack:inspect` Correctness | 리뷰어 1명 (`model: opus`). Correctness는 보안도 보니 설계 · 보안 판단은 opus라는 사용자 규칙을 따른다 | 적대 리뷰어 2명 (`opus` 하나 + `sonnet` 하나). 서로 다른 모델은 서로 다른 버그를 잡는다 |
| `kstack:pr` | 템플릿 그대로 쓴다 | `Blast Radius` 칸에 근거 사실과 증명 출력을 적는다 |

**적대 리뷰어**는 이 변경을 깨뜨리려고 읽는 리뷰어다. 지적마다 재현 명령 · 그 출력 · 의도가 요구하는 출력을 낸다(사다리 ④). 메인은 재현 명령을 다시 돌려 확인된 지적만 남기고, 돌려 보지 못한 것은 «의심»으로 따로 둔다.

## `kstack:pr`의 Merge Danger 칸

| 칸 | 채우는 것 |
|---|---|
| `**Door:**` | `kstack:spec`의 Door 표시 |
| `**Blast Radius:**` | `kstack:spec`의 근거 사실 + `kstack:inspect` Correctness 결과 |

> 출처: mattpocock/skills@59db609 · skills/engineering/pr «Merge Danger» (Door · Blast Radius의 정의, MIT · THIRD_PARTY_NOTICES.md) · pstack-claude@190fc9a · plugins/pstack/skills/blast-radius · plugins/pstack/skills/interrogate (아이디어만, 문장은 다시 씀)

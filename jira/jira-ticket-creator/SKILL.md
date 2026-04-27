---
name: jira-ticket-creator
description: 29CM Jira 티켓 생성 스킬. "지라 티켓 만들어줘", "Jira 티켓 생성해줘" 등 명시적 요청 시 트리거. PM이 간단한 설명만으로 표준화된 티켓(배경/문제정의, 목표, 요구사항, 검토사항)을 생성할 수 있도록 지원.
---

# Jira Ticket Creator

29CM 표준 형식의 Jira 티켓을 생성한다.

## 워크플로우

### 1. 정보 수집
사용자 요청에서 파악:
- 무엇을 해결/구현할 것인가
- 왜 필요한가 (배경, VoC, 데이터)
- 어떤 팀이 작업하는가 (FE, BE, Mobile)

### 2. 프로젝트 결정

| 작업 영역 | 프로젝트 | 비고 |
|----------|---------|------|
| Frontend - 전시 영역 | M29CEF | 홈, 탐색, SRP, 기획전, 콘텐츠 등 Discovery Frontend |
| Frontend - 회원/마이페이지/장바구니 | M29CMCCF | 회원가입, 로그인, 마이페이지, 장바구니, 결제 FE 등 |
| BE (Customer Engagement) | M29CE | 선물하기, 검색, 최근본상품 등 |
| BE (Commerce Core) | **사용자에게 문의** | PDP, 주문, 결제 등 |
| Mobile | CMMOBILE | [Android], [iOS] 각각 생성 |

FE 작업 시 영역 확인:
> "전시(홈/탐색/SRP/콘텐츠) 영역이면 M29CEF, 회원/마이페이지/장바구니 영역이면 M29CMCCF로 생성합니다."

BE 작업이 CE 영역 아닌 경우:
> "BE 작업이 Commerce Core 영역으로 보이는데, 어떤 프로젝트로 생성할까요?"

### 3. 티켓 타입 확인

**항상 확인:**
> "Task 티켓으로 생성할까요?"

복잡한 작업 시:
> "예상 작업량이 커 보이는데, Task로 생성할까요? Initiative가 필요할까요?"

### 4. 티켓 본문 구조

```markdown
## 🎯 배경 및 문제정의

[현재 상황, 문제점, VoC 등]

---

## ✅ 목표

[달성하고자 하는 것]

---

## 📝 요구사항

| 항목 | 내용 |
|------|------|
| ... | ... |

---

## 📎 검토사항

- [고려할 점, 의존성, 관련 티켓]
```

### 5. CMMOBILE 특수 처리

동일 내용으로 2개 생성:
- `[Android] {제목}`
- `[iOS] {제목}`

## Jira 설정

- Cloud ID: `23c14e7d-74ed-40b6-a0bb-fbc1f6351b84`
- Assignee: 미지정 (automatic)
- Issue Type: Task (기본)
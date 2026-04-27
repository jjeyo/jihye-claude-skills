---
name: ce-okr-manager
description: Customer Engagement 팀 OKR 백로그 관리 스킬. "OKR 백로그 정리해줘", "OKR 추가해줘", "OKR 수정해줘", "백로그 관리해줘", "OKR 과제 순연해줘" 등의 요청에 트리거됩니다. 엑셀 시트에서 분기별 과제 리스트업, 순연/추가 과제 추적, 상태 관리를 지원합니다. (Jira Plan은 별도 관리)
---

# CE OKR Manager

Customer Engagement 팀의 OKR 백로그를 관리한다.

## 리소스

- **CE OKR 백로그 시트** (이 스킬에서 관리)
  - ID: `1Msn_QGkXRXagDnN6qL_DKlEFgiVPpBD2kGXMW_8sC9E`
  - 시트명: CE_OKR_Backlog
  - URL: https://docs.google.com/spreadsheets/d/1Msn_QGkXRXagDnN6qL_DKlEFgiVPpBD2kGXMW_8sC9E/edit

> **참고**: 현재 분기 일감 진행상황은 Jira Plan으로 별도 관리

## 백로그 컬럼 구조

| 컬럼 | 설명 |
|------|------|
| 목적 | Discovery-발견, Discovery-탐색, Engagement, GMV, 운영효율화 |
| Project Title | 과제명 |
| Objective | 목표 |
| KR | Key Result |
| Initiative | 이니셔티브 |
| Description | 상세 설명 |
| ETR | ETR 티켓 번호 |
| 요청본부 | ELT, 29CM 커머스, CBP, 마케팅, 자체발의 등 |
| 요청우선순위 | Big-Rock, P0, P1, P2 |
| 원래분기 | 최초 계획된 분기 (Q1, Q2, Q3, Q4) |
| 적용분기 | 실제 진행 예정 분기 |
| 상태 | 완료, 진행중, 순연, 추가, 대기 |
| Owner | 담당자 (김태호, 이현욱, 심지현) |
| Jira Link | 관련 Jira 티켓 링크 |
| 비고 | 특이사항 |

## 워크플로우

### 1. 백로그 조회
```
"OKR 백로그 보여줘"
"2Q 과제 리스트 확인해줘"
"순연된 과제 뭐가 있어?"
```

→ Google Sheets MCP로 CE_OKR_Backlog 시트 조회

### 2. 과제 추가
```
"OKR에 새 과제 추가해줘"
"3Q 과제로 {과제명} 추가해줘"
```

**필수 정보 확인:**
- 목적 (Discovery-발견/탐색, Engagement, GMV, 운영효율화)
- Project Title
- 요청본부
- 요청우선순위
- 원래분기 / 적용분기
- Owner

→ Google Sheets MCP로 CE_OKR_Backlog에 행 추가

### 3. 상태 업데이트
```
"OKR 상태 업데이트해줘"
"{과제명} 완료 처리해줘"
"{과제명} 3Q로 순연해줘"
```

**상태 변경 시:**
- 순연: 적용분기 컬럼 변경, 상태를 '순연'으로
- 완료: 상태를 '완료'로
- 추가: 분기 중 신규 추가 시 상태를 '추가'로

→ Google Sheets MCP로 해당 행 업데이트

### 4. 분기 마감 정리
```
"2Q 마감 정리해줘"
"3Q OKR 준비해줘"
```

**처리 순서:**
1. 현재 분기 과제 상태 확인 (완료/진행중/순연)
2. 미완료 과제 → 다음 분기로 순연 처리
3. 다음 분기 로드맵 과제 확인
4. 백로그 적용분기 컬럼 업데이트

## Owner 매핑

| 담당자 | 주요 영역 |
|--------|----------|
| 김태호 | 커스텀탭, 발견탭, CMS/AI, 이구위크 |
| 이현욱 | SRP/PLP, 홈메인, 브랜드홈, 선물하기, 전문관 |
| 심지현 | 커뮤니티, CRM, 래플/체험단, 핀메뉴 |

## 분기 일정

- Q1: 1월 ~ 3월
- Q2: 4월 ~ 6월
- Q3: 7월 ~ 9월
- Q4: 10월 ~ 12월

## 주의사항

- Jira 링크 형식: `https://jira.team.musinsa.com/browse/{TICKET_ID}`
- 과제 추가 시 원래분기와 적용분기 동일하게 설정
- 순연 시 원래분기는 유지, 적용분기만 변경

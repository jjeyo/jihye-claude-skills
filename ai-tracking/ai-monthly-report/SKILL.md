---
name: ai-monthly-report
description: 29CM PM AI 활용 월간 리포트 React 대시보드 생성 스킬. "AI 기여 리포트 만들어줘", "월간 리포트 생성", "이번 달 AI 성과 정리해줘", "monthly report", "리포트 대시보드 만들어줘" 등의 요청에 트리거됩니다. ai-activity-tracker로 누적된 Persistent Storage 세션 데이터를 로드하여, 4탭(Overview/카테고리/타임라인/전체내역) 다크 테마 React JSX Artifact 대시보드로 출력합니다. KPI 카드, 카테고리/도구별 분포, 주차별 타임라인, 절감 단가 근거 테이블, 필터링 가능한 전체 세션 내역을 포함합니다. 마크다운 텍스트가 아닌 시각화 대시보드로만 출력합니다.
---

# 29CM PM AI 활용 월간 리포트 생성기 (React 대시보드 버전)

기준: https://wiki.team.musinsa.com/wiki/spaces/~shin.han/pages/383353087

## 목적

ai-activity-tracker로 누적된 세션 데이터를 기반으로 **React 대시보드 Artifact**로 월간 AI 기여 리포트를 생성한다. 마크다운 텍스트가 아닌, 시각화된 대시보드 형태로 출력한다.

## 트리거 조건

- "AI 기여 리포트 만들어줘", "월간 리포트 생성"
- "이번 달 AI 성과 정리해줘", "monthly report"
- "ai-monthly-report", "리포트 대시보드 만들어줘"

---

## 출력 형태: React JSX Artifact (필수)

이 스킬은 **반드시 React JSX Artifact로 출력**한다.
마크다운 텍스트, 표, 일반 텍스트 형식은 사용하지 않는다.

전체 구현 레퍼런스: [`references/ai-monthly-report-example.jsx`](references/ai-monthly-report-example.jsx) — 4탭 구조, 디자인 시스템, 집계 로직 모두 포함.

---

## 대시보드 구성 (4탭)

### Tab 1: Overview
- KPI 카드 4개: 총 건수 / 절감시간(h) / MD 환산 / 효율 배수
- 카테고리별 절감시간 수평 바차트
- 도구별(Desktop/Code) 비율 + 주요 카테고리
- 이달의 하이라이트 (자동 생성)
- 절감시간 추정 근거 테이블 (단가 × 건수)

### Tab 2: 카테고리별
- 카테고리별 카드 그리드 (2열)
- 카드 내: 총 건수/시간 + 세부 작업 목록 (최대 3개)
- 카테고리 색상 코딩

### Tab 3: 타임라인
- 주차별 절감시간 스택 바 (Code/Desktop 분리)
- Desktop vs Code 범례

### Tab 4: 전체 내역
- 도구 / 카테고리 필터
- 전체 세션 테이블 (날짜·도구·카테고리·유형·내용·시간·링크)
- 필터 적용 건수·합계

---

## 디자인 가이드 (과거 대시보드 스타일 통일)

```
배경: #0f1117 (진한 네이비 다크)
카드: #1e293b
강조선: #334155
탭 액티브: #6366f1 (인디고)

카테고리 색상:
  PRD·설계:    #6366f1
  Jira:        #06b6d4
  전략·기획:   #f59e0b
  데이터 분석: #10b981
  문서화:      #8b5cf6
  경쟁·리서치: #f43f5e
  매니저기여:  #ec4899

도구 색상:
  Code:    #6366f1
  Desktop: #10b981
```

폰트: `'Pretendard','Apple SD Gothic Neo',sans-serif`

---

## 데이터 소스

### Case A: Persistent Storage 데이터 있음 (ai-activity-tracker 사용 중)

```javascript
const raw = await window.storage.get("ai_sessions");
const sessions = raw ? JSON.parse(raw.value) : [];
// 기간 필터링
const targetMonth = "2026-04"; // 현재 월 또는 사용자 지정
const data = sessions.filter(s => s.date.startsWith(targetMonth));
```

### Case B: Persistent Storage 없음 (데이터 직접 입력)

사용자에게 아래 필드를 입력받아 sessions 배열 구성:

```
날짜, 도구(Desktop/Code), 카테고리, 유형/스코프 티어, 작업 내용, 절감시간(h), 산출물 링크
```

입력 방법:
1. "세션 목록 붙여줘" → 사용자가 텍스트로 붙여넣기
2. 슬랙/노션에서 복사한 기존 리포트 텍스트 파싱

---

## 단가 기준표 (대시보드 내 추정 근거 섹션용)

| 유형 | 단가 |
|------|------|
| Initiative | 4h |
| Epic | 2h |
| Dev/Task | 1h |
| 전략문서 S | 32h |
| 전략문서 A | 16~20h |
| 전략문서 B | 8~9h |
| 전략문서 C | 3h |
| 2pager 복합 | 64h |
| 2pager 표준 | 32h |
| 2pager 단순 | 12h |
| PRD 복합 | 32h |
| PRD 일반 | 20h |
| PRD 단순 | 7h |
| Databricks 단순 | 6~14h |
| Databricks 분석 | 13~35h |
| Databricks 종합 | 32~72h |
| Amplitude 이벤트/퍼널 | 1~4.5h |
| Amplitude 코호트/리텐션 | 4~5h |
| Amplitude 복합 | 8~12h |
| 정책·가이드·API | 2h |
| 위클리·회의록 | 1h |
| CRM·OKR 문서 | 2h |

---

## 실행 절차

### STEP 1: 기간 확인
"어느 달 리포트를 생성할까요?" (기본: 현재 월)

### STEP 2: 데이터 로드
Persistent Storage 조회 → 없으면 사용자 입력 요청

### STEP 3: 집계 계산 (JavaScript 내부)

```javascript
const totalH = sessions.reduce((a,b) => a + b.saved_hours, 0);
const totalMD = (totalH / 8).toFixed(1);
const catGroups = groupBy(sessions, "category");
const toolGroups = groupBy(sessions, "tool");
const weekGroups = groupByWeek(sessions); // 주차별
```

### STEP 4: React JSX Artifact 생성
- 위 디자인 가이드 스타일 적용
- 4탭 구조 구현 (`references/ai-monthly-report-example.jsx` 그대로 따라가되 데이터만 교체)
- 실제 집계 데이터로 차트/테이블 렌더링
- 단가 근거 테이블 자동 구성

### STEP 5: Slack 공유 메시지 출력

대시보드 아래에 텍스트로 추가:

```
📊 2026년 N월 AI 기여 리포트
총 N건 / Nh 절감 (~N MD) / N.N× 효율
상세 대시보드: [대화 링크 복사해서 공유]
단가 기준: 공통 가이드 v2
```

---

## 주의사항

- ❌ 마크다운 표/텍스트로 출력하지 않는다
- ❌ 단순 텍스트 리스트로 출력하지 않는다
- ✅ 반드시 React JSX Artifact 대시보드로 출력한다
- ✅ 다크 테마 (#0f1117 배경) 유지
- ✅ 4탭 구조 유지 (Overview / 카테고리 / 타임라인 / 전체내역)
- ✅ KPI 카드 4개 필수 포함

---

## 참고 산출물

- 전체 구현 예시: [`references/ai-monthly-report-example.jsx`](references/ai-monthly-report-example.jsx)
- 과거 대시보드 스타일: claude-productivity-dashboard.jsx, claude-unified-dashboard.jsx (동일 스타일)

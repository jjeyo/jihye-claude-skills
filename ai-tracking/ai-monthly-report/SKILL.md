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

**우선순위**:
1. `references/ai-monthly-report-example.jsx` 가 존재하면 → 그 파일을 Read하여 구조·스타일 그대로 따라가되, 하드코딩된 `SESSIONS` 배열만 실제 데이터로 교체
2. references 파일이 없으면 → 아래 **Fallback 인라인 명세**로 직접 구현

---

## Fallback 인라인 명세 (references/jsx 없을 때)

### 디자인 토큰

```javascript
// 색상 시스템
const THEME = {
  bg:      "#0f1117",  // 배경 (네이비 다크)
  card:    "#1e293b",  // 카드 배경
  border:  "#334155",  // 강조선
  accent:  "#6366f1",  // 인디고 (탭/포인트)
  text:    "#e2e8f0",  // 본문
  textDim: "#94a3b8",  // 보조 텍스트
  textMute:"#64748b",  // 라벨
  textFade:"#475569",  // 캡션
};

const CAT_META = {
  "PRD·설계":   { color:"#6366f1", icon:"📋" },
  "Jira":       { color:"#06b6d4", icon:"🎫" },
  "전략·기획":  { color:"#f59e0b", icon:"🧭" },
  "데이터 분석":{ color:"#10b981", icon:"📊" },
  "문서화":     { color:"#8b5cf6", icon:"📄" },
  "경쟁·리서치":{ color:"#f43f5e", icon:"🔍" },
  "매니저기여": { color:"#ec4899", icon:"👥" },
};

const TOOL_COLOR = { Code:"#6366f1", Desktop:"#10b981" };

const FONT = "'Pretendard','Apple SD Gothic Neo',sans-serif";
```

### 집계 헬퍼

```javascript
const sum = (arr, key) => arr.reduce((a,b) => a + (b[key]||0), 0);
const groupBy = (arr, key) => arr.reduce((m,x) => {
  m[x[key]] = m[x[key]] || []; m[x[key]].push(x); return m;
}, {});
// 주차별: 1~7일=1주, 8~14=2주 ...
const groupByWeek = (arr) => {
  const weeks = {};
  arr.forEach(s => {
    const w = `${Math.ceil(new Date(s.date).getDate()/7)}주`;
    weeks[w] = weeks[w] || { Code:0, Desktop:0 };
    weeks[w][s.tool] = (weeks[w][s.tool]||0) + s.hours;
  });
  return weeks;
};
```

### 컴포넌트 구조

```
<App>
  ├ Header (gradient: linear-gradient(135deg,#1e1b4b 0%,#0f1117 60%))
  │   ├ Title: "📊 YYYY년 M월" + 부제 ("작성자 · 역할 · 단가 기준 v2")
  │   ├ AI-ASSISTED 배지
  │   ├ KPI 카드 4개 (grid 4col, gap 12)
  │   └ 탭바 4개
  │
  └ Body (padding 24)
      ├ Tab "overview" (grid 2col)
      │   ├ 카테고리별 수평 바차트 (% 기반, height 6)
      │   ├ 도구별 분포 (Code/Desktop 비율 바 height 8)
      │   ├ ✨ 이달의 하이라이트 (자동 생성 3줄)
      │   └ 절감 단가 근거 테이블 (gridColumn:"1/-1") — 유형/건수/단가/소계/비중
      │
      ├ Tab "카테고리" (grid 2col)
      │   └ 카테고리 카드 7개 (borderLeft 3px CAT_META.color)
      │       └ 세부 작업 3개 + "외 N건" 표시
      │
      ├ Tab "타임라인"
      │   ├ 주차별 스택 바 (Code 인디고 / Desktop 그린)
      │   └ 범례 (Code 합계 / Desktop 합계)
      │
      └ Tab "전체내역"
          ├ 도구 필터 (전체/Code/Desktop 버튼)
          ├ 카테고리 필터 (select)
          └ 테이블 (날짜·도구·카테고리·유형·내용·시간·링크)
              + hover 효과 (#243044), 링크는 ↗ 아이콘
```

### KPI 카드 4개 (필수)

```javascript
[
  { label:"총 AI 지원 건수", val:`${sessions.length}건`, sub:"전월 대비 +N건", color:"#6366f1" },
  { label:"절감 시간",       val:`${totalH}h`,           sub:`${totalMD} MD`, color:"#10b981" },
  { label:"효율 배수",       val:"N.N×",                  sub:"평균 효율",     color:"#f59e0b" },
  { label:"산출물 링크",     val:`${linkedCount}건`,      sub:"Jira/Confluence",color:"#06b6d4" },
]
// 카드 스타일: bg #1e293b, borderRadius 10, borderTop 2px color, padding 14/16
// val: fontSize 22, fontWeight 700, color: 카드별 color
```

### 탭바

```javascript
const TABS = [
  ["overview","Overview"],
  ["카테고리","카테고리별"],
  ["타임라인","타임라인"],
  ["전체내역","전체 내역"],
];
// 액티브: color #6366f1, borderBottom 2px #6366f1, fontWeight 600
// 비액티브: color #64748b, borderBottom transparent
```

### 단가 근거 테이블

집계된 `유형별 건수`를 단가 기준표(위)와 join해서 자동 구성:

```javascript
// 예시 행: { type: "PRD 일반", cnt: 4, rate: 20, sub: 80 }
// 비중: Math.round(sub/totalH*100) %
// 합계 행: 굵게, color #10b981
```

### "이달의 하이라이트" 자동 생성

세션 데이터에서 다음 패턴으로 3줄 작성:
1. 가장 큰 카테고리 + 건수/시간
2. 같은 작업명 시리즈가 있으면 "X → Y → Z 1일 내 완결" 형식
3. 도구별 특징 (Code 위주 / Desktop 위주 / 혼용)

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

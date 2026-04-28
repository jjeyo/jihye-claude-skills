---
name: ai-monthly-report
description: 29CM PM AI 활용 리포트 대시보드 생성 스킬. "AI 기여 리포트 만들어줘", "월간 리포트", "분기 리포트", "반기 리포트", "이번 달 AI 성과 정리해줘", "Q1 누적", "monthly report" 등의 요청에 트리거됩니다. 사용자 요청과 프로필을 기반으로 두 축의 모드를 자동 결정 — 기간(단월/분기/반기) × 역할(PM/Manager). 단월 PM은 4탭(Overview·카테고리·타임라인·전체내역), 분기/반기 PM은 5탭(+월별 추이·인사이트), Manager 모드는 M7 전략 연결·M8 리더십 탭이 추가됩니다. 공통 컴포넌트(KPI·1줄 해석·카테고리·절감 단가 근거·이전 기간 대비)는 모든 모드에 표시되고, 도구별 분석은 Desktop·Code 모두 사용 시에만 표시됩니다. ai-activity-tracker로 누적된 세션 데이터를 환경별로 로드 — Claude Code는 ~/.claude/ai-sessions.json에서 읽고 자체완결형 HTML 파일을 생성한 뒤 브라우저 자동 오픈, Claude Desktop은 window.storage("ai_sessions")에서 읽고 React JSX Artifact로 렌더링. 단가는 Confluence 위키(Page ID 425657419)를 진실의 원천으로 매 실행 시 fetch. 코드만 채팅에 풀어놓는 출력은 금지.
---

# 29CM PM AI 활용 월간 리포트 생성기 (React 대시보드 버전)

기준: https://wiki.team.musinsa.com/wiki/spaces/~7120204a0ba1ca75154594a01b1c185b5abe45/pages/425657419

## 목적

ai-activity-tracker로 누적된 세션 데이터를 기반으로 **React 대시보드 Artifact**로 월간 AI 기여 리포트를 생성한다. 마크다운 텍스트가 아닌, 시각화된 대시보드 형태로 출력한다.

## 트리거 조건

- "AI 기여 리포트 만들어줘", "월간 리포트 생성"
- "이번 달 AI 성과 정리해줘", "monthly report"
- "ai-monthly-report", "리포트 대시보드 만들어줘"

---

## 출력 형태 (환경별 분기)

이 스킬은 **반드시 시각화된 대시보드**로 출력한다. 환경에 따라 형식이 다름:

| 환경 | 출력 형식 | 동작 |
|------|----------|------|
| **Claude Desktop / Web** | React JSX **Artifact** | Artifact 패널에 4탭 대시보드 렌더링 |
| **Claude Code (CLI)** | 자체완결형 **HTML 파일** | `./ai-monthly-report-YYYY-MM.html` 생성 + 브라우저 자동 오픈 |

❌ 마크다운 표/텍스트로 출력 금지
❌ 코드만 채팅에 풀어놓기 금지

전체 구현 레퍼런스: [`references/ai-monthly-report-example.jsx`](references/ai-monthly-report-example.jsx) — Artifact 환경에서 그대로 사용 가능, HTML 환경에서도 동일 컴포넌트 사용.

---

## 보고서 표준 구조 (모드 분기)

### 모드 결정 (실행 시 자동)

**1. 기간 모드** (사용자 요청에서 추정)
- **단월**: "이번 달", "4월 리포트" 등 1개월
- **분기**: "Q1 리포트", "1~3월 누적" 등 3개월
- **반기**: "상반기", "1~6월" 등 6개월

**2. 역할 모드** (사용자 프로필에서 자동)
- **PM 모드** (default): 일반 PM
- **Manager 모드**: Lead PM / 매니저 (역할 정보 있을 때만 활성화)

역할 정보 추정 출처 (우선순위):
1. `~/.claude/CLAUDE.md` 또는 글로벌 설정의 `role: Lead PM` / `role: Manager` 표기
2. 사용자가 "Lead 모드", "매니저 보고서"로 명시 요청
3. 둘 다 없으면 PM 모드

### 공통 컴포넌트 (모든 모드)

| 컴포넌트 | 위치 | 비고 |
|---|---|---|
| KPI 카드 4개 | 헤더 | 건수 / 절감시간(h) / MD / 효율배수 |
| **1줄 해석** | Overview 최상단 | 자동 생성 — "N개월간 N건 작업에 Nh 투입, 수작업 Nh 절감" |
| **카테고리별 절감시간** | Overview / 카테고리 탭 | 수평 바차트 + 표 (위키 v2 단가 적용) |
| **절감시간 추정 근거** | Overview 하단 | 유형 × 건수 × 단가 = 소계 표 |
| **이전 기간 대비** | KPI 카드 sub | 단월=전월 / 분기=직전 분기 / 반기=직전 반기 |
| **인사이트** | 별도 탭 또는 Overview | 레이아웃 공통, 내용은 기간·역할별 자동 생성 |

### 조건부 컴포넌트

**도구별 분석** — Desktop·Code 둘 다 사용한 경우에만 표시. 단일 도구만 사용 시 숨김.

### 기간 모드별 추가

| 모드 | 추가 |
|---|---|
| **단월** | 타임라인 탭 (주차별 스택 바) |
| **분기** | **월별 추이 탭** (3개 월 비교 + 카드) + 직전 분기 대비 |
| **반기** | **월별 추이 탭** (6개 월 비교 + 카드) + 직전 반기 대비 |

### 역할 모드별 추가 (Manager만)

| 컴포넌트 | 위치 | 내용 |
|---|---|---|
| **M7 전략 연결** | 별도 탭 | OKR Initiative별 분포, 전략 축별 비율, Big Rock 비중, 데이터 기반 의사결정 비율 |
| **M8 리더십** | 별도 탭 | 인터뷰·팀원 검토·크로스펑셔널·OKR 설계·ETR 검토 카드 |

> Manager 모드 컨텐츠는 [Tech Lead AI 성과 관리 체계 v2 (425755704)](https://musinsa-oneteam.atlassian.net/wiki/spaces/~7120204a0ba1ca75154594a01b1c185b5abe45/pages/425755704)의 M7·M8 사양 기준으로 구성.

### 인사이트 섹션 — 개인 성장 관점

인사이트는 **레이아웃은 공통, 내용은 사람·기간·역할별 자동 생성**한다.

**자동 생성 인사이트 4종 (공통)**:
1. 자동화 효과 (스킬·규칙·에이전트 누적 효과)
2. 도구 상호 보완 (Desktop ↔ Code 시너지)
3. 팀 확장 (산출물의 팀 영향)
4. 기간 특이사항 (월별/분기별 변화 포인트)

**Job Competency 참고 인사이트** (개인 성장 관점, 선택):
- 사용자의 현재 Job level 정보가 있는 경우만 활성 (`~/.claude/CLAUDE.md`의 `job_level` 또는 사용자 명시)
- **다음 단계 Job competency 기준** 으로 본인 작업 패턴을 비추어 자기 성장 시사점 자동 도출
- 참조 파일:
  - `hr/interview-question-generator/references/job-competency.md` (5개 역량 축: Scope & Impact / Expertise / AI Proficiency / Collaboration & Leadership / Skillset, IC·Manager 트랙)
  - `hr/interview-question-generator/references/musinsa-way.md` (MUSINSA WAY 7대 핵심가치)
- 출력 예: "데이터 기반 의사결정 비율 38% (Excellence 가치 부합) / 크로스펑셔널 협업 4건 (Collaborate Across Boundaries 영역 누적 강화 가능)"
- 본 박스는 **개인 성장 시사점**으로만 출력 (사람·역할별 맞춤)

**조직 영향 표현 가이드** (Manager 모드 인사이트):
- 사실 기반 중립 표현만 사용: "팀 표준 스킬 70+ 발행", "크로스펑셔널 4팀 협업 주도", "팀원 산출물 코칭 9건"
- 헤더는 "조직 영향" / "팀 기여" / "크로스펑셔널" 같은 중립 명칭

### 최종 탭 구조 (모드 조합)

| 모드 | 탭 |
|---|---|
| **단월 PM** | Overview · 카테고리별 · 타임라인 · 전체 내역 (4탭) |
| **단월 Manager** | Overview · 카테고리별 · 타임라인 · M7 전략 · M8 리더십 · 전체 내역 (6탭) |
| **분기/반기 PM** | Overview · 월별 추이 · 카테고리별 · 인사이트 · 전체 내역 (5탭) |
| **분기/반기 Manager** | Overview · 월별 추이 · 카테고리별 · M7 전략 · M8 리더십 · 인사이트 · 전체 내역 (7탭) |

### 각 탭 상세 명세

**Tab: Overview** (공통)
- KPI 카드 4개 + 이전 기간 대비
- 1줄 해석 박스 (자동 생성)
- 카테고리별 절감시간 수평 바차트
- 도구별 분석 (도구 2개 이상일 때만)
- 이달/이번 분기/이번 반기 하이라이트 (자동 생성 3줄)
- 절감시간 추정 근거 테이블

**Tab: 카테고리별** (공통)
- 카테고리 카드 그리드 (2열, 색상 코딩)
- 카드 내: 총 건수/시간 + 세부 작업 (최대 3~5건)

**Tab: 타임라인** (단월에만)
- 주차별 절감시간 스택 바 (도구 2개일 때 분리)

**Tab: 월별 추이** (분기/반기에만)
- 3~6개 월 바차트 (도구별 색상)
- 월별 카드 그리드 (건수·시간·도구 분포)
- 직전 기간 대비 변화율

**Tab: M7 전략 연결** (Manager만)
- OKR Initiative별 분포 (Big Rock 표시)
- 전략 축별 기여 비율
- 데이터 기반 의사결정 비율
- 상향 영향 (선택) — 임원·본부장 보고 건수 (사실 기반 카운트만)

**Tab: M8 리더십** (Manager만)
- 5개 카드: 인터뷰 / 팀원 검토 / 크로스펑셔널 / OKR 설계 / ETR
- 카드 내: 건수·시간·단가·세부 항목

**Tab: 인사이트** (분기/반기 권장)
- 레이아웃 공통: 자동화 효과 / 도구 상호 보완 / 팀 확장 / 기간 특이사항 4개 카드
- (선택) Job Competency 참고 — 개인 성장 시사점 박스
- (Manager) 조직 영향 박스 — 사실 기반 중립 표현

**Tab: 전체 내역** (공통)
- 도구·카테고리·기간 필터
- 전체 세션 테이블

### 카테고리·단가 (공통, 위키 v2 기반)

`STEP 0`에서 fetch한 위키 단가표 그대로 사용. 공통 카테고리:
- PRD·설계 / 전략·기획 / 데이터 분석 / Jira / 문서화 / 경쟁·리서치 / 디자인·프로토타입

Manager 모드에서는 `리더십·매니저` 카테고리 추가 노출 (인터뷰·OKR·ETR 합산).

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

## 데이터 소스 (환경별)

### Case A: Claude Code 환경 — JSON 파일 읽기

**ai-activity-tracker가 누적한 표준 경로**: `~/.claude/ai-sessions.json`

```bash
# 파일 존재 + 비어있지 않은지 확인
[ -s ~/.claude/ai-sessions.json ] || echo "데이터 없음"

# 특정 월만 필터 (jq)
jq --arg m "2026-04" '[.[] | select(.date | startswith($m))]' ~/.claude/ai-sessions.json
```

Python으로:
```python
import json, os
path = os.path.expanduser('~/.claude/ai-sessions.json')
sessions = json.load(open(path)) if os.path.exists(path) else []
data = [s for s in sessions if s['date'].startswith('2026-04')]
```

### Case B: Claude Desktop 환경 — Persistent Storage

```javascript
const raw = await window.storage.get("ai_sessions");
const sessions = raw ? JSON.parse(raw.value) : [];
const targetMonth = "2026-04";
const data = sessions.filter(s => s.date.startsWith(targetMonth));
```

### Case C: 데이터 없음 — 사용자 입력 요청

ai-activity-tracker를 안 썼거나 데이터가 비어있으면:

```
"세션 목록을 붙여넣어주세요. 형식 예시:
날짜 | 도구 | 카테고리 | 유형 | 작업 | 시간 | 링크
2026-04-03 | Code | PRD·설계 | 2pager-표준 | 이구위크 2pager | 32 | https://..."
```

또는 슬랙·노션에서 복사한 기존 리포트 텍스트를 파싱.

---

## 단가 기준표 (가이드 v2 — 스코프 티어 세분화)

⚠️ **단가의 진실의 원천**: [29CM PM AI 활용 성과 추적 — 공통 가이드](https://musinsa-oneteam.atlassian.net/wiki/spaces/~7120204a0ba1ca75154594a01b1c185b5abe45/pages/425657419) (Page ID: `425657419`)

ai-activity-tracker와 동일한 단가 표를 사용한다 (절감 단가 근거 테이블 렌더링용). **매 실행 시 위키 fetch**해서 최신 단가 적용 — 아래 표는 fetch 실패 시 fallback. 위키와 차이 있으면 위키 값 우선.

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
| 분석 리포트 | 2~4h |
| Braze CRM 설계 | 2h |
| CRM 캠페인 기획 | 2h |
| 경쟁사 분석 | 2h |
| OKR 헬스체크 | 2h |
| 홈·발견·탐색 전략 | 3~4h |
| 인터뷰 질문·평가 | 2h |
| 신규 PM 온보딩 | 2h |

---

## 실행 절차

### STEP 0: 실행 환경 감지 + 위키 단가 freshness 체크

**환경 감지**:
- **Bash 도구 사용 가능** (Read/Write/Bash 모두 있음) → **Claude Code 환경** → 4-B (HTML 파일 출력)
- **Bash 없고 Artifact 생성 가능** → **Claude Desktop/Web 환경** → 4-A (React Artifact)
- 둘 다 애매하면 사용자에게 직접 질문

**단가 freshness 체크** (Atlassian MCP 있을 때):
```
mcp__atlassian__confluence_get_page(page_id="425657419")
```
- "3. 절감 시간 단가 기준" 섹션 파싱 → fallback 표와 비교
- 차이 있으면 **위키 값 우선**, 변경사항 사용자에게 알림
- 절감 단가 근거 테이블(Tab 1 마지막)은 항상 위키 단가 기준으로 렌더링

### STEP 1: 기간 확인
"어느 달 리포트를 생성할까요?" (기본: 현재 월)

### STEP 2: 데이터 로드 (환경에 따라)
- **Code**: `~/.claude/ai-sessions.json` 읽기 (위 Case A)
- **Desktop**: `window.storage.get("ai_sessions")` 호출 (위 Case B)
- **데이터 없음**: 사용자 입력 요청 (위 Case C)

### STEP 3: 집계 계산 (JavaScript 내부)

```javascript
const totalH = sessions.reduce((a,b) => a + b.saved_hours, 0);
const totalMD = (totalH / 8).toFixed(1);
const catGroups = groupBy(sessions, "category");
const toolGroups = groupBy(sessions, "tool");
const weekGroups = groupByWeek(sessions); // 주차별
```

### STEP 4: 대시보드 출력 (환경별 분기)

#### 4-A. Claude Desktop / Web — React JSX Artifact

**우선순위**:
1. `references/ai-monthly-report-example.jsx` 가 존재하면 → 그 파일을 Read하여 구조·스타일 그대로 따라가되, 하드코딩된 `SESSIONS` 배열만 실제 데이터로 교체
2. references 파일이 없으면 → 아래 **Fallback 인라인 명세**로 직접 구현

#### 4-B. Claude Code (CLI) — 자체완결형 HTML 파일

**저장 위치**: 현재 작업 디렉토리 (`./ai-monthly-report-YYYY-MM.html`)

**HTML 템플릿 구조** (자체완결형, CDN 사용):

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>AI 활용 성과 리포트 — YYYY년 M월</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin:0; font-family:'Pretendard','Apple SD Gothic Neo',sans-serif; background:#0f1117; color:#e2e8f0; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    const { useState } = React;

    // ── 실제 세션 데이터 (~/.claude/ai-sessions.json에서 로드한 값 인라인) ──
    const SESSIONS = /* [실제 데이터 배열 인라인] */;

    // ── references/ai-monthly-report-example.jsx의 App 컴포넌트 동일 코드 ──
    // (CAT_META, TOOL_COLOR, sum, groupBy, App 함수 그대로 복사)

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
```

**파일 생성 후 자동 브라우저 오픈**:
```bash
# macOS
open ./ai-monthly-report-2026-04.html

# Linux
xdg-open ./ai-monthly-report-2026-04.html

# Windows (WSL 또는 Git Bash)
start ./ai-monthly-report-2026-04.html

# 사용자 환경 모르면 절대 경로만 출력
echo "리포트 생성됨: $(pwd)/ai-monthly-report-2026-04.html"
echo "브라우저에서 열어주세요."
```

**Claude Code에서 권장 흐름**:
1. Write 도구로 HTML 파일 생성
2. Bash로 OS 감지: `uname -s` (Darwin/Linux/MINGW...)
3. 적절한 open 명령 실행
4. 사용자에게 파일 경로 안내

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
- ❌ Claude Code인데 채팅창에 JSX 코드만 풀어놓지 않는다 → **반드시 HTML 파일로 저장**
- ✅ 환경별 분기: Desktop은 Artifact, Code는 HTML 파일 + 자동 브라우저 오픈
- ✅ 다크 테마 (#0f1117 배경) 유지
- ✅ 4탭 구조 유지 (Overview / 카테고리 / 타임라인 / 전체내역)
- ✅ KPI 카드 4개 필수 포함
- ✅ 실제 데이터로 렌더링 (하드코딩된 샘플 데이터 그대로 출력 금지)

---

## 참고 산출물

- 전체 구현 예시: [`references/ai-monthly-report-example.jsx`](references/ai-monthly-report-example.jsx)
- 과거 대시보드 스타일: claude-productivity-dashboard.jsx, claude-unified-dashboard.jsx (동일 스타일)

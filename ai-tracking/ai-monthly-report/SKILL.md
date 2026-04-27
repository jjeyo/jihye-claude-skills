---
name: ai-monthly-report
description: 29CM PM AI 활용 월간 리포트 생성 스킬. "AI 기여 리포트 만들어줘", "월간 리포트 생성", "이번 달 AI 성과 정리해줘", "monthly report", "리포트 Confluence 올려줘" 등의 요청에 트리거됩니다. ai-activity-tracker로 누적된 세션 데이터(Persistent Storage)를 기반으로 월간 AI 기여 리포트를 마크다운으로 생성하고, MCP 환경에서는 Confluence 자동 발행까지 수행합니다. 예시 출력 포맷은 references/example-pm-monthly-report.md 참조.
---

# 29CM PM AI 활용 월간 리포트 생성기 (표준)

## 목적
ai-activity-tracker로 누적된 세션 데이터를 기반으로 월간 AI 기여 리포트를 생성한다.
Confluence 발행(Claude Code + MCP 환경) 또는 마크다운 다운로드(Desktop 환경) 방식으로 출력.

## 트리거 조건
- "AI 기여 리포트 만들어줘", "월간 리포트 생성"
- "이번 달 AI 성과 정리해줘", "monthly report"
- "ai-monthly-report", "리포트 Confluence 올려줘"

---

## 자동 처리 항목

1. **Persistent Storage에서 세션 데이터 자동 로드**
2. **기간 필터링** → 이번 달 (또는 사용자 지정 월)
3. **집계 계산** → 유형별 건수, 총 절감시간, MD, 효율 배수 평균
4. **카테고리별 분포** → 자동 집계
5. **리포트 마크다운 자동 생성**
6. **(Level 2)** Confluence 자동 발행 (Atlassian MCP 필요)

## 수동 처리 항목

- 리포트 대상 월 확인 (기본: 현재 월)
- Confluence 발행 공간·위치 확인
- Jira 이슈 목록 링크 (MCP 없는 경우 수동 붙여넣기)
- 특이사항·하이라이트 멘트 추가

---

## 실행 절차

### STEP 1: 데이터 로드 및 기간 필터
```javascript
const raw = await window.storage.get("ai_sessions");
const sessions = raw ? JSON.parse(raw.value) : [];
const targetMonth = "2026-04"; // 사용자 지정 또는 현재 월
const filtered = sessions.filter(s => s.date.startsWith(targetMonth));
```

### STEP 2: 집계 계산
```javascript
const summary = {
  total_count: filtered.length,
  total_hours: filtered.reduce((a, b) => a + b.saved_hours, 0),
  total_md: (total_hours / 8).toFixed(1),
  by_category: groupBy(filtered, "category"),
  by_type: groupBy(filtered, "type"),
  by_tool: groupBy(filtered, "tool"),
  jira_count: filtered.filter(s => s.output_link.includes("jira")).length,
  confluence_count: filtered.filter(s => s.output_link.includes("wiki")).length
};
```

### STEP 3: 리포트 마크다운 생성

아래 구조로 마크다운을 생성한다.

---

```markdown
# AI 활용 성과 리포트 — YYYY년 M월

> 29CM PM AI 활용 공통 가이드 기준: https://wiki.team.musinsa.com/...

---

## 요약

| 항목 | 수량 | 절감 시간 |
|------|------|----------|
| Jira 이슈 | N건 | Nh |
| Confluence 페이지 | N건 | Nh |
| 기타 세션 (분석·전략·리서치) | N건 | Nh |
| **합계** | **N건** | **Nh (~N MD)** |

> 효율 배수: 평균 N.N×  
> 단가 기준: 가이드 v2 (2026-04-08)

---

## M1. KPI 요약 카드

| 지표 | 이번 달 |
|------|--------|
| 총 AI 지원 건수 | N건 |
| 누적 절감 시간 | Nh |
| MD 환산 | N.N MD |
| 효율 배수 | N.N× |

---

## M2. 산출물 현황 (Jira·Confluence)

### Jira 이슈

| 유형 | 건수 | 절감 시간 |
|------|------|----------|
| Initiative | N | Nh |
| Epic | N | Nh |
| Dev/Task | N | Nh |

상세 목록:

| 티켓 | 제목 | AI 기여 내용 |
|------|------|------------|
| [PROJ-N](링크) | 제목 | 내용 |

### Confluence 페이지

| 유형 | 건수 | 절감 시간 |
|------|------|----------|
| PRD/2-Pager | N | Nh |
| 전략 문서 | N | Nh |
| 정책·가이드 | N | Nh |
| 위클리·회의록 | N | Nh |

상세 목록:

| 페이지 | AI 기여 내용 | 절감 시간 |
|--------|------------|----------|
| [제목](링크) | 내용 | Nh |

---

## M3. 세션 로그 분포

### 카테고리별

| 카테고리 | 건수 | 절감 시간 |
|----------|------|----------|
| 데이터 분석 | N | Nh |
| 전략·기획 | N | Nh |
| PRD·설계 | N | Nh |
| 경쟁·리서치 | N | Nh |
| 문서화 | N | Nh |

---

## M4. 월별 타임라인

[누적 추이 텍스트 요약]

---

## 절감 시간 추정 근거

| 유형 | 건수 | 단가 | 소계 |
|------|------|------|------|
| Initiative | N | 4h | Nh |
| Epic | N | 2h | Nh |
| ... | | | |
| **합계** | **N** | | **Nh** |

> 절감 시간은 AI 없이 동일 산출물을 직접 작성했을 때 소요 예상 시간 기준 추정치.  
> 단가 기준: 29CM PM AI 활용 공통 가이드 (https://wiki.team.musinsa.com/...)

---

_작성: YYYY-MM-DD | Claude AI-ASSISTED_
```

---

### STEP 4: 출력 방식 분기

#### Claude Code + Atlassian MCP (Level 2 자동)
- Atlassian MCP로 Confluence 페이지 자동 생성
- 부모 페이지: 사용자 스페이스 내 "AI 기여 리포트" 폴더
- 레이블 `AI-ASSISTED` 자동 부착
- 완료 후 링크 출력

#### Claude Desktop only (Level 1 수동)
- 마크다운 파일 생성 → 다운로드 링크 제공
- 사용자가 Confluence에 직접 붙여넣기

### STEP 5: 확인 메시지 출력

```
✅ 리포트 생성 완료
──────────────────────────────
대상 월: 2026년 4월
총 건수: N건 | 절감시간: Nh | N.N MD
효율 배수: N.N×
Confluence: https://wiki.team.musinsa.com/...
──────────────────────────────
Slack 공유용 요약:
"📊 2026년 4월 AI 기여 리포트
총 N건 / Nh 절감 (~N MD)
상세: [링크]"
```

---

## 자동화 vs 수동 구분

| 항목 | Level 2 (Code+MCP) | Level 1 (Desktop) |
|------|--------------------|-------------------|
| 세션 데이터 로드 | **자동** | **자동** (Persistent Storage) |
| 집계 계산 | **자동** | **자동** |
| 리포트 마크다운 생성 | **자동** | **자동** |
| Confluence 발행 | **자동** (MCP) | 수동 (복사+붙여넣기) |
| Jira 이슈 링크 포함 | **자동** (MCP 조회) | 수동 입력 |
| AI-ASSISTED 레이블 | **자동** | 수동 |
| Slack 공유 | 수동 (텍스트 복사) | 수동 |

---

## 설치 방법
```bash
cp -r ai-monthly-report/ /mnt/skills/user/
```

트리거: "AI 기여 리포트 만들어줘" / "월간 리포트 생성" / "이번 달 AI 성과 정리해줘"

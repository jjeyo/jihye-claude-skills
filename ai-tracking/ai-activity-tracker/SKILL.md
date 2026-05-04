---
name: ai-activity-tracker
description: 29CM PM AI 활용 세션 기록 스킬. "세션 기록해줘", "로그 남겨줘", "AI 기여 기록", "pending 확인", "방금 세션 보여줘", "저장", "OK", "그대로 저장", "PRD 단순으로 바꿔", "Databricks 종합으로", "방금 세션 무시" 등의 요청에 트리거됩니다. Claude Code 환경에서는 ~/.claude/hooks/ai-tracking-hook.py가 PostToolUse·Stop hook으로 자동 메트릭 누적 (Jira/Confluence/Figma/SQL/Slack/토픽/스킬 12종 작업 타입 자동 감지). 임계값 OR 조건 (파일 3+/티켓 1+/페이지 1+/tool_calls 10+/토픽 저장/60분) 도달 시 자동 추정 record를 ~/.claude/ai-sessions/.pending.json에 작성하고, 사용자 확인 후 ~/.claude/ai-sessions/YYYY-MM.json에 월별 분리 저장. 단가는 Confluence 위키(Page ID 425657419)에서 fetch. 스코프 티어(PRD 단순/일반/복합 등)는 자동 추정 후 사용자가 한 번 확인·보정. Claude Desktop 환경에서는 window.storage("ai_sessions")에 누적 (hook 미지원, 명시 호출만). ai-monthly-report 스킬이 동일 데이터 소스에서 리포트를 생성합니다.
---

# 29CM PM AI 활용 세션 기록기 (표준)

## 목적
29CM PM이 AI 도구로 수행한 작업을 표준 단가 기준에 따라 기록하고, 세션 간 데이터를 누적 저장한다.
가이드 기준: https://wiki.team.musinsa.com/wiki/spaces/~7120204a0ba1ca75154594a01b1c185b5abe45/pages/425657419

## 트리거 조건
다음 중 하나에 해당하면 이 스킬을 실행한다.
- "세션 기록해줘", "로그 남겨줘", "AI 기여 기록"
- "오늘 작업 저장", "activity log", "ai-activity-tracker"
- Jira·Confluence 산출물 생성 직후 "이거 로그해줘"
- 특정 작업 완료 후 "몇 시간 절감됐어?"

---

## 자동 처리 항목 (Claude가 직접 수행)

1. **날짜** → 오늘 날짜 자동 입력 (YYYY-MM-DD)
2. **절감 시간 계산** → 사용자가 제공한 카테고리 + 스코프 티어 기반으로 아래 단가표 자동 적용
3. **MD 환산** → 절감시간 ÷ 8 (소수점 1자리)
4. **효율 배수** → (원래 소요 예상 시간) ÷ (실제 AI 활용 소요 시간) — 사용자 입력 기반
5. **누적 저장** → Persistent Storage에 자동 저장 (browser session 간 유지)

## 수동 입력 필요 항목 (사용자가 제공해야 함)

- 도구: Desktop / Code / Desktop+Code
- 카테고리: 아래 카테고리 목록 중 선택
- 스코프 티어: S/A/B/C (전략문서·2pager·PRD) 또는 복잡도 (Databricks: 단순/분석/종합)
- 작업 내용 요약 (1~2줄)
- 산출물 링크 (Jira URL 또는 Confluence URL, 없으면 "-")
- 메모 (단가 조정 사유 등, 선택)

---

## 단가 기준표 (가이드 v2 — 스코프 티어 세분화)

⚠️ **단가의 진실의 원천**: [29CM PM AI 활용 성과 추적 — 공통 가이드](https://musinsa-oneteam.atlassian.net/wiki/spaces/~7120204a0ba1ca75154594a01b1c185b5abe45/pages/425657419) (Page ID: `425657419`)

위키는 누구든 수정할 수 있는 살아있는 가이드. **스킬 실행 시마다 위키를 fetch해서 최신 단가 적용**한다 (STEP 0 참조). 아래 표는 fetch 실패 시 fallback. 위키 단가가 변경되면 위키 값을 우선 사용한다.

### Jira 이슈
| 유형 | 절감 단가 |
|------|----------|
| Initiative | 4h |
| Epic | 2h |
| Dev/Task | 1h |

### 전략 문서 (스코프 티어)
| 티어 | 정의 | 절감 단가 |
|------|------|----------|
| S | 연간·반기 로드맵, 전사 영향 전략 | 32h |
| A | 분기 전략, 크로스펑셔널 3개팀+ | 16~20h |
| B | 단일 도메인 전략·방향성 | 8~9h |
| C | 빠른 의사결정 1페이지 전략 | 3h |

### 2-Pager (협업 복잡도)
| 복잡도 | 협업 범위 | 절감 단가 |
|--------|----------|----------|
| 복합 | 마케팅+커머스+개발(복수팀) | 64h |
| 표준 | 개발팀 + 1개 유관부서 | 32h |
| 단순 | 단일 팀 내부 | 12h |

### PRD (스코프)
| 스코프 | 정의 | 절감 단가 |
|--------|------|----------|
| 복합 | 3개팀+, 신규 도메인, AC 15개+ | 32h |
| 일반 | 2개팀, 신규 기능, AC 5~15개 | 20h |
| 단순 | 1개팀, 기능 수정, AC 5개 이내 | 7h |

### Confluence 문서
| 유형 | 절감 단가 |
|------|----------|
| PRD/2-Pager → 위 PRD·2pager 단가표 적용 | - |
| 정책·가이드·API | 2h |
| 위클리·회의록 | 1h |
| 분석 리포트 | 2~4h |

### Databricks SQL (29cm-data-query)
| 복잡도 | 절감 단가 |
|--------|----------|
| 단순 추출 | 6~14h |
| 분석 쿼리 | 13~35h |
| 종합 분석 | 32~72h |

### Amplitude 분석
| 유형 | 절감 단가 |
|------|----------|
| 이벤트 세그먼테이션 | 1~3h |
| 퍼널 분석 | 2.5~4.5h |
| 코호트·리텐션 | 4~5h |
| 복합 분석 리포트 | 8~12h |

### 기타 29CM 특화
| 유형 | 절감 단가 |
|------|----------|
| Braze CRM 설계 문서 | 2h |
| CRM 캠페인 기획서 | 2h |
| 경쟁사 분석 (If-Then 가설) | 2h |
| OKR 헬스체크 문서 | 2h |
| 홈·발견·탐색 전략 문서 | 3~4h |
| 인터뷰 질문·평가 문서 | 2h |
| 신규 PM 온보딩 자료 | 2h |

> **단가 조정 원칙**: 스코프 편차 큰 유형은 ±1~2h 조정 가능. 조정 시 세션 로그의 `memo` 필드에 사유 기재.

---

## 실행 절차

### STEP 0: 위키 단가 freshness 체크 (필수, Atlassian MCP 있을 때)

**Atlassian MCP가 사용 가능한 환경**이면 매 실행 시 위키 단가를 fetch해서 변경 여부 확인:

```
mcp__atlassian__confluence_get_page(page_id="425657419")
```

응답에서 "3. 절감 시간 단가 기준" 섹션의 표를 파싱한다.

**비교 로직**:
1. 위키의 단가 표 vs 이 SKILL.md의 fallback 단가 표 비교
2. 차이 있으면 **위키 값 우선 사용**
3. 사용자에게 변경사항 알림: `"⚠️ 위키 단가 변경 감지: {유형} {기존} → {신규}. 위키 값으로 계산합니다."`
4. 캐시 저장(선택): `~/.claude/ai-pricing-cache.json` (24h TTL)

```bash
# 캐시 파일 형식 (Code 환경)
{
  "fetched_at": "2026-04-28T10:00:00Z",
  "source_page_id": "425657419",
  "source_version": 12,
  "rates": {
    "Jira-Initiative": 4,
    "Jira-Epic": 2,
    "PRD/2-Pager": 3,
    "...": "..."
  }
}
```

**Atlassian MCP가 없는 환경**: 이 SKILL.md의 fallback 단가표 사용. 사용자에게 안내:
```
ℹ️ Atlassian MCP 미연동 — 캐시된 단가표 사용 중. 최신 단가는 위키에서 직접 확인하세요:
https://musinsa-oneteam.atlassian.net/wiki/spaces/~7120204a0ba1ca75154594a01b1c185b5abe45/pages/425657419
```

### STEP 1: 입력 수집
사용자에게 다음을 순서대로 확인한다. 이미 메시지에 포함된 정보는 재질문하지 않는다.

```
[필수]
1. 도구: Desktop / Code / Desktop+Code?
2. 카테고리: 데이터분석 / 전략기획 / PRD설계 / 경쟁리서치 / 문서화 / Jira이슈?
3. 유형 (카테고리 내 세부): [단가표 참고]
4. 스코프 티어 (전략·2pager·PRD인 경우): S/A/B/C 또는 복합/표준/단순?
5. 작업 내용 요약 (1~2줄)
6. 산출물 링크 (없으면 엔터)

[선택]
7. 실제 AI 활용 소요 시간 (분 단위, 없으면 생략)
8. 메모 (단가 조정 사유 등)
```

### STEP 2: 단가 계산
- **단가 출처**: STEP 0에서 fetch한 위키 단가 우선, 실패 시 fallback 표 사용
- 유형 → 단가 매핑
- 범위 단가(예: 2~3h)인 경우: 복잡도 기반으로 중간값 또는 사용자 확인
- ±1~2h 조정 시 `memo` 필드에 사유 기재
- 실제 AI 소요 시간이 입력된 경우: 효율 배수 = 원래 소요 / 실제 소요

### STEP 3: 레코드 생성
아래 JSON 구조로 레코드를 생성한다.

```json
{
  "id": "YYYYMMDD-NNN",
  "date": "YYYY-MM-DD",
  "tool": "Desktop|Code|Desktop+Code",
  "category": "...",
  "type": "...",
  "scope_tier": "S|A|B|C|복합|표준|단순|-",
  "description": "...",
  "saved_hours": 0.0,
  "saved_md": 0.0,
  "efficiency_ratio": null,
  "output_link": "-",
  "label": "AI-ASSISTED|AI-REVIEWED|AI-ANALYZED",
  "memo": ""
}
```

### STEP 4: 누적 저장 (Hook 자동화 + 환경 분기)

#### 4-A. Claude Code 환경: Hook 자동 누적 + 월별 파일 분리

**Hook 시스템** (`~/.claude/hooks/ai-tracking-hook.py`)이 자동으로:
1. 매 tool 호출(PostToolUse) 직후 메트릭 누적 → `~/.claude/.session-metrics.json` (임시)
2. 임계값 OR 조건 도달 시 자동 추정 record 생성 → `~/.claude/ai-sessions/.pending.json`
3. 사용자 확인 후 → `~/.claude/ai-sessions/YYYY-MM.json` 에 append (월별 분리)

**Hook이 자동 감지하는 작업 타입** (12종):
- Jira 티켓 작성·수정·조회
- Confluence 페이지 작성·수정·조회 (PRD/2-Pager/정책·가이드/위클리 자동 분류)
- Figma 와이어프레임 (figma-wireframe 스킬, use_figma)
- SQL 파일 작성 (.sql 확장자, 단순/분석/종합 자동 추정)
- Amplitude 분석
- Slack 요약·읽기·쓰기
- 토픽 저장 (`~/.claude/topics/*.md`)
- 스킬·규칙·에이전트 구축 (`~/.claude/skills/`, `~/.claude/rules/`, `~/dev/jihye-claude-skills/`)

**임계값 (OR 조건, 한 신혜님 가이드 기준)**:
- 파일 3개+ / Jira 티켓 1건+ / Confluence 페이지 1건+
- tool_calls 10회+ / 토픽 저장 발생 / 60분 경과

**Pending 확인 흐름** — 자동 추정 결과를 사용자가 확인 후 확정:

```
사용자: "방금 세션 보여줘" / "pending 확인" / 또는 다음 응답 시 자동 안내
↓
Claude: pending.json 읽고 요약 카드 표시
"📝 AI 기여 세션 자동 기록 준비됨 (2026-04-28 14:00~15:30)
🎫 TM-2979 Initiative → 4h ✓
📄 PRD: 멀티플랫폼 통합 → 자동 추정 PRD-일반 (20h, AC 8개·2팀 추정) ⚠️ 확인 필요
📊 취향공유_v3.sql → Databricks-분석 (20h) ⚠️ 확인 필요
🎨 Figma 와이어프레임 3안 → 5h ✓
총 추정: 49h 절감

✅ 그대로 저장 / 🔧 수정 / ❌ 무시"
```

**사용자 응답 처리**:

| 응답 | 동작 |
|------|------|
| "저장" / "OK" / "그대로" | 자동 추정값으로 record 생성 → `~/.claude/ai-sessions/YYYY-MM.json` append, pending 삭제 |
| "PRD 단순으로" / "Databricks 종합으로" | 해당 항목 단가 보정 후 저장 |
| "Figma 빼고" / "Initiative만 저장" | 일부 항목 제외 후 저장 |
| "메모: 마이그레이션 작업" | record에 memo 필드 추가 |
| "전부 무시" / "저장 안 해" | pending 파일 삭제 (저장 안 함) |
| 무응답 (3분) | 사용자 설정에 따라 default 동작 (auto-save / keep-pending) |

#### 4-B. Claude Desktop 환경: window.storage 저장 (Hook 미지원)

Desktop은 hook 시스템이 없으므로 명시적 호출만:

```javascript
const existing = await window.storage.get("ai_sessions");
const sessions = existing ? JSON.parse(existing.value) : [];
sessions.push(newRecord);
await window.storage.set("ai_sessions", JSON.stringify(sessions));
```

#### 4-C. 사용자 수동 명령 (환경 무관)

| 명령 | 동작 |
|------|------|
| "AI 기여 기록해줘" / "세션 기록해줘" | 임계값 미도달이라도 즉시 수동 flush (현재 메트릭 → pending) |
| "pending 확인" / "방금 세션 보여줘" | pending.json 내용 카드로 표시 |
| "저장" / "OK" / "그대로 저장" | pending → YYYY-MM.json 저장 + 폐기 |
| "PRD 단순으로 바꿔" | pending 항목 단가 보정 |
| "오늘 기록한 세션 보여줘" | YYYY-MM.json에서 오늘 record 표시 |
| "방금 세션 카테고리 X로 바꿔" | YYYY-MM.json 마지막 record 수정 |
| "방금 세션 OKR 선물하기 성장 태그" | 마지막 record OKR Initiative 추가 |
| "방금 세션 무시" | pending 폐기 또는 마지막 record 삭제 |

### STEP 5: 확인 출력
저장 후 다음 형식으로 요약 출력:

```
✅ 세션 기록 완료
──────────────────────────────
날짜: 2026-04-08 | 도구: Code
카테고리: 전략기획 > 2-Pager (표준)
작업: 홈 커뮤니티 런치 2-pager 초안 작성
절감 시간: 32h (4.0 MD)
산출물: https://wiki.team.musinsa.com/...
──────────────────────────────
이번 달 누적: 47건 / 156h / 19.5 MD
```

---

## 자동화 vs 수동 구분 정리

| 항목 | Claude Code | Claude Desktop |
|------|------------|----------------|
| 저장 위치 | `~/.claude/ai-sessions.json` | `window.storage` ("ai_sessions") |
| 누적 저장 방식 | jq/python으로 JSON append | localStorage 형태 |
| AI-ASSISTED 레이블 부착 | **자동** (Jira/Confluence MCP) | 수동 |
| 날짜·MD 계산 | **자동** | **자동** |
| 단가 매핑 | **자동** | **자동** |
| 스코프 티어 판단 | 사용자 확인 필요 | 사용자 확인 필요 |
| 산출물 링크 | 사용자 입력 | 사용자 입력 |
| ai-monthly-report 연동 | 동일 JSON 파일 읽음 | 동일 storage 키 읽음 |

---

## 설치 방법
```bash
cp -r ai-activity-tracker/ /mnt/skills/user/
```

트리거: "세션 기록해줘" / "로그 남겨줘" / "AI 기여 기록" / "오늘 작업 저장"

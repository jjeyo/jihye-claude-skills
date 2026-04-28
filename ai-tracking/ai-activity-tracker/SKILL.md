---
name: ai-activity-tracker
description: 29CM PM AI 활용 세션 기록 스킬. "세션 기록해줘", "로그 남겨줘", "AI 기여 기록", "오늘 작업 저장", "activity log", "이거 로그해줘", "몇 시간 절감됐어" 등의 요청에 트리거됩니다. Jira·Confluence 산출물 생성 직후 표준 단가표(Initiative/Epic/Task, 전략S~C, 2pager 복합/표준/단순, PRD 복합/일반/단순 등) 기반으로 절감 시간을 자동 계산합니다. 환경별 저장: Claude Code는 ~/.claude/ai-sessions.json 파일에 append, Claude Desktop은 window.storage("ai_sessions")에 누적. ai-monthly-report 스킬이 동일 데이터 소스에서 리포트를 생성합니다.
---

# 29CM PM AI 활용 세션 기록기 (표준)

## 목적
29CM PM이 AI 도구로 수행한 작업을 표준 단가 기준에 따라 기록하고, 세션 간 데이터를 누적 저장한다.
가이드 기준: https://wiki.team.musinsa.com/wiki/spaces/~shin.han/pages/383353087

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

## 단가 기준표 (가이드 기준 2026-04-08 v2)

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

### Databricks SQL (cm29-data-query)
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
| 신규 PM 온보딩 자료 | 2h |

---

## 실행 절차

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
- 유형 + 스코프 티어 → 단가표에서 자동 매핑
- 범위 단가(예: 6~14h)인 경우: 복잡도 기반으로 중간값 또는 사용자 확인
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

### STEP 4: 누적 저장 (환경 분기)

**먼저 실행 환경을 확인한다**:
- Bash 도구 사용 가능 → **Claude Code 환경** (4-A 사용)
- 그렇지 않고 `window.storage` API 사용 가능 → **Claude Desktop 환경** (4-B 사용)
- 둘 다 안 되면 → 사용자에게 환경 알려주고 출력 텍스트 그대로 복사 안내

#### 4-A. Claude Code 환경: JSON 파일에 append

**표준 저장 경로**: `~/.claude/ai-sessions.json`

```bash
# 디렉토리 보장
mkdir -p ~/.claude

# 파일 없으면 빈 배열로 초기화
[ ! -f ~/.claude/ai-sessions.json ] && echo '[]' > ~/.claude/ai-sessions.json

# 새 레코드 append (jq 사용)
jq --argjson new '<NEW_RECORD_JSON>' '. + [$new]' ~/.claude/ai-sessions.json > /tmp/ai-sessions.tmp \
  && mv /tmp/ai-sessions.tmp ~/.claude/ai-sessions.json
```

`jq`가 없으면 Python fallback:
```bash
python3 -c "
import json, sys, os
path = os.path.expanduser('~/.claude/ai-sessions.json')
data = json.load(open(path)) if os.path.exists(path) else []
data.append(<NEW_RECORD_DICT>)
json.dump(data, open(path, 'w'), ensure_ascii=False, indent=2)
"
```

`<NEW_RECORD_JSON>` / `<NEW_RECORD_DICT>` 자리에는 STEP 3에서 생성한 레코드를 직렬화해서 넣는다.

#### 4-B. Claude Desktop 환경: window.storage 저장

```javascript
// 저장 키: "ai_sessions"
const existing = await window.storage.get("ai_sessions");
const sessions = existing ? JSON.parse(existing.value) : [];
sessions.push(newRecord);
await window.storage.set("ai_sessions", JSON.stringify(sessions));
```

#### 4-C. 환경 미지원: 사용자 안내

```
⚠️ 자동 저장 환경이 아닙니다. 아래 JSON을 별도 보관해주세요:
{...newRecord JSON...}
```

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

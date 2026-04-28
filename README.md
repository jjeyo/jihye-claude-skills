# jihye-claude-skills

29CM PM 워크플로우를 위한 [Claude Code](https://docs.claude.com/en/docs/claude-code) 스킬 모음입니다.

데이터 분석, PRD/2pager 작성, JIRA 연동, Figma 와이어프레임, AI 활용 리포트 등 PM 업무 자동화에 사용하는 스킬을 카테고리별로 정리했습니다.

---

## 📦 스킬 목록

### 📊 data — 데이터 분석/쿼리
- **[29cm-data-query](data/29cm-data-query/)** — 29CM Databricks SQL 쿼리 작성. GMV/DAU/리텐션/퍼널/코호트 분석 트리거.
- **[29cm-amplitude](data/29cm-amplitude/)** — Amplitude 분석. 이벤트·퍼널·리텐션·DAU 트리거.

### 📝 docs — PM 문서 작성
- **[prd-writer](docs/prd-writer/)** — 29CM 표준 PRD 작성. 개발 스코프·WBS 산정 가능한 상세 요구사항 포함.
- **[2pager-writer](docs/2pager-writer/)** — 2-pager 개요 작성 + Confluence 위키 생성.
- **[2pager-data-analysis](docs/2pager-data-analysis/)** — 2-pager 작성용 데이터·레퍼런스 수집(Wiki/Amplitude/Jira).

### 🎨 design — 디자인/와이어프레임
- **[figma-wireframe](design/figma-wireframe/)** — Ruler 디자인 시스템 기반 모바일 와이어프레임 3개 시안 자동 생성 → Figma 삽입.

### 🎫 jira — JIRA 연동
- **[jira-ticket-creator](jira/jira-ticket-creator/)** — 29CM 표준 형식(배경/문제정의/목표/요구사항/검토사항) Jira 티켓 자동 생성.

### ⚙️ ops — 운영/모니터링
- **[ce-okr-manager](ops/ce-okr-manager/)** — Customer Engagement 팀 OKR 백로그 관리.
- **[etr-monitor](ops/etr-monitor/)** — ETR 티켓 자동 모니터링·일일 변동사항 추적.
- **[schema-governance](ops/schema-governance/)** — 분석 MD 파일(스키마/쿼리 패턴/지표) Slack 기반 거버넌스.

### 📱 app-config — 앱 운영 JSON
- **[29play-logo](app-config/29play-logo/)** — 29CM 앱 좌측 상단 29플레이 로고 변경용 Amplitude JSON 생성.
- **[gift-theme-category](app-config/gift-theme-category/)** — 선물하기 추천탭 Promoted형 테마 카테고리 JSON 생성.

### 👥 hr
- **[interview-question-generator](hr/interview-question-generator/)** — 이력서/포트폴리오 PDF 기반 면접 질문 자동 생성(MUSINSA WAY/Job Competency 기반).

### 🤖 ai-tracking — AI 활용 리포트
- **[ai-activity-tracker](ai-tracking/ai-activity-tracker/)** — AI 작업 세션을 표준 단가표 기반으로 기록·누적 저장. **환경별 저장**: Claude Code는 `~/.claude/ai-sessions.json`, Desktop은 `window.storage("ai_sessions")`.
- **[ai-monthly-report](ai-tracking/ai-monthly-report/)** — 누적 세션 데이터로 월간 AI 기여 리포트 4탭 대시보드 자동 생성. **환경별 출력**: Claude Code는 자체완결형 HTML 파일 생성 + 브라우저 자동 오픈, Desktop은 React JSX Artifact 패널. 다크 테마, KPI 카드, 카테고리/도구별 분포, 주차별 타임라인, 절감 단가 근거 포함.

> 💡 **AI 활용 리포트 사용 흐름**:
> 1. `ai-activity-tracker`로 작업할 때마다 "세션 기록해줘" → 데이터 누적
> 2. 월말에 `ai-monthly-report` 트리거 ("AI 기여 리포트 만들어줘") → 시각화 대시보드 자동 생성
> 3. 두 스킬 모두 Claude Code / Desktop 양 환경 지원 (자동 감지·분기)

---

## 🚀 설치 방법

목적에 따라 선택하세요:

| 옵션 | 추천 대상 | 설치/업데이트 난이도 |
|---|---|---|
| 1. 단일 스킬 (giget) | 1~2개 스킬만 가볍게 쓰고 싶을 때 | ⭐ |
| 2. 전체 + 심볼릭 링크 | 본인이 직접 수정/기여할 때 | ⭐⭐ |
| 3. 카테고리 단위 (sparse checkout) | 특정 그룹만 받고 git으로 관리 | ⭐⭐ |
| 4. SKILL.md 단일 파일 (curl) | 개별 스킬을 가장 가볍게 시도 | ⭐ |

---

### 옵션 1: 단일 스킬 설치 (가장 권장) ⭐

[giget](https://github.com/unjs/giget)으로 폴더 단위 다운로드. references/, templates/ 모두 포함됨.

```bash
# 설치 (예: ai-monthly-report 스킬)
npx giget gh:jjeyo/jihye-claude-skills/ai-tracking/ai-monthly-report \
  ~/.claude/skills/ai-monthly-report --force

# 업데이트 (동일 명령 재실행)
npx giget gh:jjeyo/jihye-claude-skills/ai-tracking/ai-monthly-report \
  ~/.claude/skills/ai-monthly-report --force
```

다른 스킬 받을 때는 경로의 `<카테고리>/<스킬명>` 부분만 바꾸면 됩니다:

```bash
npx giget gh:jjeyo/jihye-claude-skills/docs/prd-writer ~/.claude/skills/prd-writer --force
npx giget gh:jjeyo/jihye-claude-skills/data/29cm-data-query ~/.claude/skills/29cm-data-query --force
npx giget gh:jjeyo/jihye-claude-skills/design/figma-wireframe ~/.claude/skills/figma-wireframe --force
```

---

### 옵션 2: 전체 설치 + 심볼릭 링크 (모든 스킬)

레포 한 번 클론 후 모든 스킬을 `~/.claude/skills/`에 심볼릭 링크. `git pull`만 하면 모든 스킬이 한꺼번에 갱신됩니다.

```bash
# 설치
git clone https://github.com/jjeyo/jihye-claude-skills.git ~/dev/jihye-claude-skills
mkdir -p ~/.claude/skills
for skill in ~/dev/jihye-claude-skills/*/*/SKILL.md; do
  name=$(basename $(dirname $skill))
  ln -s "$(dirname $skill)" ~/.claude/skills/$name
done

# 업데이트 (한 번에 전체 갱신)
cd ~/dev/jihye-claude-skills && git pull
```

이 방식은 본인이 스킬을 수정해서 PR로 기여할 때도 편리합니다.

---

### 옵션 3: 카테고리 단위 (sparse checkout)

특정 카테고리(예: docs, design)만 받고 git으로 관리:

```bash
# 설치
git clone --filter=blob:none --sparse https://github.com/jjeyo/jihye-claude-skills.git ~/skills-repo
cd ~/skills-repo
git sparse-checkout set docs design  # 원하는 카테고리만

# ~/.claude/skills/ 에 심볼릭 링크
for skill in ~/skills-repo/*/*/SKILL.md; do
  name=$(basename $(dirname $skill))
  ln -s "$(dirname $skill)" ~/.claude/skills/$name
done

# 업데이트
cd ~/skills-repo && git pull

# 나중에 카테고리 추가
cd ~/skills-repo && git sparse-checkout add jira ai-tracking
```

---

### 옵션 4: SKILL.md 한 파일만 (가장 간단)

references/ 없어도 SKILL.md 안의 fallback 인라인 명세로 동작합니다 (단, 정확도는 폴더 단위 설치 대비 약간 낮음).

```bash
# 설치 (예: ai-monthly-report)
mkdir -p ~/.claude/skills/ai-monthly-report
curl -sL https://raw.githubusercontent.com/jjeyo/jihye-claude-skills/main/ai-tracking/ai-monthly-report/SKILL.md \
  -o ~/.claude/skills/ai-monthly-report/SKILL.md

# 업데이트 (동일 명령 재실행)
curl -sL https://raw.githubusercontent.com/jjeyo/jihye-claude-skills/main/ai-tracking/ai-monthly-report/SKILL.md \
  -o ~/.claude/skills/ai-monthly-report/SKILL.md
```

또는 전체 ZIP: https://github.com/jjeyo/jihye-claude-skills/archive/refs/heads/main.zip

---

> 💡 **설치 후 Claude Code 재시작**을 권장합니다 — 신규/업데이트된 스킬 트리거가 즉시 인식됩니다.

---

## 🔧 스킬 작동 방식

각 스킬은 `SKILL.md`의 YAML frontmatter에 정의된 트리거 키워드로 자동 실행됩니다.

```yaml
---
name: prd-writer
description: PRD 작성 스킬. "PRD 작성해줘", "PRD 만들어줘" 등의 요청에 트리거됩니다.
---
```

Claude Code가 사용자 메시지의 키워드를 감지하면 해당 스킬을 자동 로드해 컨텍스트로 사용합니다.

---

## 📋 사전 요구사항

대부분의 스킬은 다음 환경을 가정합니다:

- **Claude Code** (CLI 또는 IDE 확장)
- **Atlassian MCP**: JIRA/Confluence 연동 스킬용 — [설정 가이드](https://mcp.atlassian.com/docs)
- **Databricks SQL 접근**: `29cm-data-query` 스킬용
- **29CM 무신사 사내 환경**: 다수 스킬이 사내 Wiki/Jira/Slack 의존

29CM 외부에서는 일부 스킬은 동작하지 않거나 수정이 필요할 수 있습니다.

---

## 🤝 기여

PR 환영합니다. 새 스킬을 추가할 때는:

1. 카테고리 폴더 선택 (없으면 새로 생성)
2. `<skill-name>/SKILL.md` 작성 — frontmatter에 `name`, `description`(트리거 키워드 포함) 필수
3. 필요시 `references/`, `templates/` 등 보조 파일 추가
4. README의 스킬 목록에 한 줄 추가

---

## 📜 라이선스

MIT (별도 명시 전)

---

작성: [jihye.kim1@musinsa.com](mailto:jihye.kim1@musinsa.com) · 29CM Customer Engagement Lead

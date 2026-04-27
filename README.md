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
- **[ai-activity-tracker](ai-tracking/ai-activity-tracker/)** — AI 작업 세션을 표준 단가표 기반으로 기록·누적 저장.
- **[ai-monthly-report](ai-tracking/ai-monthly-report/)** — 누적 세션 데이터로 월간 AI 기여 리포트를 4탭 React 대시보드 Artifact로 자동 생성. 다크 테마, KPI 카드, 카테고리/도구별 분포, 주차별 타임라인, 절감 단가 근거 포함.

---

## 🚀 설치 방법

### 옵션 1: 전체 설치 (모든 스킬)

```bash
# 1. 레포 클론
git clone https://github.com/jjeyo/jihye-claude-skills.git ~/dev/jihye-claude-skills

# 2. ~/.claude/skills/ 에 심볼릭 링크 생성
mkdir -p ~/.claude/skills
for skill in ~/dev/jihye-claude-skills/*/*/SKILL.md; do
  name=$(basename $(dirname $skill))
  ln -s "$(dirname $skill)" ~/.claude/skills/$name
done

# 3. Claude Code 재시작
```

### 옵션 2: 개별 스킬 설치

원하는 스킬만 골라서 복사:

```bash
# 예: PRD 작성 스킬만 설치
git clone https://github.com/jjeyo/jihye-claude-skills.git /tmp/skills
cp -r /tmp/skills/docs/prd-writer ~/.claude/skills/
```

또는 ZIP 다운로드:
```
https://github.com/jjeyo/jihye-claude-skills/archive/refs/heads/main.zip
```

### 옵션 3: 선택 동기화 (sparse checkout)

특정 카테고리만 받기:
```bash
git clone --filter=blob:none --sparse https://github.com/jjeyo/jihye-claude-skills.git
cd jihye-claude-skills
git sparse-checkout set docs design  # 원하는 카테고리만
```

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

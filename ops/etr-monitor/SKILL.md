# ETR Ticket Monitor - Customer Engagement Team

Customer Engagement 팀으로 배정된 ETR 티켓들을 자동 모니터링하고 매일 변동사항을 추적합니다.

## 🔌 API Mode

- Direct API (curl) with [ATLASSIAN_API_CONFIG] 우선
- MCP fallback

## 📋 Commands

### /etr-monitor
Customer Engagement 팀 ETR 티켓 현황 조회 및 리포트 생성

**Usage**:
```
/etr-monitor
/etr-monitor --status "Tech 검토 대기 중,Tech 검토 중"
/etr-monitor --slack
/etr-monitor --confluence
```

## 🎯 Parameters

- `--status <statuses>` (optional): 특정 상태만 필터링 (쉼표 구분)
- `--slack` (optional): Slack으로 리포트 전송
- `--confluence` (optional): Confluence 페이지 업데이트
- `--days <N>` (optional): 최근 N일 이내 업데이트된 티켓만 (기본: 30일)

## 🔴 필수 규칙: 티켓 표시 형식 (CRITICAL)

**모든 티켓은 반드시 `{key} {summary}` 형식으로 표시해야 합니다.**

- ✅ `ETR-3268 검색홈 로직 개선` (티켓 번호 + 타이틀)
- ❌ `ETR-3268` (티켓 번호만 — 금지)
- ❌ `ETR-3268 - 김태호` (타이틀 없이 담당자만 — 금지)

**적용 범위**: 콘솔 리포트, Slack 메시지, Confluence 페이지 등 모든 출력물

**summary가 없는 경우**:
1. JIRA API에서 반드시 `summary` 필드를 조회
2. 조회한 `summary`를 상태 파일에 저장
3. API 실패 시 캐시된 상태 파일의 `summary` 사용
4. 캐시에도 없으면 `(제목 미확인)` 표시 — 절대 생략하지 않음

## 🔧 Workflow

### Step 1: CE 팀 티켓 조회

Customer Engagement 팀으로 배정된 ETR 티켓 기준:
- **담당자**: jihye.kim1@musinsa.com 또는 CE 팀원
- **상태**: Tech 검토 대기 중, Tech 검토 중, 검토완료-우선착수, 검토완료-백로그
- **제외**: Done, 반려

```typescript
const CE_TEAM_MEMBERS = [
  'jihye.kim1@musinsa.com',
  'hyunwook.lee@29cm.co.kr',
  // CE 팀원 추가 시 여기에 이메일 추가
];

// JQL 쿼리 — summary 필드 반드시 포함
const jql = `
  project = ETR AND
  assignee in (${CE_TEAM_MEMBERS.map(e => `"${e}"`).join(',')}) AND
  status in ("Tech 검토 대기 중", "Tech 검토 중", "검토완료-우선착수", "검토완료-백로그") AND
  status not in (Done, 반려) AND
  updated >= -30d
  ORDER BY updated DESC
`;

// JIRA 조회 시 fields에 summary 반드시 포함
const fields = "summary,status,assignee,priority,created,updated,labels";
```

### Step 2: 티켓 분류

```typescript
interface ETRTicket {
  key: string;
  summary: string;
  status: string;
  assignee: string;
  priority: string;
  created: string;
  updated: string;
  labels: string[];
  daysInStatus: number;  // 현재 상태에 머문 일수
  totalDays: number;     // 발의 이후 총 경과일
}

const categories = {
  techReviewWaiting: [],   // Tech 검토 대기 중
  techReviewing: [],       // Tech 검토 중
  priorityWork: [],        // 검토완료-우선착수
  backlog: [],             // 검토완료-백로그
};

// 상태별 분류
for (const ticket of tickets) {
  const category = getCategoryByStatus(ticket.status);
  categories[category].push(ticket);
}
```

### Step 3: 변동사항 감지

```typescript
// 이전 실행 결과 로드
const previousState = loadPreviousState(); // from .etr-monitor-state.json

// 변동사항 감지
const changes = {
  newTickets: [],        // 새로 인입된 티켓
  statusChanged: [],     // 상태 변경된 티켓
  staleTickets: [],      // 7일 이상 상태 변화 없는 티켓
  urgent: [],            // 우선 대응 필요 (P0, Emergency)
};

for (const ticket of tickets) {
  const prev = previousState[ticket.key];

  if (!prev) {
    changes.newTickets.push(ticket);
  } else if (prev.status !== ticket.status) {
    changes.statusChanged.push({
      ticket,
      from: prev.status,
      to: ticket.status,
      changedAt: ticket.updated
    });
  }

  // 7일 이상 상태 변화 없음
  if (ticket.daysInStatus >= 7) {
    changes.staleTickets.push(ticket);
  }

  // 긴급 우선순위
  if (ticket.priority === 'P0' || ticket.priority === 'Emergency') {
    changes.urgent.push(ticket);
  }
}

// 현재 상태 저장 — summary 필드 반드시 포함 (CRITICAL)
const stateToSave = {};
for (const ticket of tickets) {
  stateToSave[ticket.key] = {
    summary: ticket.summary,  // 필수! 절대 생략 금지
    status: ticket.status,
    assignee: ticket.assignee,
    lastUpdated: ticket.updated,
    firstSeen: previousState[ticket.key]?.firstSeen || ticket.created
  };
}
savePreviousState(stateToSave); // to .etr-monitor-state.json
```

### Step 4: 리포트 생성

```
╔══════════════════════════════════════════════════════════════╗
║      ETR 티켓 모니터링 - Customer Engagement 팀              ║
║                  2026-03-21 (금)                             ║
╚══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 긴급 대응 필요 (P0/Emergency)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1] ETR-3268 검색홈 로직 개선
    담당자: 이광수 | 상태: Tech 검토 대기 중 | 우선순위: P0
    발의: 2026-03-19 (2일 경과)
    → 검토 대기 2일째

[2] ETR-3196 마이페이지 내 크로스플랫폼 고객 혜택 노출
    담당자: 한신혜 | 상태: Tech 검토 대기 중 | 우선순위: P0
    발의: 2026-03-16 (5일 경과)
    라벨: 26'2Q
    → 검토 대기 5일째

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆕 신규 인입 티켓 (오늘)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(없음)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 상태별 현황
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Tech 검토 대기 중 (5개)
   - ETR-2475 글로벌원앱 론칭 전 HO 상품관리 내 판매가... (78일 경과) ⚠️
   - ETR-3268 검색홈 로직 개선 (2일 경과) 🔴 P0
   - ETR-3196 마이페이지 내 크로스플랫폼 고객 혜택 노출 (5일 경과) 🔴 P0
   - ETR-3164 [세일판] 모듈 추가 검토 요청 (7일 경과)
   - ETR-3010 [무신사컨택센터] "예약배송" 설정 시... (15일 경과)

🔍 Tech 검토 중 (1개)
   - ETR-3057 조조타운 빠른 반품 기능 도입 (14일 경과)

✅ 검토완료-우선착수 (7개)
   - ETR-3063 콘텐츠 CMS KV 모듈 - 플렉서블 활용 개발
   - ETR-2658 CMS 모듈 기능 개선 - 리스트 썸네일, KV 모듈
   - ...

📋 검토완료-백로그 (3개)
   - ETR-2943 [OCMP] 무신사 검색 완료 인앱 지면 상시 운영
   - ETR-2753 무신사 운영형 페널티 전환
   - ETR-2867 상품 검수 페이지 내 고위험 소재/필파워...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ 장기 대기 티켓 (7일 이상)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[!] ETR-2475 글로벌원앱 론칭 전 HO 상품관리 내 판매가 수정 기능 차단
    상태: Tech 검토 대기 중 (78일째) ⚠️⚠️⚠️
    발의: 2026-01-05
    라벨: KTLO
    → 즉시 검토 필요

[!] ETR-3010 [무신사컨택센터] "예약배송" 설정 시 로컬 캐시...
    상태: Tech 검토 대기 중 (15일째)
    발의: 2026-03-05

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 변동사항 (지난 24시간)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

상태 변경 (0건)
신규 인입 (0건)
업데이트 (3건)
   - ETR-2475 업데이트됨 (2026-03-21 15:02)
   - ETR-3268 업데이트됨 (2026-03-20 21:08)
   - ETR-3057 업데이트됨 (2026-03-20 17:33)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 16개 티켓
- Tech 검토 대기 중: 5개 (긴급 2개 포함)
- Tech 검토 중: 1개
- 검토완료-우선착수: 7개
- 검토완료-백로그: 3개

⚠️ 조치 필요:
   - 7일 이상 대기 티켓: 2개 (즉시 검토 필요)
   - P0 긴급 티켓: 2개

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Step 5: Slack 전송 (Optional)

#### Slack 메시지 포맷 규칙 (CRITICAL)

**가독성을 위해 반드시 다음 구조를 따를 것:**

1. **헤더**: 제목 + 날짜를 한 줄로
2. **섹션 구분**: 각 섹션 사이에 빈 줄 + 구분선(`———`) + 빈 줄
3. **담당자별 그룹핑**: Tech 검토 중은 담당자별로 묶어서 표시
4. **티켓 표시**: 코드블록(```)으로 정렬된 테이블 형태
5. **요약은 상단에**: 핵심 수치 요약을 맨 위에 배치
6. **변동사항 강조**: 상태 변경은 별도 섹션으로 눈에 띄게

**Slack 메시지 템플릿:**

```
:bar_chart: *ETR 모니터링 | CE팀 | {날짜}*

*{총 N개}* 검토중 {n} · 대기 {n} · 우선착수 {n} · 백로그 {n}

———

:rotating_light: *변동사항*
> {상태변경 요약 한 줄}
> - ETR-XXXX 티켓제목 (담당자)
> - ETR-XXXX 티켓제목 (담당자)

———

:mag: *Tech 검토 중 ({n}개)*

*김태호* ({n}개)
```
ETR-3292  이구위크_타임세일 배너 알림신청 고도화          P0
ETR-3291  이구위크_세일즈캠페인 고도화 - 룩북 모듈       P0
ETR-3290  이구위크_세일즈캠페인 고도화 - Launching card  P0
```

*심지현* ({n}개)
```
ETR-3347  4월 월간이구홈 알림키 생성 요청               P0
ETR-3239  마이페이지 띠배너 3월 풋웨어클럽              P0
```

———

:pushpin: *Tech 검토 대기 중 ({n}개)*
```
ETR-3232  MATCH 데이터 파이프라인 구축                  김지혜  P0
```

———

:white_check_mark: *검토완료-우선착수 ({n}개)*
```
ETR-3257  Brand Lookbook 동기화 시트 생성              김태호
ETR-2878  패션위크 LookBook 동기화 시트                김태호
```

———

:file_folder: *검토완료-백로그 ({n}개)*
```
ETR-2737  CMS 에피소드 검색 기능 추가                  김태호
ETR-2508  29CM 스페셜 메뉴트리 반영                    심지현
```

———

:warning: *주의*
- ETR-2040 프리퀀시 프로그램 125일째 검토 중 (장기 체류)
- 신규: ETR-3383 이미지 대량 다운로드 (PMO 검토 중)
```

**핵심 원칙:**
- 코드블록(```)을 사용해 티켓 목록을 정렬된 테이블처럼 표시
- 각 섹션은 `———` 구분선으로 명확히 분리
- 담당자별 그룹핑으로 "누가 얼마나" 한눈에 파악
- 요약 수치는 최상단에 한 줄로 압축
- 우선착수/백로그는 간결하게 (상세 정보 필요시 JIRA 링크)

```typescript
if (params.slack) {
  const slackChannel = config.SLACK_CHANNEL || '#ce-team-alerts';

  await slackPostMessage({
    channel: slackChannel,
    text: generateSlackMessage(report) // 위 템플릿 형식 준수
  });
}
```

### Step 6: Confluence 업데이트 (Optional)

```typescript
if (params.confluence) {
  // Confluence page 설정 (config에서 읽기)
  const confluencePageId = config.CONFLUENCE_PAGE_ID;

  await updateConfluencePage({
    pageId: confluencePageId,
    title: `[ETR 모니터링] ${todayStr}`,
    content: convertToConfluenceFormat(report)
  });
}
```

## 📁 State Management

### State File Location
```
~/.claude/skills/etr-monitor/.etr-monitor-state.json
```

### State Structure

**`summary` 필드는 필수입니다. 절대 생략하지 마세요.**

```json
{
  "lastRun": "2026-03-21T09:00:00+09:00",
  "tickets": {
    "ETR-3268": {
      "summary": "검색홈 로직 개선",
      "status": "Tech 검토 대기 중",
      "assignee": "kwansu.lee@musinsa.com",
      "lastUpdated": "2026-03-20T21:08:34+09:00",
      "firstSeen": "2026-03-19T15:05:03+09:00"
    }
  }
}
```

**상태 파일에 `summary`가 없는 기존 티켓**: JIRA API 조회 시 `summary`를 가져와서 상태 파일을 업데이트합니다.

## ⚙️ Configuration

### Config File: `~/.claude/config/etr-monitor.json`

```json
{
  "ceTeamMembers": [
    "jihye.kim1@musinsa.com",
    "hyunwook.lee@29cm.co.kr"
  ],
  "monitorStatuses": [
    "Tech 검토 대기 중",
    "Tech 검토 중",
    "검토완료-우선착수",
    "검토완료-백로그"
  ],
  "staleThresholdDays": 7,
  "lookbackDays": 30,
  "slack": {
    "enabled": false,
    "channel": "#ce-team-alerts"
  },
  "confluence": {
    "enabled": false,
    "pageId": "123456789"
  }
}
```

## 🔄 Schedule Setup

매일 아침 자동 실행 (macOS launchd):

```
Name:     com.user.etr-morning-briefing
Schedule: 10:00 AM, Mon-Fri (평일)
Script:   ~/.claude/scripts/send-etr-briefing.sh
Method:   claude -p "/etr-monitor --slack" --model haiku
Plist:    ~/Library/LaunchAgents/com.user.etr-morning-briefing.plist
Channel:  #morning-briefing (C0AND6NNT4Z)
```

관리 명령어:
```bash
# 상태 확인
launchctl list | grep etr

# 재로드
launchctl unload ~/Library/LaunchAgents/com.user.etr-morning-briefing.plist
launchctl load ~/Library/LaunchAgents/com.user.etr-morning-briefing.plist

# 즉시 실행 (테스트)
bash ~/.claude/scripts/send-etr-briefing.sh
```

## 🚨 Alert Rules

### 긴급 알림 조건
- ✅ P0 또는 Emergency 우선순위 티켓
- ✅ 7일 이상 상태 변화 없음
- ✅ 새로 인입된 티켓 (당일)

### 주의 알림 조건
- ⚠️ 3일 이상 Tech 검토 대기 중
- ⚠️ 14일 이상 Tech 검토 중

## 📊 Helper Functions

```typescript
function getDaysInStatus(ticket, statusHistory) {
  const currentStatus = ticket.status;
  const lastStatusChange = statusHistory
    .filter(h => h.field === 'status')
    .sort((a, b) => b.created - a.created)[0];

  if (!lastStatusChange) {
    return Math.floor((Date.now() - new Date(ticket.created)) / (1000 * 60 * 60 * 24));
  }

  return Math.floor((Date.now() - new Date(lastStatusChange.created)) / (1000 * 60 * 60 * 24));
}

function getTotalDays(ticket) {
  return Math.floor((Date.now() - new Date(ticket.created)) / (1000 * 60 * 60 * 24));
}

function categorizeByStatus(status) {
  const statusMap = {
    'Tech 검토 대기 중': 'techReviewWaiting',
    'Tech 검토 중': 'techReviewing',
    '검토완료-우선착수': 'priorityWork',
    '검토완료-백로그': 'backlog'
  };

  return statusMap[status] || 'other';
}
```

## ⚠️ Error Handling

### JIRA API Failure
```
⚠️ JIRA API 연결 실패 — 이전 캐시 데이터 사용
   마지막 업데이트: 2026-03-20 09:00
```

### Empty Result
```
✅ Customer Engagement 팀에 배정된 ETR 티켓이 없습니다.
   모든 티켓이 완료되었거나 다른 팀으로 재배정되었습니다.
```

## 📚 Related

- `/morning-briefing` — 전체 아침 브리핑 (ETR 포함)
- `/etr-weekly-report` — 주간 ETR 리포트

---

<!-- muno-workerbee -->

---
name: figma-wireframe
description: "29CM PM을 위한 Figma 와이어프레임 생성 스킬. PRD/2Pager URL, 기존 Figma 화면 URL, 또는 자유 텍스트 요구사항으로부터 Ruler 디자인 시스템 기반 모바일 와이어프레임 3개 시안을 생성하고 Figma에 삽입합니다. '와이어프레임 만들어줘', '화면 설계해줘', 'wireframe', 'Figma에 그려줘', '시안 만들어줘', '화면 프로토타입' 등의 요청에 사용하세요."
---

# Figma 와이어프레임 생성

PM이 요구사항을 정리하면, **Ruler 디자인 시스템** 기반의 모바일 와이어프레임 3개 시안을 생성하여 Figma에 직접 삽입합니다.

<!-- muno-workerbee -->

## 언제 사용하나요?

- PM이 2Pager/PRD를 기반으로 화면을 설계하고 싶을 때
- 기존 화면을 개선하는 TO-BE 시안이 필요할 때
- 디자이너에게 전달할 초안 와이어프레임이 필요할 때
- 전략 방향성 검증을 위해 빠르게 시안을 만들어보고 싶을 때

---

## Step 0: 사전 점검 및 환경 설정 (자동)

> **이 단계는 Claude가 사용자의 환경을 자동 진단하고, 필요한 설치/설정을 단계별로 수행합니다.**
> setup.sh 같은 고정 스크립트를 사용하지 않습니다. 환경마다 다르기 때문에 Claude가 직접 판단합니다.

### 0-1. figma-use CLI 설치 확인

```bash
# 1단계: figma-use 설치 여부 확인
which figma-use || echo "NOT_INSTALLED"
```

**설치되어 있으면**: 버전 확인 후 0-2로 진행
```bash
figma-use --version
```

**설치되어 있지 않으면**: Node.js 환경을 진단한 후 설치

```bash
# Node.js 확인
node --version 2>/dev/null || echo "NO_NODE"

# npm 확인
npm --version 2>/dev/null || echo "NO_NPM"
```

**Node.js가 없는 경우** — 사용자에게 안내:
```
Node.js가 설치되어 있지 않습니다. 아래 방법 중 하나로 설치해주세요:

macOS:
  brew install node

Windows:
  https://nodejs.org 에서 LTS 버전 다운로드

설치 후 다시 /figma-wireframe 을 실행해주세요.
```

**Node.js가 있고 figma-use가 없는 경우** — npm global 설치:
```bash
# npm global 설치 (권한 문제 시 자동 대응)
npm install -g figma-use 2>&1
```

**npm global 권한 오류 발생 시** (EACCES):
```bash
# 방법 1: npx로 대체 실행 (설치 없이 사용)
npx figma-use status

# 방법 2: npm prefix 변경 (권한 문제 근본 해결)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc  # 또는 ~/.bashrc
source ~/.zshrc
npm install -g figma-use
```

> Claude는 오류 메시지를 읽고 적절한 방법을 자동 선택합니다.

### 0-2. Figma 데스크톱 앱 확인

```bash
# macOS
ls /Applications/Figma.app 2>/dev/null && echo "FIGMA_INSTALLED" || echo "NO_FIGMA"

# Linux
which figma 2>/dev/null || echo "NO_FIGMA"

# Windows (Git Bash / WSL)
ls "$LOCALAPPDATA/Figma/Figma.exe" 2>/dev/null && echo "FIGMA_INSTALLED" || echo "NO_FIGMA"
```

**Figma가 없으면** — 사용자에게 안내:
```
Figma 데스크톱 앱이 필요합니다.
다운로드: https://www.figma.com/downloads/

설치 후 다시 실행해주세요.
```

### 0-3. Figma 연결 (remote debugging)

```bash
# 현재 Figma 연결 상태 확인
figma-use status 2>&1
```

**연결 성공 시**: Step 1로 진행

**연결 실패 시** — OS를 감지하여 적절한 방법으로 Figma 재시작:

```bash
# OS 감지
uname -s  # Darwin(macOS), Linux, MINGW/MSYS(Windows)
```

**macOS**:
```bash
# Figma 종료
pkill -x Figma 2>/dev/null || true
sleep 2

# remote debugging 모드로 시작
open -a Figma --args --remote-debugging-port=9222
sleep 10

# 연결 재확인
figma-use status
```

**Linux**:
```bash
pkill -x figma 2>/dev/null || true
sleep 2
figma --remote-debugging-port=9222 &
sleep 10
figma-use status
```

**Windows (Git Bash)**:
```bash
taskkill /IM Figma.exe /F 2>/dev/null || true
sleep 2
"$LOCALAPPDATA/Figma/Figma.exe" --remote-debugging-port=9222 &
sleep 10
figma-use status
```

### 0-4. Figma 패치 (126+ 버전 대응)

연결이 안 되면 Figma 126+ 버전에서 remote debugging이 차단된 것일 수 있습니다.

```bash
# 패치 시도
figma-use patch 2>&1
```

**권한 오류 시**:
```bash
# macOS/Linux: sudo 사용
sudo figma-use patch

# 또는: daemon 모드 사용 (패치 없이 동작)
figma-use daemon start --pipe
```

**패치 후 Figma 재시작** → 0-3 반복

> `figma-use daemon start --pipe`는 패치 없이도 동작하는 대안입니다.
> 패치가 반복 실패하면 이 방법을 자동 시도합니다.

### 0-5. figma-use SKILL.md 복사

```bash
# npm global 경로에서 SKILL.md 찾기
SKILL_SRC="$(npm root -g 2>/dev/null)/figma-use/SKILL.md"
SKILL_DST="$HOME/.claude/figma-use-skill.md"

if [ -f "$SKILL_SRC" ]; then
  cp "$SKILL_SRC" "$SKILL_DST"
elif [ ! -f "$SKILL_DST" ]; then
  echo "SKILL.md를 찾을 수 없음 — figma-use가 정상 설치되었는지 확인"
fi
```

### 0-6. 연결 최종 확인

```bash
figma-use status
```

**성공 시**: "Figma 연결 완료! 와이어프레임 생성을 시작합니다." → Step 1로 진행

**최종 실패 시** — 사용자에게 수동 조치 안내:
```
Figma 연결에 실패했습니다. 아래를 확인해주세요:

1. Figma 데스크톱 앱이 실행 중인지 확인
2. Figma에서 디자인 파일을 하나 열어주세요
3. 터미널에서 수동 실행:
   - macOS: open -a Figma --args --remote-debugging-port=9222
   - Linux: figma --remote-debugging-port=9222
   - Windows: "%LOCALAPPDATA%\Figma\Figma.exe" --remote-debugging-port=9222
4. 다시 /figma-wireframe 을 실행해주세요
```

### 전체 진단 플로우 요약

```
figma-use 있음? ──YES──→ Figma 연결됨? ──YES──→ Step 1 진행
       │                        │
       NO                       NO
       │                        │
       ▼                        ▼
  Node.js 있음?           OS 감지 → Figma 재시작
       │                  (remote debugging 모드)
    YES / NO                    │
       │                   연결 성공?
       ▼                   YES / NO
  npm install -g                │
  figma-use                     ▼
       │                  패치 시도 or daemon --pipe
       ▼                        │
  0-2로 진행              Figma 재시작 → 재확인
```

---

## Step 1: 요구사항 취합

### 입력 모드 자동 감지

사용자 입력을 분석하여 3가지 모드 중 하나로 자동 진행합니다.

| 입력 유형 | 감지 조건 | 처리 방법 |
|----------|----------|----------|
| **Confluence URL** | URL에 `wiki.team.musinsa.com` 또는 `atlassian.net` 포함 | Atlassian MCP로 페이지 읽기 → 요구사항 추출 |
| **Figma URL** | URL에 `figma.com/design/` 포함 | figma-use로 AS-IS 화면 직접 분석 |
| **자유 텍스트** | URL 패턴 없음 | 사용자 입력을 직접 요구사항으로 처리 |

### Confluence URL 입력 시

```typescript
// 1. 페이지 읽기
const page = await mcp__claude_ai_Atlassian__getConfluencePage({ pageId: extractedId });

// 2. 추출 항목
// - 프로젝트 목적 / 배경
// - 기능 요구사항 (화면별)
// - 사용자 시나리오
// - 핵심 KPI
// - 디자인 제약사항 (있으면)
```

### Figma URL 입력 시 (AS-IS 분석)

Figma URL이 제공되면 **figma-use CLI로 직접 Figma 파일을 분석**합니다. WebFetch로 웹사이트를 참조하지 않습니다.

```bash
# 1. Figma 파일 열기 및 해당 노드로 이동
figma-use viewport zoom-to-fit <node-id>

# 2. 해당 화면의 JSX 구조 추출
figma-use export jsx <node-id> --pretty

# 3. 스크린샷으로 시각적 확인
figma-use export node <node-id> --output /tmp/as-is-screen.png

# 4. 레이아웃 분석
figma-use analyze snapshot <node-id>
```

분석 항목:
- 현재 레이아웃 구조 (JSX export에서 확인)
- 사용 중인 컴포넌트 (Instance 노드 확인)
- 정보 계층 구조
- 개선 가능 포인트

### 보완 질문 (부족한 정보만)

이미 알고 있는 정보는 제시하고, **부족한 정보만** 대화형으로 질문합니다. 한 번에 모든 질문을 하지 않습니다.

> **필수 확인 사항** (이 중 누락된 것만 질문):
> 1. 어떤 화면을 설계하나요? (예: 선물하기 홈, 발견탭, 검색 결과)
> 2. 이 화면의 주요 목적은? (예: 상품 탐색 강화, 전환율 개선)
> 3. 핵심 기능 우선순위는? (예: 카테고리 탐색 > 브랜드 탐색 > 추천)
> 4. 참고할 기존 29CM 화면이 있나요? (Figma URL 또는 화면명)

---

## Step 1.5: Ruler DS & 29CM 기존 화면 분석 (자동)

> **🔴 핵심 규칙**: 웹사이트(29cm.co.kr 등)를 참조하지 않습니다. 반드시 **Figma 파일 내의 화면과 Ruler DS 컴포넌트**를 참조합니다.

시안 생성 전에 반드시 아래 2가지를 Figma에서 직접 분석합니다.

### 1) Ruler DS 컴포넌트 분석

현재 Figma 파일에 연결된 Ruler DS 라이브러리 컴포넌트를 분석합니다.

```bash
# 현재 파일에서 사용 가능한 컴포넌트 검색
figma-use query "//COMPONENT[contains(@name, 'ProductCard')]"
figma-use query "//COMPONENT[contains(@name, 'Navigation')]"
figma-use query "//COMPONENT[contains(@name, 'Tab')]"
figma-use query "//COMPONENT[contains(@name, 'Button')]"
figma-use query "//COMPONENT[contains(@name, 'Chip')]"
figma-use query "//COMPONENT[contains(@name, 'Banner')]"
figma-use query "//COMPONENT[contains(@name, 'Card')]"

# 컴포넌트 구조 분석
figma-use export jsx <component-id> --pretty

# 디자인 시스템 패턴 분석
figma-use analyze colors          # 색상 팔레트
figma-use analyze typography      # 타이포그래피 스케일
figma-use analyze spacing --grid 8  # 간격 체계
```

**발견된 Ruler DS 컴포넌트가 있으면**: `<Instance component="<id>" />`로 실제 컴포넌트 인스턴스를 사용합니다.

```tsx
// ✅ 올바른 방법: Figma 컴포넌트 인스턴스 사용
<Instance component="59763:10626" />

// ❌ 잘못된 방법: 하드코딩된 JSX 근사치만 사용
<Frame w={165} h={165} ... />
```

### 2) 29CM 기존 화면 참조

설계하려는 화면과 유사한 **기존 29CM 화면을 Figma 파일 내에서** 찾아 분석합니다.

```bash
# 관련 화면 검색 (화면명으로)
figma-use query "//FRAME[contains(@name, '홈')]"
figma-use query "//FRAME[contains(@name, '선물')]"
figma-use query "//FRAME[contains(@name, '발견')]"
figma-use query "//FRAME[contains(@name, '검색')]"

# 페이지 목록에서 관련 페이지 탐색
figma-use page list

# 찾은 화면의 구조 분석
figma-use export jsx <found-frame-id> --pretty
figma-use export node <found-frame-id> --output /tmp/reference-screen.png

# 사용 중인 컴포넌트 패턴 확인
figma-use analyze clusters  # 반복 패턴 분석
```

**분석 결과를 시안 설계에 반영**:
- 29CM에서 실제 사용 중인 레이아웃 패턴 (간격, 정렬, 섹션 구성)
- 기존 화면의 정보 계층 구조
- Ruler DS 컴포넌트의 실제 사용 방식 (사이즈, 변형)
- 29CM 특유의 여백 체계와 타이포그래피

> **참고할 Figma 파일이 없는 경우**: 사용자에게 29CM 디자인 파일의 Figma URL을 요청하거나, 현재 열린 파일 내에서 기존 화면을 탐색합니다. 절대 웹사이트 크롤링으로 대체하지 않습니다.

---

## Step 2: 반영 페이지 확인

와이어프레임을 삽입할 Figma 파일/페이지를 확인합니다.

```
현재 열린 Figma 파일에 와이어프레임을 생성합니다.

어떤 페이지에 넣을까요?
1. 현재 페이지에 추가
2. 새 페이지 생성 (페이지 이름을 알려주세요)
```

```bash
# 페이지 목록 확인
figma-use page list

# 새 페이지 생성 시
figma-use create page "와이어프레임 - [화면명]"
```

---

## Step 3: 전략 방향 체크

수집한 요구사항을 정리하여 사용자에게 확인합니다.

```markdown
## 📋 전략 방향 확인

**화면**: [화면명]
**목적**: [해결하려는 문제 / 달성 목표]

**핵심 기능** (우선순위순):
1. [기능 1] — [간략 설명]
2. [기능 2] — [간략 설명]
3. [기능 3] — [간략 설명]

**사용 예정 Ruler DS 컴포넌트**:
- TopNavigation, ProductCard, Tabs, FilterTag, ...

**레이아웃 기본 방향**:
- 모바일 퍼스트 (375 x 812px)
- [추가 레이아웃 설명]

**참고 화면**: [있으면 기재]

---
이 방향으로 진행해도 될까요?
- ✅ 네, 진행해주세요
- ✏️ 수정이 필요해요 → 어떤 부분을 변경할지 알려주세요
```

**반복 규칙**: 최대 **3회** 수정 반복 가능. 3회 후에도 합의되지 않으면:
> "현재 방향으로 먼저 시안을 만들어볼까요? 시안을 보면서 조정하는 것이 더 효율적일 수 있습니다."

---

## Step 4: 3개 디자인 시안 생성

### 시안 구성 원칙

각 시안은 **의미 있게 다른 접근**을 제안합니다:

| 시안 | 방향 | 설명 |
|------|------|------|
| **시안 A (표준형)** | 29CM 현재 패턴 기반 | 검증된 패턴으로 안정적인 레이아웃 |
| **시안 B (탐색 강화형)** | 정보 계층 재구성 | 탐색/브라우징을 강화한 다른 구조 |
| **시안 C (실험형)** | 대담한 변형 | 새로운 레이아웃 시도 |

### 와이어프레임 스타일 (그레이스케일)

레이아웃과 정보 구조에 집중하기 위해 **그레이스케일 팔레트**를 사용합니다.

| 용도 | 색상 |
|------|------|
| 배경 | `#FFFFFF` |
| 카드/서피스 | `#F5F5F5` |
| 이미지 플레이스홀더 | `#E0E0E0` |
| 텍스트 (Primary) | `#1A1A1A` |
| 텍스트 (Secondary) | `#888888` |
| 구분선 | `#EEEEEE` |
| 액센트 (CTA 등) | `#333333` |

### 각 시안별 제공 내용

1. **시안명 + 설계 근거** — 왜 이런 구성인지 한 줄 설명
2. **레이아웃 구조** — 섹션별 구성 (ATF / Mid / BTF)
3. **사용 Ruler DS 컴포넌트** — 어떤 컴포넌트를 어디에 사용했는지
4. **Figma 렌더링** — figma-use JSX로 실제 Figma에 삽입

### 렌더링 배치

3개 시안을 **나란히** 배치합니다:
- 시안 A: x=0, y=0
- 시안 B: x=415, y=0 (375 + 40 간격)
- 시안 C: x=830, y=0

각 시안 위에 **레이블 프레임**을 추가합니다:

```bash
# 레이블 예시
echo '<Frame w={375} h={40} bg="#333333" items="center" justify="center">
  <Text size={14} weight="bold" color="#FFFFFF">시안 A: 표준형</Text>
</Frame>' | figma-use render --stdin --x 0 --y -50
```

### JSX 렌더링 실행

```bash
# 시안 A 렌더링
echo '<Frame w={375} h={812} bg="#FFFFFF" flex="col">
  <!-- TopNavigation -->
  <Frame w={375} h={56} flex="row" items="center" px={16}>
    <Icon name="lucide:arrow-left" size={24} color="#1A1A1A" />
    <Text size={18} weight="bold" color="#1A1A1A" ml={12}>[화면명]</Text>
    <Frame flex={1} />
    <Icon name="lucide:search" size={24} color="#1A1A1A" />
  </Frame>

  <!-- 컨텐츠 영역 -->
  ...
</Frame>' | figma-use render --stdin --x 0 --y 0

# 시안 B, C도 동일하게 x 좌표만 변경하여 렌더링
```

### 렌더링 후 스크린샷 캡처

```bash
# 각 시안 스크린샷 내보내기
figma-use export png <node-id-A> --out /tmp/wireframe-a.png
figma-use export png <node-id-B> --out /tmp/wireframe-b.png
figma-use export png <node-id-C> --out /tmp/wireframe-c.png
```

스크린샷을 사용자에게 보여주며 각 시안의 특징을 설명합니다.

---

## Step 5: 컨펌 / 재시작 분기

3개 시안을 제시한 후 사용자에게 선택을 요청합니다.

```markdown
어떤 시안을 선택하시겠어요?

- **A 선택**: [시안 A 이름] — 이 시안을 확정합니다
- **B 선택**: [시안 B 이름] — 이 시안을 확정합니다
- **C 선택**: [시안 C 이름] — 이 시안을 확정합니다
- **수정**: 특정 시안을 기반으로 부분 수정합니다
- **재시작**: 특정 단계부터 다시 진행합니다
```

### 선택 시

| 응답 | 처리 |
|------|------|
| **A/B/C 선택** | 선택한 시안을 확정. "나머지 2개를 캔버스에서 삭제할까요?" 확인 |
| **수정 요청** | "어떤 시안을 기반으로, 어떤 부분을 수정할까요?" → 해당 시안만 재렌더링. **최대 3회** 수정 가능 |
| **재시작** | "어느 단계부터 다시 할까요?" 선택지 제시 |

### 재시작 옵션

```
어느 단계부터 다시 시작할까요?

1️⃣ 요구사항 취합 (Step 1) — 요구사항을 다시 정리
2️⃣ 반영 페이지 확인 (Step 2) — 다른 페이지에 생성
3️⃣ 전략 방향 체크 (Step 3) — 방향을 다시 잡기
4️⃣ 시안 생성 (Step 4) — 같은 방향으로 새로운 시안 3개
```

---

## Ruler DS 컴포넌트 → figma-use JSX 매핑

### 🔴 컴포넌트 사용 우선순위 (CRITICAL)

1. **1순위: Figma 컴포넌트 인스턴스** — Step 1.5에서 발견한 Ruler DS 컴포넌트를 `<Instance>`로 사용
2. **2순위: Figma에서 추출한 JSX** — `figma-use export jsx`로 기존 화면에서 추출한 실제 구조 재사용
3. **3순위: 아래 폴백 JSX** — 컴포넌트를 찾을 수 없을 때만 아래 근사 표현 사용

```tsx
// 1순위: Ruler DS 컴포넌트 인스턴스 (Step 1.5에서 발견한 ID 사용)
<Instance component="<discovered-component-id>" />

// 2순위: 기존 29CM 화면에서 추출한 패턴 재사용
// figma-use export jsx <existing-screen-node> 결과를 기반으로 구성

// 3순위: 아래 폴백 JSX (컴포넌트 미발견 시에만)
```

아래는 Ruler DS 컴포넌트를 찾을 수 없을 때 사용하는 **폴백 JSX 매핑**입니다.

### TopNavigation

```tsx
<Frame w={375} h={56} flex="row" items="center" px={16} bg="#FFFFFF">
  <Icon name="lucide:arrow-left" size={24} color="#1A1A1A" />
  <Text size={18} weight="bold" color="#1A1A1A" ml={12}>타이틀</Text>
  <Frame flex={1} />
  <Icon name="lucide:search" size={24} color="#1A1A1A" mr={16} />
  <Icon name="lucide:shopping-bag" size={24} color="#1A1A1A" />
</Frame>
```

### ProductCard (기본)

```tsx
<Frame w={165} flex="col" gap={8}>
  <Rectangle w={165} h={165} fill="#E0E0E0" rounded={8} />
  <Frame flex="col" gap={2}>
    <Text size={11} weight="bold" color="#1A1A1A">브랜드명</Text>
    <Text size={12} color="#888888">상품명 2줄까지 노출</Text>
    <Frame flex="row" gap={4} items="center">
      <Text size={13} weight="bold" color="#1A1A1A">30%</Text>
      <Text size={13} weight="bold" color="#1A1A1A">69,000원</Text>
    </Frame>
  </Frame>
</Frame>
```

### CompactProductCard (횡스크롤용)

```tsx
<Frame w={120} flex="col" gap={6}>
  <Rectangle w={120} h={120} fill="#E0E0E0" rounded={8} />
  <Text size={11} color="#1A1A1A" weight="bold">브랜드명</Text>
  <Text size={11} color="#888888">상품명</Text>
  <Text size={12} weight="bold" color="#1A1A1A">49,000원</Text>
</Frame>
```

### BrandCard

```tsx
<Frame w={140} h={180} flex="col" items="center" gap={8}>
  <Ellipse w={80} h={80} fill="#E0E0E0" />
  <Text size={13} weight="bold" color="#1A1A1A">브랜드명</Text>
  <Text size={11} color="#888888">한줄 소개</Text>
</Frame>
```

### Tabs

```tsx
<Frame w={375} h={44} flex="row" bg="#FFFFFF">
  <Frame flex={1} h={44} items="center" justify="center" borderBottom={2} borderColor="#1A1A1A">
    <Text size={14} weight="bold" color="#1A1A1A">추천</Text>
  </Frame>
  <Frame flex={1} h={44} items="center" justify="center">
    <Text size={14} color="#888888">브랜드</Text>
  </Frame>
  <Frame flex={1} h={44} items="center" justify="center">
    <Text size={14} color="#888888">카테고리</Text>
  </Frame>
</Frame>
```

### FilterTag (카테고리 칩)

```tsx
<Frame flex="row" gap={8} px={16}>
  <Frame px={16} py={8} bg="#1A1A1A" rounded={20}>
    <Text size={13} color="#FFFFFF">생일</Text>
  </Frame>
  <Frame px={16} py={8} bg="#F5F5F5" rounded={20}>
    <Text size={13} color="#1A1A1A">결혼</Text>
  </Frame>
  <Frame px={16} py={8} bg="#F5F5F5" rounded={20}>
    <Text size={13} color="#1A1A1A">졸업</Text>
  </Frame>
</Frame>
```

### SearchField

```tsx
<Frame w={343} h={40} bg="#F5F5F5" rounded={8} flex="row" items="center" px={12} mx={16}>
  <Icon name="lucide:search" size={18} color="#888888" />
  <Text size={14} color="#888888" ml={8}>검색어를 입력하세요</Text>
</Frame>
```

### Banner (프로모션)

```tsx
<Frame w={375} h={180} bg="#E0E0E0" items="center" justify="center">
  <Frame flex="col" items="center" gap={4}>
    <Text size={12} color="#888888">SPRING COLLECTION</Text>
    <Text size={20} weight="bold" color="#1A1A1A">봄 신상품 모아보기</Text>
    <Text size={13} color="#888888">최대 30% 할인</Text>
  </Frame>
</Frame>
```

### SectionHeader (섹션 제목 + 더보기)

```tsx
<Frame w={375} h={48} flex="row" items="center" px={16}>
  <Text size={16} weight="bold" color="#1A1A1A">섹션 제목</Text>
  <Frame flex={1} />
  <Text size={13} color="#888888">더보기</Text>
</Frame>
```

### BottomNavigation

```tsx
<Frame w={375} h={56} flex="row" bg="#FFFFFF" borderTop={1} borderColor="#EEEEEE">
  <Frame flex={1} flex="col" items="center" justify="center" gap={2}>
    <Icon name="lucide:home" size={22} color="#1A1A1A" />
    <Text size={10} color="#1A1A1A">홈</Text>
  </Frame>
  <Frame flex={1} flex="col" items="center" justify="center" gap={2}>
    <Icon name="lucide:compass" size={22} color="#888888" />
    <Text size={10} color="#888888">발견</Text>
  </Frame>
  <Frame flex={1} flex="col" items="center" justify="center" gap={2}>
    <Icon name="lucide:heart" size={22} color="#888888" />
    <Text size={10} color="#888888">좋아요</Text>
  </Frame>
  <Frame flex={1} flex="col" items="center" justify="center" gap={2}>
    <Icon name="lucide:user" size={22} color="#888888" />
    <Text size={10} color="#888888">마이</Text>
  </Frame>
</Frame>
```

### Divider (구분선)

```tsx
<Frame w={375} h={8} bg="#F5F5F5" />
```

---

## 에러 처리

### Figma 연결 실패

```bash
# figma-use status 실패 시 자동 복구 시도
killall Figma 2>/dev/null
sleep 2
open -a Figma --args --remote-debugging-port=9222
sleep 10
figma-use status
```

복구 실패 시 사용자에게 수동 조치 안내:
```
Figma 연결을 복구하지 못했습니다. 다음을 확인해주세요:
1. Figma 앱이 설치되어 있는지 확인
2. figma-use가 설치되어 있는지: npm list -g figma-use
3. 패치 필요 여부: sudo figma-use patch
```

### 렌더링 실패

- JSX 문법 오류 → 코드 수정 후 1회 재시도
- "not connected" → Step 0 재실행
- "no page" → Step 2로 이동

### Confluence 인증 실패

```
Confluence 페이지를 읽지 못했습니다.
/mcp 명령어로 Atlassian 인증을 다시 해주세요.
```

---

## 사용 예시

### 예시 1: 자유 텍스트로 화면 설계

```
사용자: 선물하기 홈 화면을 새로 설계해줘.
       카테고리 탐색과 브랜드 탐색을 강화하고,
       시즌별 큐레이션 영역도 넣고 싶어.

Claude:
  → Step 0: Figma 연결 확인 ✅
  → Step 1: 요구사항 정리 + 보완 질문
  → Step 2: 페이지 확인
  → Step 3: 전략 방향 제시 + 확인
  → Step 4: 3개 시안 생성 → Figma 삽입
  → Step 5: 시안 선택 또는 수정
```

### 예시 2: PRD URL로 화면 설계

```
사용자: /figma-wireframe https://wiki.team.musinsa.com/.../pages/12345

Claude:
  → Step 0: Figma 연결 확인
  → Step 1: Confluence 페이지 읽기 → 요구사항 자동 추출
  → Step 2~5: 동일 플로우
```

### 예시 3: 기존 화면 개선

```
사용자: /figma-wireframe https://www.figma.com/design/abc123/...?node-id=3-24
       이 화면에서 상품 탐색을 강화하고 싶어

Claude:
  → Step 0: Figma 연결 확인
  → Step 1: AS-IS 화면 분석 (get_design_context + get_screenshot)
  → Step 2~5: 동일 플로우 (AS-IS 대비 TO-BE 설명 포함)
```

---

## Ruler DS 참조

### Figma 라이브러리 (1순위 — 반드시 여기서 참조)

- **Figma 라이브러리**: https://www.figma.com/files/1398101599914805624/project/89415921

시안 생성 전에 반드시 **figma-use CLI로 Figma 라이브러리 파일을 직접 분석**하여 컴포넌트 스펙(사이즈, 간격, 변형)을 확인합니다.

```bash
# Ruler DS 컴포넌트 탐색
figma-use query "//COMPONENT_SET"          # 모든 컴포넌트 세트
figma-use query "//COMPONENT"              # 모든 컴포넌트
figma-use export jsx <component-id> --pretty  # 컴포넌트 구조 확인
figma-use analyze typography               # 타이포그래피 스케일
figma-use analyze spacing --grid 8         # 간격 체계
```

### 웹 문서 (보조 참조 — Figma에서 정보 부족 시에만)

- **컴포넌트 문서**: https://29cm-developers.github.io/ruler-design/components/

> **🔴 절대 금지**: 29cm.co.kr, m.29cm.co.kr 등 **웹사이트/앱을 WebFetch로 크롤링하여 참조하지 않습니다**.
> 디자인 참조는 반드시 **Figma 파일 내의 화면과 컴포넌트**에서 가져옵니다.

---

## 주의사항

1. **모바일 퍼스트**: 모든 와이어프레임은 375 x 812px (iPhone 기준)으로 생성
2. **그레이스케일**: 와이어프레임은 레이아웃 검증 목적이므로 컬러를 사용하지 않음
3. **Ruler DS 기반**: 29CM의 Ruler 디자인 시스템 컴포넌트를 기반으로 구성
4. **3개 시안**: 항상 3개의 의미 있게 다른 시안을 제안
5. **한국어**: 모든 와이어프레임 내 텍스트와 설명은 한국어로 작성
6. **Figma 우선 참조**: 디자인 패턴과 컴포넌트는 반드시 Figma 파일에서 분석하여 참조. 웹사이트 크롤링 금지
7. **Instance 우선**: Ruler DS 컴포넌트가 Figma에서 발견되면 `<Instance>`로 사용, 폴백 JSX는 최후 수단

---

🤖 Generated with Claude Code

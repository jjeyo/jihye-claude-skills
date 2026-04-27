#!/bin/bash
# ============================================================
# 🎨 Figma 와이어프레임 스킬 원클릭 셋업
#
# 사용법: bash ~/.claude/skills/figma-wireframe/setup.sh
# ============================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  🎨 Figma 와이어프레임 스킬 셋업                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# --- Step 1: Node.js 확인 ---
echo "1️⃣  Node.js 확인..."
if ! command -v node &> /dev/null; then
  echo "   ❌ Node.js가 설치되어 있지 않습니다."
  echo "   👉 설치: brew install node"
  exit 1
fi
NODE_VER=$(node --version)
echo "   ✅ Node.js $NODE_VER"

# --- Step 2: figma-use 설치 ---
echo ""
echo "2️⃣  figma-use 설치..."
if command -v figma-use &> /dev/null; then
  CURRENT_VER=$(figma-use --version 2>/dev/null || echo "unknown")
  echo "   ✅ 이미 설치됨 (v$CURRENT_VER)"
  echo "   📦 최신 버전으로 업데이트 중..."
  npm install -g figma-use@latest 2>/dev/null || echo "   ⚠️ 업데이트 실패 (현재 버전 유지)"
else
  echo "   📦 figma-use 설치 중..."
  npm install -g figma-use
  echo "   ✅ 설치 완료"
fi

# --- Step 3: Figma 패치 ---
echo ""
echo "3️⃣  Figma 패치 (remote debugging 활성화)..."
echo "   ⚠️ 관리자 비밀번호가 필요할 수 있습니다."

# Figma 종료
if pgrep -x "Figma" > /dev/null 2>&1; then
  echo "   🔄 Figma 종료 중..."
  killall Figma 2>/dev/null || true
  sleep 2
fi

# 패치 적용
if sudo figma-use patch 2>/dev/null; then
  echo "   ✅ 패치 완료"
else
  echo "   ⚠️ 패치 실패 — Figma가 설치되어 있는지 확인하세요"
  echo "   💡 Figma 데스크톱 앱: https://www.figma.com/downloads/"
fi

# --- Step 4: Figma 재시작 ---
echo ""
echo "4️⃣  Figma 시작 (remote debugging 모드)..."
open -a Figma --args --remote-debugging-port=9222 2>/dev/null || true
echo "   ⏳ Figma 로딩 대기 중 (15초)..."
sleep 15

# --- Step 5: 연결 확인 ---
echo ""
echo "5️⃣  연결 확인..."
if figma-use status 2>/dev/null | grep -q "connected\|Connected\|ready\|Ready"; then
  echo "   ✅ Figma 연결 성공!"
else
  # 포트 열려있는지 확인
  if lsof -i :9222 > /dev/null 2>&1; then
    echo "   ⚠️ 포트 9222 열림 — Figma에서 파일을 하나 열어주세요"
  else
    echo "   ⚠️ 연결 대기 중 — Figma에서 디자인 파일을 열면 자동 연결됩니다"
  fi
fi

# --- Step 6: figma-use-skill.md 복사 ---
echo ""
echo "6️⃣  figma-use 스킬 문서 설정..."
SKILL_SRC=$(npm root -g 2>/dev/null)/figma-use/SKILL.md
SKILL_DST="$HOME/.claude/figma-use-skill.md"
if [ -f "$SKILL_SRC" ]; then
  cp "$SKILL_SRC" "$SKILL_DST"
  echo "   ✅ SKILL.md 복사 완료 → $SKILL_DST"
elif [ -f "$SKILL_DST" ]; then
  echo "   ✅ SKILL.md 이미 존재"
else
  echo "   ⚠️ SKILL.md를 찾을 수 없음 (수동 복사 필요)"
fi

# --- Step 7: MCP 서버 설정 ---
echo ""
echo "7️⃣  Claude Code MCP 서버 설정..."
MCP_FILE="$HOME/.claude/.mcp.json"
if [ -f "$MCP_FILE" ] && grep -q "figma-use" "$MCP_FILE" 2>/dev/null; then
  echo "   ✅ figma-use MCP 이미 설정됨"
else
  # .mcp.json 생성 또는 업데이트
  if [ -f "$MCP_FILE" ]; then
    # 기존 파일에 figma-use 추가
    python3 -c "
import json
with open('$MCP_FILE', 'r') as f:
    data = json.load(f)
data.setdefault('mcpServers', {})['figma-use'] = {
    'command': 'figma-use',
    'args': ['mcp', 'serve']
}
with open('$MCP_FILE', 'w') as f:
    json.dump(data, f, indent=2)
print('   ✅ figma-use MCP 추가 완료')
" 2>/dev/null || echo "   ⚠️ MCP 설정 실패 (수동 추가 필요)"
  else
    cat > "$MCP_FILE" << 'MCPEOF'
{
  "mcpServers": {
    "figma-use": {
      "command": "figma-use",
      "args": ["mcp", "serve"]
    }
  }
}
MCPEOF
    echo "   ✅ .mcp.json 생성 완료"
  fi
fi

# --- 완료 ---
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ 셋업 완료!                                      ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
echo "║  사용법:                                             ║"
echo "║  1. Figma에서 작업할 파일을 엽니다                   ║"
echo "║  2. Claude Code에서:                                 ║"
echo "║     /figma-wireframe 선물하기 홈 화면 설계해줘       ║"
echo "║                                                      ║"
echo "║  💡 Figma 재시작 시:                                 ║"
echo "║  open -a Figma --args --remote-debugging-port=9222   ║"
echo "║                                                      ║"
echo "║  ⚠️ Claude Code 세션을 재시작해야                    ║"
echo "║     MCP 서버 설정이 적용됩니다.                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

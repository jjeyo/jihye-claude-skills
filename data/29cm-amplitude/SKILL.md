---
name: 29cm-amplitude
description: 29CM Amplitude 데이터 분석 스킬. "앰플리튜드 분석해줘", "DAU 추이 보여줘", "퍼널 분석해줘", "이벤트 조회해줘", "코호트 분석해줘", "리텐션 분석", "구매전환율", "GGMV 분석" 등의 요청에 트리거됩니다.
version: 1.0.0
tags: amplitude, analytics, 29cm, 데이터분석, 퍼널, 리텐션, DAU, GGMV
category: analytics
---

# 29CM Amplitude Analytics

29CM 프로덕트 데이터를 Amplitude MCP를 통해 분석하는 스킬.

## 프로젝트 정보

| 항목 | 값 |
|------|-----|
| **운영 프로젝트** | `29cm` (App ID: **369240**) |
| **개발 프로젝트** | `29cm - Development` (App ID: **556432**) |
| **타임존** | Asia/Seoul (KST, UTC+9) |
| **세션 정의** | 30분 타임아웃 |

> 분석은 항상 **운영 프로젝트 (369240)**를 기본으로 사용한다.
> 개발 프로젝트는 사용자가 명시적으로 요청한 경우에만 사용.

## 비즈니스 컨텍스트

### 핵심 목표
- **MAU 성장**
- **재방문율** (D1, D7, D30)
- **구매전환율** (Visit → Purchase)
- **GGMV 증대**
- **LTV 증가 및 이탈률 감소**

### 분석 기준
- **로그인 유저만** 분석 (`user_id != none`)
- `[Appboy]`로 시작하는 이벤트는 푸시 발송이므로 Any Active Event에서 **제외**
- `[Experiment]` 이벤트는 별도 명시 없는 한 일반 분석에서 **제외**
- **율(%) 비교 시 bps 사용**: `(비교기간 율 - 현재 율) * 10000`, 소수점 버림
- 퍼널간 전환율 비교 금지 (예: DAU→PDP vs Cart→Purchase 비교 X)
- 동일 퍼널의 **전년 동기간** 또는 **이전 3개월** 비교만 허용

### 프로모션 참고 (이상치 아님)
- **매월 29일**: 정기 프로모션 (유입/GGMV 상승)
- **매년 6월, 11월**: 대규모 프로모션 (전체 지표 상승)

## 이벤트 택소노미

### 네이밍 규칙
- 모든 이벤트 영어, `동사_목적어` 형태
- Deprecated 이벤트는 분석 시 제외

### 핵심 이벤트 (신규 택소노미)

| 이벤트 | 설명 | 주요 프로퍼티 |
|--------|------|-------------|
| `view_page` | 지면 방문 | `page_name` |
| `impression_item` | 상품 노출 (→PDP 랜딩) | `page_name`, `section_name`, `item_no`, `brand_no` |
| `click_item` | 상품 클릭 (→PDP 랜딩) | `page_name`, `section_name`, `item_no`, `brand_no` |
| `like_item` | 상품 좋아요 | `page_name`, `section_name`, `item_no`, `brand_no` |
| `unlike_item` | 상품 좋아요 해제 | `page_name`, `section_name`, `item_no`, `brand_no` |
| `click_button` | 버튼 클릭 | `page_name`, `section_name`, `button_id`, `button_name` |
| `impression_content` | 콘텐츠 노출 | `page_name`, `section_name`, `link_value`, `on_site_content_id`, `layout_id` |
| `click_content` | 콘텐츠 클릭 | `page_name`, `section_name`, `link_value`, `on_site_content_id`, `layout_id` |
| `impression_brand` | 브랜드 노출 (→브랜드홈 랜딩) | `page_name`, `section_name`, `brand_no` |
| `click_brand` | 브랜드 클릭 (→브랜드홈 랜딩) | `page_name`, `section_name`, `brand_no` |
| `impression_popup` | 팝업 노출 | `page_name`, `section_name`, `popup_type`, `popup_id` |
| `add_to_cart` | 장바구니 담기 | `page_name`, `section_name`, `price`, `item_no` |
| `click_checkout` | 바로 구매/선물하기 클릭 | `page_name`, `section_name`, `checkout_type`, `item_no_list` |
| `purchase_success` | 구매 완료 | `order_no`, `order_item_manage_no`, `item_no`, `brand_no` |

### 레거시 주요 이벤트 (visit_ 계열)

| 카테고리 | 이벤트 |
|---------|--------|
| **홈/탐색** | `visit_home_main_page`, `visit_home_tab`, `visit_best`, `visit_category`, `visit_shop_main_page` |
| **상품** | `visit_item_detail`, `visit_item_search_result` |
| **구매 퍼널** | `visit_cart`, `visit_order_check_out`, `visit_order_confirm_success`, `purchase_success` |
| **검색** | `visit_search_start_page`, `visit_search_result_page` |
| **선물하기** | `visit_gift_main`, `visit_gift_best`, `visit_gift_detail`, `visit_gift_receive`, `visit_giftbox` |
| **브랜드** | `visit_brand`, `visit_brand_home`, `visit_brand_choice` |
| **콘텐츠** | `visit_content`, `visit_post`, `visit_selection_detail` |
| **회원** | `signup_success`, `login_success`, `visit_login_page`, `visit_invite` |
| **CS** | `visit_cs_qna_mantoman_main`, `visit_cs_qna_mantoman_write`, `visit_cs_qna_mantoman_list` |

## 주요 대시보드

| 대시보드 | URL | 설명 |
|---------|-----|------|
| **SRP** | https://app.amplitude.com/analytics/style-share/dashboard/9deouteu | `page_name='search_result'` 검색결과 지면 주요 지표 |
| **Purchase Funnel** | https://app.amplitude.com/analytics/style-share/dashboard/ogy4j2e4 | PLP→PDP→Cart→주문서→구매완료 주간 전환율/소요시간/빈도 |

## 워크플로우

### 1. 이벤트/프로퍼티 조회

```
"click_item 이벤트 프로퍼티 보여줘"
"purchase_success 프로퍼티 뭐가 있어?"
"29CM 이벤트 목록 조회"
```

**절차**:
1. `search` (entityTypes: EVENT, appIds: [369240])로 이벤트 검색
2. `get_event_properties` (projectId: "369240", eventType: "이벤트명")로 프로퍼티 조회
3. 이벤트명을 모르면 search로 먼저 탐색 후 프로퍼티 조회

> **CRITICAL**: 이벤트명을 추측하지 마라. 반드시 `search` 또는 `get_event_properties`로 확인 후 사용.

### 2. 차트 조회/생성

```
"최근 7일 DAU 추이 보여줘"
"이번 달 purchase_success 추이 차트"
"홈 방문자 수 주간 추이"
```

**절차**:
1. `search`로 관련 기존 차트가 있는지 확인
2. 없으면 `query_chart`로 새 차트 생성하여 시각화
3. 여러 지표 비교 시 `query_charts` 사용

### 3. 퍼널 분석

```
"구매 퍼널 분석해줘"
"PDP→Cart→Purchase 전환율"
"선물하기 퍼널 보여줘"
```

**구매 퍼널 기본 단계**:
1. `impression_item` (상품 노출)
2. `click_item` 또는 `visit_item_detail` (상품 상세)
3. `add_to_cart` (장바구니)
4. `visit_order_check_out` (주문서)
5. `purchase_success` (구매 완료)

**절차**:
1. Purchase Funnel 대시보드 (`ogy4j2e4`) 먼저 참조
2. 커스텀 퍼널이 필요하면 `query_chart`로 Funnel 차트 생성

### 4. 리텐션 분석

```
"D1/D7/D30 재방문율 보여줘"
"신규 유저 리텐션"
"재구매율 분석"
```

**분석 규칙**:
- D1, D7, D30 지표끼리 비교 금지
- 동일 지표의 전년 동기간 또는 이전 3개월 비교만 허용
- 재방문율과 재구매율을 별도로 분석

### 5. 대시보드 조회

```
"SRP 대시보드 보여줘"
"Purchase Funnel 대시보드 확인"
"내 대시보드 목록"
```

**절차**:
1. `search` (entityTypes: DASHBOARD)로 목록 조회
2. `get_dashboard` (dashboardId)로 상세 확인

### 6. 코호트/세그먼트 분석

```
"구매 유저 코호트 만들어줘"
"최근 30일 활성 유저 세그먼트"
```

**절차**:
1. `get_cohorts`로 기존 코호트 확인
2. `create_cohort`로 새 코호트 생성

### 7. AI Agent 결과 조회

```
"대시보드 AI 분석 결과 보여줘"
"세션 리플레이 인사이트 확인"
```

**절차**:
1. `get_agent_results` (agent_type: "dashboard_explorer" 또는 "session_replay_explorer")

### 8. 실험 (A/B 테스트) 조회

```
"현재 진행중인 실험 보여줘"
"A/B 테스트 결과 확인"
```

**절차**:
1. `get_experiments`로 목록 조회
2. `query_experiment` (experimentId)로 결과 확인

## MCP 도구 매핑

| 작업 | MCP 도구 | 필수 파라미터 |
|------|---------|-------------|
| 이벤트 검색 | `search` | appIds: [369240], entityTypes: ["EVENT"] |
| 프로퍼티 조회 | `get_event_properties` | projectId: "369240", eventType |
| 차트 쿼리 | `query_chart` | projectId 필요 시 369240 |
| 멀티 차트 | `query_charts` | - |
| 대시보드 조회 | `get_dashboard` | dashboardId |
| 대시보드 검색 | `search` | entityTypes: ["DASHBOARD"] |
| 코호트 조회 | `get_cohorts` | - |
| 코호트 생성 | `create_cohort` | - |
| 실험 조회 | `get_experiments` | - |
| 실험 결과 | `query_experiment` | experimentId |
| AI 분석 결과 | `get_agent_results` | agent_type |
| 세션 리플레이 | `get_session_replays` | - |
| 프로젝트 컨텍스트 | `get_project_context` | projectId: 369240 |

## 응답 가이드라인

1. **시각적 답변 우선**: 가능하면 `query_chart`로 차트 렌더링
2. **불확실한 데이터 추정 금지**: 한계를 명확히 언급
3. **실행 가능한 액션 아이템** 포함
4. **마케팅/그로스 관점** 실무적 해석
5. **bps 사용**: 율(%) 비교 시 반드시 bps 단위
6. **프로모션 고려**: 29일, 6월, 11월 데이터 해석 시 참고

## 인증

Amplitude MCP 인증이 필요합니다. 인증이 안 되어 있으면:

1. `mcp__Amplitude__authenticate` 호출
2. 브라우저에서 OAuth 인증 완료
3. 도구 자동 활성화 확인

## 주의사항

- 이벤트명을 **절대 추측하지 말 것** → 반드시 search/get_event_properties로 확인
- `user_id`가 없는 이벤트는 분석에서 제외
- `[Appboy]` 이벤트는 Any Active Event에서 제외
- 퍼널간 전환율 비교 금지 (동일 퍼널 내 전년/이전 기간 비교만)
- MAU는 MTD도 함께 고려 (월 미완료 시 상승 패턴 반영)

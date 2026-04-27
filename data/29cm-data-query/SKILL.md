---
name: 29cm-data-query
description: 29CM 데이터 분석을 위한 Databricks SQL 쿼리 작성 스킬. "데이터 분석 쿼리 작성해줘", "GMV 분석", "DAU 분석", "리텐션 분석", "퍼널 분석", "전환율 분석", "코호트 분석", "홈탭 트래픽", "발견탭 분석", "VOC 분석", "장바구니 추가율", "선물하기 분석", "키즈 분석", "내 아이 정보 분석" 등의 요청에 트리거됩니다. 주문 테이블, 이벤트 테이블, VOC 테이블, 키즈 테이블의 스키마를 참조하여 쿼리를 생성합니다.
---

# 29CM Data Query

29CM 데이터 분석을 위한 Databricks SQL 쿼리 작성 가이드.

## ⚠️ 필수 규칙

> **쿼리 작성 전 반드시 `references/schema.md`의 테이블 스키마를 확인할 것!**
>
> 컬럼명, 데이터 타입을 확인하지 않고 임의로 쿼리를 작성하지 말 것.

## 🔴 Critical Gotchas (PDA 피드백 — CMDATA-3141, 2026-04)

> 과거 AI 생성 쿼리에서 PDA 팀이 공식 지적한 3대 오류. **반드시 숙지하고 쿼리에 반영.**

### 1. GMV/매출: CS 반영 UNION 필수

`29cm_mart_order` **단독 사용 시 CS(교환/환불/반품) 미반영** → 매출 왜곡.

- **정확한 최종 매출 필요 시**: `29cm_mart_order` UNION ALL `29cm_mart_order_cs` 패턴 사용
- **간편 집계 (CS 미반영 OK)**: `29cm_mart_order` + `order_item_cancel_status_name = '주문_최초'`
- 상세 쿼리: [query-patterns.md Section 1 "CS 반영 GMV"](references/query-patterns.md)

### 2. 적립금 지급 내역: 3테이블 JOIN 필수

`t_mileage` 단독 + `type='ACCUMULATE' AND merchant_key LIKE 'REWARD-V-%'` 만으로는 **지급 사유 복원 불충분**.

- **지급 내역 분석**: `t_mileage_history` + `t_mileage` + `t_mileage_accumulate_issue` JOIN
- `detail_type` (1차) + `merchant_key` 패턴 (2차) + `ai.message` (어드민 사유)로 완전한 복원
- 상세 쿼리: [schema.md Section 28-3](references/schema.md), [query-patterns.md "적립금 지급 내역 표준 쿼리"](references/query-patterns.md)

### 3. 유저 세그먼트: 공식 마케팅 세그먼트 사용

방문 빈도 기준 임의 정의 (휴면/저활성/활성) 는 **마케팅 공식 세그먼트 정의와 불일치** → 팀 간 커뮤니케이션 혼선.

- **반드시 사용**: `team.marketing.29cm_user_visit_segment_monthly` (`active_status`, `visit_frequency`)
- **금지**: `CASE WHEN visits = 0 THEN '휴면' ...` 같은 임의 세그먼트 정의
- 상세 쿼리: [schema.md Section 30](references/schema.md), [query-patterns.md "유저 세그먼트"](references/query-patterns.md)

## 쿼리 작성 원칙

1. **날짜 필터 필수**: 대용량 테이블 조회 시 반드시 날짜 조건 포함
2. **LIMIT 사용**: 탐색적 쿼리는 LIMIT 절 추가
3. **명시적 컬럼 선택**: SELECT * 지양, 필요한 컬럼만 명시
4. **alias 사용**: 가독성을 위해 테이블/컬럼 alias 적극 활용
5. **비중/비율 분석 시 월별 추이 기본 제공**: `DATE_TRUNC('MONTH', ...)` 월별 breakdown 포함
6. **월별 집계 시 LEFT JOIN + COALESCE**: 0건 월이 누락되지 않도록 `LEFT JOIN` + `COALESCE(..., 0)` 사용
7. **비율 포맷**: `ROUND(... * 100.0 / NULLIF(..., 0), 2) AS xxx_pct` 형식 통일
8. **집계-필터 CTE 분리**: 중복 탐지 등에서 `GROUP BY` 집계 CTE → 필터 CTE 2단계로 분리 (가독성/디버깅 개선)
9. **건수 집계**: `COUNT(DISTINCT pk_column)` 사용 (`COUNT(*)` 대신 정확한 집계)
10. **주문 취소 체크 (CRITICAL)**: 주문 테이블 사용 시 반드시 "주문 취소 고려 체크리스트" 확인 → 해당 케이스면 `order_item_cancel_status_name = '주문_최초'` 필터 적용

## ⚠️ TIMESTAMP 날짜 비교 주의

TIMESTAMP 타입 컬럼에 `BETWEEN '시작일' AND '종료일'` 사용 시 **종료일 당일 데이터가 누락**됨.

| 컬럼 타입 | 안전한 패턴 |
|-----------|------------|
| `dt` (DATE) | `dt BETWEEN '2026-01-28' AND '2026-03-31'` ✅ |
| `completed_timestamp`, `inserted_timestamp` (TIMESTAMP) | `>= '2026-01-28' AND < '2026-04-01'` ✅ |
| TIMESTAMP에 BETWEEN 사용 | `BETWEEN '2026-01-28' AND '2026-03-31'` ❌ (3/31 00:00:01 이후 누락!) |

## SQL 작성 규칙

### 한글 Alias 백틱 규칙
Databricks SQL에서 한글 또는 특수문자가 포함된 컬럼 Alias는 반드시 **백틱(`)**으로 감싸야 합니다.

| 케이스 | 백틱 필요 여부 | 예시 |
|--------|---------------|------|
| 영문만 | 불필요 | `AS base_date` |
| 한글 포함 | **필수** | `` AS `기준일` `` |
| 특수문자 포함 | **필수** | `` AS `GV_율(%)` `` |
| 공백 포함 | **필수** | `` AS `진입 세션` `` |

## 쿼리 작성 절차

1. 사용자 요청에서 분석 목적 파악
2. 해당하는 references 파일에서 테이블 스키마 확인
3. 스키마의 쿼리 예시를 참고하여 쿼리 작성
4. 쿼리와 함께 해석 가이드 제공

## 테이블 참조

분석 목적에 따라 적절한 스키마 참조 파일 확인:

| 분석 유형 | 참조 파일 | 테이블 |
|-----------|-----------|--------|
| GMV/주문/선물 비중 분석 | [schema.md](references/schema.md) | datamart.datamart.29cm_mart_order |
| 선물 구매자-수령자/중복/건수 분석 | [schema.md](references/schema.md) | `29cm`.orders.t_order_gift |
| 이벤트/퍼널/전환 분석 (앱) | [schema.md](references/schema.md) | team.tech.cda_29cm_snowplow_event_mart_daily |
| **검색(SRP/자동완성/검색시작) 분석** | [schema.md](references/schema.md) | **team.tech.cda_29cm_snowplow_search_mart_daily** (검색 전용, 우선 사용) |
| VOC/고객의 소리 분석 | [schema.md](references/schema.md) | `29cm`.front.voc_comments |
| 키즈(내 아이 정보) 분석 | [schema.md](references/schema.md) | ocmp.onemember.onemember_custom_data |
| 홈카테고리/WAU/유저행동 분석 | [schema.md](references/schema.md) | datamart.gold.user_mart_29cm |
| 앱 세션/DAU/WAU 분석 | [schema.md](references/schema.md) | datamart.gold.snowplow_app_user_session_29cm |
| N차 주문/리텐션 분석 | [schema.md](references/schema.md) | datamart.gold.nth_order_29cm |
| 카테고리별 주문 분석 (홈카테고리) | [schema.md](references/schema.md) | datamart.gold.auxia_orders_merged |
| **웹 PV/UV 분석** | [schema.md](references/schema.md) | **lake.bigquery.ga4_log** |
| **GA4 이벤트 원천 (파라미터 파싱)** | [schema.md](references/schema.md) | **lake.bigquery.events** |
| **유저 속성별 분석 (연령/성별)** | [schema.md](references/schema.md) | **lake.gold.user_partitioned** ⚠️ 권한필요 |
| **UTM/캠페인 유입 분석** | [schema.md](references/schema.md) | **team.marketing.29cm_session_traffic_log** |
| **CRM 캠페인 성과 분석** | [schema.md](references/schema.md) | **team.marketing.29cm_crm_campaign_list_daily** |
| **A/B 테스트 실험군 분석** | [schema.md](references/schema.md) | **datamart.gold.amplitude_app_exposure_user_exp_daily_29cm** |
| **클릭 로그/히드로 분석** | [schema.md](references/schema.md) | **event_log.silver.heathrow_click_log** |
| **카테고리 매핑 조회** | [schema.md](references/schema.md) | **team.tech.cda_s_29cm_item_category_mapping** |
| **상품 마스터/카테고리 코드** | [schema.md](references/schema.md) | **datamart.datamart.goods** |
| **상품 원천 (등록일/공급유형)** | [schema.md](references/schema.md) | **`29cm`.item.t_item** |
| **회원 등급 이력 (VIP/VVIP)** | [schema.md](references/schema.md) | **29cm.member.t_user_level_history** |
| **적립금/마일리지 분석** | [schema.md](references/schema.md) | **`29cm`.mileage.t_mileage** |
| **간단한 유저 등급 조회** | [schema.md](references/schema.md) | **datamart.datamart.users** |
| **주문 CS(취소/반품/교환)** | [schema.md](references/schema.md) | **datamart.datamart.29cm_mart_order_cs** |
| **단독상품 판별** | [schema.md](references/schema.md) | **`29cm`.item.t_item_analysis_tagging** (`is_exclusive='T'`) |
| **N차 주문 시퀀스 (마케팅)** | [schema.md](references/schema.md) | **team.marketing.29cm_order_sequence** |
| **회원 가입일** | [schema.md](references/schema.md) | **29cm.member.t_user** (insert_timestamp=UTC) |
| **적립금 지급 이력 (3테이블 JOIN)** | [schema.md](references/schema.md) | **`29cm`.mileage.t_mileage_history** + t_mileage + t_mileage_accumulate_issue |
| **유저 활성도/세그먼트** | [schema.md](references/schema.md) | **team.marketing.29cm_user_visit_segment_monthly** |

## 핵심 테이블

| 테이블 | 용도 | 주요 컬럼 |
|--------|------|-----------|
| datamart.datamart.29cm_mart_order | 주문 데이터 (GMV, 카테고리, 선물 비중) | user_no, sales_sell_price, dt, is_gift, large_category_name 등 |
| `29cm`.orders.t_order_gift | 선물 주문 raw (구매자-수령자 관계, 건수) | order_gift_no, buyer_user_id, receiver_user_no, inserted_timestamp |
| team.tech.cda_29cm_snowplow_event_mart_daily | 앱 이벤트 로그 | user_id, event_name, event_timestamp, home_tab, page_name |
| 29cm.front.voc_comments | VOC (고객의 소리) | id, user_id, type, content, platform_type, created_at |
| ocmp.onemember.onemember_custom_data | 키즈(내 아이 정보) | category_code, pii_attribute_data |
| datamart.gold.user_mart_29cm | 유저 마트 (일별 스냅샷, 행동 배열) | user_no, visit_home_category_item_list, order_item_list, dt |
| datamart.gold.snowplow_app_user_session_29cm | 앱 세션 데이터 | snowplow_id, user_id, platform, partition_date, duration_sec |
| datamart.gold.nth_order_29cm | 29CM N차 주문 데이터 | user_no, order_no, nth_orders, app_nth_order, web_nth_order, dt |
| datamart.gold.auxia_orders_merged | 카테고리별 주문 (홈카테고리=Life) | user_no, order_no, large_nm, medium_nm, dt |
| lake.bigquery.ga4_log | 웹 GA4 로그 (PV/UV) | dt, page_id, client_id, hash_id |
| lake.bigquery.events | GA4 이벤트 원천 (파라미터 중첩) | dt, event_name, event_params, user_pseudo_id |
| lake.gold.user_partitioned | 통합 유저 마스터 ⚠️ 권한필요 | dt, hash_id, age_band, gender, user_grade |
| team.marketing.29cm_session_traffic_log | UTM 기반 세션 트래픽 | partition_date, utm_source, utm_medium, user_id |
| datamart.gold.amplitude_app_exposure_user_exp_daily_29cm | A/B 테스트 실험군 | dt, exp_name, user_id, exp_group_name |
| event_log.silver.heathrow_click_log | 히드로 클릭 로그 | dt, hash_id, goods_no, act_url, act_slot_id |
| `29cm`.mileage.t_mileage | 마일리지 마스터 (메타 정보) | user_no, merchant, merchant_key, type, amount, deleted_timestamp |
| `29cm`.mileage.t_mileage_history | 마일리지 지급 이력 (**지급일/사유 기준**) | mileage_history_no, mileage_no, user_no, detail_type, amount, insert_timestamp |
| `29cm`.mileage.t_mileage_accumulate_issue | 어드민 발행 메시지 | mileage_accumulate_issue_no, message |
| team.marketing.29cm_user_visit_segment_monthly | **공식 마케팅 세그먼트** | user_id, active_status, visit_frequency, partition_date |
| 29cm.member.t_user_level_history | 회원 등급 이력 (월별) | user_no, level_no, calculation_date |

## ⚠️ 새 지표 설계 전 필수 확인 (CRITICAL)

**브랜드홈/SRP/기타 탐색 지면 지표를 설계할 때는 반드시 먼저 탐색 헬퍼 쿼리를 실행해서 이벤트/컬럼 실제 채워진 값을 확인할 것.**

29CM 이벤트 로그는 Amplitude 지표 정의와 명칭이 다르고, 일반적으로 예상되는 이벤트들이 **존재하지 않는다**:

| 이벤트명 | 상태 |
|----------|------|
| `click_filter` | ❌ 존재하지 않음 |
| `apply_filter` | ❌ 존재하지 않음 |
| `select_filter` | ❌ 존재하지 않음 |
| `click_search` | ❌ 존재하지 않음 |
| `click_search_bar` | ❌ 존재하지 않음 |

→ 필터는 `click_button` 이벤트 안에서 `button_name` 또는 `facet_type_list`/`facet_value_list` 컬럼 값으로 구분해야 한다.

→ 탐색 헬퍼 쿼리 6종은 [query-patterns.md Section 19](references/query-patterns.md) 참조.

## 필터/패싯 트래킹 주의사항

| 지면 | filter_type/filter_value | filter_sorter | facet_type_list/facet_value_list | button_name |
|------|--------------------------|---------------|------------------------------------|-------------|
| brand_home | **비어있음** | O (정렬만) | 비어있음 | 일부 버튼만 |
| search_result (SRP) | 비어있음 | O | **O (94% 채워짐, 필수)** | 일부 버튼만 |
| category_list | 비어있음 | O | 일부 | 일부 |

**결론**:
- **SRP 필터 사용률** = `facet_type_list IS NOT NULL` 세션 비중으로 측정
- **SRP 필터별 사용률** = `facet_type_list` 값별 카운트
- **브랜드홈 단독/할인 필터**는 이벤트 로그로 **직접 측정 불가** → 세션당 impression/click 비교 등 간접 지표로 대체
- **브랜드홈 section_name은 100% 채워짐** → 섹션 구분 가능

## SRP facet 주요 값

| facet_type_list | 대표 facet_value_list |
|-----------------|----------------------|
| 상품정보 | 품절상품 제외, 무료배송, 할인상품만, 스페셜 상품(=단독상품 Parity), isSpecialProduct, isDiscount, excludeSoldOut, isFreeShipping |
| 카테고리 | (카테고리명, 콤마로 계층 결합: "여성의류,상의,전체") |
| 색상 | 블랙, 화이트, 아이보리, 그레이, 레드 ... |
| 가격대 | 10000~50000, 50000~100000 ... |
| 브랜드 | (개별 브랜드명) |
| 정렬 | 추천순, 최신순, 판매량순, 가격순 등 |

## ⚠️ 데이터 타입 주의사항

| 컬럼 | 타입 | 실제 값 | 올바른 사용법 |
|------|------|--------|--------------|
| `is_gift` | **VARCHAR** | **'T' / 'F'** | `is_gift = 'T'` (TRUE/FALSE, 'Y'/'N' 사용 불가!) |
| `dt` | **DATE** | 날짜 | `dt BETWEEN '2025-01-01' AND '2025-01-31'` |
| `user_no` | BIGINT | 숫자 | 이벤트 테이블 조인 시 `CAST(user_no AS STRING)` |

### 주문 취소/반품 필터 (CRITICAL)

- ❌ `cancel_yn` (존재하지 않는 컬럼!)
- ✅ `order_item_cancel_status_name` 사용

**실제 값 분포 (2026-04-02 기준)**:

| 값 | 건수 | 설명 |
|----|------|------|
| `주문_최초` | 76,574,300 | 정상 주문 (대다수) |
| `취소_배송전` | 6,723,938 | 배송 전 취소 |
| `취소_교환` | 1 | 교환으로 인한 취소 |
| `""` (빈 값) | 4,999 | 상태 미지정 |

**필터 패턴**:
  - 정상 주문만: `order_item_cancel_status_name = '주문_최초'`
  - 취소 건만: `order_item_cancel_status_name IN ('취소_배송전', '취소_교환')`
  - 전체 (취소 포함): 필터 없이 사용

> **GMV/매출 분석 시 취소/반품 제외가 필요하면 반드시 `order_item_cancel_status_name = '주문_최초'` 조건 추가**

### ⚠️ 주문 취소 고려 체크리스트 (CRITICAL)

**쿼리 작성 전 반드시 아래 체크리스트를 확인하고, 해당 케이스에는 `order_item_cancel_status_name = '주문_최초'` 필터를 적용할 것.**

> 과거 사례: 적립금 어뷰징 분석 시 취소 주문을 제외하지 않아 "적립금을 많이 받은 유저"에 취소 주문 건이 포함되어 분석 오류 발생.

#### 🔴 반드시 취소 제외해야 하는 케이스 (= `주문_최초`만 사용)

| 분석 유형 | 이유 |
|-----------|------|
| **GMV/매출/실적 집계** | 취소 건 포함 시 매출 과대 계상 |
| **적립금/마일리지 분석** (어뷰징, 적립 패턴 등) | 취소된 주문의 적립금은 회수되므로 실제 적립과 불일치 |
| **구매 패턴/구매 빈도 분석** | 취소 건 포함 시 실제 구매 행동과 괴리 |
| **AOV (평균 주문 금액)** | 취소 건 포함 시 평균값 왜곡 |
| **전환율 계산** (주문 완료 기준) | 취소된 주문은 실제 전환이 아님 |
| **쿠폰 사용 분석** | 취소 건의 쿠폰은 반환되므로 실사용과 불일치 |
| **유저별 구매 랭킹/TOP N** | 취소 건 포함 시 순위 왜곡 |
| **리텐션/재구매 분석** | 취소만 하고 실제 유지되지 않은 유저 포함됨 |

#### 🟡 취소 포함해도 되는 케이스 (= 필터 없이 사용)

| 분석 유형 | 이유 |
|-----------|------|
| **주문 트래픽/주문 시도 분석** | 취소 포함 시도 건수 자체가 분석 대상 |
| **취소율/반품율 분석** | 취소 건이 분석의 핵심 대상 |
| **CS 현황 분석** | 취소/반품 건수 추이 파악이 목적 |
| **주문 퍼널 (주문 시도 → 완료)** | 전체 시도 건 기준으로 퍼널 구성 |

#### 🔵 판단이 필요한 케이스

| 분석 유형 | 판단 기준 |
|-----------|-----------|
| **카테고리/브랜드별 주문 비중** | 실적 목적이면 취소 제외, 수요 파악 목적이면 포함 가능 |
| **선물하기 분석** | GMV 집계면 취소 제외, 선물 시도/패턴 분석이면 포함 가능 |
| **시간대별/요일별 주문 분석** | 수요 패턴이면 포함, 매출 집계면 취소 제외 |

#### 자동 적용 규칙

**쿼리 작성 시 다음 키워드가 포함되면 자동으로 `주문_최초` 필터 적용:**
- `GMV`, `매출`, `실적`, `수익`
- `적립금`, `마일리지`, `포인트`, `어뷰징`
- `AOV`, `객단가`, `평균 주문`
- `구매 패턴`, `구매 빈도`, `구매 횟수`
- `전환율`, `구매 전환`
- `쿠폰 사용`, `할인`
- `TOP`, `랭킹`, `순위`
- `리텐션`, `재구매`, `잔존`

**사용자가 명시적으로 "취소 포함"이라고 하지 않는 한, 위 키워드가 있으면 취소 제외를 기본으로 적용.**

### 카테고리 컬럼

- ❌ `category_no` (존재하지 않음)
- ✅ `large_category_code`, `large_category_name`
- ✅ `middle_category_code`, `middle_category_name`
- ✅ `small_category_code`, `small_category_name`

### 사용자 등급 컬럼

- ✅ `user_grade_code`, `user_grade_name`

## JOIN 패턴 & 유저 ID 매핑

### 테이블별 유저 ID 타입

| 테이블 | 유저 ID 컬럼 | 타입 | 비고 |
|--------|-------------|------|------|
| `29cm_mart_order` | user_no | BIGINT | 주문 테이블 |
| `snowplow_event_mart_daily` | user_id | STRING | Snowplow 이벤트 |
| `ga4_log` | hash_id | STRING | GA4 로그 |
| `user_partitioned` | hash_id | STRING | 유저 마스터 ⚠️ 권한 필요 |
| `amplitude_app_exposure_user_exp_daily_29cm` | user_id | STRING | A/B 테스트 (CAST AS INT) |
| `user_mart_29cm` | user_no | BIGINT | 유저 마트 |

### 주요 JOIN 패턴

```sql
-- 주문 ↔ Snowplow
CAST(order.user_no AS STRING) = event.user_id

-- GA4 ↔ 유저 마스터
ga4.hash_id = user.hash_id AND ga4.dt = user.dt

-- A/B 테스트 ↔ 주문
CAST(exp.user_id AS INT) = order.user_no

-- 세션-주문 매칭: session_id가 주문 테이블에 없으므로 "같은 날 같은 user 주문 여부" 프록시 사용
CAST(event.user_id AS STRING) = CAST(order.user_no AS STRING) AND DATE(event.event_timestamp) = order.dt
```

### GA4 vs Snowplow 선택 기준

| 분석 목적 | 테이블 | 이유 |
|-----------|--------|------|
| 웹 트래픽/PV 분석 | `lake.bigquery.ga4_log` | 웹 로그 수집 원천 |
| 앱 이벤트/퍼널 분석 | `snowplow_event_mart_daily` | 앱 이벤트 수집 원천 |
| UTM/캠페인 분석 | `29cm_session_traffic_log` | UTM 파라미터 포함 |
| 유저 속성별 분석 | `lake.gold.user_partitioned` ⚠️ 권한 필요 | age_band, gender 등 |

## 주요 이벤트명

### 기본 이벤트
| 이벤트명 | 설명 |
|----------|------|
| session_start | 세션 시작 |
| view_page | 페이지 조회 |
| visit_item_detail | PDP 방문 |
| click_checkout | 구매 클릭 |
| click_add_to_cart | 장바구니 담기 |
| view_search_results | 검색 결과 조회 |
| impression_item | 상품 노출 |
| click_item | 상품 클릭 |

## 상품/브랜드 컬럼

| 컬럼 | 설명 | 사용 예시 |
|------|------|----------|
| item_no | 상품번호 | 개별 상품 식별 |
| item_name | 상품명 | 상품 정보 표시 |
| brand_no | 브랜드번호 | 브랜드별 분석 |
| brand_name | 브랜드명 | 브랜드 정보 표시 |
| default_item_no | 기본 상품번호/테마 ID | 테마별 그룹핑에 활용 |
| item_position | 상품 노출 위치 | 위치별 클릭률 분석 |
| source | 상품 소스 | 예: related_item (추천 상품) |

## 유저 속성 컬럼

| 컬럼 | 설명 | 값 예시 |
|------|------|---------|
| gender | 성별 | m, f |
| age_range | 연령대 | 25-29, 35-39 |
| grade | 회원 등급 | beginner, follower |

## 분석 유형별 가이드

### 1. GMV 분석
- 매출: SUM(sales_sell_price)
- 기간 필터: `dt BETWEEN 시작일 AND 종료일`
- 카테고리별: `GROUP BY large_category_name, middle_category_name`
- 진입 지면별: 이벤트의 current_screen, page_name 활용

### 2. 선물하기 분석

**테이블 선택 기준:**
| 분석 목적 | 테이블 |
|-----------|--------|
| GMV, 비중, 카테고리별 | `29cm_mart_order` (`is_gift = 'T'`) |
| 구매자-수령자 관계, 중복 탐지 | `t_order_gift` (`receiver_user_no` 보유) |
| 건수 기준 (정확한 선물 건수) | `t_order_gift` (`COUNT(DISTINCT order_gift_no)`) |
| AOV (금액 + 건수) | 두 테이블 크로스 JOIN |

- 선물 여부: **`is_gift = 'T'`** (VARCHAR 타입, 'T'=선물, 'F'=일반)
- 선물 GMV: `SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END)`
- 선물 홈 방문: `event_name = 'visit_gift_main'`
- 테마 화면: `current_screen = 'gift_theme'`
- 테마 상품 노출: `event_name = 'impression_item_recommend' AND current_screen = 'gift_theme'`
- 테마 그룹 ID: `default_item_no` 컬럼 활용

**선물하기 이벤트:**
| 이벤트명 | current_screen | 설명 |
|----------|----------------|------|
| visit_gift_main | gift_main | 선물 메인 방문 |
| visit_gift_best | gift_best | 선물 베스트 방문 |
| visit_gift_detail | gift_detail | 선물 상세 방문 |
| view_gift_theme | search_start | 선물 테마 조회 |
| click_gift_theme | gift_main, search_start | 선물 테마 클릭 |
| impression_item_recommend | gift_theme | 테마 추천 상품 노출 |
| click_item_recommend | gift_theme | 테마 추천 상품 클릭 |
| visit_giftbox | giftbox | 선물함 방문 |
| click_button_gift_receive | gift_receive | 선물 수신 버튼 클릭 |

**선물하기 current_screen 값:**
| current_screen | 설명 |
|----------------|------|
| gift_main | 선물하기 메인 |
| gift_theme | 선물 테마 화면 (생일, 결혼/집들이 등) |
| gift_best | 선물 베스트 |
| gift_detail | 선물 상세 |
| gift_receive | 선물 수신 |
| giftbox | 선물함 |

### 3. 퍼널 분석
단계: 방문(session_start) → PDP(visit_item_detail) → 구매(click_checkout) → 주문완료(order 테이블)

### 4. 리텐션 분석
- 월별: DATE_TRUNC, ADD_MONTHS 활용
- N일차: DATEDIFF 활용

### 5. 코호트 분석 (전후 비교)
- 첫 행동 시점 기준 전/후 기간 비교
- CASE WHEN + 날짜 범위로 pre/post 구분

### 6. 카테고리/브랜드 탐색 분석
- 브랜드 탭 클릭률: view_page(분모) vs click_button(분자) 비교
- 주요 page_name: category_main, category_home, category_brand_index, brand_home
- 주요 이벤트: view_page, click_button, click_item, click_brand
- 참고: 탭 전환은 click_button 이벤트로 트래킹됨

### 7. VOC 분석
- 테이블: 29cm.front.voc_comments
- 유형별 분석: type 컬럼 (SUGGESTION, IMPROVEMENT, REPORT, COMPLIMENT)
- 플랫폼별 분석: platform_type 컬럼 (IOS, ANDROID, PC_WEB, M_WEB)
- 키워드 검색: content LIKE 패턴
- 기간 필터: DATE(created_at) BETWEEN 시작일 AND 종료일

### 8. 키즈(내 아이 정보) 분석
- 테이블: ocmp.onemember.onemember_custom_data
- ⚠️ **참고**: 키즈 정보는 무신사 ↔ 29CM 간 통합회원 정보로 동기화됨
- 키즈 정보 입력 고객 수 조회:

```sql
SELECT COUNT(1)
FROM ocmp.onemember.onemember_custom_data
WHERE category_code = 'KIDS'
  AND pii_attribute_data != '[]'
```

### 9. 발견탭 분석
- ⚠️ **데이터 시작일: 2025-11-19** (이전 날짜에는 데이터 없음)
- 발견탭 진입: `home_tab = 'discovery' AND event_name = 'view_page'`
- GV 전환율: 발견탭 진입 세션 중 상품상세(item_detail) 조회 비율
- 크로스카테고리 탐색: 발견탭 진입 후 2개 이상 다른 large_category_name 탐색 비율
- 상세 쿼리 예시: [references/schema.md](references/schema.md) 참조

### 10. 마일리지/적립금 분석
- **테이블**: `` `29cm`.mileage.t_mileage `` / `t_mileage_history` / `t_mileage_accumulate_issue`
- 🔴 **CRITICAL**: `deleted_timestamp IS NULL` 필터 필수 (두 테이블 모두!)
- 🔴 **어뷰징 분석 시**: `visible IS TRUE` 필터 추가 필수 (비노출 레코드 제외)
- 🔴 **CRITICAL (CMDATA-3141)**: **지급 내역 분석은 3테이블 JOIN 필수** — `t_mileage` 단독으로는 사유 복원 불충분
- **분석 목적별 테이블 선택**:
  - **지급 내역(사유/세분화)**: `t_mileage_history` + `t_mileage` + `t_mileage_accumulate_issue` JOIN → [query-patterns.md "적립금 지급 내역 표준 쿼리"](references/query-patterns.md)
  - 적립 현황(간편 요약): `t_mileage` (`type='ACCUMULATE'`)
  - 사용 현황(주문 연계): `29cm_mart_order.mileage_sale_amount` (취소 필터 용이)
  - 잔액: `t_mileage` (ACCUMULATE - USE)
- **앱테크/이벤트 merchant_key 패턴**:
  - `REWARD-S%` = 친구소개 (가입보상, 2,900원)
  - `REWARD-V%` = 마일리지챌린지 (방문보상, 29원)
  - `REWARD%` (10/15 이전) = 친구소개+마일리지챌린지 미분리
  - `TASTE_SWIPE_%` = 취향스와이프
  - `CARD_GAME_%` = 카드뒤집기(카드게임)
  - `O4O_GIFT%` = 오프라인 이벤트
- TIMESTAMP 날짜 필터: `completed_timestamp >= 'YYYY-MM-DD' AND completed_timestamp < 'YYYY-MM-DD'`

### 13. 유저 세그먼트 분석
- **테이블**: `team.marketing.29cm_user_visit_segment_monthly`
- 🔴 **CRITICAL (CMDATA-3141)**: 유저 활성도 세그먼트(휴면/저활성/활성)를 **임의 정의 금지** — 반드시 공식 마케팅 세그먼트 사용
- **active_status**: `Active`, `Churn`, `Inactive`, `Sleep`
- **visit_frequency** (Active 유저 한정): `AA`, `A` (고활성) / `B`, `C`, `D`, `Z` (저활성)
- 상세 쿼리: [query-patterns.md "유저 세그먼트"](references/query-patterns.md), [schema.md Section 30](references/schema.md)

### 11. 랭킹(베스트) 탭 분석
> **변경 이력**: 2026-03-18 베스트→랭킹 탭 UX 고도화 (브랜드 탭 추가). 선물하기 탭은 2026-04-01 배포.
- 진입 이벤트: `view_page` + `page_name = 'best_main'`
- 상품 클릭: `click_item` + `page_name = 'best_main'`
- PDP 진입: 세션 시퀀스 기반 (`best_main` 진입 후 같은 세션에서 `view_page` + `item_detail`)
- **⚠️ 귀속 기준**: 유저 기반 기간 내 overlap 사용 금지 → 세션 시퀀스 또는 동일일 귀속
- **선물탭 이벤트** (2026-04-01~): `visit_gift_best`, `click_tab_gift_main`

### 12. 브랜드홈 3열/SRP 패싯 분석
- **브랜드홈 배포 전후 비교**: 세션당 impression_item, click_item, CTR, CVR
- **SRP 필터 사용률**: `facet_type_list IS NOT NULL` 세션 비중
- **패싯별 CVR**: 해당 facet 적용 세션의 order 전환율
- **⚠️ previous_page_name 비어있음**: 일부 경로(search_start, search_result)에서 미기록 → 세션 시퀀스 기반 전환 분석 사용
- 상세 쿼리: [references/query-patterns.md Section 16~19](references/query-patterns.md)

VOC 테이블 컬럼:

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT | VOC 고유 ID (PK) |
| user_id | INT | 작성자 유저 ID |
| user_level | STRING | 유저 등급 (LV1~LV9) |
| user_grade | STRING | 유저 그레이드 (nullable) |
| type | STRING | VOC 유형 |
| content | STRING | VOC 내용 본문 |
| platform_type | STRING | 작성 플랫폼 |
| is_usable | INT | 사용 가능 여부 (0, 1) |
| is_answer | INT | 답변 완료 여부 (0, 1) |
| version | INT | 버전 |
| created_at | TIMESTAMP | 생성 일시 |
| updated_at | TIMESTAMP | 수정 일시 |

## Databricks SQL 함수 예시

### 날짜 함수
```sql
-- 현재 날짜 기준 N일 전
DATE_ADD(CURRENT_DATE(), -30)

-- 날짜 범위 필터
DATE(event_timestamp) BETWEEN '2024-01-01' AND '2024-01-31'

-- 월 단위 집계
DATE_TRUNC('month', event_timestamp)
```

### 배열 함수
```sql
-- 고유값 수집
COLLECT_SET(column_name)

-- 배열 교집합/합집합
ARRAY_INTERSECT(array1, array2)
ARRAY_UNION(array1, array2)

-- 배열 크기
SIZE(array_column)
```

### NULL 처리
```sql
-- NULL 제외 필터
WHERE column IS NOT NULL AND column != ''

-- NULL 대체
COALESCE(column, 'default_value')
IFNULL(column, 0)
```

## 상세 참조

- 테이블 스키마: [references/schema.md](references/schema.md)
- CE 지표 정의: [references/ce-metrics.md](references/ce-metrics.md)
- 쿼리 패턴 예시: [references/query-patterns.md](references/query-patterns.md)

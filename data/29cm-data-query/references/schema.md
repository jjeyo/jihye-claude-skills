# 29CM 테이블 스키마

> ⚠️ **쿼리 작성 전 반드시 이 스키마를 확인하세요!**

## 1. 주문 테이블

**테이블명**: `datamart.datamart.29cm_mart_order`

### 기본 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | DATE | 주문 일자 (파티션 키) |
| insert_timestamp | TIMESTAMP | 데이터 입력 시간 |
| pay_timestamp | TIMESTAMP | 결제 시간 |
| order_no | BIGINT | 주문번호 |
| order_serial | VARCHAR | 주문 시리얼 |
| order_item_no | BIGINT | 주문 아이템 번호 |
| order_item_manage_no | BIGINT | 주문 아이템 관리 번호 |

### 상품 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| item_no | BIGINT | 상품번호 |
| item_name | VARCHAR | 상품명 |
| option_no | BIGINT | 옵션번호 |
| option_code | VARCHAR | 옵션코드 |
| option_name | VARCHAR | 옵션명 |
| custom_option_value | VARCHAR | 커스텀 옵션 값 |
| item_type_code | BIGINT | 상품 유형 코드 |
| item_type_name | STRING | 상품 유형명 |
| item_tax_code | BIGINT | 과세 코드 |
| item_tax_name | STRING | 과세명 |

### 카테고리 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| large_category_code | BIGINT | 대분류 카테고리 코드 |
| **large_category_name** | STRING | 대분류 카테고리명 |
| middle_category_code | BIGINT | 중분류 카테고리 코드 |
| **middle_category_name** | STRING | 중분류 카테고리명 |
| small_category_code | BIGINT | 소분류 카테고리 코드 |
| small_category_name | STRING | 소분류 카테고리명 |

### 브랜드/파트너 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| partner_no | BIGINT | 파트너 번호 |
| partner_name | VARCHAR | 파트너명 |
| partner_brand_no | BIGINT | 파트너 브랜드 번호 |
| partner_brand_name | VARCHAR | 파트너 브랜드명 |
| front_brand_no | BIGINT | 프론트 브랜드 번호 |
| front_brand_name | VARCHAR | 프론트 브랜드명 |
| front_brand_name_eng | VARCHAR | 프론트 브랜드 영문명 |

### 사용자 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_no | BIGINT | 유저 고유번호 |
| gender | VARCHAR | 성별 |
| birth_year | BIGINT | 출생연도 |
| user_grade_code | BIGINT | 유저 등급 코드 |
| **user_grade_name** | STRING | 유저 등급명 |

### 주문/결제 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| **is_gift** | **VARCHAR** | 선물 여부 (**'T'**=선물, **'F'**=일반) ⚠️ BOOLEAN 아님! |
| is_internal_fulfillment | BOOLEAN | 내부 풀필먼트 여부 |
| device_type_code | BIGINT | 디바이스 유형 코드 |
| device_type_name | STRING | 디바이스 유형명 |
| pay_type_code | BIGINT | 결제 유형 코드 |
| pay_type_name | STRING | 결제 유형명 |
| card_name | VARCHAR | 카드명 |
| card_code | VARCHAR | 카드 코드 |
| pg_site_no | BIGINT | PG사 사이트 번호 |
| supply_type_code | BIGINT | 공급 유형 코드 |
| supply_type_name | STRING | 공급 유형명 |

### 금액 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| order_count | BIGINT | 주문 수량 |
| order_count_init | BIGINT | 초기 주문 수량 |
| order_count_cancel | INT | 취소 수량 |
| order_count_return | INT | 반품 수량 |
| unit_supply_price | BIGINT | 단위 공급가 |
| unit_sell_price | BIGINT | 단위 판매가 |
| unit_consumer_price | BIGINT | 단위 소비자가 |
| unit_option_supply_price | BIGINT | 단위 옵션 공급가 |
| unit_option_sell_price | BIGINT | 단위 옵션 판매가 |
| **sales_sell_price** | BIGINT | 판매 금액 (GMV 계산용) |
| sales_margin_amount | DOUBLE | 마진 금액 |
| margin_rate | DOUBLE | 마진율 |
| delivery_amount | BIGINT | 배송비 |

### 쿠폰/마일리지 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| unit_mileage_sale_amount | DOUBLE | 단위 적립금 사용 금액 (단위 수량 기준) |
| **mileage_sale_amount** | DOUBLE | **적립금 사용 금액** (아이템 레벨. 보고서에서 "mileage_amount"로 약칭되기도 하나 실제 컬럼명은 `mileage_sale_amount`) |
| pre_discount_mileage_amount | DECIMAL | 할인 전 적립금 금액 |
| unit_coupon_sale_amount | BIGINT | 단위 쿠폰 할인 |
| coupon_sale_amount | BIGINT | 쿠폰 할인 금액 |
| order_coupon_no | BIGINT | 주문 쿠폰 번호 |
| order_coupon_name | VARCHAR | 주문 쿠폰명 |
| order_coupon_sale_rate | DOUBLE | 주문 쿠폰 할인율 |
| order_coupon_sale_price | BIGINT | 주문 쿠폰 할인가 |
| order_item_coupon_no | BIGINT | 주문 아이템 쿠폰 번호 |
| order_item_coupon_name | VARCHAR | 주문 아이템 쿠폰명 |
| order_item_coupon_sale_rate | DOUBLE | 주문 아이템 쿠폰 할인율 |
| order_item_coupon_sale_price | BIGINT | 주문 아이템 쿠폰 할인가 |

> ⚠️ **mileage_amount ≠ 실제 컬럼명**: 리포트/슬랙에서 "mileage_amount"라고 부르더라도 **실제 컬럼명은 `mileage_sale_amount`** 이며, `mileage_amount` 컬럼은 존재하지 않음.
>
> **단위 적립금과 합계 적립금 관계**:
> `SUM(unit_mileage_sale_amount * order_count) = SUM(mileage_sale_amount)` (동일값 생성)
> — 수량 × 단위로 적립금 총액을 재현할 수 있으나, 직접 `mileage_sale_amount` 집계 권장.

### 취소/반품 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| order_item_cancel_status_code | BIGINT | 취소 상태 코드 |
| order_item_cancel_status_name | STRING | 취소 상태명 (`주문_최초`, `취소_배송전`, `취소_교환`, `""` 빈값) |
| return_type | STRING | 반품 유형 |
| return_type_name | STRING | 반품 유형명 |
| order_as_no | STRING | AS 번호 |

#### ⚠️ 주문 취소/반품 필터링 규칙 (CRITICAL)

**`cancel_yn` 컬럼은 존재하지 않음!** 반드시 `order_item_cancel_status_name` 사용.

**실제 값 분포 (2026-04-02 기준)**:

| 값 | 건수 | 설명 |
|----|------|------|
| `주문_최초` | 76,574,300 | 정상 주문 (대다수) |
| `취소_배송전` | 6,723,938 | 배송 전 취소 |
| `취소_교환` | 1 | 교환으로 인한 취소 |
| `""` (빈 값) | 4,999 | 상태 미지정 |

| 목적 | 필터 조건 |
|------|-----------|
| 정상 주문만 (취소 제외) | `order_item_cancel_status_name = '주문_최초'` |
| 취소 건만 | `order_item_cancel_status_name IN ('취소_배송전', '취소_교환')` |
| 전체 (취소 포함) | 필터 없이 사용 |

```sql
-- ✅ 정상 주문만 조회 (취소/반품 제외)
WHERE order_item_cancel_status_name = '주문_최초'

-- ❌ 잘못된 사용 (cancel_yn 컬럼은 존재하지 않음!)
WHERE cancel_yn = 'N'
```

### MD 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| md_admin_no | BIGINT | MD 관리자 번호 |
| md_code | BIGINT | MD 코드 |
| md_name | STRING | MD명 |

---

## 2. 이벤트 테이블

**테이블명**: `team.tech.cda_29cm_snowplow_event_mart_daily`

### 주요 컬럼

#### 식별자
| 컬럼 | 설명 |
|------|------|
| user_id | 사용자 ID (STRING) |
| device_id | 디바이스 ID |
| session_id | 세션 ID |
| event_id | 이벤트 ID |

#### 시간
| 컬럼 | 설명 |
|------|------|
| dt | 이벤트 일자 (DATE, 파티션) |
| event_timestamp | 이벤트 발생 시간 |
| collector_tstamp | 수집 시간 |

#### 이벤트 정보
| 컬럼 | 설명 |
|------|------|
| event_name | 이벤트명 |
| event_type | 이벤트 유형 |
| app_id | 앱 ID |
| platform | 플랫폼 (web, ios, android) |
| brand_name | STRING | 브랜드명 |
| item_name | STRING | 상품명 |

#### 화면/페이지 정보
| 컬럼 | 설명 |
|------|------|
| current_screen | 현재 화면 |
| page_name | 페이지명 |
| page_url | 페이지 URL |
| page_referrer | 이전 페이지 |

#### 상품 관련 (PDP)
| 컬럼 | 설명 |
|------|------|
| item_no | 상품 번호 |
| item_name | 상품명 |
| brand_no | 브랜드 번호 |
| brand_name | 브랜드명 |

### 주요 event_name 목록

| event_name | 설명 |
|------------|------|
| session_start | 세션 시작 |
| visit_item_detail | PDP 방문 |
| click_checkout | 구매 버튼 클릭 |
| add_to_cart | 장바구니 담기 |
| click_like | 좋아요 클릭 |
| click_brand_follow | 브랜드 팔로우 |
| view_home | 홈 탭 진입 |
| view_discovery | 발견 탭 진입 |
| view_search_results | 검색 결과 조회 |

### 필터/패싯/정렬 컬럼 ★ 29CM에서 자주 오해되는 부분

| 컬럼 | 실제 활용 현황 |
|------|--------------|
| `filter_type` / `filter_value` | **현재 브랜드홈/SRP 모두 비어있음** (레거시 컬럼) |
| `filter_sorter` | **정렬 옵션**. 브랜드홈/SRP 모두 활성. 값: RECOMMENDED / NEWEST / MOST_SOLD / LOWEST_PRICE / HIGHEST_PRICE / HIGHEST_DISCOUNT |
| **`facet_type_list`** | **SRP 필터의 핵심 컬럼.** click_button에서 94% 채워짐. 값: 카테고리 / 색상 / 가격대 / 브랜드 / 상품정보 / 정렬 |
| **`facet_value_list`** | **SRP 필터 값**. 콤마로 여러 값 결합 (예: "여성의류,상의,전체") |
| `section_name` | 섹션명. impression/click 이벤트에 거의 항상 채워짐 (브랜드홈 100%) |
| `button_name` | 버튼명. 탭 전환·일부 필터·검색 포함 |
| `previous_page_name` | 이전 페이지 (**일부 경로에서 미기록** — 브랜드홈→검색 등. 세션 시퀀스 기반 전환 분석 권장) |

#### 29CM에 존재하지 않는 이벤트명 ❌

`click_filter`, `apply_filter`, `select_filter`, `click_search`, `click_search_bar`

→ 필터/검색 액션은 모두 `click_button` 이벤트 안에서 `button_name` 또는 `facet_type_list`/`facet_value_list` 컬럼으로 구분.

### 주요 page_name 값

| page_name | 설명 |
|-----------|------|
| category_main | 카테고리 메인 페이지 |
| category_home | 카테고리 홈 |
| category_list | 카테고리 리스트 (상품 목록) |
| category_tab | 카테고리 탭 |
| category_brand_index | 브랜드 인덱스 페이지 (브랜드 탭) |
| brand_home | 브랜드 홈 페이지 |
| brand_news | 브랜드 뉴스 |
| brand_choice | 브랜드 추천 |
| search_start | 검색 시작 페이지 (검색창 진입) |
| search_result | 검색결과 페이지 (SRP) |
| search_autocomplete | 검색 자동완성 |
| item_detail | 상품상세 (PDP) |
| checkout | 체크아웃 |
| cart | 장바구니 |
| best_main | 랭킹(베스트) 탭 메인 |
| home_main | 홈 메인 |

### 주요 이벤트명 (추가)

| 이벤트명 | 설명 |
|---------|------|
| view_page | 페이지 진입/조회 |
| click_item | 상품 클릭 |
| click_brand | 브랜드 클릭 |
| click_category | 카테고리 클릭 |
| click_button | 버튼 클릭 (탭 전환·필터·검색 포함 — 29CM는 대부분 이 이벤트 안에서 구분) |
| impression_item | 상품 노출 |
| impression_brand | 브랜드 노출 |
| impression_category | 카테고리 노출 |
| impression_content | 컨텐츠 노출 |
| visit_search_start | 검색창 진입 |
| visit_search_result | 검색결과 페이지 진입 |
| visit_brand_home | 브랜드홈 진입 |

### 브랜드홈(brand_home) 이벤트 분포 실측치 (2026-03 기준)

| event_name | 볼륨 | 용도 |
|---|---|---|
| impression_item | 3.7B | 상품 노출 (세션당 노출 밀도 분석 핵심) |
| click_item | 88M | 상품 클릭 |
| view_page | 59M | 브랜드홈 진입 (세션 분모) |
| impression_content | 24M | 컨텐츠(배너) 노출 |
| click_button | 13M | 쿠폰 받기 / 상품보기 버튼 등 |

> **브랜드홈 필터/검색 트래킹 한계**: `filter_type`, `filter_value`, `tag`, `tab_name` 모두 비어있음. `filter_sorter`만 활성화(정렬만 추적). 단독/할인 필터 토글 및 검색 → **현재 이벤트 로그로 직접 측정 불가**.

### SRP(search_result) 이벤트 분포 실측치 (2026-03 기준)

| event_name | 볼륨 | filter/facet 채워진 비율 |
|---|---|---|
| impression_item | 413M | filter_sorter 89%, facet_value_list 17%, keyword 73% |
| click_item | 12M | filter_sorter 90%, facet_value_list 18%, keyword 67% |
| click_button | 1.5M | **facet_type_list 94%, facet_value_list 61%** |

> **SRP 필터 트래킹 규칙**: SRP 필터는 `click_filter` 이벤트가 아니라 **`click_button` + `facet_type_list`/`facet_value_list`** 로 추적. `filter_type`/`filter_value`는 SRP에서도 비어있음.

---

## 3. VOC 테이블

**테이블명**: `29cm.front.voc_comments`

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT | VOC 고유 ID (PK) |
| user_id | INT | 작성자 유저 ID |
| user_level | STRING | 유저 등급 (LV1~LV9) |
| user_grade | STRING | 유저 그레이드 (nullable) |
| type | STRING | VOC 유형 (SUGGESTION/IMPROVEMENT/REPORT/COMPLIMENT) |
| content | STRING | VOC 내용 본문 |
| platform_type | STRING | 작성 플랫폼 (IOS/ANDROID/PC_WEB/M_WEB) |
| is_usable | INT | 사용 가능 여부 (0, 1) |
| is_answer | INT | 답변 완료 여부 (0, 1) |
| version | INT | 버전 |
| created_at | TIMESTAMP | 생성 일시 |
| updated_at | TIMESTAMP | 수정 일시 |

### VOC 유형 (type)

| 값 | 설명 |
|----|------|
| SUGGESTION | 제안 |
| IMPROVEMENT | 개선 요청 |
| REPORT | 신고 |
| COMPLIMENT | 칭찬 |

---

## 4. 선물 주문 테이블

**테이블명**: `` `29cm`.orders.t_order_gift ``

> ⚠️ 선물하기 raw 데이터 테이블. 구매자-수령자 관계, 중복 선물 탐지, 선물 건수 기준 분석에 사용.
> 선물 GMV/비중 등 금액 집계는 `datamart.datamart.29cm_mart_order`의 `is_gift = 'T'`를 우선 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| order_gift_no | BIGINT | 선물 주문 고유번호 (PK) |
| inserted_timestamp | TIMESTAMP | 주문 입력 시간 |
| buyer_user_id | BIGINT | 구매자 유저 ID |
| receiver_user_no | BIGINT | 수령자 유저 번호 |
| gift_token | VARCHAR | 선물 토큰 |

### 사용 시 주의사항

- `dt` 파티션 키가 없으므로 날짜 필터 시 `CAST(inserted_timestamp AS DATE)` 변환 필요
- 금액 정보 없음 — AOV 등 금액 필요 시 `29cm_mart_order`와 크로스 테이블 JOIN
- 건수 집계 시 `COUNT(DISTINCT order_gift_no)` 사용 (`COUNT(*)` 대신)

### 테이블 선택 가이드 (선물하기)

| 분석 목적 | 사용 테이블 | 이유 |
|-----------|------------|------|
| 선물 GMV, 비중, 카테고리별 | `29cm_mart_order` (`is_gift = 'T'`) | 금액/카테고리 정보 포함 |
| 구매자-수령자 관계, 중복 탐지 | `t_order_gift` | receiver_user_no 컬럼 보유 |
| 선물 건수 기준 분석 | `t_order_gift` | order_gift_no로 정확한 건수 집계 |
| AOV (금액 + 건수 모두 필요) | 두 테이블 크로스 JOIN | GMV는 mart, 건수는 raw에서 |

---

## 5. JOIN 규칙

### 주문 테이블 ↔ 이벤트 테이블

### 주문 테이블 ↔ 선물 주문 테이블

주문 테이블과 선물 주문 테이블을 JOIN할 때는 월 단위로 각각 집계한 뒤 LEFT JOIN:

```sql
-- GMV는 mart, 건수는 raw에서 가져와 월별 JOIN
base_gmv AS (
    SELECT DATE_TRUNC('MONTH', dt) AS order_month, SUM(sales_sell_price) AS gmv
    FROM datamart.datamart.29cm_mart_order
    WHERE is_gift = 'T' AND dt BETWEEN ... AND ...
    GROUP BY order_month
),
base_count AS (
    SELECT DATE_TRUNC('MONTH', CAST(inserted_timestamp AS DATE)) AS order_month,
           COUNT(DISTINCT order_gift_no) AS order_count
    FROM `29cm`.orders.t_order_gift
    WHERE CAST(inserted_timestamp AS DATE) BETWEEN ... AND ...
    GROUP BY order_month
)
SELECT g.order_month, g.gmv, COALESCE(c.order_count, 0) AS order_count
FROM base_gmv g LEFT JOIN base_count c ON g.order_month = c.order_month
```

주문 테이블의 `user_no`는 INT 타입이고, 이벤트 테이블의 `user_id`는 STRING 타입이므로 **반드시 형변환 필요**:

```sql
CAST(order.user_no AS STRING) = event.user_id
```

> ⚠️ 주의: 주문 테이블의 user_no는 BIGINT 타입이고, 이벤트 테이블의 user_id는 STRING 타입이므로 반드시 형변환 필요.

---

## 6. 자주 하는 실수

| 실수 | 올바른 방법 |
|------|------------|
| `is_gift = TRUE` | `is_gift = 'T'` |
| `is_gift = 1` | `is_gift = 'T'` |
| `is_gift = 'Y'` | `is_gift = 'T'` |
| `is_gift = true` | `is_gift = 'T'` |
| `category_no` 사용 | `large_category_code` 또는 `large_category_name` 사용 |
| `DATE(dt)` | `dt` (이미 DATE 타입) |

### is_gift 값 정리

| 값 | 의미 |
|----|------|
| **'T'** | 선물 주문 (True) |
| **'F'** | 일반 주문 (False) |

---

## 7. 발견탭(Discovery) 분석 가이드

### ⚠️ 중요 주의사항
- **발견탭(discovery) 데이터 시작일: 2025-11-19**
- 이전 날짜로 쿼리 시 결과가 없음

### home_tab 컬럼 값

| 값 | 설명 | 비고 |
|----|------|------|
| `discovery` | 발견탭 | 2025-11-19 이후 데이터만 존재 |
| `women` | 여성 탭 | |
| `men` | 남성 탭 | |
| `home` | 홈 탭 | |
| `life` | 라이프 탭 | |
| `beauty` | 뷰티 탭 | |
| `tech` | 테크 탭 | |
| `web` | 웹 | |

### 발견탭 관련 이벤트 정의

#### 페이지 조회 이벤트
| 이벤트 | 조건 | 설명 |
|--------|------|------|
| 발견탭 진입 | `home_tab = 'discovery' AND event_name = 'view_page'` | 발견탭 페이지 조회 |
| GV (상품 상세) | `event_name = 'view_page' AND page_name = 'item_detail'` | 상품 상세 페이지 조회 |
| 홈탭 진입 | `home_tab = 'home' AND event_name = 'view_page'` | 홈탭 페이지 조회 |

#### 클릭 이벤트
| 이벤트 | 조건 | 설명 |
|--------|------|------|
| 상품 클릭 | `event_name = 'click_item'` | 상품 클릭 |
| 브랜드 클릭 | `event_name = 'click_brand'` | 브랜드 클릭 |
| 콘텐츠 클릭 | `event_name = 'click_content'` | 콘텐츠 클릭 |
| 버튼 클릭 | `event_name = 'click_button'` | 버튼 클릭 |

#### 노출 이벤트
| 이벤트 | 조건 | 설명 |
|--------|------|------|
| 상품 노출 | `event_name = 'impression_item'` | 상품 노출 |
| 브랜드 노출 | `event_name = 'impression_brand'` | 브랜드 노출 |
| 콘텐츠 노출 | `event_name = 'impression_content'` | 콘텐츠 노출 |

#### 피드 이벤트
| 이벤트 | 조건 | 설명 |
|--------|------|------|
| 피드 조회 | `event_name = 'view_feed'` | 피드 조회 |
| 피드 상품 노출 | `event_name = 'impression_item_feed'` | 피드 내 상품 노출 |
| 피드 상품 클릭 | `event_name = 'click_item_feed'` | 피드 내 상품 클릭 |

### 랭킹(베스트) 탭 이벤트 정의

> ⚠️ **변경 이력**: 2026-03-18 기존 "베스트" 탭이 "랭킹" 탭으로 UX 고도화. 상품 외에 **브랜드 탭** 추가. **선물하기 탭**은 2026-04-01 배포.

#### page_name / current_screen 매핑

| 화면 | page_name | current_screen | 비고 |
|------|-----------|----------------|------|
| 랭킹 탭 메인 (상품) | `best_main` | - | 진입 이벤트 기준 |
| 랭킹 탭 좋아요 | - | `best_main` | like_item, unlike_item |
| 랭킹 선물 탭 | - | `gift_best` | 2026-04-01 배포 |
| 큐레이터 판매랭킹 | `curator_product_sales_ranking` | - | 별도 서브 페이지 |
| PDP (상품 상세) | `item_detail` | - | `view_page` + `page_name = 'item_detail'` |
| 브랜드 홈 | `brand_home` | - | `view_page` + `page_name = 'brand_home'` |

#### 주요 이벤트 (P0 기준)

| 이벤트 | 설명 | 탭 |
|--------|------|-----|
| `view_page` (page_name=`best_main`) | 랭킹 탭 진입 | 공통 |
| `click_item` (page_name=`best_main`) | 상품 클릭 | 상품/선물 |
| `click_category` (page_name=`best_main`) | 카테고리 탭 클릭 (1~3depth) | 공통 |
| `click_button` (page_name=`best_main`) | 탭 전환(상품/브랜드/선물), 필터(성별/연령/시간/정렬), 그리드 변경 | 공통 |
| `impression_item` (page_name=`best_main`) | 상품 노출 (item_position으로 순서 파악) | 상품/선물 |
| `impression_content` (page_name=`best_main`) | 주목받는 카테고리/신규 브랜드 모듈 노출 | 상품/브랜드 |
| `click_content` (page_name=`best_main`) | 주목받는 카테고리/브랜드명 클릭 | 상품/브랜드 |
| `like_item` (current_screen=`best_main`) | 좋아요 | 상품/선물 |
| `visit_gift_best` (current_screen=`gift_best`) | 선물 베스트 진입 | 선물 (4/1~) |
| `click_tab_gift_main` (current_screen=`gift_best`) | 선물 탭 전환 | 선물 (4/1~) |

#### 분석 시 주의사항

1. **날짜 필터**: 이 테이블에 `dt` 컬럼 없음. 반드시 `DATE(event_timestamp)` 사용
2. **PDP 이벤트**: `visit_item_detail` 아님! → `view_page` + `page_name = 'item_detail'`
3. **귀속 기준**: 전후 비교 시 유저 기반(기간 내 overlap)이 아닌 **세션 시퀀스 기반** 또는 **동일일 귀속** 사용 권장
4. **Before/After 기간 차이 보정**: 기간 일수가 다를 경우 반드시 **일평균**으로 비교
5. **브랜드 탭**: 2026-03-18 추가. Before 기간에는 랭킹→브랜드홈 직접 동선 없음
6. **선물 탭**: 2026-04-01 배포. 3월 데이터로 선물 분석 불가

#### 전후 비교 쿼리 패턴 (권장)

```sql
-- 세션 시퀀스 기반 전환율 (예: PDP 진입율)
WITH best_entry AS (
    SELECT
        CASE
            WHEN DATE(event_timestamp) BETWEEN '2026-03-01' AND '2026-03-17' THEN 'Before'
            WHEN DATE(event_timestamp) BETWEEN '2026-03-18' AND '2026-03-31' THEN 'After'
        END AS period,
        session_id,
        MIN(event_timestamp) AS entry_ts
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE DATE(event_timestamp) BETWEEN '2026-03-01' AND '2026-03-31'
      AND event_name = 'view_page'
      AND page_name = 'best_main'
    GROUP BY 1, session_id
),
pdp_after AS (
    SELECT DISTINCT be.period, be.session_id
    FROM best_entry be
    JOIN team.tech.cda_29cm_snowplow_event_mart_daily e
        ON be.session_id = e.session_id
        AND e.event_timestamp >= be.entry_ts
    WHERE e.event_name = 'view_page' AND e.page_name = 'item_detail'
)
SELECT
    be.period,
    COUNT(DISTINCT be.session_id) AS entry_sessions,
    COUNT(DISTINCT pa.session_id) AS pdp_sessions,
    ROUND(COUNT(DISTINCT pa.session_id) * 100.0
        / NULLIF(COUNT(DISTINCT be.session_id), 0), 2) AS pdp_rate_pct
FROM best_entry be
LEFT JOIN pdp_after pa ON be.period = pa.period AND be.session_id = pa.session_id
WHERE be.period IS NOT NULL
GROUP BY be.period
```

```sql
-- 동일일 귀속 CVR (유저 기반 기간 overlap 지양)
WITH best_visitors_daily AS (
    SELECT DISTINCT
        CASE
            WHEN DATE(event_timestamp) BETWEEN '2026-03-01' AND '2026-03-17' THEN 'Before'
            WHEN DATE(event_timestamp) BETWEEN '2026-03-18' AND '2026-03-31' THEN 'After'
        END AS period,
        user_id,
        DATE(event_timestamp) AS visit_date
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE DATE(event_timestamp) BETWEEN '2026-03-01' AND '2026-03-31'
      AND event_name = 'view_page'
      AND page_name = 'best_main'
)
SELECT
    bv.period,
    COUNT(DISTINCT bv.user_id) AS entry_uv,
    COUNT(DISTINCT CASE WHEN o.order_no IS NOT NULL THEN bv.user_id END) AS purchase_uv,
    ROUND(COUNT(DISTINCT CASE WHEN o.order_no IS NOT NULL THEN bv.user_id END) * 100.0
        / NULLIF(COUNT(DISTINCT bv.user_id), 0), 2) AS cvr_pct
FROM best_visitors_daily bv
LEFT JOIN datamart.datamart.29cm_mart_order o
    ON bv.user_id = CAST(o.user_no AS STRING) AND bv.visit_date = o.dt
WHERE bv.period IS NOT NULL
GROUP BY bv.period
```

---

### 발견탭 분석용 컬럼

| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| partition_date | DATE | 파티션 날짜 | 2025-12-22 |
| partition_datetime | TIMESTAMP | 파티션 일시 | 2025-12-22 18:00:00 |
| event_timestamp | TIMESTAMP | 이벤트 발생 일시 | 2025-12-22 18:16:10.815 |
| session_id | STRING | 세션 ID (UUID) | 99c78c0e-7be6-4f44-a617-540206f7cd96 |
| user_id | INT | 회원 번호 | 6245725 |
| event_name | STRING | 이벤트명 | view_page, click_item |
| page_name | STRING | 페이지명 | item_detail, home |
| home_tab | STRING | 홈탭 구분 | discovery, women, men, home, life, beauty, tech, web |
| tab | STRING | 탭 구분 | - |
| section_name | STRING | 섹션명 | GridThumbnailCarousel |
| platform | STRING | 플랫폼 | ios, android, web |
| large_category_name | STRING | 대카테고리 | 여성의류, 남성의류, 뷰티 |
| middle_category_name | STRING | 중카테고리 | 상의, 하의 |
| small_category_name | STRING | 소카테고리 | 스웨트셔츠 |
| brand_no | INT | 브랜드 번호 | 8147 |
| brand_name | STRING | 브랜드명 | 시티브리즈 |
| item_no | INT | 상품 번호 | 3015979 |
| item_name | STRING | 상품명 | 시트러스 그래픽 스웨트 셔츠_NAVY |
| price | INT | 정가 | 80100 |
| best_price | INT | 최저가 | 58447 |
| discount_rate | INT | 할인율 | 19 |

### 대카테고리 (large_category_name) 목록

| 카테고리 |
|----------|
| 여성의류 |
| 남성의류 |
| 여성신발 |
| 남성신발 |
| 여성가방 |
| 남성가방 |
| 여성액세서리 |
| 남성액세서리 |
| 뷰티 |
| 가구,인테리어 |
| 주방,생활 |
| 가전 |
| 컴퓨터,디지털 |
| 푸드 |
| 유아,아동 |
| 레저 |
| 컬처 |

---

## 8. 발견탭 예시 쿼리

### 발견탭 진입→GV 전환율

```sql
-- 발견탭 진입→GV 전환율 분석
-- ⚠️ partition_date >= '2025-11-19' 필수 (발견탭 데이터 시작일)

WITH discovery_sessions AS (
    SELECT DISTINCT
        partition_date,
        session_id,
        user_id
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE partition_date BETWEEN '2025-11-19' AND '2025-12-22'
      AND home_tab = 'discovery'
      AND event_name = 'view_page'
),

gv_sessions AS (
    SELECT DISTINCT
        d.partition_date,
        d.session_id
    FROM discovery_sessions d
    INNER JOIN team.tech.cda_29cm_snowplow_event_mart_daily e
        ON d.session_id = e.session_id
        AND d.partition_date = e.partition_date
    WHERE e.event_name = 'view_page'
      AND e.page_name = 'item_detail'
)

SELECT
    d.partition_date AS 기준일,
    COUNT(DISTINCT d.session_id) AS 발견탭_진입_세션,
    COUNT(DISTINCT g.session_id) AS GV_세션,
    ROUND(COUNT(DISTINCT g.session_id) * 100.0 / NULLIF(COUNT(DISTINCT d.session_id), 0), 2) AS 진입_대비_GV율_pct
FROM discovery_sessions d
LEFT JOIN gv_sessions g
    ON d.session_id = g.session_id
    AND d.partition_date = g.partition_date
GROUP BY d.partition_date
ORDER BY d.partition_date;
```

### 크로스카테고리 탐색 분석

```sql
-- 발견탭 진입 후 2개 이상 다른 카테고리 탐색 비율

WITH discovery_sessions AS (
    SELECT DISTINCT
        partition_date,
        session_id
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE partition_date BETWEEN '2025-11-19' AND '2025-12-22'
      AND home_tab = 'discovery'
      AND event_name = 'view_page'
),

category_views AS (
    SELECT
        d.session_id,
        e.large_category_name
    FROM discovery_sessions d
    INNER JOIN team.tech.cda_29cm_snowplow_event_mart_daily e
        ON d.session_id = e.session_id
        AND d.partition_date = e.partition_date
    WHERE e.event_name = 'view_page'
      AND e.page_name = 'item_detail'
      AND e.large_category_name IS NOT NULL
      AND e.large_category_name != ''
),

session_category_count AS (
    SELECT
        session_id,
        COUNT(DISTINCT large_category_name) AS category_cnt
    FROM category_views
    GROUP BY session_id
)

SELECT
    COUNT(DISTINCT d.session_id) AS 전체_발견탭_세션,
    COUNT(DISTINCT CASE WHEN s.category_cnt >= 2 THEN d.session_id END) AS 크로스카테고리_세션,
    ROUND(COUNT(DISTINCT CASE WHEN s.category_cnt >= 2 THEN d.session_id END) * 100.0
          / NULLIF(COUNT(DISTINCT d.session_id), 0), 2) AS 크로스카테고리_비율_pct
FROM discovery_sessions d
LEFT JOIN session_category_count s ON d.session_id = s.session_id;
```

---

## 9. 유저 마스터 테이블

**테이블명**: `lake.gold.user_partitioned`

> ⚠️ 29CM/무신사 통합 유저 마스터. 유저 속성별(연령, 성별, 등급) 분석 시 주로 사용.
> 이벤트 테이블과 JOIN 시 `hash_id` 사용.
>
> 🔴 **권한 주의**: CE Product 계정에 SELECT 권한 없음 (2026-04-02 확인). 사용 시 권한 요청 필요.
> **대안**: 신규가입자 판별 시 `snowplow_app_user_session_29cm`의 첫 세션 날짜를 가입일 프록시로 사용 가능.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | STRING | 파티션 날짜 (yyyyMMdd 형식) |
| hash_id | STRING | 해시 유저 ID (GA4 조인 키) |
| age_band | STRING | 연령대 |
| gender | STRING | 성별 |
| group_level | INT | 무신사 회원 등급 |
| user_grade | STRING | 29CM 회원 등급 |
| total_ord_cnt | INT | 누적 주문 건수 |
| last_ord_dt | STRING | 마지막 주문 일자 |
| reg_dt | STRING | 가입일 |

### JOIN 규칙

```sql
-- GA4 로그와 유저 마스터 JOIN
FROM lake.bigquery.ga4_log g
JOIN lake.gold.user_partitioned u
  ON g.hash_id = u.hash_id AND g.dt = u.dt

-- 히드로 클릭 로그와 유저 마스터 JOIN
FROM event_log.silver.heathrow_click_log a
JOIN lake.gold.user_partitioned b
  ON a.hash_id = b.hash_id AND a.dt = b.dt
```

---

## 10. 유저 테이블 (datamart)

**테이블명**: `datamart.datamart.users`

> 유저 마스터 (등급, 가입정보 등). 간단한 등급 조회 시 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_no | BIGINT | 유저 번호 |
| user_grade | STRING | 29CM 유저 등급 |
| group_level | INT | 무신사 회원 등급 |

---

## 11. 상품 마스터 테이블

**테이블명**: `datamart.datamart.goods`

> 상품 마스터. 카테고리 코드/명 조회 시 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| goods_no | BIGINT | 상품번호 |
| base_cat_code_1depth | STRING | 대분류 카테고리 코드 |
| base_cat_nm_1depth | STRING | 대분류 카테고리명 |
| base_cat_code_2depth | STRING | 중분류 카테고리 코드 |
| base_cat_nm_2depth | STRING | 중분류 카테고리명 |
| base_cat_code_3depth | STRING | 소분류 카테고리 코드 |
| base_cat_nm_3depth | STRING | 소분류 카테고리명 |

---

## 12. 29CM 상품 원천 테이블

**테이블명**: `` `29cm`.item.t_item ``

> 29CM 상품 raw 테이블. 매입/위탁 구분, 상품 등록일 등 원천 데이터 조회 시 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| item_no | BIGINT | 상품번호 |
| insert_timestamp | TIMESTAMP | 상품 등록 시간 |
| supply_type | INT | 공급 유형 (1=매입, 2=위탁) |
| item_name | STRING | 상품명 |

### 사용 예시

```sql
-- 월별 매입상품 수 집계
SELECT
    DATE_TRUNC('MONTH', insert_timestamp) AS month,
    COUNT(DISTINCT item_no) AS item_cnt
FROM `29cm`.item.t_item
WHERE DATE(insert_timestamp) BETWEEN '2025-01-01' AND '2025-12-31'
  AND supply_type = 1 -- 매입상품
GROUP BY ALL
ORDER BY 1
```

---

## 13. 29CM 상품 이미지 테이블

**테이블명**: `` `29cm`.item.t_item_image ``

> 상품 썸네일 이미지 정보. 상품당 이미지 수 분석 등에 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| item_no | BIGINT | 상품번호 |
| item_image_no | BIGINT | 이미지 고유번호 |

---

## 14. 29CM 회원 등급 이력 테이블

**테이블명**: `29cm.member.t_user_level_history`

> 회원 등급 변동 이력. 월별 스냅샷 (매월 1일 기준).

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_no | BIGINT | 유저 번호 |
| level_no | INT | 등급 번호 (80=VIP, 90=VVIP 등) |
| calculation_date | DATE | 등급 산정 기준일 (매월 1일) |

### 사용 예시

```sql
-- 특정 월 VIP/VVIP 회원 수
SELECT COUNT(*)
FROM 29cm.member.t_user_level_history
WHERE calculation_date = DATE('2026-03-01')
  AND level_no IN (80, 90)
```

---

## 15. GA4 이벤트 원천 테이블

**테이블명**: `lake.bigquery.events`

> GA4 이벤트 원천 데이터. event_params가 중첩 구조이므로 `LATERAL VIEW explode` 필요.
> ⚠️ 통합회원 전환 후 로그인 page_id가 `/auth/login` → `/auth/one/login`으로 변경됨.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | STRING | 파티션 날짜 (yyyyMMdd 형식) |
| event_name | STRING | 이벤트명 (page_view, select_item 등) |
| event_params | ARRAY | 이벤트 파라미터 (key-value 배열) |
| user_pseudo_id | STRING | GA4 익명 유저 ID |
| user_id | STRING | 로그인 유저 ID |

### 이벤트 파라미터 파싱 (LATERAL VIEW explode)

```sql
-- page_id 파라미터 추출 예시
SELECT
    dt,
    p.value.string_value AS page_id,
    COUNT(DISTINCT user_pseudo_id) AS cnt_users,
    COUNT(DISTINCT user_id) AS cnt_login_users
FROM lake.bigquery.events
LATERAL VIEW OUTER explode(event_params) ep AS p
WHERE dt = '20251020'
  AND event_name = 'page_view'
  AND p.key = 'page_id'
  AND p.value.string_value LIKE '/auth%'
GROUP BY dt, p.value.string_value
ORDER BY cnt_users DESC
```

---

## 16. GA4 로그 테이블

**테이블명**: `lake.bigquery.ga4_log`

> GA4 로그 (평탄화된 버전). 웹 PV/UV 분석 시 사용.
> ⚠️ 통합회원 전환 후 로그인 page_id 변경: `/auth/login` → `/auth/one/login` (2025년 9월 이후)

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | STRING | 파티션 날짜 (yyyyMMdd 형식) |
| date | STRING | 날짜 (yyyyMMdd) |
| page_id | STRING | 페이지 ID |
| client_id | STRING | GA4 클라이언트 ID |
| hash_id | STRING | 해시 유저 ID (user_partitioned 조인 키) |

### 사용 예시

```sql
-- 페이지별 PV/UV 분석
SELECT
    DATE(DATE_TRUNC(:interval, TO_DATE(date, 'yyyyMMdd'))) AS partition_date,
    page_id,
    COUNT(*) AS pv,
    COUNT(DISTINCT client_id) AS total_user_count,
    COUNT(DISTINCT hash_id) AS login_user_count
FROM lake.bigquery.ga4_log
WHERE dt BETWEEN '20260101' AND '20260131'
GROUP BY ALL
ORDER BY pv DESC
```

---

## 17. 세션 트래픽 로그 테이블

**테이블명**: `team.marketing.29cm_session_traffic_log`

> 29CM 세션 트래픽 로그. UTM 기반 유입 채널/캠페인 분석에 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| partition_date | DATE | 파티션 날짜 |
| utm_source | STRING | UTM 소스 |
| utm_medium | STRING | UTM 미디엄 |
| utm_campaign | STRING | UTM 캠페인 |
| user_id | STRING | 유저 ID |
| session_id | STRING | 세션 ID |

---

## 18. CRM 캠페인 리스트 테이블

**테이블명**: `team.marketing.29cm_crm_campaign_list_daily`

> CRM 캠페인 목록. 세션 트래픽 로그와 JOIN하여 캠페인 성과 분석에 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| partition_date | DATE | 파티션 날짜 |
| campaign | STRING | 캠페인명 |
| campaign_type | STRING | 캠페인 유형 |

---

## 19. A/B 테스트 실험군 테이블

**테이블명**: `datamart.gold.amplitude_app_exposure_user_exp_daily_29cm`

> Amplitude 기반 A/B 테스트 실험군/대조군 데이터. 일별 적재.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | DATE | 파티션 날짜 |
| exp_name | STRING | 실험 이름 |
| user_id | STRING | 유저 ID (CAST AS INT로 주문 테이블 조인) |
| exp_group_name | STRING | 실험군/대조군 그룹명 |

### 사용 예시

```sql
-- 특정 실험의 실험군/대조군 유저 조회
SELECT
    exp_name,
    CAST(user_id AS INT) AS user_id,
    exp_group_name,
    dt
FROM datamart.gold.amplitude_app_exposure_user_exp_daily_29cm
WHERE exp_name = '실험명'
  AND dt BETWEEN '2026-01-01' AND '2026-01-31'
```

---

## 20. 히드로 클릭 로그 테이블

**테이블명**: `event_log.silver.heathrow_click_log`

> 히드로(Heathrow) 클릭 이벤트 로그. 상품 클릭, 슬롯 클릭 등 분석에 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | STRING | 파티션 날짜 (yyyyMMdd 형식) |
| hash_id | STRING | 해시 유저 ID (user_partitioned 조인 키) |
| goods_no | STRING | 상품번호 |
| act_url | STRING | 클릭 URL |
| act_slot_id | STRING | 슬롯 ID (모듈 위치 식별) |

---

## 21. 카테고리 매핑 테이블

**테이블명**: `team.tech.cda_s_29cm_item_category_mapping`

> 프론트 카테고리 ↔ 관리 카테고리 매핑. 카테고리 변환 시 사용.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| front_cate3_code | STRING | 프론트 카테고리 코드 (3depth) |
| front_cate3_name | STRING | 프론트 카테고리명 (3depth) |
| manage_cate3_code | STRING | 관리 카테고리 코드 (3depth) |
| manage_cate3_name | STRING | 관리 카테고리명 (3depth) |
| is_deleted | BOOLEAN | 삭제 여부 |
| available_begin_timestamp | TIMESTAMP | 유효 시작일 |
| available_end_timestamp | TIMESTAMP | 유효 종료일 |

---

## 22. 주문 CS 테이블

**테이블명**: `datamart.datamart.29cm_mart_order_cs`

> 주문 CS(교환/환불/반품) 데이터. **`29cm_mart_order` 테이블에는 CS 정보가 반영되어 있지 않기 때문에**, GMV/매출 집계에서 CS 후 최종 판매액을 반영하려면 **두 테이블을 UNION ALL로 결합**해서 집계해야 함.
>
> 🔴 **CRITICAL (CMDATA-3141, 2026-04 PDA 피드백)**: 과거 AI 생성 쿼리에서 `29cm_mart_order` 단독 사용으로 CS 미반영 → 매출 수치 왜곡 사례 발생. **CS 반영이 필요한 분석은 반드시 UNION ALL 패턴을 따를 것.**

### 스키마 (주요 컬럼)

`29cm_mart_order`와 동일한 주요 컬럼(`dt`, `order_no`, `user_no`, `sales_sell_price` 등)을 가짐. 레코드 자체는 CS(교환/환불/반품) 처리 결과가 반영된 거래건.

### 표준 UNION 패턴 (CMDATA-3141 참조 쿼리)

```sql
-- CS 반영 GMV/GGMV 집계 (참조: CMDATA-3141)
WITH ord AS (
  SELECT
    dt,
    order_no,
    SUM(sales_sell_price) AS gmv,
    SUM(CASE WHEN sales_sell_price > 0 THEN sales_sell_price ELSE 0 END) AS ggmv
  FROM (
    SELECT dt, order_no, sales_sell_price
    FROM datamart.datamart.`29cm_mart_order`  -- CS 미반영
    WHERE dt BETWEEN '2026-04-01' AND '2026-04-02'

    UNION ALL

    SELECT dt, order_no, sales_sell_price
    FROM datamart.datamart.`29cm_mart_order_cs`  -- CS 반영 (교환/환불/반품)
    WHERE dt BETWEEN '2026-04-01' AND '2026-04-02'
  )
  GROUP BY ALL
)
SELECT
  dt,
  COUNT(DISTINCT CASE WHEN gmv > 0 THEN order_no END) AS order_cnt,
  SUM(gmv)  AS gmv,   -- CS 차감 반영 매출
  SUM(ggmv) AS ggmv   -- 음수(환불) 제외, 양수 매출만
FROM ord
GROUP BY 1
```

### 선택 기준

| 분석 목적 | 테이블 조합 |
|-----------|------------|
| **정확한 실제 매출/GMV** (CS 반영 순매출) | `29cm_mart_order` **UNION ALL** `29cm_mart_order_cs` |
| 주문 시도/트래픽/주문 취소율 | `29cm_mart_order` 단독 + `order_item_cancel_status_name` 필터 |
| CS(교환/환불/반품) 현황만 | `29cm_mart_order_cs` 단독 |

> ⚠️ **`order_item_cancel_status_name = '주문_최초'` 필터만으로는 CS 후 환불/반품이 반영되지 않음.** 정확한 최종 매출이 필요하면 UNION ALL 필수.

---

## 23. 유저 ID 매핑 가이드

29CM 데이터에서 유저 ID 체계가 테이블마다 다르므로 JOIN 시 주의:

| 테이블 | 유저 ID 컬럼 | 타입 | 비고 |
|--------|-------------|------|------|
| `29cm_mart_order` | user_no | BIGINT | 주문 테이블 PK |
| `snowplow_event_mart_daily` | user_id | STRING | Snowplow 이벤트 |
| `lake.bigquery.ga4_log` | hash_id | STRING | GA4 로그 |
| `lake.gold.user_partitioned` | hash_id | STRING | 유저 마스터 |
| `event_log.silver.heathrow_click_log` | hash_id | STRING | 클릭 로그 |
| `amplitude_app_exposure_user_exp_daily_29cm` | user_id | STRING | A/B 테스트 (CAST AS INT) |
| `user_mart_29cm` | user_no | BIGINT | 유저 마트 (hash_id도 보유) |
| `snowplow_app_user_session_29cm` | user_id | BIGINT | 앱 세션 |
| `nth_order_29cm` | user_no | BIGINT | N차 주문 |
| `auxia_orders_merged` | user_no | BIGINT | 카테고리별 주문 |

### 주요 JOIN 패턴

```sql
-- 주문 ↔ Snowplow
CAST(order.user_no AS STRING) = event.user_id

-- GA4 ↔ 유저 마스터
ga4.hash_id = user.hash_id AND ga4.dt = user.dt

-- A/B 테스트 ↔ 주문
CAST(exp.user_id AS INT) = order.user_no
```

### GA4 vs Snowplow 선택 기준

| 분석 목적 | 테이블 | 이유 |
|-----------|--------|------|
| **웹 트래픽/PV 분석** | `lake.bigquery.ga4_log` 또는 `lake.bigquery.events` | 웹 로그 수집 원천 |
| **앱 이벤트/퍼널 분석** | `team.tech.cda_29cm_snowplow_event_mart_daily` | 앱 이벤트 수집 원천 |
| **UTM/캠페인 분석** | `team.marketing.29cm_session_traffic_log` | UTM 파라미터 포함 |
| **유저 속성별 분석** | `lake.gold.user_partitioned` | age_band, gender 등 유저 속성 |

---

## 24. 유저 마트 테이블 (29CM)

**테이블명**: `datamart.gold.user_mart_29cm`

> ⚠️ **주의**: 일별 전체 유저 스냅샷. 배열 컬럼(`*_list`)은 **누적 데이터**이므로 기간별 분석 시 반드시 `FILTER()` 함수로 `insert_timestamp` 필터링 필요.

### 기본 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | DATE | 스냅샷 일자 (파티션 키) |
| user_no | BIGINT | 유저 번호 |
| user_grade | SMALLINT | 유저 등급 코드 |
| user_grade_name | STRING | 유저 등급명 |
| gender | STRING | 성별 |
| birth_year | INT | 출생 연도 |
| hash_id | STRING | 해시 ID (GA4 JOIN 키) |

### 배열 컬럼 (누적 — FILTER 필수)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| visit_home_category_item_list | ARRAY\<STRUCT\> | 홈 카테고리 상품 방문 이력 |
| order_item_list | ARRAY\<STRUCT\> | 주문 상품 이력 |
| visit_item_list | ARRAY\<STRUCT\> | 상품 방문 이력 |
| like_item_list | ARRAY\<STRUCT\> | 좋아요 상품 이력 |
| cart_item_list | ARRAY\<STRUCT\> | 장바구니 상품 이력 |
| search_keyword_item_click_list | ARRAY\<STRUCT\> | 검색 키워드 클릭 이력 |
| visit_front_brand_list | ARRAY\<STRUCT\> | 브랜드 방문 이력 |

### 배열 내부 STRUCT 구조 (공통)

| 필드 | 타입 | 설명 |
|------|------|------|
| insert_timestamp | TIMESTAMP | 이벤트 발생 시간 (**기간 필터 기준**) |
| item_no | BIGINT | 상품번호 |
| item_name | STRING | 상품명 |
| front_category_item_binding_list | ARRAY\<STRUCT\> | 카테고리 바인딩 (중첩 배열) |

### front_category_item_binding_list 내부 STRUCT

| 필드 | 타입 | 설명 |
|------|------|------|
| front_category_no | BIGINT | 카테고리 번호 |
| front_category_level | INT | 카테고리 레벨 (1=대, 2=중, 3=소) |
| front_category_name | STRING | 카테고리명 |

### 기간별 분석 패턴 (필수)

```sql
-- 28일간 홈 카테고리 방문 유저 집계 (FILTER 적용)
SELECT
  dt,
  COUNT(DISTINCT CASE
    WHEN SIZE(FILTER(visit_home_category_item_list,
      x -> x.insert_timestamp >= DATE_SUB(dt, 28))) > 0
    THEN user_no
  END) AS home_category_wau
FROM datamart.gold.user_mart_29cm
WHERE dt = '2026-03-23'
GROUP BY dt
```

### ID 매핑

| JOIN 대상 | JOIN 조건 |
|-----------|----------|
| 29cm_mart_order | `user_mart.user_no = order.user_no` |
| GA4 로그 | `user_mart.hash_id = ga4.hash_id AND user_mart.dt = ga4.dt` |
| Snowplow | `CAST(user_mart.user_no AS STRING) = event.user_id` |

---

## 25. 앱 유저 세션 테이블 (29CM)

**테이블명**: `datamart.gold.snowplow_app_user_session_29cm`

> 29CM 앱 세션 분석 전용. 세션별 첫/마지막 이벤트, 체류 시간 포함.

### 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| partition_date | DATE | 세션 일자 (파티션 키) |
| snowplow_id | STRING | Snowplow 디바이스 ID |
| user_id | BIGINT | 유저 번호 |
| platform | STRING | 플랫폼 (ios, android) |
| session_number | BIGINT | 세션 순번 |
| last_events | ARRAY\<STRUCT\> | 세션 마지막 이벤트 배열 |
| first_events | ARRAY\<STRUCT\> | 세션 첫 이벤트 배열 |
| duration_sec | BIGINT | 세션 체류 시간 (초) |

### ID 매핑

| JOIN 대상 | JOIN 조건 |
|-----------|----------|
| user_mart_29cm | `session.user_id = user_mart.user_no` |
| 29cm_mart_order | `session.user_id = order.user_no` |

---

## 26. N차 주문 테이블 (29CM)

**테이블명**: `datamart.gold.nth_order_29cm`

> 유저별 N차 구매 분석 전용. 전체/앱/웹 채널별 구매 순서 포함.

### 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | DATE | 주문 일자 (파티션 키) |
| user_no | BIGINT | 유저 번호 |
| pay_timestamp | TIMESTAMP | 결제 시간 |
| order_no | BIGINT | 주문번호 |
| order_serial | STRING | 주문 시리얼 |
| device_type_name | STRING | 디바이스 유형 (App, MobileWeb, PC 등) |
| nth_orders | INT | 전체 N차 구매 순서 |
| app_nth_order | INT | 앱 N차 구매 순서 |
| web_nth_order | INT | 웹 N차 구매 순서 |

### ID 매핑

| JOIN 대상 | JOIN 조건 |
|-----------|----------|
| user_mart_29cm | `nth.user_no = user_mart.user_no` |
| 29cm_mart_order | `nth.order_no = order.order_no AND nth.dt = order.dt` |

### 활용 패턴

```sql
-- 홈 카테고리 방문 유저의 N차 구매 분포
SELECT
  n.nth_orders,
  COUNT(DISTINCT n.user_no) AS user_count
FROM datamart.gold.nth_order_29cm n
INNER JOIN datamart.gold.user_mart_29cm u
  ON n.user_no = u.user_no AND n.dt = u.dt
WHERE u.dt = '2026-03-23'
  AND SIZE(FILTER(u.visit_home_category_item_list,
      x -> x.insert_timestamp >= DATE_SUB(u.dt, 28))) > 0
GROUP BY n.nth_orders
ORDER BY n.nth_orders
```

---

## 27. 홈 카테고리 주문 분석 테이블

**테이블명**: `datamart.gold.auxia_orders_merged`

> 29CM 주문 테이블 중 카테고리별 분석에 유용. `large_nm = 'Life'`가 홈 카테고리에 해당.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | DATE | 주문 일자 (파티션 키) |
| user_no | BIGINT | 유저 번호 |
| order_no | BIGINT | 주문번호 |
| large_nm | STRING | 대분류 카테고리명 (**영문**: Life, Clothing, Shoes 등) |
| medium_nm | STRING | 중분류 카테고리명 (한글: 가구/매트리스, 침구, 그릇/커트러리 등) |

### 홈 카테고리 필터링

```sql
-- 홈 카테고리 = large_nm이 'Life'인 항목
WHERE large_nm = 'Life'

-- 주요 홈 카테고리 중분류:
-- 가구/매트리스, 침구, 그릇/커트러리, 홈패브릭, 조리도구,
-- 수납/정리, 홈데코, 조명, 가전, 생활용품 등
```

### ID 매핑

| JOIN 대상 | JOIN 조건 |
|-----------|----------|
| user_mart_29cm | `orders.user_no = user_mart.user_no` |
| nth_order_29cm | `orders.order_no = nth.order_no AND orders.dt = nth.dt` |

---

## 28. 마일리지 테이블 (3종 세트)

> 🔴 **CRITICAL (CMDATA-3141, 2026-04 PDA 피드백)**:
> 적립금 **지급 내역 분석**은 `t_mileage` 단독으로는 지급 사유/출처를 정확히 복원할 수 없음. 과거 AI 생성 쿼리(`type='ACCUMULATE' AND merchant_key LIKE 'REWARD-V-%'`만 사용)는 지급 로직이 불충분한 사례로 공식 지적됨.
> **반드시 `t_mileage` + `t_mileage_history` + `t_mileage_accumulate_issue` 3개 테이블을 JOIN**하여 발행 사유(`detail_type`, `ai.message`, `title`, `merchant_key`)를 함께 복원해야 함. 아래 "적립금 지급 내역 표준 쿼리(CMDATA-3141 참조)" 절 참고.

**관련 테이블**:

| 테이블 | 용도 |
|--------|------|
| `` `29cm`.mileage.t_mileage `` | 마일리지 마스터 (merchant, merchant_key, mileage_accumulate_issue_no 등 메타 정보) |
| `` `29cm`.mileage.t_mileage_history `` | 마일리지 이력 (insert_timestamp, detail_type, type, amount — **지급일/지급액 단위 집계 기준**) |
| `` `29cm`.mileage.t_mileage_accumulate_issue `` | 적립 발행 메시지 (어드민 수동 발행 사유 `message` 보관) |

### 28-1. `t_mileage` (마일리지 마스터)

**테이블명**: `` `29cm`.mileage.t_mileage ``

> 적립금(마일리지) 적립/사용/취소 이력. 취향공유 보상, 이벤트 적립 등 분석에 사용.
>
> ✅ **권한 확인**: CE Product 계정 SELECT 가능 (2026-04-06 확인, 617K건 조회 성공).
> **대안**: 적립금 **사용** 분석은 `29cm_mart_order`의 `mileage_sale_amount` 컬럼으로도 우회 가능.
>
> 🔴 **CRITICAL**: `deleted_timestamp IS NULL` 필터 필수! `deleted_timestamp`가 NULL이 아니면 삭제된 레코드 → 반드시 제외해야 유효 데이터만 집계됨.

### 전체 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| mileage_accumulate_issue_no | BIGINT | 적립 발급 번호 |
| **visible** | BOOLEAN | **표시 여부** (어뷰징 분석 시 `visible IS TRUE` 필터 필수 — 비노출 레코드 제외) |
| comment | VARCHAR | 코멘트 (상품명 등) |
| merchant | VARCHAR(30) | 적립 출처 |
| merchant_key | VARCHAR(50) | 적립 식별키 |
| type | VARCHAR(30) | 유형 |
| title | VARCHAR(100) | 제목 (주문번호 등) |
| amount | DOUBLE | 적립/사용 금액 |
| user_no | BIGINT | 유저 번호 |
| mileage_no | BIGINT | 마일리지 번호 |
| issue_apply_timestamp | TIMESTAMP | 발급 적용 일시 |
| visible_updated_timestamp | TIMESTAMP | 표시 여부 변경 일시 |
| expired_timestamp | TIMESTAMP | 만료 일시 |
| insert_timestamp | TIMESTAMP | 생성 일시 |
| updated_timestamp | TIMESTAMP | 수정 일시 |
| deleted_timestamp | TIMESTAMP | 삭제 일시 |
| completed_timestamp | TIMESTAMP | 완료 일시 |

### merchant 컬럼 값 (적립 출처)

| 값 | 설명 |
|-----|------|
| `ORDER` | 주문 적립 |
| `CS_ORDER` | CS 주문 적립 |
| `DELIVERY` | 배송 관련 |
| `REVIEW` | 리뷰 적립 |
| `MPOS` | MPOS 적립 |
| `CS` | CS 적립 |
| `EVENT` | 이벤트 적립 |
| `ONEMEMBER_CONVERT` | 원멤버 전환 적립 |
| `USER_JOIN` | 회원가입 적립 |
| `ADMIN` | 관리자 적립 |
| `SYSTEM` | 시스템 적립 |
| `COUPON` | 쿠폰 관련 |
| `EX_DEPOSIT` | 예치금 전환 |

### type 컬럼 값

| 값 | 설명 |
|-----|------|
| `ACCUMULATE` | 적립 |
| `ACCUMULATE_CANCEL` | 적립 취소 |
| `USE` | 사용 |
| `USE_CANCEL` | 사용 취소 |

### merchant_key 패턴

`merchant_key`는 `merchant` 값에 따라 다른 패턴을 가짐:

| merchant | merchant_key 패턴 | 예시 |
|----------|-------------------|------|
| `ORDER` | 주문 내부 ID (숫자) | `136851970` |
| `EVENT` | 앱테크/취향공유 보상 키 | `REWARD-S-{programId}-{uuid}`, `TASTE_SWIPE_{...}` 등 |

#### 앱테크/이벤트 merchant_key 전체 패턴 ★

| prefix | 의미 | 필터 | 비고 |
|--------|------|------|------|
| `REWARD-S-{programId}-{uuid}` | 친구소개 (가입보상) | `merchant_key LIKE 'REWARD-S%'` | 2,900원 (공유자/피공유자 각각) |
| `REWARD-V-{programId}-{uuid}` | 마일리지챌린지 (방문보상) | `merchant_key LIKE 'REWARD-V%'` | 29원 (공유자/피공유자 각각) |
| `REWARD{...}` (10/15 이전) | 친구소개+마일리지챌린지 (미분리) | `merchant_key LIKE 'REWARD%'` | 2025-10-15 이전 데이터는 S/V 미구분 |
| `TASTE_SWIPE_{...}` | 취향스와이프 | `merchant_key LIKE 'TASTE_SWIPE_%'` | |
| `CARD_GAME_{...}` | 카드뒤집기 (카드게임) | `merchant_key LIKE 'CARD_GAME_%'` | |
| `O4O_GIFT{...}` | 오프라인 이벤트 | `merchant_key LIKE 'O4O_GIFT%'` | |

### 필수 필터 패턴 (CRITICAL)

```sql
-- ✅ 유효 적립 레코드만 조회
SELECT user_no, type, amount, merchant, merchant_key, completed_timestamp
FROM `29cm`.mileage.t_mileage
WHERE deleted_timestamp IS NULL          -- 삭제된 레코드 제외 (��수!)
  AND visible IS TRUE                    -- 비노출 레코드 제외 (어뷰징 분석 시 필수!)
  AND type = 'ACCUMULATE'               -- 적립만
  AND merchant = 'EVENT'                 -- 이벤트 적립만
  AND completed_timestamp >= '2026-01-01'

-- ❌ 잘못된 사용 (deleted_timestamp, visible 필터 누락 시 삭제/비노출 건 포함되어 집계 오염)
SELECT COUNT(*) FROM `29cm`.mileage.t_mileage WHERE type = 'ACCUMULATE'
```

> **분석 기간 필터**: `completed_timestamp BETWEEN`은 TIMESTAMP 타입이므로
> `>= '2026-01-28' AND < '2026-04-01'` 형태를 권장 (`BETWEEN '...' AND '2026-03-31'`은 3/31 00:00 이후 누락).

### 적립금 사용 우회 쿼리 (적립금 사용 세그먼트)

```sql
-- t_mileage 대신 주문 테이블의 mileage_sale_amount로 적립금 사용 패턴 분석
SELECT
    CASE
        WHEN ROUND(mileage_sale_amount * 100.0
             / NULLIF(sales_sell_price, 0), 0) >= 80 THEN '① 80%+ (적립금 의존)'
        WHEN ROUND(mileage_sale_amount * 100.0
             / NULLIF(sales_sell_price, 0), 0) >= 50 THEN '② 50~79%'
        WHEN mileage_sale_amount > 0 THEN '③ 1~49% (적립금 보조)'
        ELSE '④ 적립금 미사용'
    END AS `적립금_비중_세그먼트`,
    COUNT(DISTINCT user_no) AS `유저수`,
    COUNT(DISTINCT order_no) AS `주문건수`,
    ROUND(AVG(sales_sell_price), 0) AS `평균_주문금액`
FROM datamart.datamart.29cm_mart_order
WHERE dt BETWEEN '2026-01-01' AND '2026-03-31'
  AND order_item_cancel_status_name = '주문_최초'
GROUP BY 1
ORDER BY 1
```

### 28-2. `t_mileage_history` (이력) / `t_mileage_accumulate_issue` (발행 메시지)

**테이블명**:
- `` `29cm`.mileage.t_mileage_history `` — 마일리지 발행/취소 이력 (지급일자, 지급액 단위 집계 기준 테이블)
- `` `29cm`.mileage.t_mileage_accumulate_issue `` — 어드민 수동 발행 시 메시지 보관

> 🔴 **지급 내역 분석은 반드시 `t_mileage_history` 기준**. `t_mileage`는 지급 이벤트 단위가 아니라 마일리지 건 단위이므로, 지급액/지급일/지급 사유의 정확한 복원을 위해 `t_mileage_history`를 주 테이블로 사용해야 함.

#### `t_mileage_history` 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| mileage_history_no | BIGINT | 이력 번호 (PK) |
| mileage_no | BIGINT | 마일리지 번호 (`t_mileage` JOIN 키) |
| mileage_issue_no | BIGINT | 발급 번호 |
| user_no | BIGINT | 유저 번호 |
| type | VARCHAR | 이력 유형 (`ACCUMULATE`, `ACCUMULATE_CANCEL`, `USE`, `USE_CANCEL`, `EXPIRES`) |
| **detail_type** | VARCHAR | **세부 유형** (`EVENT_ACCUMULATE`, `CS_ACCUMULATE`, `ORDER_USE`, `ORDER_USE_CANCEL` 등) |
| amount | DOUBLE | 금액 (적립=양수, 취소/사용=음수) |
| insert_timestamp | TIMESTAMP | 생성 일시 (**지급일 기준 필드**) |
| completed_timestamp | TIMESTAMP | 완료 일시 |
| deleted_timestamp | TIMESTAMP | 삭제 일시 (`IS NULL` 필터 필수) |
| expired_timestamp | TIMESTAMP | 만료 일시 |
| accumulated_timestamp | TIMESTAMP | 적립 시점 |
| **accumulated_mileage_history_no** | BIGINT | **원본 적립 이력 번호** (self-join으로 적립→사용/만료 lifecycle 추적) |
| **origin_mileage_history_no** | BIGINT | **원래 이력 번호** (어드민 적립금→주문 사용 추적 시 사용) |

#### `t_mileage_history` type 값

| 값 | 설명 |
|----|------|
| `ACCUMULATE` | 적립 |
| `ACCUMULATE_CANCEL` | 적립 취소 |
| `USE` | 사용 |
| `USE_CANCEL` | 사용 취소 |
| `EXPIRES` | 만료 |

#### `t_mileage_history` detail_type 값 (주요)

| 값 | 설명 |
|----|------|
| `EVENT_ACCUMULATE` | 이벤트 적립 (앱테크, 어드민 발행 등) |
| `CS_ACCUMULATE` | CS 적립 |
| `ORDER_USE` | 주문 시 적립금 사용 |
| `ORDER_USE_CANCEL` | 주문 취소 시 적립금 반환 |

#### 앱테크 lifecycle 추적 패턴 (self-join)

앱테크 적립금의 적립→사용/만료/취소 전체 생애주기를 추적하려면 `accumulated_mileage_history_no`로 self-join:

```sql
-- 앱테크 적립 건의 후속 이력 추적 (사용/만료/취소)
SELECT
    t3.type,                    -- ACCUMULATE, USE, EXPIRES, USE_CANCEL 등
    COUNT(DISTINCT t3.mileage_no) AS cnt,
    SUM(t3.amount) AS total_amount
FROM `29cm`.mileage.t_mileage_history t1        -- 원본 적립 이력
JOIN `29cm`.mileage.t_mileage_history t3         -- self-join: 후속 이력
  ON t1.mileage_history_no = t3.accumulated_mileage_history_no
JOIN `29cm`.mileage.t_mileage t2                 -- 마스터 (merchant_key 필터용)
  ON t1.mileage_no = t2.mileage_no
WHERE t2.merchant = 'EVENT'
  AND t2.merchant_key LIKE 'REWARD-V%'           -- 마일리지챌린지 예시
  AND t2.deleted_timestamp IS NULL
GROUP BY t3.type
```

### 28-3. 적립금 지급 내역 표준 쿼리 (CMDATA-3141 참조)

> CMDATA-3141 PDA 제공 참고 쿼리. EVENT 적립 분석 시 **이 쿼리를 베이스로 시작**할 것. `merchant_key` 패턴으로 이벤트 종류(취향공유/카드게임/스와이프 등) 세분화 가능.

```sql
SELECT
  DATE(h.insert_timestamp) AS dt,                          -- 지급일
  h.user_no,                                                -- 유저 번호
  h.detail_type AS reason,                                  -- 적립 사유 (1차)
  CASE
    WHEN h.detail_type = 'EVENT_ACCUMULATE' AND m.mileage_accumulate_issue_no IS NOT NULL
      THEN COALESCE(ai.message, 'EVENT_어드민발행')
    WHEN h.detail_type = 'EVENT_ACCUMULATE' AND m.mileage_accumulate_issue_no IS NULL
      THEN COALESCE(NULLIF(m.title, ''), 'EVENT_기타')
    WHEN h.detail_type = 'CS_ACCUMULATE' AND m.mileage_accumulate_issue_no IS NOT NULL
      THEN COALESCE(ai.message, 'CS_어드민발행')
    ELSE h.detail_type
  END AS reason_detail,                                     -- EVENT는 이벤트명, CS는 발행사유, 나머지는 detail_type 그대로
  CASE
    WHEN m.merchant_key LIKE 'REWARD-S%'     THEN '취향공유 친구소개'
    WHEN m.merchant_key LIKE 'REWARD-V%'     THEN '취향공유 마일리지챌린지'
    WHEN m.merchant_key LIKE 'REWARD%'       THEN '취향공유 친구소개_마일리지챌린지(10/15이전)'
    WHEN m.merchant_key LIKE 'TASTE_SWIPE_%' THEN '취향스와이프'
    WHEN m.merchant_key LIKE 'CARD_GAME_%'   THEN '카드뒤집기(카드게임)'
    ELSE '어드민발행_기타'
  END AS reason_detail2,                                    -- merchant_key 패턴 기반 이벤트 종류 세분화
  m.merchant AS merchant_type,                              -- 출처 대분류 (EVENT/ORDER/CS 등)
  COUNT(DISTINCT h.mileage_history_no) AS issue_cnt,        -- 지급 건수
  SUM(h.amount) AS paid_amount                              -- 지급액 합계 (ACCUMULATE_CANCEL은 음수로 상계됨)
FROM `29cm`.mileage.t_mileage_history h
JOIN `29cm`.mileage.t_mileage m
  ON h.mileage_no = m.mileage_no
LEFT JOIN `29cm`.mileage.t_mileage_accumulate_issue ai
  ON m.mileage_accumulate_issue_no = ai.mileage_accumulate_issue_no
WHERE
  h.type IN ('ACCUMULATE', 'ACCUMULATE_CANCEL')   -- 적립/적립취소 모두 포함 (상계 처리)
  AND m.merchant = 'EVENT'                         -- EVENT 적립만 (필요 시 'ORDER','CS' 등으로 변경)
  AND m.deleted_timestamp IS NULL                  -- 삭제 레코드 제외 (필수!)
  AND h.deleted_timestamp IS NULL                  -- 삭제 이력 제외 (필수!)
  -- AND h.insert_timestamp >= '2026-01-01'         -- 기간 필터 필요 시
GROUP BY ALL
ORDER BY 1, 2, 3
```

#### 이 쿼리의 중요 포인트

1. **집계 주체는 `t_mileage_history`** (`h.mileage_history_no`, `h.amount`, `h.insert_timestamp`) — `t_mileage`가 아님.
2. **`ACCUMULATE` + `ACCUMULATE_CANCEL`을 함께 합산**하여 실제 순지급액을 상계 처리.
3. **`detail_type`** (= `EVENT_ACCUMULATE`, `CS_ACCUMULATE`, `ORDER_ACCUMULATE` 등) 으로 1차 분류 → `merchant_key` 패턴으로 2차 세분화.
4. **어드민 수동 발행은 `t_mileage_accumulate_issue.message`** 로만 사유 복원 가능.
5. **두 테이블 모두 `deleted_timestamp IS NULL`** 필터 필수.
6. 단순히 `t_mileage` + `type='ACCUMULATE'` + `merchant_key LIKE 'REWARD-%'` 만으로는 지급 사유/세분화를 복원할 수 없음 — 과거 AI 쿼리 오류 사례.

---

## 29-1. 단독상품 태깅 테이블

**테이블명**: `` `29cm`.item.t_item_analysis_tagging ``

> 상품 분석용 태깅 정보. **단독상품(exclusive) 여부** 판별에 사용.

```sql
-- 단독상품 item_no 목록 조회
SELECT DISTINCT item_no
FROM `29cm`.item.t_item_analysis_tagging
WHERE is_exclusive = 'T'
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| item_no | BIGINT | 상품번호 |
| is_exclusive | VARCHAR | 단독상품 여부 (`'T'`=단독, `'F'`=일반) |

> 주문 테이블과 `item_no` JOIN으로 단독상품 GMV/비중 분석 가능.

---

## 29-2. N차 주문 시퀀스 테이블 (마케팅)

**테이블명**: `team.marketing.29cm_order_sequence`

> 마케팅팀 관리 N차 주문 테이블. `datamart.gold.nth_order_29cm`과 유사하나 `pay_timestamp` 정밀도와 `device_type_name`이 포함되어 어드민 적립금→주문 매칭에 사용.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| dt | DATE | 주문 일자 (파티션 키) |
| user_no | BIGINT | 유저 번호 |
| order_no | BIGINT | 주문번호 |
| order_serial | STRING | 주문 시리얼 |
| device_type_name | STRING | 디바이스 유형 (App, MobileWeb, PC 등) |
| pay_timestamp | TIMESTAMP | 결제 시간 (**KST 원본**) |
| nth_orders | INT | N차 구매 순서 |

> **KST 주의**: `pay_timestamp`는 KST 원본. UTC 변환 불필요.

---

## 29-3. 회원 테이블

**테이블명**: `29cm.member.t_user`

> 회원 기본 정보. **가입일** 조회에 사용.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_no | BIGINT | 유저 번호 |
| insert_timestamp | TIMESTAMP | 가입 일시 (**UTC 저장** — `from_utc_timestamp(..., 'Asia/Seoul')` 변환 필요) |

> ⚠️ `insert_timestamp`는 **UTC**로 저장됨. KST 변환 필수: `from_utc_timestamp(insert_timestamp, 'Asia/Seoul')`

---

## 29-4. 검색 전용 이벤트 마트 ★

**테이블명**: `team.tech.cda_29cm_snowplow_search_mart_daily`

> **검색 시작/결과/자동완성 페이지 전용 이벤트 마트**. `cda_29cm_snowplow_event_mart_daily`에서 검색 관련 이벤트/페이지만 필터링한 다운스트림 마트.
>
> ✅ **검색(SRP/자동완성/검색시작) 분석은 이 마트를 우선 사용** — 원본 이벤트 마트보다 조회 범위가 좁고 빠름.

### 파이프라인 정의 (원천 → 검색 마트)

검색 마트는 원본 `cda_29cm_snowplow_event_mart_daily`에서 **아래 2가지 조건을 모두 만족하는 이벤트만** 적재:

**1. event_name 필터 (검색 유입 분석용 주요 이벤트)**

| 카테고리 | event_name |
|----------|-----------|
| 상품 노출/클릭 | `impression_item_recommend`, `click_item_recommend`, `impression_item`, `click_item`, `impression_item_search_result`, `click_item_search_result` |
| 컨텐츠 노출/클릭 | `impression_content`, `click_content` |
| 페이지 방문 | `view_page`, `visit_search_result`, `visit_search_start` |
| 카테고리 | `impression_category`, `click_category` |
| 브랜드 | `impression_brand`, `click_brand` |
| 패싯/버튼 | `click_button`, `click_button_search_start` |
| 선물 테마 | `view_gift_theme`, `click_gift_theme` |

**2. 페이지 필터 (검색 관련 페이지만)**

```sql
COALESCE(page_name, current_screen) IN ('search_result', 'search_start', 'search_autocomplete')
```

### 주요 컬럼 (`cda_29cm_snowplow_event_mart_daily`와 공통 + 추가)

| 구분 | 컬럼 | 비고 |
|------|------|------|
| **파티션** | `partition_date`, `partition_datetime` | DATE / TIMESTAMP |
| 공통 식별자 | `event_timestamp`, `event_name`, `event_version`, `user_id`, `uuid`, `snowplow_id`, `adid`, `idfa`, `session_id`, `session_index_id` | |
| 디바이스/환경 | `app`, `platform`, `os_name`, `os_version`, `version_name`, `device_type`, `device_manufacturer`, `device_carrier`, `device_model`, `city`, `country` | |
| UTM | `utm_medium`, `utm_source`, `utm_term`, `utm_content` | |
| user_properties | `gender`, `age_range`, `grade`, `os_push_notification` | |
| 페이지 | `COALESCE(page_name, current_screen) AS page_name` | **동일 기능 프로퍼티는 하나로 합침** (CRITICAL) |
| 섹션/버튼 | `section_name`, `section_title`, `source`, `button_id`, `button_type`, `button_value`, `position`, `layout_position` | |
| 상품/브랜드 | `brand_no`, `brand_name`, `item_no`, `item_name`, `source_item_no`, `price`, `discount_rate`, `discount_price`, `is_soldout`, `item_type`, `item_position`, `is_badge_doublecoupon`, `is_delivery_today`, `brand_tag`, `layout_format` | |
| 카테고리 | `large_category_no/name`, `middle_category_no/name`, `small_category_no/name`, `category_no`, `category_name`, `category_depth` | |
| 필터/검색 | `filter_gender`, `filter_sorter`, `hit_status`, `keyword`, `keyword_type`, `facet_type_list`, `facet_value_list`, `threshold` | |
| **통합 식별자** | **`onemember_hash_id`** | **무신사 통합회원 해시 ID** (원천 마트에도 존재) |
| **A/B 테스트** | **`experiment_data`** | **2026-03-18 신규 추가** — 실험 노출 정보 (원천 마트에도 존재) |

### page_name vs current_screen 합치기 패턴 (CRITICAL)

> 29CM 이벤트 로그에서 **동일한 논리적 페이지 식별자가 `page_name` 또는 `current_screen` 중 한쪽에만 기록**되는 경우가 있음. 반드시 `COALESCE`로 합쳐서 사용할 것.

```sql
-- ✅ 올바른 사용 (검색 페이지 식별)
WHERE COALESCE(page_name, current_screen) IN ('search_result', 'search_start', 'search_autocomplete')

-- ❌ 잘못된 사용 (한쪽만 조회 시 누락 발생)
WHERE page_name = 'search_result'
```

### 검색 페이지 식별자

| page_name | 설명 |
|-----------|------|
| `search_start` | 검색 시작 페이지 (검색창 진입) |
| `search_result` | 검색결과 페이지 (SRP) |
| `search_autocomplete` | 검색 자동완성 페이지 |

### 검색 유입/전환 분석 예시

```sql
-- 검색결과(SRP) 진입 후 상품 클릭 세션 비율
WITH s AS (
    SELECT
        session_id,
        MAX(CASE WHEN event_name = 'visit_search_result' THEN 1 ELSE 0 END) AS visited_srp,
        MAX(CASE WHEN event_name = 'click_item_search_result' THEN 1 ELSE 0 END) AS clicked_item
    FROM team.tech.cda_29cm_snowplow_search_mart_daily
    WHERE partition_date BETWEEN '2026-04-01' AND '2026-04-30'
      AND COALESCE(page_name, current_screen) = 'search_result'
    GROUP BY session_id
)
SELECT
    COUNT(*) AS srp_sessions,
    SUM(clicked_item) AS click_sessions,
    ROUND(SUM(clicked_item) * 100.0 / COUNT(*), 2) AS click_rate_pct
FROM s
WHERE visited_srp = 1
```

---

## 29. 테이블 권한 현황 (CE Product 계정)

> 2026-04-02 기준 확인된 권한 현황. 쿼리 작성 전 반드시 참고.

| 테이블 | 권한 | 비고 |
|--------|:----:|------|
| `datamart.datamart.29cm_mart_order` | ✅ | 주문 분석 메인 |
| `datamart.gold.snowplow_app_user_session_29cm` | ✅ | 앱 세션/DAU |
| `datamart.gold.user_mart_29cm` | ✅ | 유저 마트 |
| `datamart.gold.nth_order_29cm` | ✅ | N차 주문 |
| `datamart.gold.auxia_orders_merged` | ✅ | 카테고리별 주문 |
| `team.tech.cda_29cm_snowplow_event_mart_daily` | ✅ | 이벤트 로그 (원천) |
| `team.tech.cda_29cm_snowplow_search_mart_daily` | ✅ | **검색 전용 이벤트 마트** (SRP/검색시작/자동완성) |
| `29cm.front.voc_comments` | ✅ | VOC |
| `` `29cm`.orders.t_order_gift `` | ✅ | 선물 주문 |
| `lake.gold.user_partitioned` | 🔴 | 가입일(reg_dt) 조회 불가 |
| `` `29cm`.mileage.t_mileage `` | ✅ | 적립금 이력 (2026-04-06 권한 확인) |
| `` `29cm`.mileage.t_mileage_history `` | ✅ | 적립금 지급 이력 (CMDATA-3141) |
| `` `29cm`.mileage.t_mileage_accumulate_issue `` | ✅ | 어드민 발행 메시지 (CMDATA-3141) |
| `datamart.datamart.29cm_mart_order_cs` | ✅ | 주문 CS(교환/환불/반품) — GMV 정확 집계 시 UNION 필수 |
| `team.marketing.29cm_user_visit_segment_monthly` | ✅ | 마케팅 공식 세그먼트(Active/Churn/Inactive/Sleep) |

---

## 30. 마케팅 세그먼트 테이블 ★

**테이블명**: `team.marketing.29cm_user_visit_segment_monthly`

> 🔴 **CRITICAL (CMDATA-3141, 2026-04 PDA 피드백)**:
> 유저 활성도/휴면 세그먼트 분석 시 **반드시 이 공식 마케팅 세그먼트 테이블 사용**. 방문 빈도 기준으로 임의 정의한 '휴면/저활성/활성'은 마케팅 공식 정의와 상이하여 팀 간 커뮤니케이션 일관성을 해침 (과거 AI 생성 쿼리 오류 사례).
>
> 월 단위(`partition_date`) 파티션. 유저별로 1행.

### 주요 컬럼

| 컬럼 | 타입 | 설명 |
|------|------|------|
| partition_date | DATE | 월 단위 파티션 키 (예: `'2026-04-01'`) |
| user_id | STRING/BIGINT | 유저 식별자 |
| **active_status** | STRING | **마케팅 공식 세그먼트**. 값: `Active`, `Churn`, `Inactive`, `Sleep` |
| **visit_frequency** | STRING | Active 유저 한정, 방문 빈도 세그먼트. 값: `AA`, `A`, `B`, `C`, `D`, `Z` 등 (AA~A=고활성, 나머지=저활성) |

### active_status 값 정의

| 값 | 의미 |
|----|------|
| `Active` | 활성 유저 |
| `Churn` | 이탈 유저 |
| `Inactive` | 비활성 유저 |
| `Sleep` | 휴면 유저 |

### 표준 조회 패턴

```sql
-- 월별 세그먼트 스냅샷 조회
SELECT
    partition_date,
    user_id,
    active_status,     -- 마케팅 공식 세그먼트
    visit_frequency    -- Active 유저 세부 빈도
FROM team.marketing.29cm_user_visit_segment_monthly
WHERE partition_date = '2026-04-01'
```

### 활용 원칙

| 분석 목적 | 사용 방법 |
|-----------|----------|
| 휴면/비활성/이탈 분석 | `active_status` 값으로 필터 |
| 고활성 vs 저활성 비교 | `visit_frequency IN ('AA','A')` vs `('B','C','D','Z')` |
| 세그먼트별 GMV/전환 | 주문 테이블과 `user_id` JOIN |

### 금지 패턴 (과거 AI 쿼리 오류 사례)

```sql
-- ❌ 이런 식의 임의 정의 금지 — 마케팅 공식 세그먼트와 일관성 깨짐
CASE
  WHEN COALESCE(visits_before, 0) = 0 THEN '휴면'
  WHEN COALESCE(visits_before, 0) BETWEEN 1 AND 3 THEN '저활성'
  ELSE '활성'
END AS status_before
```

→ 반드시 `active_status`/`visit_frequency` 컬럼을 조인하여 사용.

---

## 31. 데이터 리니지: Snowplow App User Session

> CMDATA-3141 참고. `snowplow_app_user_session_29cm` 관련 조인 키/원천 정보.

**데이터 리니지**:
- **원천**: `ocmp-29cm.snowplow.snowplow_app` (Snowplow 이벤트 로그, BigQuery 원천)
- **결과**: `datamart.gold.snowplow_app_user_session_29cm` (세션 집계)

**주요 조인 키**:

| 컬럼 | 설명 |
|------|------|
| `user_id` | 사용자 식별자 (BIGINT) |
| `snowplow_id` | Snowplow 익명 사용자 식별자 (비로그인 포함) |
| `partition_date` / `dt` | 날짜 파티션 |

> **활용 주의**: 방문 유저 "식별" 용도로만 사용 권장. 유저 활성도 세그먼트 정의는 **Section 30 마케팅 세그먼트 테이블**을 사용할 것.

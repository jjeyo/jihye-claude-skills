# 쿼리 패턴 예시

> ⚠️ **쿼리 작성 전 반드시 `schema.md`의 컬럼 타입을 확인하세요!**
> ⚠️ **주문 테이블 사용 시 취소 필터 필요 여부를 반드시 체크하세요!** (SKILL.md "주문 취소 고려 체크리스트" 참조)

## 1. GMV 분석

> ⚠️ GMV/매출 집계는 **반드시 취소 제외** (`order_item_cancel_status_name = '주문_최초'`)
>
> 🔴 **CS 반영 순매출이 필요한 경우** (교환/환불/반품 차감): `29cm_mart_order` + `29cm_mart_order_cs` UNION ALL 패턴 사용 (아래 "CS 반영 GMV" 절 참고)

### CS 반영 GMV (CMDATA-3141 참조 쿼리) ★

> `29cm_mart_order` 단독 사용 시 CS(교환/환불/반품) 미반영으로 매출 수치 왜곡. **정확한 최종 매출**이 필요한 보고서/분석에는 이 패턴 사용.

```sql
WITH ord AS (
  SELECT
    dt,
    order_no,
    SUM(sales_sell_price) AS gmv,
    SUM(CASE WHEN sales_sell_price > 0 THEN sales_sell_price ELSE 0 END) AS ggmv
  FROM (
    SELECT dt, order_no, sales_sell_price
    FROM datamart.datamart.`29cm_mart_order`  -- CS 미반영 원본
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
  SUM(gmv) AS gmv,
  SUM(ggmv) AS ggmv
FROM ord
GROUP BY 1
```

### 일별 GMV (간편 — CS 미반영)

```sql
SELECT
    dt AS order_date,
    COUNT(DISTINCT order_no) AS order_count,
    COUNT(DISTINCT user_no) AS buyer_count,
    SUM(sales_sell_price) AS gmv
FROM datamart.datamart.29cm_mart_order
WHERE dt BETWEEN '2025-01-01' AND '2025-01-31'
    AND order_item_cancel_status_name = '주문_최초'  -- 취소/반품 제외
GROUP BY dt
ORDER BY order_date
```

### 카테고리별 GMV

```sql
SELECT
    large_category_name,
    middle_category_name,
    COUNT(DISTINCT order_no) AS order_count,
    COUNT(DISTINCT user_no) AS buyer_count,
    SUM(sales_sell_price) AS gmv
FROM datamart.datamart.29cm_mart_order
WHERE dt BETWEEN '2025-01-01' AND '2025-01-31'
    AND order_item_cancel_status_name = '주문_최초'  -- 취소/반품 제외
GROUP BY large_category_name, middle_category_name
ORDER BY gmv DESC
```

### 적립금 어뷰징 탐지 (유저별 적립금 TOP + 구매 패턴)

> ⚠️ 적립금/마일리지 분석은 **반드시 취소 제외** — 취소된 주문의 적립금은 회수되므로 포함 시 분석 오류 발생

```sql
-- 적립금 많이 받은 유저의 실제 구매 패턴 분석
WITH user_mileage AS (
    SELECT
        user_no,
        SUM(mileage_sale_amount) AS total_mileage_used,
        COUNT(DISTINCT order_no) AS order_count,
        SUM(sales_sell_price) AS total_gmv
    FROM datamart.datamart.29cm_mart_order
    WHERE dt BETWEEN '2025-01-01' AND '2025-03-31'
        AND order_item_cancel_status_name = '주문_최초'  -- ⚠️ 취소 제외 필수!
    GROUP BY user_no
)
SELECT
    user_no,
    total_mileage_used,
    order_count,
    total_gmv,
    ROUND(total_mileage_used / NULLIF(total_gmv, 0) * 100, 2) AS mileage_ratio_pct
FROM user_mileage
WHERE total_mileage_used > 0
ORDER BY total_mileage_used DESC
LIMIT 100
```

---

## 2. 퍼널 분석

### 기본 퍼널 (진입→PDP→구매)

```sql
WITH funnel AS (
    SELECT
        COUNT(DISTINCT CASE WHEN event_name = 'session_start' THEN user_id END) AS visitors,
        COUNT(DISTINCT CASE WHEN event_name = 'visit_item_detail' THEN user_id END) AS pdp_viewers,
        COUNT(DISTINCT CASE WHEN event_name = 'click_checkout' THEN user_id END) AS checkout_users
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE DATE(event_timestamp) BETWEEN '2025-01-01' AND '2025-01-31'
)
SELECT
    visitors,
    pdp_viewers,
    checkout_users,
    ROUND(pdp_viewers * 100.0 / visitors, 2) AS pdp_rate,
    ROUND(checkout_users * 100.0 / pdp_viewers, 2) AS checkout_rate
FROM funnel
```

### 상세 퍼널 (장바구니 포함)

```sql
WITH funnel AS (
    SELECT
        user_id,
        MAX(CASE WHEN event_name = 'session_start' THEN 1 ELSE 0 END) AS step1_visit,
        MAX(CASE WHEN event_name = 'visit_item_detail' THEN 1 ELSE 0 END) AS step2_pdp,
        MAX(CASE WHEN event_name = 'add_to_cart' THEN 1 ELSE 0 END) AS step3_cart,
        MAX(CASE WHEN event_name = 'click_checkout' THEN 1 ELSE 0 END) AS step4_checkout
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE dt BETWEEN '2024-12-01' AND '2024-12-31'
    GROUP BY user_id
)
SELECT
    SUM(step1_visit) AS step1_visit,
    SUM(step2_pdp) AS step2_pdp,
    SUM(step3_cart) AS step3_cart,
    SUM(step4_checkout) AS step4_checkout,
    ROUND(SUM(step2_pdp) * 100.0 / SUM(step1_visit), 2) AS visit_to_pdp_rate,
    ROUND(SUM(step3_cart) * 100.0 / SUM(step2_pdp), 2) AS pdp_to_cart_rate,
    ROUND(SUM(step4_checkout) * 100.0 / SUM(step3_cart), 2) AS cart_to_checkout_rate
FROM funnel
```

---

## 3. 리텐션 분석

### 월별 재구매율

```sql
WITH first_purchase AS (
    SELECT
        user_no,
        DATE_TRUNC('MONTH', MIN(dt)) AS first_month
    FROM datamart.datamart.29cm_mart_order
    WHERE dt >= '2024-01-01'
    GROUP BY user_no
),
monthly_orders AS (
    SELECT
        o.user_no,
        DATE_TRUNC('MONTH', o.dt) AS order_month,
        f.first_month
    FROM datamart.datamart.29cm_mart_order o
    JOIN first_purchase f ON o.user_no = f.user_no
    WHERE o.dt >= '2024-01-01'
)
SELECT
    first_month,
    MONTHS_BETWEEN(order_month, first_month) AS month_diff,
    COUNT(DISTINCT user_no) AS retained_users
FROM monthly_orders
GROUP BY first_month, MONTHS_BETWEEN(order_month, first_month)
ORDER BY first_month, month_diff
```

### N일차 리텐션

```sql
WITH first_visit AS (
    SELECT
        user_id,
        MIN(DATE(event_timestamp)) AS first_date
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE DATE(event_timestamp) >= '2025-01-01'
    GROUP BY user_id
),
retention AS (
    SELECT
        f.user_id,
        f.first_date,
        DATEDIFF(DATE(e.event_timestamp), f.first_date) AS day_n
    FROM first_visit f
    JOIN team.tech.cda_29cm_snowplow_event_mart_daily e
        ON f.user_id = e.user_id
)
SELECT
    day_n,
    COUNT(DISTINCT user_id) AS retained_users
FROM retention
WHERE day_n BETWEEN 0 AND 30
GROUP BY day_n
ORDER BY day_n
```

---

## 4. 코호트 분석 (전후 비교)

### 기능 출시 전후 비교

```sql
WITH user_behavior AS (
    SELECT
        user_id,
        CASE
            WHEN DATE(event_timestamp) < '2025-06-01' THEN 'pre'
            ELSE 'post'
        END AS period,
        COUNT(*) AS event_count
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE DATE(event_timestamp) BETWEEN '2025-05-01' AND '2025-06-30'
    GROUP BY user_id,
        CASE
            WHEN DATE(event_timestamp) < '2025-06-01' THEN 'pre'
            ELSE 'post'
        END
)
SELECT
    period,
    COUNT(DISTINCT user_id) AS users,
    AVG(event_count) AS avg_events
FROM user_behavior
GROUP BY period
```

### 첫 행동 기준 전후 비교

```sql
WITH user_first_action AS (
    SELECT
        user_id,
        MIN(DATE(event_timestamp)) AS first_action_date
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE event_name = 'click_like'
      AND dt BETWEEN '2024-06-01' AND '2024-12-31'
    GROUP BY user_id
),
user_orders AS (
    SELECT
        CAST(user_no AS STRING) AS user_id,
        DATE(dt) AS order_date,
        SUM(sales_sell_price) AS gmv
    FROM datamart.datamart.29cm_mart_order
    WHERE dt BETWEEN '2024-01-01' AND '2024-12-31'
    GROUP BY user_no, DATE(dt)
)
SELECT
    CASE
        WHEN o.order_date < u.first_action_date THEN 'pre'
        ELSE 'post'
    END AS period,
    COUNT(DISTINCT o.user_id) AS users,
    SUM(o.gmv) AS total_gmv,
    SUM(o.gmv) / COUNT(DISTINCT o.user_id) AS gmv_per_user
FROM user_first_action u
JOIN user_orders o ON u.user_id = o.user_id
WHERE o.order_date BETWEEN DATE_ADD(u.first_action_date, -30)
                       AND DATE_ADD(u.first_action_date, 30)
GROUP BY CASE WHEN o.order_date < u.first_action_date THEN 'pre' ELSE 'post' END
```

---

## 5. 선물하기 분석

> ⚠️ **중요: is_gift는 VARCHAR 타입입니다!**
> - **선물 주문**: `is_gift = 'T'`
> - **일반 주문**: `is_gift = 'F'`
> - ❌ TRUE, FALSE, 'Y', 'N', 1, 0 사용 불가!

### is_gift 값 확인 (첫 사용 시 필수)

```sql
-- 먼저 is_gift 컬럼의 실제 값 분포를 확인
SELECT
    is_gift,
    COUNT(*) AS cnt,
    SUM(sales_sell_price) AS gmv
FROM datamart.datamart.29cm_mart_order
WHERE dt BETWEEN '2025-01-01' AND '2025-01-31'
GROUP BY is_gift
ORDER BY cnt DESC
```

### 선물 주문 비중 (일별)

```sql
SELECT
    dt AS order_date,
    COUNT(DISTINCT order_no) AS total_orders,
    COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN order_no END) AS gift_orders,
    SUM(sales_sell_price) AS total_gmv,
    SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) AS gift_gmv,
    ROUND(COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN order_no END) * 100.0
        / NULLIF(COUNT(DISTINCT order_no), 0), 2) AS gift_order_ratio_pct,
    ROUND(SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) * 100.0
        / NULLIF(SUM(sales_sell_price), 0), 2) AS gift_gmv_ratio_pct
FROM datamart.datamart.29cm_mart_order
WHERE dt BETWEEN '2025-01-01' AND '2025-01-31'
GROUP BY dt
ORDER BY order_date
```

### 월별 선물하기 성과

```sql
SELECT
    DATE_TRUNC('MONTH', dt) AS month,
    COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN order_no END) AS gift_orders,
    COUNT(DISTINCT CASE WHEN is_gift = 'F' THEN order_no END) AS normal_orders,
    SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) AS gift_gmv,
    SUM(CASE WHEN is_gift = 'F' THEN sales_sell_price ELSE 0 END) AS normal_gmv,
    ROUND(
        SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) * 100.0 /
        SUM(sales_sell_price), 2
    ) AS gift_gmv_ratio
FROM datamart.datamart.29cm_mart_order
WHERE dt >= '2024-01-01'
GROUP BY DATE_TRUNC('MONTH', dt)
ORDER BY month
```

### 선물하기 기본 지표 — 월별(취소 분리, CS 반영) ★

> CS 테이블(mart.order_cs)을 UNION하여 취소 건을 유형별(반품취소 / 취소_배송전)로 분리 집계하는 표준 패턴.
> order_count 부호로 원주문(>0)과 취소주문(<0)을 구분한다.

```sql
/*
[선물하기] 기본 지표(취소제외) — 월별 집계
*/
WITH union_data AS (
  SELECT
    dt,
    order_no,
    is_gift,
    sales_sell_price,
    order_count,
    user_no,
    order_item_cancel_status_name
  FROM mart.order
  WHERE dt BETWEEN DATE('2024-05-01') AND DATE('2025-05-31')
  UNION ALL
  SELECT
    dt,
    order_no,
    is_gift,
    sales_sell_price,
    order_count,
    user_no,
    order_item_cancel_status_name
  FROM mart.order_cs
  WHERE dt BETWEEN DATE('2024-05-01') AND DATE('2025-05-31')
),
monthly_info AS (
  SELECT
    EXTRACT(YEAR  FROM dt) AS year,
    EXTRACT(MONTH FROM dt) AS month,
    -- 선물하기 전체 주문수
    COUNT(DISTINCT CASE WHEN order_count > 0 AND is_gift = 'T' THEN order_no END) AS cnt_gift_order,
    -- 선물하기 취소 주문수 (유형별)
    COUNT(DISTINCT CASE WHEN order_count < 0 AND is_gift = 'T' AND order_item_cancel_status_name = '반품취소'    THEN order_no END) AS cnt_gift_order_cs1,
    COUNT(DISTINCT CASE WHEN order_count < 0 AND is_gift = 'T' AND order_item_cancel_status_name = '취소_배송전' THEN order_no END) AS cnt_gift_order_cs2,
    -- 선물하기 전체 사용자 수
    COUNT(DISTINCT CASE WHEN order_count > 0 AND is_gift = 'T' THEN user_no END) AS cnt_gift_user,
    -- 선물하기 취소 사용자 수
    COUNT(DISTINCT CASE WHEN order_count < 0 AND is_gift = 'T' THEN user_no END) AS cnt_gift_user_cs,
    -- 전체 GMV
    SUM(sales_sell_price) AS order_gmv,
    -- 선물하기 GMV
    SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) AS gift_gmv
  FROM union_data
  GROUP BY year, month
)
SELECT
  year,
  month,
  cnt_gift_order,
  cnt_gift_order_cs1,
  cnt_gift_order_cs2
FROM monthly_info
ORDER BY year, month
```

**활용 포인트**
- `cnt_gift_order` — 선물하기 원주문 수 (취소 제외 순주문 계산 시 baseline)
- `cnt_gift_order_cs1` — 반품취소 건수 (배송 후 반품)
- `cnt_gift_order_cs2` — 취소_배송전 건수 (배송 전 취소)
- **취소 제외 순주문** = `cnt_gift_order - cnt_gift_order_cs1 - cnt_gift_order_cs2`
- 최종 SELECT에 `cnt_gift_user`, `gift_gmv` 등을 추가해서 지표 확장 가능

### 카테고리별 선물하기 비중

```sql
SELECT
    DATE_FORMAT(dt, 'yyyy-MM') AS month,
    large_category_name,
    middle_category_name,
    COUNT(DISTINCT order_no) AS total_orders,
    COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN order_no END) AS gift_orders,
    ROUND(COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN order_no END) * 100.0
        / NULLIF(COUNT(DISTINCT order_no), 0), 2) AS gift_order_ratio_pct,
    SUM(sales_sell_price) AS total_gmv,
    SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) AS gift_gmv,
    ROUND(SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) * 100.0
        / NULLIF(SUM(sales_sell_price), 0), 2) AS gift_gmv_ratio_pct,
    COUNT(DISTINCT user_no) AS total_buyers,
    COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN user_no END) AS gift_buyers,
    ROUND(COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN user_no END) * 100.0
        / NULLIF(COUNT(DISTINCT user_no), 0), 2) AS gift_buyer_ratio_pct
FROM datamart.datamart.29cm_mart_order
WHERE dt BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY DATE_FORMAT(dt, 'yyyy-MM'), large_category_name, middle_category_name
ORDER BY month, total_gmv DESC
```

### 동일 수령인 중복 선물 비중 (월별)

> ⚠️ 구매자-수령자 관계 분석은 `t_order_gift` 테이블 사용 (mart 테이블에는 receiver_user_no 없음)

```sql
WITH
base AS (
    SELECT
        DATE_TRUNC('MONTH', CAST(inserted_timestamp AS DATE)) AS order_month,
        buyer_user_id,
        receiver_user_no,
        order_gift_no
    FROM `29cm`.orders.t_order_gift
    WHERE CAST(inserted_timestamp AS DATE)
        BETWEEN DATE_ADD(CURRENT_DATE(), -365) AND CURRENT_DATE()
),
total_per_month AS (
    SELECT
        order_month,
        COUNT(DISTINCT order_gift_no) AS total_count
    FROM base
    GROUP BY order_month
),
combos AS (
    SELECT
        order_month,
        buyer_user_id,
        receiver_user_no,
        COUNT(*) AS combo_count
    FROM base
    GROUP BY order_month, buyer_user_id, receiver_user_no
),
duplicate_per_month AS (
    SELECT
        b.order_month,
        COUNT(DISTINCT b.order_gift_no) AS match_count
    FROM base AS b
    JOIN combos AS c
        ON  b.order_month      = c.order_month
        AND b.buyer_user_id    = c.buyer_user_id
        AND b.receiver_user_no = c.receiver_user_no
    WHERE c.combo_count >= 2
    GROUP BY b.order_month
)
SELECT
    t.order_month,
    t.total_count,
    COALESCE(d.match_count, 0) AS match_count,
    ROUND(COALESCE(d.match_count, 0) * 100.0
        / NULLIF(t.total_count, 0), 2) AS match_ratio_pct
FROM total_per_month AS t
LEFT JOIN duplicate_per_month AS d ON t.order_month = d.order_month
ORDER BY t.order_month
```

### 월별 선물하기 AOV (크로스 테이블)

> ⚠️ GMV는 `29cm_mart_order`에서, 건수는 `t_order_gift`에서 가져와 월별 LEFT JOIN

```sql
WITH
base_gmv AS (
    SELECT
        DATE_TRUNC('MONTH', dt) AS order_month,
        SUM(sales_sell_price) AS gmv
    FROM datamart.datamart.`29cm_mart_order`
    WHERE dt BETWEEN DATE_ADD(CURRENT_DATE(), -365) AND CURRENT_DATE()
        AND is_gift = 'T'
    GROUP BY order_month
),
base_count AS (
    SELECT
        DATE_TRUNC('MONTH', CAST(inserted_timestamp AS DATE)) AS order_month,
        COUNT(DISTINCT order_gift_no) AS order_count
    FROM `29cm`.orders.t_order_gift
    WHERE CAST(inserted_timestamp AS DATE)
        BETWEEN DATE_ADD(CURRENT_DATE(), -365) AND CURRENT_DATE()
    GROUP BY order_month
)
SELECT
    g.order_month,
    g.gmv,
    COALESCE(c.order_count, 0) AS order_count,
    ROUND(g.gmv / NULLIF(COALESCE(c.order_count, 0), 0), 0) AS aov
FROM base_gmv AS g
LEFT JOIN base_count AS c ON g.order_month = c.order_month
ORDER BY g.order_month
```

### 고객 등급별 선물하기 비중

```sql
SELECT
    DATE_FORMAT(dt, 'yyyy-MM') AS order_month,
    user_grade_name AS user_segment,
    COUNT(DISTINCT user_no) AS total_buyers,
    COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN user_no END) AS gift_buyers,
    ROUND(COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN user_no END) * 100.0
        / NULLIF(COUNT(DISTINCT user_no), 0), 2) AS gift_buyer_ratio_pct,
    COUNT(DISTINCT order_no) AS total_orders,
    COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN order_no END) AS gift_orders,
    ROUND(COUNT(DISTINCT CASE WHEN is_gift = 'T' THEN order_no END) * 100.0
        / NULLIF(COUNT(DISTINCT order_no), 0), 2) AS gift_order_ratio_pct,
    SUM(sales_sell_price) AS total_gmv,
    SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) AS gift_gmv,
    ROUND(SUM(CASE WHEN is_gift = 'T' THEN sales_sell_price ELSE 0 END) * 100.0
        / NULLIF(SUM(sales_sell_price), 0), 2) AS gift_gmv_ratio_pct
FROM datamart.datamart.29cm_mart_order
WHERE dt BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY DATE_FORMAT(dt, 'yyyy-MM'), user_grade_name
ORDER BY order_month, total_gmv DESC
```

---

## 6. VOC 분석

### 유형별 VOC 분포

```sql
SELECT
    type,
    COUNT(*) AS voc_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS ratio
FROM 29cm.front.voc_comments
WHERE DATE(created_at) BETWEEN '2025-01-01' AND '2025-01-31'
    AND is_usable = 1
GROUP BY type
ORDER BY voc_count DESC
```

### 플랫폼별 VOC 분포

```sql
SELECT
    platform_type,
    type,
    COUNT(*) AS voc_count
FROM 29cm.front.voc_comments
WHERE DATE(created_at) BETWEEN '2025-01-01' AND '2025-01-31'
    AND is_usable = 1
GROUP BY platform_type, type
ORDER BY platform_type, voc_count DESC
```

### 키워드 검색 (선물하기 VOC)

```sql
SELECT
    id,
    user_id,
    user_level,
    type,
    content,
    platform_type,
    is_answer,
    created_at
FROM 29cm.front.voc_comments
WHERE DATE(created_at) BETWEEN '2025-01-01' AND '2025-12-31'
    AND is_usable = 1
    AND content LIKE '%선물%'
ORDER BY created_at DESC
LIMIT 100
```

### 미답변 VOC 현황

```sql
SELECT
    type,
    platform_type,
    COUNT(*) AS unanswered_count
FROM 29cm.front.voc_comments
WHERE is_answer = 0
    AND is_usable = 1
    AND DATE(created_at) >= DATE_SUB(CURRENT_DATE(), 30)
GROUP BY type, platform_type
ORDER BY unanswered_count DESC
```

---

## 7. 진입 지면별 GMV

```sql
WITH entry_events AS (
    SELECT
        user_id,
        DATE(event_timestamp) AS event_date,
        FIRST_VALUE(current_screen) OVER (
            PARTITION BY user_id, DATE(event_timestamp)
            ORDER BY event_timestamp
        ) AS entry_screen
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE dt BETWEEN '2024-12-01' AND '2024-12-31'
      AND event_name = 'session_start'
),
user_orders AS (
    SELECT
        CAST(user_no AS STRING) AS user_id,
        DATE(dt) AS order_date,
        SUM(sales_sell_price) AS gmv
    FROM datamart.datamart.29cm_mart_order
    WHERE dt BETWEEN '2024-12-01' AND '2024-12-31'
    GROUP BY user_no, DATE(dt)
)
SELECT
    e.entry_screen,
    COUNT(DISTINCT e.user_id) AS users,
    SUM(o.gmv) AS total_gmv,
    SUM(o.gmv) / COUNT(DISTINCT e.user_id) AS gmv_per_user
FROM entry_events e
LEFT JOIN user_orders o
    ON e.user_id = o.user_id
    AND e.event_date = o.order_date
GROUP BY e.entry_screen
ORDER BY total_gmv DESC
```

---

## 8. 카테고리/브랜드 탐색 분석

### 카테고리 페이지 브랜드 탭 클릭 비율 (CTR)

참고 차트: https://app.amplitude.com/analytics/style-share/chart/q4ntacfm
```sql
-- 분모: category_main 페이지 view_page
-- 분자: category_brand_index 페이지 click_button
WITH category_main_visits AS (
    SELECT
        DATE(event_timestamp) AS dt,
        COUNT(DISTINCT user_id) AS category_users
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE event_name = 'view_page'
      AND page_name = 'category_main'
      AND DATE(event_timestamp) >= DATE_SUB(CURRENT_DATE(), 30)
    GROUP BY DATE(event_timestamp)
),
brand_tab_clicks AS (
    SELECT
        DATE(event_timestamp) AS dt,
        COUNT(DISTINCT user_id) AS brand_click_users
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE event_name = 'click_button'
      AND page_name = 'category_brand_index'
      AND DATE(event_timestamp) >= DATE_SUB(CURRENT_DATE(), 30)
    GROUP BY DATE(event_timestamp)
)
SELECT
    c.dt,
    c.category_users,
    COALESCE(b.brand_click_users, 0) AS brand_tab_click_users,
    ROUND(COALESCE(b.brand_click_users, 0) * 100.0 / c.category_users, 2) AS brand_tab_ctr
FROM category_main_visits c
LEFT JOIN brand_tab_clicks b ON c.dt = b.dt
ORDER BY c.dt DESC;
```

### 카테고리 리스트 내 브랜드 클릭 TOP
```sql
SELECT
    brand_name,
    COUNT(*) AS click_count,
    COUNT(DISTINCT user_id) AS click_users
FROM team.tech.cda_29cm_snowplow_event_mart_daily
WHERE event_name = 'click_brand'
  AND current_screen = 'category_list'
  AND DATE(event_timestamp) >= DATE_SUB(CURRENT_DATE(), 30)
GROUP BY brand_name
ORDER BY click_count DESC
LIMIT 50;
```

---

## 9. 유저 속성별 분석 (유저 마스터 JOIN)

### 연령대/성별별 상품 클릭 분석

```sql
-- 히드로 클릭 로그 + 유저 마스터 JOIN
SELECT
    b.age_band,
    b.gender,
    a.goods_no,
    'click' AS activity_type,
    COUNT(1) AS cnt
FROM event_log.silver.heathrow_click_log a
JOIN lake.gold.user_partitioned b
    ON a.hash_id = b.hash_id AND a.dt = b.dt
WHERE a.dt = '20260301'
GROUP BY b.age_band, b.gender, a.goods_no
ORDER BY cnt DESC
LIMIT 100
```

### GA4 로그인 유저 vs 전체 유저 분석

```sql
-- GA4 로그 + 유저 마스터 JOIN
WITH ga4_login AS (
    SELECT
        dt,
        hash_id
    FROM lake.bigquery.ga4_log
    WHERE dt >= '20260301'
      AND hash_id IS NOT NULL
    GROUP BY dt, hash_id
),
user_info AS (
    SELECT
        dt,
        hash_id,
        age_band,
        gender
    FROM lake.gold.user_partitioned
    WHERE dt >= '20260301'
)
SELECT
    u.age_band,
    u.gender,
    COUNT(DISTINCT g.hash_id) AS login_users
FROM ga4_login g
JOIN user_info u ON g.hash_id = u.hash_id AND g.dt = u.dt
GROUP BY u.age_band, u.gender
ORDER BY login_users DESC
```

---

## 10. GA4 이벤트 파라미터 파싱

### event_params 중첩 구조 파싱 (LATERAL VIEW explode)

> ⚠️ `lake.bigquery.events` 테이블의 event_params는 배열 구조이므로 LATERAL VIEW explode 필요

```sql
-- 로그인 페이지별 PV/UV 분석
-- ⚠️ 통합회원 전환 후: /auth/login → /auth/one/login (2025년 9월~)
SELECT
    dt,
    p.value.string_value AS page_id,
    COUNT(DISTINCT user_pseudo_id) AS cnt_users,
    COUNT(DISTINCT user_id) AS cnt_login_users
FROM lake.bigquery.events
LATERAL VIEW OUTER explode(event_params) ep AS p
WHERE dt = '20260101'
  AND event_name = 'page_view'
  AND p.key = 'page_id'
  AND p.value.string_value LIKE '/auth%'
GROUP BY dt, p.value.string_value
ORDER BY cnt_users DESC
```

---

## 11. A/B 테스트 실험군 분석

### 실험군/대조군 유저 추출

```sql
-- Amplitude A/B 테스트 실험군 데이터
SELECT
    exp_name,
    exp_group_name,
    COUNT(DISTINCT user_id) AS user_count
FROM datamart.gold.amplitude_app_exposure_user_exp_daily_29cm
WHERE exp_name = '실험명'
  AND dt BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY exp_name, exp_group_name
```

### 실험군별 구매 전환 비교

```sql
WITH exp_users AS (
    SELECT
        CAST(user_id AS INT) AS user_no,
        exp_group_name
    FROM datamart.gold.amplitude_app_exposure_user_exp_daily_29cm
    WHERE exp_name = '실험명'
      AND dt BETWEEN '2026-01-01' AND '2026-01-31'
    GROUP BY user_id, exp_group_name
),
orders AS (
    SELECT
        user_no,
        COUNT(DISTINCT order_no) AS order_cnt,
        SUM(sales_sell_price) AS gmv
    FROM datamart.datamart.29cm_mart_order
    WHERE dt BETWEEN '2026-01-01' AND '2026-01-31'
    GROUP BY user_no
)
SELECT
    e.exp_group_name,
    COUNT(DISTINCT e.user_no) AS total_users,
    COUNT(DISTINCT o.user_no) AS buyers,
    ROUND(COUNT(DISTINCT o.user_no) * 100.0
        / NULLIF(COUNT(DISTINCT e.user_no), 0), 2) AS cvr_pct,
    COALESCE(SUM(o.gmv), 0) AS total_gmv,
    ROUND(COALESCE(SUM(o.gmv), 0) * 1.0
        / NULLIF(COUNT(DISTINCT e.user_no), 0), 0) AS gmv_per_user
FROM exp_users e
LEFT JOIN orders o ON e.user_no = o.user_no
GROUP BY e.exp_group_name
```

---

## 12. CRM 캠페인 성과 분석

### UTM 기반 캠페인 유입 분석

```sql
WITH utm_base AS (
    SELECT DISTINCT
        partition_date,
        utm_source,
        user_id
    FROM team.marketing.29cm_session_traffic_log
    WHERE partition_date = '2026-01-01'
),
campaign_list AS (
    SELECT
        partition_date,
        campaign,
        campaign_type
    FROM team.marketing.29cm_crm_campaign_list_daily
    WHERE partition_date = '2026-01-01'
)
SELECT
    u.utm_source,
    COUNT(DISTINCT u.user_id) AS visit_users
FROM utm_base u
GROUP BY u.utm_source
ORDER BY visit_users DESC
```

---

## 13. 회원 등급 이력 분석

### 월별 VIP/VVIP 회원 수 추이

```sql
SELECT
    calculation_date,
    level_no,
    COUNT(*) AS user_count
FROM 29cm.member.t_user_level_history
WHERE calculation_date BETWEEN '2025-01-01' AND '2026-03-01'
  AND level_no IN (80, 90)
GROUP BY calculation_date, level_no
ORDER BY calculation_date
```

---

## 14. 카테고리 매핑 조회

### 프론트 ↔ 관리 카테고리 매핑

```sql
SELECT
    front_cate3_code,
    front_cate3_name,
    manage_cate3_code,
    manage_cate3_name,
    is_deleted,
    available_begin_timestamp,
    available_end_timestamp
FROM team.tech.cda_s_29cm_item_category_mapping
WHERE is_deleted = false
ORDER BY front_cate3_code
```

---

## 15. 누적 합계 (윈도우 함수)

### 월별 누적 입점 수

```sql
SELECT
    `입점월`,
    `월별입점수`,
    SUM(`월별입점수`) OVER (
        ORDER BY `입점월` ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS `누적수`
FROM (
    SELECT
        DATE_FORMAT(insert_timestamp, 'yyyy-MM') AS `입점월`,
        COUNT(DISTINCT item_no) AS `월별입점수`
    FROM `29cm`.item.t_item
    WHERE DATE(insert_timestamp) BETWEEN '2025-01-01' AND '2025-12-31'
    GROUP BY DATE_FORMAT(insert_timestamp, 'yyyy-MM')
)
ORDER BY `입점월`
```

---

## 16. 홈 카테고리 / 유저 마트 분석

> ⚠️ **`user_mart_29cm`은 일별 전체 유저 스냅샷입니다!**
> - 배열 컬럼(`visit_home_category_item_list`, `order_item_list` 등)은 **누적 데이터**
> - 기간별 분석 시 반드시 `FILTER()` 함수로 `insert_timestamp` 기간 필터 적용
> - 단일 스냅샷 분석 시 `WHERE dt = (SELECT MAX(dt) FROM ...)` 사용

### 홈 카테고리 WAU (주간 추이)

```sql
SELECT
  DATE_TRUNC('week', dt)     AS week_start,
  COUNT(DISTINCT user_no)    AS total_wau,
  COUNT(DISTINCT CASE
    WHEN SIZE(visit_home_category_item_list) > 0 THEN user_no
  END) AS home_category_wau,
  ROUND(COUNT(DISTINCT CASE
    WHEN SIZE(visit_home_category_item_list) > 0 THEN user_no
  END) * 100.0 / COUNT(DISTINCT user_no), 2) AS home_wau_pct
FROM datamart.gold.user_mart_29cm
WHERE dt >= DATE_ADD(CURRENT_DATE(), -84)  -- 12주
GROUP BY 1
ORDER BY 1 DESC
```

### 홈카테고리 방문 유저 vs 미방문 유저 구매 비교 (28일 보정)

```sql
-- ⚠️ 반드시 FILTER()로 기간 보정해야 정확한 수치
WITH latest AS (
  SELECT
    user_no,
    SIZE(FILTER(visit_home_category_item_list,
      x -> x.insert_timestamp >= DATE_ADD(CURRENT_DATE(), -28))) AS home_visit_cnt_28d,
    SIZE(FILTER(order_item_list,
      x -> x.insert_timestamp >= DATE_ADD(CURRENT_DATE(), -28))) AS order_cnt_28d
  FROM datamart.gold.user_mart_29cm
  WHERE dt = (SELECT MAX(dt) FROM datamart.gold.user_mart_29cm)
)
SELECT
  CASE WHEN home_visit_cnt_28d > 0 THEN '홈카테고리 방문' ELSE '미방문' END AS segment,
  COUNT(DISTINCT user_no)          AS users,
  COUNT(DISTINCT CASE WHEN order_cnt_28d > 0 THEN user_no END) AS purchasers,
  ROUND(COUNT(DISTINCT CASE WHEN order_cnt_28d > 0 THEN user_no END)
        * 100.0 / COUNT(DISTINCT user_no), 2) AS gv_conversion_rate_pct,
  ROUND(SUM(order_cnt_28d) * 1.0 / COUNT(DISTINCT user_no), 3) AS gv_per_user
FROM latest
GROUP BY 1
ORDER BY 1
```

### 홈 카테고리 세부 카테고리 분포

```sql
SELECT
  item.front_category_item_binding_list[0].category1_name AS cat1,
  item.front_category_item_binding_list[0].category2_name AS cat2,
  COUNT(*) AS cnt
FROM datamart.gold.user_mart_29cm
LATERAL VIEW EXPLODE(visit_home_category_item_list) t AS item
WHERE dt >= DATE_ADD(CURRENT_DATE(), -7)
GROUP BY 1, 2
ORDER BY cnt DESC
LIMIT 30
```

### 커뮤니티 경유 유저 성과 비교 (론칭 후 사용)

```sql
-- 커뮤니티 론칭 후: page_name을 실제 이벤트명으로 교체
WITH community_users AS (
  SELECT DISTINCT
    user_id,
    1 AS is_community_user
  FROM team.tech.cda_29cm_snowplow_event_mart_daily
  WHERE event_name = 'view_page'
    AND page_name = 'home_community'  -- 론칭 후 실제 page_name으로 교체
    AND dt BETWEEN '{start_date}' AND '{end_date}'
),
home_visitors AS (
  SELECT
    user_no,
    SIZE(FILTER(visit_home_category_item_list,
      x -> x.insert_timestamp >= '{start_date}')) AS home_visit_cnt,
    SIZE(FILTER(order_item_list,
      x -> x.insert_timestamp >= '{start_date}')) AS order_cnt
  FROM datamart.gold.user_mart_29cm
  WHERE dt = '{end_date}'
    AND SIZE(FILTER(visit_home_category_item_list,
      x -> x.insert_timestamp >= '{start_date}')) > 0
)
SELECT
  CASE WHEN cu.is_community_user = 1 THEN '커뮤니티 경유' ELSE '비경유' END AS segment,
  COUNT(DISTINCT hv.user_no) AS users,
  COUNT(DISTINCT CASE WHEN hv.order_cnt > 0 THEN hv.user_no END) AS purchasers,
  ROUND(COUNT(DISTINCT CASE WHEN hv.order_cnt > 0 THEN hv.user_no END)
        * 100.0 / COUNT(DISTINCT hv.user_no), 2) AS gv_conversion_rate_pct,
  ROUND(SUM(hv.order_cnt) * 1.0 / COUNT(DISTINCT hv.user_no), 3) AS gv_per_user
FROM home_visitors hv
LEFT JOIN community_users cu
  ON CAST(hv.user_no AS STRING) = cu.user_id
GROUP BY 1
ORDER BY 1
```

---

## 17. 상품 마스터 카테고리 조회

### 카테고리 코드/명 목록 (goods 테이블)

```sql
SELECT DISTINCT
    base_cat_code_1depth AS large_cd,
    base_cat_nm_1depth AS large_nm,
    base_cat_code_2depth AS medium_cd,
    base_cat_nm_2depth AS medium_nm
FROM datamart.datamart.goods
ORDER BY 1, 3
```

---

## 18. 분석 방법론 노하우

### TIMESTAMP vs DATE BETWEEN 비교 주의

```sql
-- ❌ 위험: TIMESTAMP 컬럼에 DATE 범위 사용 시 마지막 날 데이터 누락
WHERE completed_timestamp BETWEEN '2026-01-28' AND '2026-03-31'
-- → 2026-03-31 00:00:00 이후 데이터 전부 누락!

-- ✅ 올바른 패턴: 상한은 다음 날 미만으로 설정
WHERE completed_timestamp >= '2026-01-28'
  AND completed_timestamp < '2026-04-01'
```

> 적용 테이블: `t_mileage.completed_timestamp`, `t_order_gift.inserted_timestamp` 등 TIMESTAMP 타입 컬럼.
> `29cm_mart_order`의 `dt`는 DATE 타입이므로 `BETWEEN` 사용 안전.

---

### 활성도 기반 모수 매칭 시 ref_date 비대칭 주의

실험군/대조군 매칭 시 **ref_date 정의가 다르면 윈도우 왜곡**이 발생함.

| 구분 | 잘못된 예 | 올바른 예 |
|------|-----------|-----------|
| 실험군 ref_date | 보상 수신일 | 보상 수신일 |
| 대조군 ref_date | 첫 방문일 | 실험군 분포와 동일하게 매칭 |

**왜곡 예시**: 실험군 ref_date = 보상 수신일(2월~3월), 대조군 ref_date = 첫 방문일(랜덤 분포)이면, 대조군의 "30일 내 재방문" 윈도우 기준이 실험군과 달라져 비율이 불공정하게 계산됨.

**올바른 방법**:

```sql
-- 실험군: 보상 수신일을 ref_date로
WITH treated AS (
    SELECT user_no, MIN(completed_timestamp) AS ref_date
    FROM `29cm`.mileage.t_mileage
    WHERE merchant_key LIKE 'REWARD-%'
      AND deleted_timestamp IS NULL
    GROUP BY user_no
),
-- 대조군: 실험군 ref_date 분포와 동일한 날짜로 매칭
control AS (
    SELECT s.user_id AS user_no,
           -- 동일 날짜 분포 매칭: 실험군 ref_date 분포에서 무작위 할당
           t_sample.ref_date
    FROM control_users s
    JOIN (SELECT ref_date FROM treated ORDER BY RAND()) t_sample
      ON ...  -- 매칭 조건
)
```

---

### 리텐션 분석: "일평균" vs "전체(가중평균)" 차이

두 방식이 **수치상 크게 다를 수 있음**. 보고서에서 반드시 기준 명시 필요.

| 방식 | 계산 방법 | 특징 |
|------|-----------|------|
| **일평균** | 일별 비율의 산술평균 | 소규모 날의 이상치 영향 큼 |
| **전체(가중평균)** | `SUM(재방문자) / SUM(전체)` | 볼륨 큰 날의 영향 반영 |

```sql
-- 일평균 리텐션 (일별 비율 → 평균)
WITH daily_retention AS (
    SELECT
        DATE(ref_date) AS ref_day,
        COUNT(DISTINCT user_no) AS cohort_size,
        COUNT(DISTINCT CASE WHEN returned = 1 THEN user_no END) AS returned_users,
        ROUND(COUNT(DISTINCT CASE WHEN returned = 1 THEN user_no END) * 100.0
            / NULLIF(COUNT(DISTINCT user_no), 0), 2) AS daily_rate
    FROM cohort_table
    GROUP BY ref_day
)
SELECT
    -- 일평균: 날짜별 비율의 산술평균
    ROUND(AVG(daily_rate), 1) AS avg_retention_pct,
    -- 전체(가중평균): 합계 기반
    ROUND(SUM(returned_users) * 100.0 / NULLIF(SUM(cohort_size), 0), 1) AS total_retention_pct
FROM daily_retention
```

> 예시: 일평균 55.0% vs 전체 51.9%처럼 차이가 날 수 있음. 보고서 작성 시 어느 기준인지 명시 필수.

---

### 적립금 분석: 테이블 선택 기준

| 분석 목적 | 권장 테이블 | 이유 |
|-----------|-------------|------|
| 적립금 **적립** 현황 (보상/이벤트 출처) | `t_mileage` (type='ACCUMULATE') | merchant_key로 출처 구분 가능 |
| 적립금 **지급 내역** (정확한 사유/금액) | **`t_mileage_history` + `t_mileage` + `t_mileage_accumulate_issue` JOIN** | detail_type + merchant_key + ai.message로 완전한 사유 복원 |
| 적립금 **사용** 현황 (주문 연계) | `29cm_mart_order.mileage_sale_amount` | 주문 취소 필터 적용 용이 |
| 적립금 잔액 | `t_mileage` (ACCUMULATE - USE) | 적립-사용 차액으로 계산 |

> 🔴 **CRITICAL (CMDATA-3141 PDA 피드백)**: `t_mileage` 단독 + `type='ACCUMULATE' AND merchant_key LIKE 'REWARD-V-%'` 만으로는 지급 사유/세분화를 정확히 복원할 수 없음. **지급 내역 분석은 반드시 3테이블 JOIN 패턴 사용.**

### 적립금 지급 내역 표준 쿼리 (CMDATA-3141 참조) ★

```sql
-- EVENT 적립 지급 내역 (3테이블 JOIN — 정확한 사유/세분화)
SELECT
  DATE(h.insert_timestamp) AS dt,
  h.user_no,
  h.detail_type AS reason,
  CASE
    WHEN h.detail_type = 'EVENT_ACCUMULATE' AND m.mileage_accumulate_issue_no IS NOT NULL
      THEN COALESCE(ai.message, 'EVENT_어드민발행')
    WHEN h.detail_type = 'EVENT_ACCUMULATE' AND m.mileage_accumulate_issue_no IS NULL
      THEN COALESCE(NULLIF(m.title, ''), 'EVENT_기타')
    WHEN h.detail_type = 'CS_ACCUMULATE' AND m.mileage_accumulate_issue_no IS NOT NULL
      THEN COALESCE(ai.message, 'CS_어드민발행')
    ELSE h.detail_type
  END AS reason_detail,
  CASE
    WHEN m.merchant_key LIKE 'REWARD-S%'     THEN '취향공유 친구소개'
    WHEN m.merchant_key LIKE 'REWARD-V%'     THEN '취향공유 마일리지챌린지'
    WHEN m.merchant_key LIKE 'REWARD%'       THEN '취향공유(10/15이전)'
    WHEN m.merchant_key LIKE 'TASTE_SWIPE_%' THEN '취향스와이프'
    WHEN m.merchant_key LIKE 'CARD_GAME_%'   THEN '카드뒤집기(카드게임)'
    ELSE '어드민발행_기타'
  END AS reason_detail2,
  m.merchant AS merchant_type,
  COUNT(DISTINCT h.mileage_history_no) AS issue_cnt,
  SUM(h.amount) AS paid_amount
FROM `29cm`.mileage.t_mileage_history h
JOIN `29cm`.mileage.t_mileage m ON h.mileage_no = m.mileage_no
LEFT JOIN `29cm`.mileage.t_mileage_accumulate_issue ai
  ON m.mileage_accumulate_issue_no = ai.mileage_accumulate_issue_no
WHERE h.type IN ('ACCUMULATE', 'ACCUMULATE_CANCEL')
  AND m.merchant = 'EVENT'
  AND m.deleted_timestamp IS NULL
  AND h.deleted_timestamp IS NULL
  -- AND h.insert_timestamp >= '2026-01-01'  -- 기간 필터
GROUP BY ALL
ORDER BY 1, 2, 3
```

### 간편 적립 집계 (t_mileage 단독 — 요약용)

```sql
-- 취향공유 보상 적립 집계 (t_mileage 사용 — 간편 요약)
SELECT
    CASE
        WHEN merchant_key LIKE 'REWARD-V-%' THEN '방문보상'
        WHEN merchant_key LIKE 'REWARD-S-%' THEN '가입보상'
    END AS reward_type,
    COUNT(DISTINCT user_no) AS `수혜_유저수`,
    COUNT(*) AS `적립_건수`,
    SUM(amount) AS `총_적립금`
FROM `29cm`.mileage.t_mileage
WHERE merchant_key LIKE 'REWARD-%'
  AND deleted_timestamp IS NULL           -- 필수!
  AND type = 'ACCUMULATE'
  AND completed_timestamp >= '2026-01-28'
  AND completed_timestamp < '2026-04-01'
GROUP BY 1
```

### 앱테크 적립금 어뷰징 탐지 (t_mileage 기반) ★

> 앱테크(취향스와이프/카드게임/친구소개/마일리지챌린지) 적립금을 유저별로 집계하여 어뷰징 의심 유저를 판별.
> 필수 필터: `visible IS TRUE` + `merchant = 'EVENT'` + `deleted_timestamp IS NULL`

```sql
WITH event_raw AS (
    SELECT
        user_no,
        CASE
            WHEN merchant_key LIKE 'TASTE_SWIPE%' THEN '취향스와이프'
            WHEN merchant_key LIKE 'CARD_GAME%'   THEN '카드게임'
            WHEN merchant_key LIKE 'REWARD-S%'    THEN '친구소개'
            WHEN merchant_key LIKE 'REWARD-V%'    THEN '마일리지챌린지'
            WHEN merchant_key LIKE 'O4O_GIFT%'    THEN '오프라인이벤트'
            ELSE '기타'
        END AS event_type,
        type,
        SUM(amount) AS total_mileage_amount,
        COUNT(*) AS total_mileage_cnt,
        DATE_FORMAT(MIN(completed_timestamp), 'yyyy-MM-dd') AS first_completed_date,
        DATE_FORMAT(MAX(completed_timestamp), 'yyyy-MM-dd') AS last_completed_date
    FROM `29cm`.mileage.t_mileage
    WHERE type = 'ACCUMULATE'
      AND visible IS TRUE                  -- 비노출 레코드 제외 (필수!)
      AND merchant = 'EVENT'
      AND deleted_timestamp IS NULL        -- 삭제 레코드 제외 (필수!)
      AND DATE(completed_timestamp) BETWEEN '2026-01-01' AND '2026-03-31'
      AND (merchant_key LIKE 'TASTE_SWIPE%'
        OR merchant_key LIKE 'CARD_GAME%'
        OR merchant_key LIKE 'REWARD-S%'
        OR merchant_key LIKE 'REWARD-V%')  -- 앱테크 관련 지급만
    GROUP BY ALL
)
SELECT *
FROM event_raw
ORDER BY total_mileage_amount DESC
```

### 단독상품 조회 ★

```sql
-- 단독상품(exclusive) item_no 목록
SELECT DISTINCT item_no
FROM `29cm`.item.t_item_analysis_tagging
WHERE is_exclusive = 'T'
```

> 주문 테이블과 `item_no` JOIN으로 단독상품 GMV/비중 분석 가능:
> `JOIN `29cm`.item.t_item_analysis_tagging tag ON o.item_no = tag.item_no AND tag.is_exclusive = 'T'`

---

### 유저 세그먼트: 공식 마케팅 세그먼트 사용 (CMDATA-3141 참조) ★

> 🔴 **CRITICAL**: 유저 활성도(휴면/저활성/활성) 세그먼트를 방문 횟수로 **임의 정의하지 말 것**. 마케팅 공식 정의와 일관성 필수.

```sql
-- 공식 마케팅 세그먼트 기준 유저 분류
SELECT
    partition_date,
    user_id,
    active_status,      -- Active / Churn / Inactive / Sleep
    visit_frequency      -- Active 유저 한정: AA, A, B, C, D, Z
FROM team.marketing.29cm_user_visit_segment_monthly
WHERE partition_date = '2026-04-01'
```

```sql
-- 세그먼트별 GMV 분석 (마케팅 세그먼트 JOIN)
WITH seg AS (
    SELECT user_id, active_status, visit_frequency
    FROM team.marketing.29cm_user_visit_segment_monthly
    WHERE partition_date = '2026-04-01'
)
SELECT
    s.active_status,
    s.visit_frequency,
    COUNT(DISTINCT o.user_no) AS buyer_cnt,
    SUM(o.sales_sell_price) AS gmv
FROM datamart.datamart.`29cm_mart_order` o
JOIN seg s ON CAST(o.user_no AS STRING) = s.user_id
WHERE o.dt BETWEEN '2026-04-01' AND '2026-04-30'
  AND o.order_item_cancel_status_name = '주문_최초'
GROUP BY 1, 2
ORDER BY 1, 2
```

#### 금지 패턴 (과거 AI 쿼리 오류)

```sql
-- ❌ 임의 정의 금지 — 마케팅 공식 세그먼트와 불일치
CASE
  WHEN COALESCE(visits, 0) = 0 THEN '휴면'
  WHEN COALESCE(visits, 0) BETWEEN 1 AND 3 THEN '저활성'
  ELSE '활성'
END

-- ✅ 반드시 team.marketing.29cm_user_visit_segment_monthly 조인
```

---

## 19. 브랜드홈 3열 레이아웃 배포 전후 분석

> ⚠️ 신규 지표 설계 전 Section 22 탐색 헬퍼 쿼리로 이벤트/컬럼 실제 값 먼저 확인할 것.
> 브랜드홈 `filter_type`/`filter_value`는 비어있음. `filter_sorter`(정렬)만 추적 가능.

### 세션당 노출 밀도 (impression/click/CTR pre vs post)

```sql
WITH session_metrics AS (
    SELECT
        CASE
            WHEN DATE(event_timestamp) BETWEEN '2026-03-05' AND '2026-03-18' THEN 'pre'
            WHEN DATE(event_timestamp) BETWEEN '2026-03-20' AND '2026-04-02' THEN 'post'
        END AS period,
        session_id,
        SUM(CASE WHEN event_name = 'impression_item' THEN 1 ELSE 0 END) AS impression_cnt,
        SUM(CASE WHEN event_name = 'click_item' THEN 1 ELSE 0 END) AS click_cnt
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE page_name = 'brand_home'
      AND event_name IN ('impression_item','click_item')
      AND DATE(event_timestamp) BETWEEN '2026-03-05' AND '2026-04-02'
    GROUP BY 1, session_id
)
SELECT
    period,
    COUNT(DISTINCT session_id)                                                      AS sessions,
    ROUND(SUM(impression_cnt) * 1.0 / NULLIF(COUNT(DISTINCT session_id),0), 2)     AS impressions_per_session,
    ROUND(SUM(click_cnt) * 1.0 / NULLIF(COUNT(DISTINCT session_id),0), 2)          AS clicks_per_session,
    ROUND(SUM(click_cnt) * 100.0 / NULLIF(SUM(impression_cnt),0), 4)              AS ctr_pct
FROM session_metrics
WHERE period IS NOT NULL
GROUP BY period
ORDER BY period DESC
```

### 브랜드홈 세션 → 주문 CVR (같은 날 동일 user 주문 여부 프록시)

> `session_id`가 주문 테이블에 없으므로 "같은 날 같은 user_id 주문 여부"를 프록시로 사용.

```sql
WITH brand_sessions AS (
    SELECT DISTINCT
        CASE
            WHEN DATE(event_timestamp) BETWEEN '2026-03-05' AND '2026-03-18' THEN 'pre'
            WHEN DATE(event_timestamp) BETWEEN '2026-03-20' AND '2026-04-02' THEN 'post'
        END AS period,
        session_id,
        user_id,
        DATE(event_timestamp) AS session_date
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE event_name = 'view_page'
      AND page_name = 'brand_home'
      AND DATE(event_timestamp) BETWEEN '2026-03-05' AND '2026-04-02'
      AND user_id IS NOT NULL
),
orders AS (
    SELECT DISTINCT
        CAST(user_no AS STRING) AS user_id,
        dt AS order_date
    FROM datamart.datamart.29cm_mart_order
    WHERE dt BETWEEN '2026-03-05' AND '2026-04-02'
      AND order_item_cancel_status_name = '주문_최초'
)
SELECT
    b.period,
    COUNT(DISTINCT b.session_id)                                                                AS brand_sessions,
    COUNT(DISTINCT CASE WHEN o.user_id IS NOT NULL THEN b.session_id END)                      AS ordered_sessions,
    ROUND(COUNT(DISTINCT CASE WHEN o.user_id IS NOT NULL THEN b.session_id END) * 100.0
        / NULLIF(COUNT(DISTINCT b.session_id), 0), 4)                                          AS brand_cvr_pct
FROM brand_sessions b
LEFT JOIN orders o
  ON CAST(b.user_id AS STRING) = o.user_id
 AND b.session_date = o.order_date
WHERE b.period IS NOT NULL
GROUP BY b.period
ORDER BY b.period DESC
```

---

## 20. SRP(검색결과) 필터·패싯 분석

> ⚠️ SRP 필터는 `click_filter` 이벤트가 **존재하지 않음**.
> `click_button` + `facet_type_list`/`facet_value_list` 로 추적.

### SRP 필터 사용률 (facet_type_list 기반)

```sql
WITH srp_sessions AS (
    SELECT DISTINCT session_id
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE page_name = 'search_result'
      AND event_name IN ('view_page','visit_search_result')
      AND DATE(event_timestamp) BETWEEN '2026-03-27' AND '2026-04-09'
),
filter_sessions AS (
    SELECT DISTINCT session_id
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE page_name = 'search_result'
      AND DATE(event_timestamp) BETWEEN '2026-03-27' AND '2026-04-09'
      AND facet_type_list IS NOT NULL AND facet_type_list != ''
)
SELECT
    COUNT(DISTINCT s.session_id)                                                         AS srp_sessions,
    COUNT(DISTINCT f.session_id)                                                         AS filter_using_sessions,
    ROUND(COUNT(DISTINCT f.session_id) * 100.0
        / NULLIF(COUNT(DISTINCT s.session_id), 0), 2)                                   AS srp_filter_usage_rate_pct
FROM srp_sessions s
LEFT JOIN filter_sessions f ON s.session_id = f.session_id
```

### SRP facet 타입별 클릭률

```sql
WITH srp_sessions AS (
    SELECT DISTINCT session_id
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE page_name = 'search_result'
      AND event_name IN ('view_page','visit_search_result')
      AND DATE(event_timestamp) BETWEEN '2026-03-27' AND '2026-04-09'
),
facet_clicks AS (
    SELECT facet_type_list, session_id
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE page_name = 'search_result'
      AND event_name = 'click_button'
      AND DATE(event_timestamp) BETWEEN '2026-03-27' AND '2026-04-09'
      AND facet_type_list IS NOT NULL AND facet_type_list != ''
)
SELECT
    f.facet_type_list,
    COUNT(DISTINCT f.session_id)                                                                    AS facet_click_sessions,
    (SELECT COUNT(DISTINCT session_id) FROM srp_sessions)                                          AS total_srp_sessions,
    ROUND(COUNT(DISTINCT f.session_id) * 100.0
        / NULLIF((SELECT COUNT(DISTINCT session_id) FROM srp_sessions), 0), 2)                     AS facet_ctr_pct
FROM facet_clicks f
GROUP BY f.facet_type_list
ORDER BY facet_click_sessions DESC
```

### SRP CVR pre/post 비교

```sql
WITH srp_sessions AS (
    SELECT
        CASE
            WHEN DATE(event_timestamp) BETWEEN '2026-03-12' AND '2026-03-25' THEN 'pre'
            WHEN DATE(event_timestamp) BETWEEN '2026-03-27' AND '2026-04-09' THEN 'post'
        END AS period,
        session_id,
        user_id,
        DATE(event_timestamp) AS session_date
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE page_name = 'search_result'
      AND event_name IN ('view_page','visit_search_result')
      AND DATE(event_timestamp) BETWEEN '2026-03-12' AND '2026-04-09'
      AND user_id IS NOT NULL
    GROUP BY 1, session_id, user_id, DATE(event_timestamp)
),
orders AS (
    SELECT DISTINCT CAST(user_no AS STRING) AS user_id, dt AS order_date
    FROM datamart.datamart.29cm_mart_order
    WHERE dt BETWEEN '2026-03-12' AND '2026-04-09'
      AND order_item_cancel_status_name = '주문_최초'
)
SELECT
    s.period,
    COUNT(DISTINCT s.session_id)                                                                    AS srp_sessions,
    COUNT(DISTINCT CASE WHEN o.user_id IS NOT NULL THEN s.session_id END)                          AS ordered_sessions,
    ROUND(COUNT(DISTINCT CASE WHEN o.user_id IS NOT NULL THEN s.session_id END) * 100.0
        / NULLIF(COUNT(DISTINCT s.session_id), 0), 4)                                              AS srp_cvr_pct
FROM srp_sessions s
LEFT JOIN orders o ON CAST(s.user_id AS STRING) = o.user_id AND s.session_date = o.order_date
WHERE s.period IS NOT NULL
GROUP BY s.period
ORDER BY s.period DESC
```

---

## 21. 세션 시퀀스 기반 페이지 전환율

> `previous_page_name`이 브랜드홈→검색 등 일부 경로에서 비어있으므로,
> 세션 ID와 event_timestamp 순서로 전환을 측정.

### 예: 브랜드홈 → 검색 페이지 이동률

```sql
WITH brand_sessions AS (
    SELECT DISTINCT
        session_id,
        user_id,
        MIN(event_timestamp) AS first_brand_time
    FROM team.tech.cda_29cm_snowplow_event_mart_daily
    WHERE event_name = 'view_page'
      AND page_name = 'brand_home'
      AND DATE(event_timestamp) BETWEEN '2026-03-10' AND '2026-03-16'
    GROUP BY session_id, user_id
),
search_after_brand AS (
    SELECT DISTINCT b.session_id
    FROM brand_sessions b
    JOIN team.tech.cda_29cm_snowplow_event_mart_daily e
      ON b.session_id = e.session_id
     AND e.event_timestamp > b.first_brand_time
    WHERE e.page_name IN ('search_start','search_result')
      AND e.event_name IN ('view_page','visit_search_start','visit_search_result')
      AND DATE(e.event_timestamp) BETWEEN '2026-03-10' AND '2026-03-17'
)
SELECT
    COUNT(DISTINCT b.session_id)                                                        AS brand_sessions,
    COUNT(DISTINCT s.session_id)                                                        AS went_to_search,
    ROUND(COUNT(DISTINCT s.session_id) * 100.0
        / NULLIF(COUNT(DISTINCT b.session_id), 0), 2)                                  AS brand_to_search_rate_pct
FROM brand_sessions b
LEFT JOIN search_after_brand s ON b.session_id = s.session_id
```

---

## 22. 이벤트/컬럼 구조 탐색 헬퍼 쿼리

신규 지표 설계 전 "어떤 이벤트의 어떤 컬럼에 값이 있는지" 먼저 확인하는 습관이 필수.

### [A] 페이지의 이벤트 분포

```sql
SELECT
    event_name,
    current_screen,
    page_name,
    COUNT(*) AS cnt
FROM team.tech.cda_29cm_snowplow_event_mart_daily
WHERE DATE(event_timestamp) BETWEEN '시작일' AND '종료일'
  AND (page_name = '대상페이지' OR current_screen LIKE '%키워드%')
GROUP BY event_name, current_screen, page_name
ORDER BY cnt DESC
LIMIT 50
```

### [B] click_button의 button_name Top 100

```sql
SELECT
    button_name,
    COUNT(*) AS cnt,
    COUNT(DISTINCT session_id) AS sessions
FROM team.tech.cda_29cm_snowplow_event_mart_daily
WHERE event_name = 'click_button'
  AND page_name = '대상페이지'
  AND DATE(event_timestamp) BETWEEN '시작일' AND '종료일'
  AND button_name IS NOT NULL AND button_name != ''
GROUP BY button_name
ORDER BY cnt DESC
LIMIT 100
```

### [C] 필터/패싯/섹션/탭 컬럼 채워진 비율 확인

```sql
SELECT
    event_name,
    COUNT(*)                                                                                        AS total_events,
    COUNT(CASE WHEN filter_type IS NOT NULL AND filter_type != ''         THEN 1 END)              AS with_filter_type,
    COUNT(CASE WHEN filter_value IS NOT NULL AND filter_value != ''       THEN 1 END)              AS with_filter_value,
    COUNT(CASE WHEN filter_sorter IS NOT NULL AND filter_sorter != ''     THEN 1 END)              AS with_filter_sorter,
    COUNT(CASE WHEN facet_type_list IS NOT NULL AND facet_type_list != '' THEN 1 END)              AS with_facet_type_list,
    COUNT(CASE WHEN facet_value_list IS NOT NULL AND facet_value_list !=''THEN 1 END)              AS with_facet_value_list,
    COUNT(CASE WHEN keyword IS NOT NULL AND keyword != ''                 THEN 1 END)              AS with_keyword,
    COUNT(CASE WHEN section_name IS NOT NULL AND section_name != ''      THEN 1 END)              AS with_section_name,
    COUNT(CASE WHEN tab_name IS NOT NULL AND tab_name != ''              THEN 1 END)              AS with_tab_name
FROM team.tech.cda_29cm_snowplow_event_mart_daily
WHERE page_name = '대상페이지'
  AND DATE(event_timestamp) BETWEEN '시작일' AND '종료일'
GROUP BY event_name
ORDER BY total_events DESC
LIMIT 30
```

> 이 쿼리를 첫 탐색 단계에서 돌리면, 해당 지면이 어떤 트래킹 구조를 쓰는지 한 번에 파악 가능.
> `with_*` 수치로 어느 컬럼을 조인축으로 쓸지 결정.

### [D] 테이블 스키마 전체

```sql
DESCRIBE TABLE team.tech.cda_29cm_snowplow_event_mart_daily;
```

### [E] 세션/이벤트 row 샘플 (모든 컬럼)

```sql
SELECT *
FROM team.tech.cda_29cm_snowplow_event_mart_daily
WHERE page_name = '대상페이지'
  AND DATE(event_timestamp) = '특정일'
LIMIT 10
```

### [F] section_name 또는 facet_value_list 전체 값 분포

```sql
SELECT
    section_name,
    COUNT(*) AS cnt,
    COUNT(DISTINCT session_id) AS sessions
FROM team.tech.cda_29cm_snowplow_event_mart_daily
WHERE page_name = '대상페이지'
  AND DATE(event_timestamp) BETWEEN '시작일' AND '종료일'
  AND section_name IS NOT NULL AND section_name != ''
GROUP BY section_name
ORDER BY cnt DESC
LIMIT 200
```

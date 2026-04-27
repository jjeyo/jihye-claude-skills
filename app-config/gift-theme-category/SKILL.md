---
name: gift-theme-category
description: 선물하기 추천탭 Promoted형 테마 카테고리 JSON 생성 스킬. "선물하기 테마 카테고리 추가해줘", "선물하기 추천탭에 테마 카테고리를 추가해줘", "선물하기 추천탭에 테마 카테고리를 수정해줘", "선물하기 추천탭에 테마 카테고리를 변경해줘", "선물하기 테마 카테고리 설정" 등의 요청에 트리거됩니다.
---

# 선물하기 테마 카테고리 JSON 생성

선물하기 추천탭 내 Promoted형 테마 카테고리를 추가/수정하기 위한 JSON을 생성한다.

## 배경

- **영역**: SSP(Smart Section Page) > 지금 많이 찾는 선물 영역 > 테마 버튼
- **담당**: FE (하드코딩 필요)
- **주의**: BE theme-category API 수정 시 부작용 발생하여 FE 하드코딩으로 진행
- **관련 문서**: [선물하기_시즌_테마_적용_가이드.md](../../Documents/29CM-P-CE/선물하기_시즌_테마_적용_가이드.md)

---

## 워크플로우

### 1. 작업 유형 확인

사용자에게 작업 유형 확인:

| 옵션 | 설명 |
|------|------|
| 테마 추가 | 새로운 테마 카테고리 추가 |
| 테마 수정 | 기존 테마 카테고리 내용 변경 |
| 테마 삭제 | 기존 테마 카테고리 제거 |
| 전체 새로 작성 | 처음부터 새로 입력 |

### 2. 필수 정보 수집

테마 카테고리별 다음 정보를 수집:

| 항목 | 설명 | 예시 |
|------|------|------|
| 메뉴명 (label) | 테마 카테고리 버튼에 표시될 텍스트 | 설맞이 |
| 이미지 URL (imageUrl) | 테마 카테고리 썸네일 이미지 | https://img.29cm.co.kr/cms/202602/... |
| 랜딩 URL (path) | 클릭 시 이동할 페이지 URL | https://www.29cm.co.kr/content/... |

### 3. 입력 형식

PM이 아래 형식으로 한 번에 입력 가능:

```
메뉴명: 설맞이
이미지: https://img.29cm.co.kr/cms/202602/example.png
URL: https://www.29cm.co.kr/content/category-collection/2026/02/ready-new-year-holiday
```

또는 간단하게:

```
설맞이
https://img.29cm.co.kr/cms/202602/example.png
https://www.29cm.co.kr/content/category-collection/2026/02/ready-new-year-holiday
```

---

## JSON 구조

### 단일 테마 카테고리

```json
[
  {
    "label": "설맞이",
    "imageUrl": "https://img.29cm.co.kr/cms/202602/11f10018dca6cd3ea5401deddd372651.png",
    "path": "https://www.29cm.co.kr/content/category-collection/2026/02/ready-new-year-holiday#gift-recommend"
  }
]
```

### 복수 테마 카테고리

```json
[
  {
    "label": "설맞이",
    "imageUrl": "https://img.29cm.co.kr/cms/202602/example1.png",
    "path": "https://www.29cm.co.kr/content/category-collection/2026/02/ready-new-year-holiday#gift-recommend"
  },
  {
    "label": "발렌타인",
    "imageUrl": "https://img.29cm.co.kr/cms/202602/example2.png",
    "path": "https://www.29cm.co.kr/content/category-collection/2026/02/valentine#gift-recommend"
  }
]
```

---

## 처리 규칙

### 1. 랜딩 URL 파라미터 처리

| 도메인 | 규칙 |
|--------|------|
| content.29cm.co.kr | 변환 없음 (path 그대로 사용) |
| www.29cm.co.kr | 변환 없음 (path 그대로 사용) |

### 2. 해시태그 추가 권장

선물하기 추천탭에서 진입 시 `#gift-recommend` 해시태그 추가 권장:
- 예: `https://www.29cm.co.kr/content/category-collection/2026/02/ready-new-year-holiday#gift-recommend`

### 3. 이미지 URL 형식

29cm CDN URL 형식 확인:
- `https://img.29cm.co.kr/cms/YYYYMM/...`
- `https://asset.29cm.co.kr/cms/...`

---

## 출력 형식

### 응답 템플릿

```
## 테마 카테고리 JSON 생성 완료

### 1. 복사용 (한 줄 - FE에 전달용)

[한 줄 JSON]

### 2. 확인용 (정렬됨)

[정렬된 JSON]

### 테마 카테고리 요약

| 순서 | 메뉴명 | 랜딩 URL |
|------|--------|----------|
| 1 | 설맞이 | .../ready-new-year-holiday |

### FE 전달 정보

| 항목 | 내용 |
|------|------|
| 담당 FE | 이현진(Satine) |
| 작업 유형 | 하드코딩 |
| 노출 위치 | SSP > 지금 많이 찾는 선물 > 1st 탭 |
| 노출 기간 | (기간 입력 시 표시) |
```

---

## 현재 적용 중인 테마 카테고리

### 운영환경 (PROD) - 최종 업데이트: 2026-02-10

```json
[
  {
    "label": "설맞이",
    "imageUrl": "https://img.29cm.co.kr/cms/202602/11f10018dca6cd3ea5401deddd372651.png",
    "path": "https://www.29cm.co.kr/content/category-collection/2026/02/ready-new-year-holiday#gift-recommend"
  }
]
```

---

## 관련 티켓 히스토리

| 시즌 | ETR 티켓 | 개발 티켓 | 비고 |
|------|----------|----------|------|
| 2025년 12월 홀리데이 | [ETR-2274](https://jira.team.musinsa.com/browse/ETR-2274) | [M29CE-868](https://jira.team.musinsa.com/browse/M29CE-868) | 완료 |
| 2026년 2월 설맞이 | [ETR-2715](https://jira.team.musinsa.com/browse/ETR-2715) | [M29CEF-2823](https://jira.team.musinsa.com/browse/M29CEF-2823) | 진행중 |

---

## 담당자

| 역할 | 담당자 | 슬랙 |
|------|--------|------|
| FE (SSP 테마 버튼) | 이현진 | @이현진(Satine)/29CMnE Commerce Frontend |
| PM (선물하기 담당) | 김지혜 | @김지혜/29CM-P Customer Engagement |

---

## 주의사항

### BE API 수정 금지

```
theme-category API 수정 시:
- SSP 테마 버튼 <- 의도한 영역
- 추천 진입점 테마 <- 의도하지 않은 영역에도 노출됨!

-> 따라서 SSP 테마 버튼 추가는 FE 하드코딩으로 진행
```

### 진입점 URL 서버 미제공

- 서버에서 제공하지 않음
- 프레이머 링크를 FE에 직접 전달해야 함

---

## 예시 요청

**사용자**: "선물하기 추천탭에 설맞이 테마 카테고리 추가해줘"

**사용자 제공 정보**:
- 메뉴명: 설맞이
- 이미지: https://img.29cm.co.kr/cms/202602/11f10018dca6cd3ea5401deddd372651.png
- URL: https://www.29cm.co.kr/content/category-collection/2026/02/ready-new-year-holiday

**Claude 출력**: 위 템플릿에 맞춰 JSON 생성 및 FE 전달 정보 제공

---

## 업데이트 이력

| 일자 | 변경 내용 | 담당자 |
|:----:|-----------|:------:|
| 2026-02-10 | 스킬 최초 생성 | Jihye |

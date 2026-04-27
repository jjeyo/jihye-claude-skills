# 29CM PRD 템플릿

## Confluence 페이지 구조

```markdown
# PRD : [프로젝트 제목]

## 0. Change History

| Version | Author | Date | Detail |
|---------|--------|------|--------|
| V 0.1 | @담당PM | YYYY-MM-DD | 초안 작성 |

---

## 1. Overview

| 항목 | 내용 |
|------|------|
| **2-Pager** | [2-Pager 링크 또는 "해당 없음"] |
| **Initiative/Epic** | [Jira 티켓 링크] |

### Team

| Role | 담당자 |
|------|--------|
| PM | @담당PM |
| PD | @담당PD |
| BE | @BE 개발자 |
| Discovery FE | @FE 개발자 |
| ME | @ME 개발자 |
| iOS | @iOS 개발자 |
| Android | @Android 개발자 |
| DA | @DA |
| QA | @QA |

### Schedule

| 마일스톤 | 일정 |
|----------|------|
| Kick-off | YYYY-MM-DD |
| Design Complete | YYYY-MM-DD |
| Dev Complete | YYYY-MM-DD |
| QA | YYYY-MM-DD |
| Launch | YYYY-MM-DD |

---

## 2. Problem Definition

### 2-1. 배경 및 문제

> 💡 2-Pager가 있는 경우 링크로 대체 가능

#### 정량적 근거 (데이터)

| 항목 | 내용 |
|------|------|
| **데이터 인사이트** | [핵심 인사이트 기술] |
| **데이터 출처** | Amplitude / Databricks / GA 등 |
| **추출 기간** | YYYY-MM-DD ~ YYYY-MM-DD |
| **데이터 링크** | [Amplitude 차트/대시보드 URL] |

#### 정성적 근거 (VOC)

| 항목 | 내용 |
|------|------|
| **VOC 내용** | [고객 피드백 요약] |
| **출처** | CS 인입 / 앱 리뷰 / 고객 인터뷰 등 |
| **수집 기간** | YYYY-MM-DD ~ YYYY-MM-DD |

### 2-2. 목표 / Business Impact

- **Primary Metric**: [주요 성공 지표]
- **Secondary Metric**: [보조 성공 지표]
- **예상 임팩트**: [정량적 기대 효과]

---

## 3. High Level Solution

1. [해결 방안 1]
2. [해결 방안 2]
3. [해결 방안 3]

---

## 4. 상세 정책 및 Spec

### REQ-001: [요구사항 제목]

| 항목 | 내용 |
|------|------|
| **우선순위** | P0 / P1 / P2 |
| **화면/기능** | [화면명 또는 기능명] |
| **영향범위** | BE / Discovery FE / ME / iOS / Android |

#### ASIS (현재 상태)

**설명**: [현재 정책 또는 동작 설명]

**화면**:
> [현재 화면 캡처 이미지 삽입]
> 또는 피그마 링크: [Figma URL]

#### TOBE (변경 후)

**설명**: [변경될 정책 또는 동작 설명]

**화면**:
> [변경 예정 화면 이미지 삽입]
> 피그마 링크: [Figma URL]

#### 기대효과
- [이 변경으로 인한 기대 결과]

---

### REQ-002: [요구사항 제목]

(위와 동일한 형식으로 반복)

---

## 5. 개발 영향범위

> 개발자가 WBS를 작성할 수 있도록 영향범위 정리

| 개발 영역 | 영향 여부 | 주요 작업 내용 |
|-----------|----------|---------------|
| BE (Backend) | O / X | [작업 내용 요약] |
| Discovery Frontend | O / X | [작업 내용 요약] |
| ME (Mobile Experience) | O / X | [작업 내용 요약] |
| iOS | O / X | [작업 내용 요약] |
| Android | O / X | [작업 내용 요약] |
| DA (Data Analytics) | O / X | [작업 내용 요약] |
| QA | O / X | [테스트 범위 요약] |

---

## 6. 디자인

**Figma 링크**: [Figma URL]

---

## 7. Appendix

- [참고 문서 링크]
- [관련 PRD 링크]
- [기타 참고 자료]
```

## 작성 가이드

### Initiative/Epic 표기 규칙
- 항상 "Initiative/Epic"으로 표기
- Initiative 하위가 아닌 독립 프로젝트도 Epic 티켓 생성 필요
- Jira 티켓을 생성한 후 반드시 링크 연결

### ASIS/TOBE 작성 규칙
1. **이미지 필수**: 화면 캡처 또는 피그마 링크 반드시 포함
2. **설명 명확화**: 현재 정책과 변경 정책을 명확하게 구분
3. **비교 용이성**: 같은 화면/기능에 대해 전후 비교가 가능하도록 작성

### 데이터 근거 작성 규칙 (2-Pager 없는 경우)
1. **데이터 인사이트**: 문제를 보여주는 핵심 데이터 포인트
2. **데이터 출처**: Amplitude, Databricks, GA 등 명시
3. **추출 기간**: 분석에 사용한 데이터 기간 명시
4. **링크 필수**: 데이터 차트/대시보드 URL 첨부

### 개발 영향범위 작성 규칙
- 각 개발 영역별로 영향 여부(O/X) 명시
- 주요 작업 내용을 간략히 요약
- 개발자가 이 표만 보고도 대략적인 스코프 파악 가능하도록

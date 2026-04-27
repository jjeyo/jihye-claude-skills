---
name: prd-writer
description: 29CM PRD(Product Requirements Document) 작성 스킬. "PRD 작성해줘", "PRD 만들어줘", "요구사항 문서 작성해줘" 등의 요청에 트리거됩니다. PM이 개발팀과 협업하기 위한 표준화된 PRD를 생성하며, 개발 스코프 산정과 WBS 작성이 가능하도록 상세한 요구사항과 영향범위를 포함합니다.
---

# PRD Writer Skill

29CM PM을 위한 PRD(Product Requirements Document) 작성 도우미입니다.

## 워크플로우

### Step 1: 프로젝트 유형 확인

사용자에게 다음을 확인:

1. **Initiative 연결 여부**: 이 PRD가 Initiative 하위에 연결되는지 확인
   - Initiative 하위인 경우 → 2-Pager 링크 요청
   - 독립 프로젝트인 경우 → Step 2에서 배경/문제정의 상세 작성

2. **프로젝트 기본 정보** 수집:
   - 프로젝트 제목
   - 담당 PM (본인)
   - 관련 개발팀 (BE, Discovery Frontend, ME, iOS, Android 등)
   - 담당 PD (있는 경우)
   - 예상 런칭 일정

### Step 2: 배경 및 문제 정의

**Initiative 하위 프로젝트인 경우:**
- 2-Pager 링크만 첨부

**독립 프로젝트인 경우 (2-Pager 없음):**
다음 정보를 반드시 수집:

1. **정량적 근거 (데이터)**
   - 데이터 인사이트: 어떤 데이터가 문제를 보여주는가?
   - 데이터 출처: Amplitude, Databricks, GA 등
   - 데이터 추출 기간: 분석 기간 명시 (예: 2025.01.01 ~ 2025.01.31)
   - 차트/데이터 링크: Amplitude 차트 또는 대시보드 URL

2. **정성적 근거 (VOC)**
   - 고객 피드백, CS 인입 내용, 앱 리뷰 등
   - VOC 출처와 수집 기간

### Step 3: 목표 및 기대효과

- 비즈니스 목표 (예: GMV 증가, 전환율 개선)
- 성공 지표 (Primary/Secondary Metrics)
- 예상 임팩트 (정량적 수치 포함)

### Step 4: High Level Solution

- 해결 방안 개요 (3-5개 항목)
- 각 방안별 간략한 설명

### Step 5: 상세 정책 및 Spec 작성

**각 요구사항에 대해 다음 형식으로 작성:**

| 구분 | 내용 |
|------|------|
| 요구사항 ID | REQ-001 |
| 우선순위 | P0/P1/P2 |
| 화면/기능 | 해당 화면 또는 기능명 |
| ASIS | 현재 상태 설명 + 이미지 첨부 위치 |
| TOBE | 변경될 상태 설명 + 이미지 첨부 위치 |
| 영향범위 | BE / Discovery FE / ME / iOS / Android 등 |
| 기대효과 | 이 변경으로 인한 기대 결과 |

**ASIS/TOBE 이미지 가이드:**
- 현재 화면 캡처 또는 피그마 링크 삽입
- 변경 예정 화면의 피그마 링크 삽입

### Step 6: 개발 영향범위 정리

개발자가 WBS를 작성할 수 있도록 영향범위 요약표 작성:

| 개발 영역 | 영향 여부 | 주요 작업 내용 |
|-----------|----------|---------------|
| BE (Backend) | O/X | 작업 내용 요약 |
| Discovery Frontend | O/X | 작업 내용 요약 |
| ME (Mobile Experience) | O/X | 작업 내용 요약 |
| iOS | O/X | 작업 내용 요약 |
| Android | O/X | 작업 내용 요약 |
| DA (Data Analytics) | O/X | 작업 내용 요약 |

### Step 7: 디자인 및 Jira 연결

1. **Figma 링크**: PD가 작업한 디자인 피그마 링크 삽입
2. **Jira 티켓**: 
   - Initiative 또는 Epic 티켓 생성 후 링크
   - jira-ticket-creator 스킬 사용 가능

### Step 8: Confluence 페이지 생성

PRD 템플릿 참조: `references/prd-template.md`

**생성 위치**: 29PRODUCT 스페이스 내 해당 프로젝트 폴더

## 중요 가이드라인

1. **Initiative/Epic 표기**: 항상 "Initiative/Epic"으로 표기 (Epic만 단독 사용 X)
2. **팀 정보 필수**: 개발팀(BE, FE, ME 등)과 디자인팀 반드시 기입
3. **Jira 연결 필수**: 생성한 Jira 티켓을 반드시 PRD에 링크
4. **피그마 링크 필수**: 디자인이 있는 경우 피그마 링크 삽입
5. **ASIS/TOBE 명확화**: 상세정책 작성 시 현재 상태와 변경 상태를 이미지와 함께 명확히 구분
6. **데이터 근거 필수**: 2-Pager 없는 경우 데이터 인사이트, 출처, 추출 기간 모두 기입
7. **영향범위 명시**: 개발자가 WBS 작성 가능하도록 개발 영역별 영향 여부 표시

## 참조 파일

- PRD 템플릿: `references/prd-template.md`

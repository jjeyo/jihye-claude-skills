---
name: 2pager-writer
description: 2-pager 문서 개요 작성 및 Confluence 위키 생성 스킬. "2pager 작성해줘", "2페이저 만들어줘", "2-pager 써줘" 등의 요청에 트리거됩니다. 아웃라인 작성, 문서 작성, Confluence 페이지 생성까지 지원합니다. 데이터 분석이 필요하면 먼저 /2pager-data-analysis를 사용하세요.
---

# 2-Pager Writer

29CM 2-pager 문서 개요 작성 및 Confluence 위키 생성 가이드입니다.

**참고**: 데이터 분석 및 레퍼런스 수집이 필요하면 먼저 `/2pager-data-analysis` 스킬을 사용하세요.

---

## 워크플로우 개요

2-pager 작성은 4단계로 진행됩니다:

1. **목표 확인** → 해결할 문제와 전달할 스토리 파악
2. **아웃라인 작성** → 문서 구조 제안 및 확인
3. **문서 작성** → 2-pager 템플릿으로 작성 (또는 수정 반복)
4. **Confluence 생성** → 최종 페이지 생성

---

## Step 1: 목표 확인

사용자에게 다음을 질문합니다:

> **해결하고자 하는 문제**와 **전달하고 싶은 핵심 스토리**가 무엇인가요?
>
> 예시:
> - 문제: "발견탭 전환율이 낮아 카테고리 확장에 한계가 있음"
> - 스토리: "발견탭 개선과 홈 커뮤니티 강화로 29CM 차별화 달성"

### 데이터 준비 확인

> 이미 `/2pager-data-analysis`로 데이터 분석을 완료하셨나요?
> - 완료했다면: 분석 결과를 공유해주세요
> - 아직이라면: 먼저 데이터 분석을 진행하시겠어요?

---

## Step 2: 아웃라인 작성

수집된 데이터를 바탕으로 문서 아웃라인을 작성하고 사용자에게 확인을 요청합니다:

> 다음 아웃라인으로 진행해도 될까요?
>
> 1. Executive Summary: [핵심 요약]
> 2. Problem Definition: [문제 정의]
> 3. Solution Proposed: [가설 및 해결책]
> 4. Metrics: [성공 지표]
> ...

### 아웃라인 수정

승인하지 않으면 구체적으로 질문합니다:

> 어떤 부분을 수정할까요?
> - 문제 정의가 다른가요?
> - 추가로 포함할 내용이 있나요?
> - 해결책의 방향성을 바꿔야 할까요?

**종료 조건:** 사용자가 아웃라인을 승인하면 Step 3으로 진행합니다.
최대 3회 반복 후에도 합의되지 않으면 현재 상태에서 진행 여부를 질문합니다.

---

## Step 3: 문서 작성

사용자가 아웃라인을 승인하면 템플릿에 맞춰 전체 문서를 작성합니다.

### 작성 완료 후

문서 초안을 보여주고 확인합니다:

> 문서 초안이 완성되었습니다. 수정할 부분이 있나요?
> - 있다면 구체적인 수정 요청을 알려주세요
> - 없다면 Confluence 페이지 생성으로 진행합니다

---

## Step 4: Confluence 생성

### 위치 확인

> Confluence 페이지를 어느 Space에 생성할까요?
> - Space 이름 또는 URL을 알려주세요
> - 상위 페이지가 있다면 함께 알려주세요

### 페이지 생성

`mcp__atlassian__confluence_create_page` 도구를 사용하여 페이지를 생성합니다.

---

## 2-Pager 템플릿 구조

자세한 템플릿은 `references/template.md`를 참조하세요.

### 필수 섹션
1. **Executive Summary** - 핵심 요약 (두괄식)
2. **Problem Definition** - 문제 정의 (데이터 기반)
3. **Solution Proposed** - 해결책 (ASIS/TOBE 테이블)
4. **Financial Forecasting** - 재무 검토 (비용/수익 관련 시 필수)
5. **Metrics** - Success Criteria + Guardrail Metrics
6. **Negative Impact to Monitor** - 부정적 영향 모니터링
7. **특허출원 검토** - 신규 기술 구현 시 필수
8. **AB Test 진행 여부** - 26점 이상 시 실험 권고

### 부가 섹션
9. **Next Step** - 후속 과제
10. **Alternative Proposed** - 대안
11. **Appendix** - 참고 자료

### 작성 순서 권장
1. Executive Summary (마지막에 최종 수정)
2. Problem Definition → Solution Proposed (핵심)
3. Metrics (Success + Guardrail)
4. 나머지 필수 섹션
5. 부가 섹션 (필요시)

---

## 작성 원칙

1. **두괄식 작성**: Executive Summary만 읽어도 핵심 파악 가능
2. **데이터 기반**: 모든 주장에 출처 명시
3. **한국어 작성**: 모든 내용은 한국어로 작성
4. **테이블 활용**: Solution Proposed는 ASIS/TOBE 테이블 사용
5. **레퍼런스 링크**: Appendix에 모든 참고 자료 정리

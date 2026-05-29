# Biker Map QA 착수 브리프 템플릿

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-29

<strong>최신 업데이트 날짜 : </strong> 2026-05-29

이 문서는 QA 실행 전에 변경 범위, 환경, 계정, 외부 서비스 의존성을 먼저 고정하기 위한 템플릿입니다. 상세 테스트 절차는 `test-plan-template.md`에 작성합니다.

## 1. 착수 정보

- 제목:
- 작성일:
- 대상 브랜치/PR:
- 기준 브랜치:
- 담당:
- QA 유형: Feature QA | Regression | Release Candidate | Hotfix | Spike
- 상태: Draft | Ready | In Progress | Blocked

## 2. 변경 범위

- 제품 범위:
- 기술 범위:
- web source of truth 확인:
- package-shared 영향:
- mobile 영향:
- 제외 범위:

## 3. 실행 환경

- 로컬 실행 경로:
- 실행 명령:
- 필요한 env:
- Supabase project/local stack:
- 외부 서비스:
- 브라우저/디바이스:

## 4. 계정과 권한

| 역할 | 계정/fixture | 필요한 권한 | 확인할 주요 동작 |
| --- | --- | --- | --- |
| anonymous |  |  |  |
| user |  |  |  |
| owner |  |  |  |
| admin |  |  |  |

## 5. 데이터 준비

- seed 필요 여부:
- post/comment/reply fixture:
- place/route fixture:
- notification fixture:
- Storage fixture:
- irreversible action 보호 방법:

## 6. 리스크 판단

- 위험도: Low | Medium | High | Release Blocking
- Supabase/Auth/RLS 리스크:
- Realtime/notification 리스크:
- 지도/외부 API 리스크:
- service role/admin 리스크:
- 데이터 손상 가능성:
- 롤백 난이도:

## 7. 이번 QA의 테스트 계층 선택

| 계층 | 선택 | 이유 | 미실행 시 기록할 내용 |
| --- | --- | --- | --- |
| 정적 검증 |  |  |  |
| smoke/E2E |  |  |  |
| DB/RLS |  |  |  |
| 수동 QA |  |  |  |
| 단위 테스트 후보 |  |  |  |
| 통합 테스트 후보 |  |  |  |

## 8. Blocked 가능성

- 접근 권한:
- 계정/fixture:
- env:
- 외부 서비스:
- 결제/요금/쿼터:
- 기타:

## 9. QA 시작 조건

- Ready 조건:
- 시작 전 확인할 질문:
- 시작 불가 조건:
- test plan 작성 필요 여부:

# Biker Map 테스트 플랜 템플릿

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-28

<strong>최신 업데이트 날짜 : </strong> 2026-05-29

이 템플릿은 기능 PR, 위험 변경, 릴리즈 후보의 QA 계획을 작성할 때 사용합니다.

## 1. 기본 정보

- 제목:
- 작성일:
- 대상 브랜치/PR:
- 담당:
- QA 유형: Feature QA | Regression | Release Candidate | Hotfix | Spike
- 상태: Draft | Ready | In Progress | Done | Blocked

## 2. 변경 요약

- 제품 범위:
- 기술 범위:
- 사용자에게 보이는 변화:
- 사용자에게 보이지 않는 변화:
- 제외 범위:

## 3. 영향 범위

- web 화면:
- web API route:
- shared contract:
- mobile 영향:
- Supabase table/RLS/migration:
- Storage/Realtime/env:
- 관리자 기능:
- release 포함 변경:
- release 제외 변경:

## 4. 위험도 판단

- 위험도: Low | Medium | High | Release Blocking
- 위험 요인:
- 회귀 가능 영역:
- 데이터 손상 가능성:
- 권한/보안 영향:
- 롤백 난이도:

## 5. 테스트 접근

| 계층 | 실행 여부 | 대상 | 도구/방법 | 통과 기준 |
| --- | --- | --- | --- | --- |
| 정적 검증 |  |  |  |  |
| 단위 테스트 |  |  |  |  |
| 통합 테스트 |  |  |  |  |
| E2E/브라우저 |  |  |  |  |
| DB/RLS |  |  |  |  |
| 수동 QA |  |  |  |  |

## 6. 테스트 데이터

- anonymous:
- 일반 user:
- owner user:
- admin:
- fixture:
- seed 필요 여부:
- 외부 서비스 필요 여부:

## 7. 상세 시나리오

### 시나리오 1

- 목적:
- 선행 조건:
- 절차:
- 기대 결과:
- 실제 결과:
- 상태: Not Run | Pass | Fail | Blocked
- evidence:

### 시나리오 2

- 목적:
- 선행 조건:
- 절차:
- 기대 결과:
- 실제 결과:
- 상태: Not Run | Pass | Fail | Blocked
- evidence:

## 8. 권한 매트릭스

| 케이스 | anonymous | user | owner | admin | 기대 결과 |
| --- | --- | --- | --- | --- | --- |
| 조회 |  |  |  |  |  |
| 생성 |  |  |  |  |  |
| 수정 |  |  |  |  |  |
| 삭제 |  |  |  |  |  |

## 9. 회귀 체크리스트

- 인증/세션:
- 지도/장소:
- 경로:
- 커뮤니티:
- 반응/즐겨찾기:
- 알림:
- 마이페이지:
- 관리자:
- mobile 계약:

## 10. 실행 로그

- 명령:
- 결과:
- 브라우저 확인:
- API 응답:
- 외부 서비스 오류(status code/body):

## 11. 결론

- QA 결론: Pass | Conditional Pass | Fail | Blocked
- merge/release 가능 여부:
- blocking issue:
- 조건부 승인 조건:
- 미실행/blocked:
- PR 코멘트 요약:
- rollback/hotfix 메모:
- 후속 자동화 후보:

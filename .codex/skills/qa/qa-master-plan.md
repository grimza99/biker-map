# Biker Map QA 마스터플랜

<strong>버전 : </strong> v1.1

<strong>생성 날짜 : </strong> 2026-05-28

<strong>최신 업데이트 날짜 : </strong> 2026-05-29

이 문서는 Biker Map의 QA 담당자와 qa-runner subagent가 테스트 전략을 세우고, 기능 PR과 릴리즈 후보를 검증할 때 사용하는 기준 문서입니다.

## 목표

- MVP 핵심 플로우의 회귀를 빠르게 발견합니다.
- Supabase Auth, RLS, Realtime, Storage처럼 운영 장애로 이어질 수 있는 영역을 별도 gate로 관리합니다.
- web을 source of truth로 두되, package-shared 계약과 mobile 소비 영향까지 추적합니다.
- 현재 테스트 인프라가 없는 MVP 개발 단계에서는 자동화 확대보다 실제 서비스 연동 리스크를 먼저 검증합니다.
- 자동화 가능한 검증과 수동 확인이 필요한 검증을 분리해 QA 비용을 줄이되, 테스트 계층 도입 자체가 MVP 속도를 막지 않게 합니다.
- 릴리즈 후보는 "무엇이 통과했는지"와 "무엇을 검증하지 못했는지"를 명확히 남깁니다.

## 현재 전략 결론

현재 Biker Map은 MVP 개발 중이고, 레포에 Vitest/Jest/Playwright 같은 테스트 실행 인프라와 fixture 체계가 아직 없습니다. 따라서 지금 단계의 기본 전략은 단위 테스트와 통합 테스트를 전부 PR gate로 요구하지 않고, 최소 후보로만 관리하는 것입니다.

단위 테스트와 통합 테스트를 완전히 제거하지 않는 이유는 다음과 같습니다.

- web이 source of truth라서 API route, validation, mapper, package-shared contract가 안정되면 빠른 자동 회귀 검증 가치가 큽니다.
- Zod schema, mapper, response helper처럼 외부 서비스 없이 결정적으로 검증 가능한 코드는 이후 자동화 비용 대비 효과가 높습니다.
- auth, RLS, notification, admin CRUD처럼 권한과 상태 전이가 많은 영역은 자동화 후보를 미리 기록해야 릴리즈 반복 때 누락을 줄일 수 있습니다.

하지만 지금 당장 단위/통합 테스트를 적극 도입하거나 필수화하지 않는 이유는 다음과 같습니다.

- 테스트 러너, assertion, mock, seed, CI 실행 기준이 없어서 테스트 코드 작성 자체가 별도 인프라 작업이 됩니다.
- Supabase Auth, RLS, Realtime, Storage, 지도 연동은 mock 기반 단위/통합 테스트만으로 운영 리스크를 충분히 줄일 수 없습니다.
- MVP 단계에서는 기능 표면과 API 계약이 아직 바뀔 수 있어, 과도한 단위/통합 테스트는 변경 비용을 늘릴 수 있습니다.
- 실제 장애 가능성이 큰 부분은 로그인 상태, 권한별 접근, DB 정책, 외부 서비스 응답, 브라우저 렌더링에서 발생하므로 smoke/E2E/수동 QA와 DB/RLS 확인이 더 직접적입니다.

따라서 QA 우선순위는 다음 순서를 따릅니다.

1. 정적 검증: lint/build/typecheck 가능한 범위
2. web 기준 smoke/E2E 또는 브라우저 수동 확인
3. Supabase/RLS/auth/admin/notification/map 같은 실제 연동 리스크 수동 QA
4. release 후보의 권한 매트릭스와 외부 서비스 오류 기록
5. 단위/통합 테스트는 반복 회귀가 확인된 순수 로직 또는 안정된 API 계약부터 최소 도입

단위/통합 테스트는 "지금 제거"가 아니라 "현재 필수 gate에서 제외하고 자동화 후보 backlog로 유지"합니다.

## 테스트 계층

### 1. 정적 검증

- 대상: TypeScript 타입, lint, build, import/export 경계, env 참조
- 기본 명령:
  - `npm run lint:web`
  - `npm run build:web`
- 보강 후보:
  - web typecheck 전용 script
  - mobile typecheck 전용 script
  - package-shared typecheck 전용 script

### 2. 단위 테스트

- 현재 판단:
  - MVP 개발 중에는 필수 PR gate가 아닙니다.
  - 테스트 러너와 fixture가 없으므로 신규 기능마다 의무 작성하지 않습니다.
  - 단위 테스트가 필요한 코드는 QA 결과의 "다음 자동화 후보"에 남깁니다.
- 최소 후보:
  - Zod schema와 validation helper
  - 날짜, class merge, request parsing 같은 shared lib
  - Supabase mapper
  - API response/error helper
  - package-shared constants/type guard 후보
- 권장 도구 후보:
  - Vitest
  - React Testing Library
- 기준:
  - 네트워크, Supabase, 브라우저 API 없이 결정적으로 실행 가능해야 합니다.
  - mapper와 validation은 정상값, 누락값, 권한 오류값, unknown enum을 포함합니다.
  - 기능 흐름, 권한, Realtime, 지도 렌더링을 단위 테스트로 대체하지 않습니다.
  - 같은 순수 로직 회귀가 2회 이상 발생하거나 release gate에서 반복 수동 확인이 발생하면 도입 우선순위를 올립니다.

### 3. 통합 테스트

- 현재 판단:
  - MVP 개발 중에는 필수 PR gate가 아닙니다.
  - API route와 Supabase query의 통합 테스트는 seed, 계정, env, mock 경계가 정리된 뒤 도입합니다.
  - auth/RLS/service role 리스크는 mock 기반 통합 테스트가 아니라 실제 Supabase local 또는 test project 검증으로 보완합니다.
- 최소 후보:
  - Next.js API route의 request validation, auth, service role 사용 여부
  - Supabase query mapper와 응답 계약
  - optimistic update 훅의 캐시 갱신과 롤백
  - notification writer와 notification list API
- 권장 도구 후보:
  - Vitest 기반 route handler 테스트
  - MSW 또는 fetch mock
  - Supabase test project 또는 local Supabase fixture
- 기준:
  - 실제 외부 서비스 호출을 기본값으로 두지 않습니다.
  - RLS 검증은 mock이 아니라 별도 DB/RLS 테스트로 분리합니다.
  - route handler 테스트가 있더라도 로그인/비로그인/owner/admin 권한별 브라우저 또는 API 확인을 생략하지 않습니다.
  - 안정된 API 계약, seed fixture, 테스트 계정, CI 실행 명령이 준비되기 전까지는 "계획 작성"을 완료 기준으로 둘 수 있습니다.

### 4. E2E / 브라우저 테스트

- 우선 대상:
  - 인증: 가입, 로그인, 로그아웃, 새로고침 세션 복구
  - 지도: marker, route polyline, category filter, 장소 상세 패널
  - 커뮤니티: 게시글, 댓글, 대댓글 작성/수정/삭제
  - 반응: post/comment 좋아요, 싫어요, 실패 롤백
  - 즐겨찾기: post/route favorite toggle
  - 알림: nav dot, dropdown, 전체 목록, 읽음 처리, Realtime 수신
  - 마이페이지: 내 글, 좋아요 목록, 프로필 수정, 회원 탈퇴
  - 관리자: place/route/post CRUD, 이미지 업로드, markdown 삽입
- 권장 도구 후보:
  - Playwright
- 기준:
  - smoke는 5분 안에 끝나는 release gate로 유지합니다.
  - 전체 E2E는 릴리즈 후보 또는 위험 PR에서 실행합니다.
  - Playwright 인프라가 없으면 브라우저 수동 smoke를 실행하고 evidence와 미실행 자동화 범위를 남깁니다.
  - web이 source of truth이므로 web 화면/API에서 먼저 검증한 뒤 mobile 계약 영향 여부를 판단합니다.

### 5. DB / RLS / Migration 테스트

- 우선 대상:
  - Auth user, owner, admin, anonymous 권한 차이
  - post/comment/reply/reaction/favorite/notification RLS
  - Storage upload path와 public/private 접근
  - migration up/down 또는 baseline drift
- 권장 도구 후보:
  - Supabase local stack
  - SQL assertion script
  - seed fixture
- 기준:
  - service role이 필요한 API와 user client API를 명확히 분리합니다.
  - RLS 변경은 E2E 통과만으로 검증 완료로 보지 않습니다.
  - 인증/권한 변경은 anonymous, login user, owner, admin을 분리해 기록합니다.
  - Supabase 또는 외부 서비스 오류는 status code와 응답 body를 함께 남깁니다.

### 6. 수동 QA

- 우선 대상:
  - 지도 시각 품질과 polyline 위치
  - 모바일 viewport, 터치 흐름, WebView 경계
  - Realtime 동시 세션
  - 관리자 markdown 편집 경험
  - 계정 삭제처럼 irreversible한 플로우
- 기준:
  - 수동 QA는 체크리스트와 evidence를 남깁니다.
  - 수동 확인이 반복되면 자동화 후보로 올립니다.

## MVP 리스크 기반 테스트 매트릭스

| 영역 | 주요 리스크 | 우선 테스트 |
| --- | --- | --- |
| 인증/세션 | 세션 유실, 잘못된 권한, middleware 회귀 | 브라우저 smoke, 권한별 수동 QA, DB/RLS |
| 지도/장소 | marker 누락, 좌표 오류, 필터 오작동 | 브라우저 smoke, 지도 수동 QA, mapper 단위 후보 |
| 경로 | polyline 누락, 상세 지도 오류, 관리자 입력 오류 | 브라우저 smoke, 관리자 수동 QA, API 통합 후보 |
| 커뮤니티 | owner 권한 오류, nested comment 회귀 | E2E/smoke, 권한별 수동 QA, RLS |
| 반응/즐겨찾기 | optimistic count 불일치, 중복 요청 | 브라우저 smoke, 실패 롤백 수동 QA, 훅 통합 후보 |
| 알림 | 누락/중복 알림, Realtime 미수신 | 최초 목록/Realtime 분리 수동 QA, E2E smoke, API 통합 후보 |
| 마이페이지 | 개인정보 수정 실패, 삭제 위험 | 브라우저 smoke, irreversible action 수동 확인, API 통합 후보 |
| 관리자 | service role 오남용, Storage 업로드 실패 | admin 수동 QA, DB/RLS, Storage 응답 확인 |
| mobile 계약 | web API 변경으로 앱 깨짐 | package-shared contract 검토, web API smoke, 앱 smoke 후보 |

## 릴리즈 Gate

### PR 기본 Gate

- 변경 영향 범위 확인
- `npm run lint:web`
- 변경 화면 또는 API의 최소 수동 확인
- 권한 변경 시 anonymous/user/admin/owner 케이스 확인
- package-shared 변경 시 소비처 영향 확인
- 단위/통합 테스트는 현재 기본 Gate가 아니며, 안정된 순수 로직 또는 API 계약 변경에 한해 후보로 기록

### 위험 PR Gate

아래 중 하나라도 해당하면 위험 PR로 분류합니다.

- auth/session/middleware 변경
- API contract 변경
- Supabase migration/RLS/service role 변경
- notification/realtime 변경
- admin CRUD 또는 Storage 변경
- mobile이 소비하는 공통 타입 변경

위험 PR은 기본 Gate에 더해 관련 smoke/E2E 또는 수동 QA 계획을 작성하고, 단위/통합 테스트가 필요한지 별도로 판단합니다. 테스트 인프라가 없어 실행하지 못한 단위/통합 항목은 미실행 사유와 도입 조건을 남깁니다.

### Release Candidate Gate

- release branch에 포함된 변경 목록 확인
- 제외된 dev 변경 목록 확인
- `npm run build:web`
- 핵심 smoke 시나리오 수행
- migration/env/RLS/service role 점검
- 운영 rollback 또는 hotfix 경로 확인

## 자동화 도입 순서

1. 정적 검증 script 정리: web lint/build, typecheck, package-shared typecheck
2. MVP smoke checklist 정리: auth, map, community, notification, admin, my page
3. Playwright smoke 도입: auth, map, community, notification, admin 최소 경로
4. Supabase local 또는 test project fixture와 RLS assertion 도입
5. 단위 테스트 최소 도입: mapper, validation, response helper처럼 외부 의존성이 없는 코드
6. API 통합 테스트 최소 도입: 안정된 auth required route, CRUD route, notification route
7. release candidate QA report 자동 템플릿화

단위 테스트와 통합 테스트의 도입 순서를 smoke/E2E와 DB/RLS 뒤로 둔 이유는 현재 가장 큰 리스크가 순수 계산 오류보다 실제 인증, 권한, 알림, Storage, 지도 연동에서 발생하기 때문입니다.

## 테스트 데이터 원칙

- admin, 일반 user, owner, anonymous를 구분합니다.
- post/comment/reply/reaction/favorite/notification fixture는 서로 참조 관계를 명확히 둡니다.
- irreversible action은 전용 테스트 계정과 fixture에서만 수행합니다.
- 외부 지도, Naver Directions, Supabase Realtime은 network failure와 empty state를 별도 케이스로 둡니다.

## QA 산출물

- QA 착수 브리프: `.codex/skills/qa/qa-kickoff-brief-template.md` 기반
- 기능별 test plan: `.codex/skills/qa/test-plan-template.md` 기반
- release QA report: 별도 중복 템플릿을 만들지 않고 `test-plan-template.md`의 `Release Candidate` 유형으로 작성한 뒤 release-manager와 공유
- regression checklist: MVP smoke 기준으로 유지
- bug report: severity, 재현 절차, evidence, 의심 파일 포함

QA 착수 전에는 master plan과 test plan template 외에 QA 착수 브리프를 먼저 작성하는 것을 권장합니다. 착수 브리프는 테스트 상세 절차가 아니라 변경 범위, 계정 권한, 환경, seed, 외부 서비스 의존성, Blocked 가능성을 고정하는 문서입니다. 이 문서가 있어야 qa-runner가 실행 가능한 검증과 미실행 항목을 빠르게 구분할 수 있습니다.

## qa-runner 결과 보고 형식

```md
## QA 결론

- 상태: Pass | Conditional Pass | Blocked | Fail
- 릴리즈 영향:
- 주요 리스크:

## 실행한 검증

- 명령:
- 브라우저/수동 확인:
- 테스트 데이터:

## 발견 이슈

- [Severity] 제목
  - 재현:
  - 기대:
  - 실제:
  - 근거:

## 미실행 / Blocked

- 항목:
- 이유:
- 필요한 후속 조치:

## 다음 자동화 후보

- unit:
- integration:
- E2E:
- DB/RLS:
```

PR 코멘트에는 위 결과 보고 전체를 그대로 붙이지 않습니다. PR에는 결론, 실행 검증, 발견 이슈, 미실행/blocked, release 영향, 상세 문서 링크만 요약하고, 긴 실행 로그와 evidence는 test plan 또는 별도 QA 기록에 둡니다.

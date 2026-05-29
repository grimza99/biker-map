# QA / 검증 가이드

<strong>버전 : </strong> v1.1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-29

이 문서는 로컬 실행, 브라우저 확인, 회귀 테스트, 수동 QA 시 참고합니다.

QA 전략과 테스트 계획은 아래 문서를 함께 기준으로 삼습니다.

- QA 마스터플랜: `.codex/skills/qa/qa-master-plan.md`
- QA 착수 브리프 템플릿: `.codex/skills/qa/qa-kickoff-brief-template.md`
- 테스트 플랜 템플릿: `.codex/skills/qa/test-plan-template.md`

qa-runner는 단순히 명령을 실행하는 역할이 아니라 변경사항의 위험도를 판단하고, 필요한 테스트 계층을 제안하며, 실행 결과와 미실행 범위를 명확히 기록하는 QA Lead 역할을 수행합니다.

## 기본 검증 순서

1. 변경된 파일과 영향 범위를 확인합니다.
2. 타입체크, lint, 테스트 중 가능한 명령을 실행합니다.
3. 프론트엔드 변경이면 관련 페이지를 브라우저에서 확인합니다.
4. 인증/권한 변경이면 로그인/비로그인/admin/owner 케이스를 나눠 봅니다.
5. Supabase 변경이면 RLS와 실제 API 응답을 같이 확인합니다.
6. package-shared 변경이면 web/mobile 소비처와 공통 문서 갱신 여부를 확인합니다.
7. 검증하지 못한 항목은 Not Run 또는 Blocked로 남기고 이유를 적습니다.

## 테스트 전략

- 빠른 정적 검증은 모든 PR의 기본 gate로 둡니다.
- 현재 MVP 개발 중이고 테스트 인프라가 없으므로 단위/통합 테스트는 기본 gate가 아니라 최소 자동화 후보로 분류합니다.
- mapper, validation, response helper 같은 순수 로직은 단위 테스트 후보로 남기되, 외부 연동 검증을 대체하지 않습니다.
- API route, auth, Supabase mapper, optimistic update는 통합 테스트 후보로 남기되, seed/env/fixture가 준비되기 전에는 계획과 미실행 사유를 기록합니다.
- 핵심 사용자 여정은 web source of truth 기준으로 Playwright E2E 또는 브라우저 수동 smoke를 우선합니다.
- RLS, migration, service role, env 변경은 release gate에서 별도로 검증하고, mock 기반 테스트만으로 완료 처리하지 않습니다.

## 주요 QA 시나리오

- 로그인 후 새로고침 시 세션 유지
- post/comment/reply 작성, 수정, 삭제
- reaction optimistic update와 실패 롤백
- favorite optimistic update
- 알림 nav dot, border, dropdown, 전체 알림 페이지
- map page marker, route polyline, category filter
- route detail map polyline 표시
- admin 이미지 업로드와 markdown 삽입
- my page profile update와 account delete

## PR kickoff 코멘트

qa-runner가 PR의 QA 착수 범위를 판단했으면 PR 코멘트에 kickoff 요약을 남깁니다.

작은 PR은 PR 코멘트만으로 충분할 수 있지만, auth/RLS/realtime/admin/storage처럼 위험한 PR은 `qa-kickoff-brief-template.md` 기반의 별도 착수 브리프를 작성하고 PR 코멘트에는 링크 또는 요약을 남깁니다.

PR kickoff 코멘트 형식은 아래를 따릅니다.

```md
QA kickoff:
- 범위:
- 필요 계정:
- 필요 env:
- 주요 리스크:
- 상세 문서:
```

예시는 아래와 같습니다.

```md
QA kickoff:
- 범위: auth/session 변경
- 필요 계정: user/admin
- 필요 env: Supabase auth, NEXTAUTH_SECRET
- 주요 리스크: 세션 복구, 권한 분기
- 상세 문서: Notion 또는 md 링크
```

## PR 결과 코멘트

QA 실행을 마쳤으면 PR에는 최종 상태와 merge/release 판단에 필요한 정보만 남깁니다. 상세 로그가 길면 `test-plan-template.md` 기반 문서에 두고 PR 코멘트에는 링크 또는 핵심 요약만 남깁니다.

PR 결과 코멘트 형식은 아래를 따릅니다.

```md
QA result:
- 결론: Pass | Conditional Pass | Fail | Blocked
- 실행:
- 발견 이슈:
- 미실행/blocked:
- release 영향:
- 상세 문서:
```

외부 서비스 오류가 있으면 해당 항목에 status code와 응답 body 요약을 함께 적습니다. 인증/권한 변경에서 anonymous/user/owner/admin 중 확인하지 못한 역할이 있으면 Conditional Pass가 아니라 Not Run 또는 Blocked 항목으로 명시합니다.

## 릴리즈 QA 보고

릴리즈 후보 QA는 기능 PR QA보다 포함/제외 범위와 운영 리스크를 더 먼저 확인합니다. 별도 release QA 문서를 새로 만들지 않고, `test-plan-template.md`의 QA 유형을 `Release Candidate`로 두고 아래 항목을 채웁니다.

- release branch에 포함된 변경과 제외된 `dev` 변경
- migration, env, RLS, service role, auth/session 변경 여부
- web 핵심 smoke 결과와 mobile/package-shared 계약 영향
- 외부 서비스 장애 또는 쿼터/비용 리스크
- rollback/hotfix 경로와 release-manager에 전달할 blocking/follow-up

## 결과 상태

- Pass: 계획한 검증이 통과했고 blocking risk가 없습니다.
- Conditional Pass: 핵심 검증은 통과했지만 미실행 항목 또는 낮은 위험의 후속 작업이 있습니다.
- Fail: 재현 가능한 실패가 있고 수정 전 merge 또는 release를 권장하지 않습니다.
- Blocked: 환경, 계정, fixture, 외부 서비스 문제로 검증을 완료하지 못했습니다.

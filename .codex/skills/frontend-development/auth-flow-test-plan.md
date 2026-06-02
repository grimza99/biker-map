# Auth Flow Test Plan

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-06-01

<strong>최신 업데이트 날짜 : </strong> 2026-06-01

이 문서는 `codex/auth-flow-tests` 브랜치에서 시작하는 web 인증 플로우 테스트 인프라와 후속 테스트 작성 기준을 정리한다. 현재 구현 source of truth는 `web`이며, 모바일 인증 계약은 `package-shared/docs/common/mobile-auth-contract.md`와 실제 `web/app/api/auth/*`, `web/app/api/me/route.ts` 구현을 함께 기준으로 본다.

## QA 참조 파일

- `.codex/skills/qa/qa-master-plan.md`
- `.codex/skills/qa/test-plan-template.md`
- `.codex/skills/qa/qa.md`
- `.codex/skills/qa/qa-kickoff-brief-template.md`

## 테스트 우선순위

### P0

- 로그인 성공/실패 Server Action
- 회원가입 성공 후 로그인 상태 전환
- 로그아웃 후 세션 제거
- 새로고침 후 세션 유지
- `refresh_token` client session 비노출
- Supabase access token refresh 후 API Bearer 유지
- 모바일 호환 `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/me` smoke

### P1

- AuthToastBridge toast 처리와 URL 정리
- Realtime token 주입 경로
- `AUTH_SECRET` production 주의사항

## 브랜치/PR 분리 계획

- `codex/auth-flow-tests`: Playwright smoke 중심. `/auth` 진입, 계정 없는 API validation smoke, 계정 fixture가 필요한 테스트의 구조와 문서를 준비한다.
- `codex/auth-api-contract-tests`: API/mobile auth contract 중심 후속. `/api/auth/login`, `/api/auth/signup`, `/api/auth/refresh`, `/api/auth/logout`, `/api/me`의 status/body/header/cookie 계약을 테스트한다.
- `codex/realtime-auth-qa`: Realtime token refresh 수동 QA 또는 별도 검증. Supabase Realtime 연결, token 주입, refresh 이후 channel 유지 여부를 확인한다.

## 자동화/수동 검증 구분

자동화 우선 대상:

- `/auth` 페이지 렌더링과 로그인/회원가입 form 기본 상태
- 잘못된 login/signup payload의 400 응답
- 로그아웃 API의 refresh token cookie 제거 응답
- 테스트 계정이 준비된 뒤 로그인, 회원가입, 로그아웃, 새로고침 세션 유지
- 모바일 client header를 포함한 auth API happy path와 failure path

수동 또는 별도 환경 검증 대상:

- 실제 Supabase Auth 메일 정책, rate limit, 비밀번호 정책 영향
- access token 만료 후 자동 refresh와 API Bearer 재주입
- `refresh_token`이 브라우저 client session, localStorage, visible JSON에 노출되지 않는지 확인
- Realtime channel token 주입과 token refresh 이후 동작
- production `AUTH_SECRET` 누락 여부와 cookie secure 설정

## 필요한 테스트 계정/env/fixture

- anonymous: 계정 없이 `/auth`, malformed API payload, unauthorized `/api/me` 확인
- user: 일반 로그인/로그아웃/새로고침 세션 유지 확인용 Supabase Auth 계정
- deleted user: `profiles.deleted_at`이 설정된 계정의 로그인/refresh 거부 확인
- mobile user fixture: 모바일 client header와 refresh token body 계약 확인용 계정
- env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`
- fixture: profile row, role, deleted_at 상태, token 만료 또는 refresh 유도 조건

로컬 smoke는 Playwright config에서 계정 없는 테스트에 필요한 public Supabase/Auth dummy env만 주입한다. 실제 인증 성공/refresh 테스트는 개발/운영 DB 오염을 막기 위해 Supabase local fixture가 준비된 뒤 작성한다.

## 테스트 작성 규칙

- 패키지 추가는 repo root에서 `npm install -w web <pkg>@<version> --save-dev --save-exact` 형식으로만 수행한다.
- `web` 폴더 안에서 `npm install`을 직접 실행하지 않는다.
- 새 패키지는 npm registry 기준 최신 안정 버전을 확인하고 exact version으로 고정한다.
- Playwright 테스트는 기본적으로 `web/tests/e2e`에 둔다.
- E2E 파일명은 영어 kebab-case로 작성한다. 예: `auth-login-validation.spec.ts`.
- Playwright `test.describe()`와 `test()` 설명은 테스트 리포트를 읽는 사용자를 위해 한글로 작성한다.
- 계정/외부 서비스가 필요한 테스트는 fixture와 env 이름을 명시하고, 준비 전에는 `test.skip` 또는 문서화 상태로 둔다.
- P0 auth 테스트는 성공/실패 응답뿐 아니라 cookie, client-visible session, API Bearer 유지 여부를 assertion에 포함한다.

## Supabase local 테스트 DB

실제 회원가입, 로그인 성공, refresh token rotation, Realtime token 주입 테스트는 Supabase local stack에서 실행한다. hosted dev/prod Supabase project를 직접 사용하면 테스트 계정, profile row, post/notification fixture가 계속 쌓일 수 있으므로 금지한다.

### 기본 명령

repo root에서 실행한다.

```bash
npm run supabase:start
npm run supabase:status
npm run supabase:reset
npm run supabase:stop
npm run test:e2e:local-supabase -- <선택 테스트 파일>
```

- `supabase:start`: Docker 기반 local Supabase stack을 시작한다.
- `supabase:reset`: baseline schema와 migration을 다시 적용하고 seed를 재실행한다.
- `supabase:status`: API URL, DB URL, anon/service role key를 확인한다.
- `supabase:stop`: local stack을 중지한다.
- `test:e2e:local-supabase`: `supabase status -o env`에서 local key를 읽어 web Playwright에 주입한 뒤 테스트를 실행한다.

### local DB schema 기준

이 레포는 초기 schema migration이 누락되어 `supabase/baseline/current` snapshot을 보관한다. Supabase CLI의 기본 migration 적용만 사용하면 post-baseline migration이 먼저 실행되어 실패하므로, local reset은 `scripts/supabase-local-reset.sh`에서 baseline snapshot을 먼저 적용하고 이후 `supabase/migrations`를 순서대로 적용한다.

### DBeaver 접속

Supabase local이 실행 중일 때 DBeaver에서 새 PostgreSQL connection을 만든다.

```txt
Host: 127.0.0.1
Port: 54322
Database: postgres
Username: postgres
Password: postgres
```

확인 대상:

- `public.profiles`
- `public.posts`
- `public.notifications`
- `auth.users`
- `auth.sessions`

테스트가 생성한 fixture는 `e2e_` prefix를 붙이고, 테스트 종료 또는 `npm run supabase:reset`으로 정리한다.

### env 기준

Playwright가 local Supabase를 사용하는 테스트는 아래 값을 사용한다.

```txt
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<supabase status의 anon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase status의 service_role key>
AUTH_SECRET=playwright-local-auth-secret-for-supabase-local
```

key 값은 `npm run supabase:status` 또는 `npx supabase status -o env`로 확인한다.

## PR 설명에 남길 검증 한계

- 이번 `codex/auth-flow-tests` 단계는 테스트 인프라, 계정 없는 smoke, 그리고 Supabase local 기반 회원가입/로그인/로그아웃 happy path를 포함한다.
- access token refresh rotation, deleted user, mobile header 기반 refresh/logout 계약은 후속 브랜치에서 계속 확장한다.
- 모바일 auth contract의 전체 happy path는 `codex/auth-api-contract-tests` 후속 브랜치에서 다룬다.
- Realtime token 주입과 refresh 이후 channel 유지 여부는 `codex/realtime-auth-qa`에서 수동 QA 또는 별도 자동화로 검증한다.
- Playwright 브라우저 바이너리가 로컬에 없으면 `npx playwright install` 같은 대용량 다운로드는 임의로 실행하지 않고 blocked로 보고한다.

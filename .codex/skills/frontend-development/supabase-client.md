# Supabase Client 사용 가이드

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Biker Map 웹 앱에서 `frontend-developer` 에이전트가 Supabase client를 사용할 때의 현재 프로젝트 컨벤션을 정리합니다.

## 문서 역할

이 문서는 Supabase client 종류, env key, client 생성 위치, service role 사용 경계의 source of truth입니다.

- 프론트엔드 공통 전제는 `.codex/skills/frontend-development/SKILL.md`를 따릅니다.
- BFF API route의 request validation, auth/session, owner/admin authorization, response contract는 `.codex/skills/bff-development/bff.md`를 우선합니다.
- RLS, migration, index, constraint, function/trigger 설계 기준은 `.codex/skills/db-engineering/database-design-guide.md`를 우선합니다.
- DB/보안 감사 체크리스트는 `.codex/skills/db-engineering/db-auditor.md`를 참고합니다.

## Client 종류

Supabase client는 사용 위치와 권한에 따라 분리합니다.

- `createSupabaseApiClient`: Next.js API route에서 request의 bearer token으로 RLS를 적용할 때 사용합니다.

- `createSupabaseAuthClient`: auth login/signup/refresh 또는 access token 기반 auth 확인에 사용합니다.

- `createSupabaseServerClient`: SSR/cookie 기반 server client가 필요할 때 사용합니다.

- `createSupabaseMiddlewareClient`: middleware에서 session 확인에 사용합니다.

- `createSupabaseServiceClient`: 서버 전용 service role 작업에만 사용합니다.

- `createSupabaseRealtimeClient`: 클라이언트 Realtime 구독에 사용합니다.

## API Route 기본값

일반적인 API route는 `createSupabaseApiClient(request)`를 사용합니다.

```ts
const supabase = createSupabaseApiClient(request);
```

이 client는 request의 `Authorization` bearer token을 Supabase 요청 header로 전달합니다. 따라서 RLS는 로그인 사용자 기준으로 평가됩니다.

인증이 필요한 route에서는 Supabase query 전에 `requireApiSession(request)`를 먼저 호출합니다.

```ts
const session = await requireApiSession(request);
if (session instanceof Response) {
  return session;
}
```

API route의 전체 처리 순서와 authorization 정책은 `.codex/skills/bff-development/bff.md`를 source of truth로 봅니다.

## Auth Client

로그인, 회원가입, refresh는 `createSupabaseAuthClient()`를 사용합니다.

```ts
const supabase = createSupabaseAuthClient();
const { data, error } = await supabase.auth.signInWithPassword(payload);
```

access token으로 사용자 확인이 필요한 helper는 token을 넘겨 auth client를 만들 수 있습니다.

```ts
const supabase = createSupabaseAuthClient(accessToken);
```

## Service Role Client

`createSupabaseServiceClient()`는 서버 전용입니다.

사용 가능한 경우:

- RLS를 우회해야 하는 system write
- notification writer
- reaction summary나 count sync처럼 서버가 일관성을 맞춰야 하는 작업
- profile/auth metadata 정리처럼 일반 사용자 RLS로 처리하기 어려운 작업

사용하면 안 되는 경우:

- 클라이언트 컴포넌트
- browser bundle에 포함될 수 있는 파일
- 단순히 RLS 정책을 피하기 위한 일반 CRUD
- owner/admin 검사를 생략하기 위한 우회

service role을 사용할 때도 API route에서 사용자 권한 검사를 먼저 수행합니다.

## Env와 Key

Supabase env는 `web/shared/config/supabase.ts`에서 Zod로 검증합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

publishable key는 클라이언트에 노출 가능한 값입니다. service role key는 절대 클라이언트에 노출하지 않습니다.

bucket name 자체는 보안 정보가 아니지만, Storage write 권한과 signed URL 정책은 보호해야 합니다.

## Session과 Refresh

API 요청은 access token을 `Authorization` header로 전달하는 방식을 기준으로 합니다.

401 상황의 refresh fallback은 API helper 경로에서 처리합니다. 같은 fallback을 API route나 Supabase client 내부에 중복 구현하지 않습니다.

서버에서 `Auth session missing!`이 나면 아래를 확인합니다.

- request header에 bearer token이 있는지
- `createSupabaseApiClient(request)`를 사용했는지
- `requireApiSession(request)` 또는 auth helper가 같은 token source를 보고 있는지
- refresh fallback이 client API helper에서 정상 동작하는지

## Realtime Client

Realtime은 `createSupabaseRealtimeClient()`를 사용합니다.

- 클라이언트 전용 파일에서 사용합니다.
- singleton client를 재사용합니다.
- 알림 row change 감지에 사용합니다.
- 채팅은 이후 별도 WebSocket 서버 도입을 검토합니다.

Realtime 이벤트를 받은 뒤에는 TanStack Query cache를 직접 갱신하거나 invalidate합니다.

## Query 작성 기준

- 가능한 필요한 column만 select합니다.
- 목록 API에서 전체 조회 후 서버 메모리 필터링하는 구조는 점진적으로 DB query 필터링으로 전환합니다.
- owner/admin 권한 확인은 API route와 RLS 정책을 함께 봅니다.
- `maybeSingle`은 없을 수 있는 row 조회에 사용합니다.
- insert/update/delete 후 필요한 데이터만 `select`로 되돌립니다.

## Storage 기준

이미지 업로드 API는 `createSupabaseApiClient(request)`를 사용해 로그인 사용자 권한으로 Storage에 접근합니다.

route/admin 이미지의 목표 흐름은 다음과 같습니다.

1. API route로 이미지 업로드
2. Supabase Storage에 저장
3. public URL 또는 접근 가능한 URL 생성
4. markdown content에 기존 커서위치를 ref로 판별하고, 해당 위치에 이미지 문법으로 삽입

bucket public/private 설정에 따라 직접 URL 접근 가능 여부가 달라집니다.

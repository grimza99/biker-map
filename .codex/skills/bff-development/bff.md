# BFF Engineering Guide

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Biker Map의 Next.js App Router API route를 BFF 계층으로 다룰 때의 구현 기준을 정리합니다.

## 문서 역할

이 문서는 BFF 정책의 source of truth입니다.

- BFF 공통 전제는 `.codex/skills/bff-development/SKILL.md`를 따릅니다.
- API route 흐름, request validation, auth/session, owner/admin authorization, response contract는 이 문서를 우선합니다.
- Supabase client 종류, env key, service client 생성 방식의 상세 기준은 `.codex/skills/frontend-development/supabase-client.md`를 봅니다.
- RLS, migration, index, constraint 같은 DB 설계 기준은 `.codex/skills/db-engineering/database-design-guide.md`를 봅니다.
- DB/보안 감사 체크리스트는 `.codex/skills/db-engineering/db-auditor.md`를 봅니다.

## Route Handler 흐름

route handler는 아래 순서를 기본으로 합니다.

1. request query 또는 body를 읽습니다.
2. Zod schema 또는 helper로 payload를 검증합니다.
3. 인증이 필요하면 `requireApiSession(request)`를 호출합니다.
4. owner/admin 권한이 필요하면 profile 또는 대상 row를 조회해 확인합니다.
5. Supabase query 또는 외부 API 호출을 수행합니다.
6. Supabase row를 그대로 응답하지 않고 mapper 또는 contract를 거칩니다.
7. `ok`, `created`, `badRequest` 등 response helper로 반환합니다.

handler가 커지면 내부 helper 또는 service로 분리합니다. `routes/[routeId]/route.ts`처럼 조회, 수정, 삭제, 외부 API, rollback이 한 파일에 집중된 경우는 분리 대상입니다.

## 엔드포인트 구조

- App Router의 `GET`, `POST`, `PATCH`, `DELETE` function으로 HTTP method를 표현합니다.
- URL path는 `package-shared`의 `API_PATHS`와 맞추고, path 추가시 `package-shared`의 `API_PATHS`에 추가하여 재사용되게 합니다.
- 앱에서도 소비할 가능성이 있는 API는 `package-shared` 타입과 응답 shape를 먼저 확인합니다.
- route handler 파일은 request parsing, validation, authorization, data access, response mapping의 흐름이 드러나야 합니다.

## Request Validation

body는 Zod schema로 검증합니다.

가능하면 `parseRequestBody(request, schema)`를 사용합니다.

```ts
let payload: LoginBody;
try {
  payload = await parseRequestBody(request, loginSchema);
} catch {
  return badRequest("로그인 payload가 올바르지 않습니다.");
}
```

직접 `request.json()`을 사용해야 하는 경우에도 바로 로직에 넘기지 않고 schema로 parse합니다.

```ts
let payload: CreateRouteBody;
try {
  payload = await request.json();
  payload = createRouteSchema.parse(payload);
} catch {
  return badRequest("경로 생성 payload가 올바르지 않습니다.");
}
```

검증 실패 시 ZodError 내부 구조를 그대로 응답하지 않습니다. 사용자에게 필요한 수준의 메시지로 `badRequest`를 반환합니다.

query param은 `getStringParam`, `getNumberParam` 같은 helper를 사용합니다.

## Auth Session

인증이 필요한 API는 Supabase query 전에 `requireApiSession(request)`를 먼저 호출합니다.

```ts
const session = await requireApiSession(request);
if (session instanceof Response) {
  return session;
}
```

세션 확인이 끝난 뒤에는 `session.userId`를 기준으로 권한과 데이터 접근을 판단합니다.

## Authorization

RLS가 있어도 API route의 권한 확인을 생략하지 않습니다.

- admin 전용 route는 `profiles.role`을 조회해 확인합니다.
- owner 전용 route는 대상 row의 `user_id`, `author_id`, `created_by` 등 실제 owner 컬럼을 기준으로 확인합니다.
- owner 또는 admin 허용 route는 두 조건을 명시적으로 계산합니다.
- 권한이 없으면 `forbidden`을 반환합니다.

## Supabase Client

일반 API route는 `createSupabaseApiClient(request)`를 사용합니다.

```ts
const supabase = createSupabaseApiClient(request);
```

이 client는 request의 bearer token을 Supabase 요청 header로 전달하므로 RLS가 로그인 사용자 기준으로 평가됩니다.

`createSupabaseServiceClient()`는 서버 전용입니다.
client 종류, env key, service client 생성 위치의 상세 기준은 `.codex/skills/frontend-development/supabase-client.md`를 source of truth로 봅니다.

## Response Contract

성공 응답은 `ok`, `created` helper를 사용합니다.

실패 응답은 상황에 맞는 helper를 사용합니다.

- `badRequest`
- `forbidden`
- `notFound`
- `internalServerError`

응답 shape는 `ApiResponse<T>` 계열과 맞춥니다. 앱과 웹이 함께 소비할 수 있는지 `package-shared` 타입을 확인합니다.

Supabase row를 그대로 반환하지 않습니다. mapper를 거쳐 클라이언트에 필요한 shape만 반환합니다.

```ts
const items = (data ?? [])
  .map(mapRouteListItem)
  .filter((item): item is NonNullable<typeof item> => Boolean(item));
```

## DB Query 기준

- 가능한 필요한 column만 select합니다.
- `select("*")`는 점진적으로 제거합니다.
- 목록 API는 DB query 단계에서 filtering, ordering, pagination을 처리합니다.
- 전체 조회 후 서버 메모리 필터링은 운영 데이터 증가 시 문제가 되므로 리팩토링 대상입니다.
- `maybeSingle`은 없을 수 있는 row 조회에 사용합니다.
- insert/update/delete 후 필요한 데이터만 `select`로 되돌립니다.

현재 리팩토링 후보:

- `places` list API의 서버 메모리 필터링 제거
- `routes` list API의 서버 메모리 필터링 제거
- `notifications` list API의 unread/source type 필터를 DB query로 이동

## External API

Naver geocoding, Naver Directions 같은 비용성 외부 API는 BFF에서 호출합니다.

- 클라이언트에서 직접 호출하지 않습니다.
- API key는 server env 또는 server-only 경계에 둡니다.
- rate limit 또는 하루 제한은 API route 상수로 관리합니다.
- 외부 API 실패 응답은 내부 error detail을 그대로 노출하지 않고 서비스 메시지로 변환합니다.

route write처럼 geocoding 비용이 발생할 수 있는 기능은 RLS만으로 제한하지 않고 API route에서 사용자별 제한을 둡니다.

## Side Effect 기준

GET 요청은 가능한 read-only로 유지합니다.

과거 post detail GET에서 view count가 증가하던 로직은 제거했습니다. 조회수 정책은 보류 중이며, 다시 설계하기 전까지 GET에서 write side effect를 추가하지 않습니다.

write side effect는 `POST`, `PATCH`, `DELETE`에서 명시적으로 처리합니다.

## 금지 패턴

- client component에서 Supabase service role 사용
- API route에서 validation 없이 `request.json()` 값을 바로 사용
- Supabase row를 그대로 응답
- RLS가 있으니 API authorization을 생략
- GET 요청에서 의도치 않은 write side effect 발생
- 비용성 외부 API를 클라이언트에서 직접 호출
- service role로 owner/admin 검사를 우회

# Zod 사용 가이드

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Biker Map 웹 앱에서 `frontend-developer` 에이전트가 Zod를 사용할 때의 현재 프로젝트 컨벤션을 정리합니다.

## 역할

Zod는 런타임 검증에 사용합니다.
이후 RHF과 함께 입력 폼에서 사용할 예정입니다. 이미 API body 에서 검증을 하고있지만, 입력폼 submit 시에도 검증을 거치는 2단계 검증 구현을 검토중에 있습니다.
프론트엔드 공통 전제는 `.codex/skills/frontend-development/SKILL.md`를 따릅니다.

- API request body 검증
- form input 검증
- env 검증
- API error payload 검증

TypeScript 타입은 컴파일 타임 안전성을 제공하지만, API 요청과 환경변수는 런타임 값이므로 Zod 검증을 유지합니다.

## API Route Body 검증

API route에서는 request body를 Zod schema로 검증합니다.

현재 프로젝트에는 두 가지 패턴이 있습니다.

### `parseRequestBody` 사용

auth login처럼 helper를 사용할 수 있는 경우 이 방식을 우선합니다.

```ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

let payload: LoginBody;
try {
  payload = await parseRequestBody(request, loginSchema);
} catch {
  return badRequest("로그인 payload가 올바르지 않습니다.");
}
```

### 직접 `request.json()` 후 `schema.parse`

route 생성처럼 route 내부에 schema가 있는 경우 직접 parse합니다.

```ts
let payload: CreateRouteBody;
try {
  payload = await request.json();
  payload = createRouteSchema.parse(payload);
} catch {
  return badRequest("경로 생성 payload가 올바르지 않습니다.");
}
```

검증 실패 응답은 `badRequest`로 변환합니다. 내부 ZodError를 그대로 노출하지 않습니다.

## Form 검증

클라이언트 form은 feature model에 schema를 둡니다.

예시:

- `web/features/auth/model/auth-schemas.ts`

공유 타입이 이미 있으면 `satisfies z.ZodType<...>`로 schema와 타입을 맞춥니다.

```ts
export const loginFormSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
}) satisfies z.ZodType<LoginBody>;
```

클라이언트 form에서는 `safeParse`를 사용해 사용자에게 보여줄 validation message를 제어합니다.

```ts
const validation = loginFormSchema.safeParse(values);

if (!validation.success) {
  return;
}
```

## Env 검증

환경변수는 `web/shared/config/supabase.ts`처럼 config 계층에서 schema를 정의합니다.

```ts
export const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
});
```

public env와 server-only env를 분리합니다.

- public env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- server env: `SUPABASE_SERVICE_ROLE_KEY`

service role key는 optional schema로 먼저 parse한 뒤, 실제 server env getter에서 없으면 명시적으로 error를 throw합니다.

## API Error Payload 검증

API error 응답처럼 외부에서 온 payload shape가 불확실한 경우 `safeParse`를 사용합니다.

```ts
const parsed = apiErrorSchema.safeParse(payload);
```

실패 가능한 외부 payload에는 `parse`보다 `safeParse`를 우선합니다.

## Schema 위치 기준

- API route 전용 body schema: 해당 route 파일 내부에 둡니다.
- 여러 API나 클라이언트가 공유하는 schema: `package-shared` 이동을 검토합니다.
- feature form schema: `web/features/<feature>/model`에 둡니다.
- env schema: `web/shared/config`에 둡니다.
- 공통 API contract schema: `web/shared/api/contracts.ts`에 둡니다.

## 주의점

- Zod schema와 `package-shared` 타입이 따로 놀지 않게 합니다.
- 클라이언트에 server-only env schema나 service role key를 노출하지 않습니다.
- API route에서 ZodError detail을 그대로 사용자에게 내려주지 않습니다.
- 숫자, enum, URL, UUID는 문자열로 대충 받지 말고 schema에서 명시합니다.

# Mobile Auth Contract Draft

이 문서는 모바일 앱이 웹 API proxy를 통해 인증할 때의 계약 초안이다.

## 목표

- 앱은 Supabase에 직접 붙지 않고 웹 API를 통해 인증한다.
- 웹은 기존 cookie 기반 흐름을 유지할 수 있다.
- 모바일은 cookie refresh를 재사용하지 않고 명시적인 header/body 계약을 사용한다.

## 기본 원칙

1. 모바일 앱은 `Authorization` 헤더를 access token 전용으로 사용한다.
2. refresh token은 `Authorization`에 섞지 않고 별도 헤더로 전달한다.
3. 모바일 요청은 웹과 응답 형식을 다르게 가져갈 수 있도록 명시적인 클라이언트 메타 헤더를 보낸다.
4. 웹은 cookie 기반 refresh를 유지하고, 모바일은 body 기반 refresh 응답을 사용한다.

## 헤더 규칙

### 공통

- `Authorization: Bearer <access-token>`
  - access token 전용

### 모바일 전용

- `X-Client-Platform: mobile`
  - 요청/응답 형식 분기용
  - 보안 경계가 아니라 클라이언트 종류 식별용

- `X-Refresh-Token: <refresh-token>`
  - refresh 요청 시 사용
  - 모바일에서만 사용

## 엔드포인트별 계약

참고 API path:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/me`

### 1. Login

#### Request

```http
POST /api/auth/login
Content-Type: application/json
X-Client-Platform: mobile
```

```json
{
  "email": "rider@example.com",
  "password": "password"
}
```

#### Response

```json
{
  "data": {
    "session": {
      "userId": "user-id",
      "name": "라이더",
      "email": "rider@example.com",
      "avatarUrl": null
    },
    "accessToken": "access-token",
    "refreshToken": "refresh-token"
  }
}
```

#### 규칙

- 웹 클라이언트는 기존처럼 cookie를 사용할 수 있다.
- 모바일은 response body에서 `accessToken`, `refreshToken`을 모두 받는다.
- 앱은 두 토큰을 `SecureStore`에 저장한다.

### 2. Signup

#### Request

```http
POST /api/auth/signup
Content-Type: application/json
X-Client-Platform: mobile
```

```json
{
  "email": "rider@example.com",
  "password": "password",
  "name": "라이더"
}
```

#### Response

```json
{
  "data": {
    "session": {
      "userId": "user-id",
      "name": "라이더",
      "email": "rider@example.com",
      "avatarUrl": null
    },
    "accessToken": "access-token",
    "refreshToken": "refresh-token"
  }
}
```

### 3. Refresh

#### Request

```http
POST /api/auth/refresh
X-Client-Platform: mobile
X-Refresh-Token: refresh-token
```

#### Response

```json
{
  "data": {
    "refreshed": true,
    "accessToken": "next-access-token",
    "refreshToken": "next-refresh-token"
  }
}
```

#### 규칙

- 모바일은 cookie를 읽지 않는다.
- 모바일 refresh는 `X-Refresh-Token`을 사용한다.
- refresh token rotation이 발생하면 새 refresh token을 반드시 response body로 다시 받는다.
- 앱은 응답을 받은 즉시 `accessToken`, `refreshToken`을 모두 교체 저장한다.

### 4. Logout

#### Request

```http
POST /api/auth/logout
X-Client-Platform: mobile
Authorization: Bearer access-token
```

#### Response

```json
{
  "data": {
    "loggedOut": true
  }
}
```

#### 규칙

- 모바일은 성공 응답 수신 후 로컬의 `accessToken`, `refreshToken`, 세션 캐시를 모두 제거한다.
- 서버는 필요 시 모바일 refresh token revoke 정책을 후속으로 붙일 수 있다.

### 5. Me

#### Request

```http
GET /api/me
Authorization: Bearer access-token
X-Client-Platform: mobile
```

#### Response

```json
{
  "data": {
    "authenticated": true,
    "session": {
      "userId": "user-id",
      "name": "라이더",
      "email": "rider@example.com",
      "avatarUrl": null
    }
  }
}
```

## 앱 저장소 규칙

- access token: `SecureStore`
- refresh token: `SecureStore`
- session snapshot: 필요 시 memory cache + query cache

권장:

- 토큰은 영속 저장
- 사용자 표시 정보는 `me` 재조회로 복원

## 실패 처리 규칙

### access token 만료

1. API 요청이 `401`을 반환한다.
2. 앱은 `POST /api/auth/refresh`를 호출한다.
3. refresh 성공 시 새 access token으로 원 요청을 1회 재시도한다.
4. refresh 실패 시 강제 로그아웃한다.

### refresh 실패

다음 경우 강제 로그아웃 처리:

- refresh token 없음
- refresh token 만료
- 탈퇴 처리 계정
- 서버가 refresh 거부

## 서버 구현 메모

현재 웹 구현은 cookie 기반 refresh만 읽는다. 모바일 대응을 위해 아래 보완이 필요하다.

1. `getRefreshTokenFromRequest(request)` 같은 별도 함수 추가
2. `X-Client-Platform: mobile`인 경우 `X-Refresh-Token` 읽기
3. 모바일 refresh 응답은 body에 `refreshToken` 포함
4. 웹은 기존 cookie 흐름 유지

## 타입 변경 후보

현재 `package-shared/src/types/auth.ts`의 `AuthResponseData`, `RefreshResponseData`는 모바일 계약을 다 담지 못한다.

후속 타입 후보:

```ts
export type AuthResponseData = {
  session: AppSession | null;
  accessToken: string | null;
  refreshToken?: string | null;
};

export type RefreshResponseData = {
  refreshed: boolean;
  accessToken: string | null;
  refreshToken?: string | null;
};
```

주의:

- `refreshToken`은 웹 응답에서는 생략 가능
- 모바일 응답에서는 필수로 다루는 방향 권장

## 오픈 이슈

- `X-Client-Platform` 이름을 그대로 쓸지 확정 필요
- `X-Refresh-Token` 이름을 그대로 쓸지 확정 필요
- 모바일 logout 시 서버 측 revoke 정책을 둘지
- signup 직후 refresh token을 바로 발급할지


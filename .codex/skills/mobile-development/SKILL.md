---
name: biker-map-mobile-development
description: Use when working on Biker Map Expo mobile app, Expo Router screens, mobile auth contract, web BFF API integration, and app-only UX.
metadata:
  short-description: Expo mobile guidance
---

# App Development Skill

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

Expo 기반 Biker Map 모바일 앱 개발, 웹 API 계약 연동, 앱 전용 UX 구현 시 사용합니다.

## 사용 시점

다음 작업을 할 때 이 skill을 사용합니다.

- `mobile` 앱 화면, navigation, tab, auth flow 구현
- Expo Router 구조 변경
- 모바일 API client 또는 token refresh flow 구현
- `package-shared` 타입/상수 기반 앱 기능 구현
- 웹 API contract가 모바일 앱에 미치는 영향 검토
- 앱 전용 기능, 예를 들어 실시간 위치 공유나 네이티브 UX 검토

## 먼저 읽을 문서

- 앱 구현 가이드: `.codex/skills/mobile-development/mobile.md`
- 모바일 인증 계약: `package-shared/docs/common/mobile-auth-contract.md`
- 공통 문서 허브: `package-shared/docs/common/README.md`
- 모바일 README: `mobile/README.md`
- BFF API 기준: `.codex/skills/bff-development/bff.md`
- nativeCss가이드 : `.codex/skills/mobile-development/native-css.md`

## 공통 전제

이 섹션은 같은 폴더의 세부 문서가 반복해서 적지 않는 모바일 공통 전제입니다.

### Source Of Truth

- 현재 실제 API route, 인증, 세션, Supabase 연동의 source of truth는 `web`입니다.
- 모바일 앱은 웹 BFF API contract를 소비합니다.
- 앱에 영향이 있는 API/auth/notification 변경은 `package-shared/docs/common` 갱신 여부를 확인합니다.

### Auth Contract

- 모바일은 cookie 기반 웹 refresh 흐름에 의존하지 않습니다.
- access token은 `Authorization: Bearer <token>`으로 보냅니다.
- refresh token은 `X-Refresh-Token`으로 refresh API에만 전달합니다.
- 모바일 요청은 `X-Client-Platform: mobile` 헤더를 사용합니다.

### Shared Contract

- API path는 가능하면 `package-shared`의 `API_PATHS`를 사용합니다.
- request/response 타입은 `package-shared` 타입을 우선합니다.
- 앱 전용 response shape를 웹과 별도로 임의 생성하지 않습니다.

## 세부 문서 역할

- `.codex/skills/mobile-development/mobile.md`: Expo Router 구조, 앱 API client, 상태 관리, 앱 전용 UX 구현 기준입니다.
- `package-shared/docs/common/mobile-auth-contract.md`: 모바일 인증 header, refresh, token 저장 계약입니다.
- `.codex/skills/bff-development/bff.md`: 웹 BFF API route 정책과 response contract 기준입니다.

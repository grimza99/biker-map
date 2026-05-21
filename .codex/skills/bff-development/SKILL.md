---
name: biker-map-bff-development
description: Use when working on Biker Map Next.js App Router API routes, request validation, authorization, Supabase server queries, and shared API contracts.
metadata:
  short-description: BFF API route guidance
---

# BFF Engineering Skill

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

Next.js App Router API route, Supabase server query, request validation, authorization, response contract 작업 시 사용합니다.

## 사용 시점

다음 작업을 할 때 이 skill을 사용합니다.

- `web/app/api/**/route.ts` 구현 또는 수정
- API request body/query validation
- API response shape 정리
- Supabase server/API/service client 사용
- owner/admin 권한 확인
- 앱과 웹이 함께 소비하는 API contract 변경
- Naver geocoding, directions 같은 외부 API를 BFF에서 호출하는 작업

## 먼저 읽을 문서

- BFF 구현 가이드: `.codex/skills/bff-development/bff.md`
- Supabase client 규칙: `.codex/skills/frontend-development/supabase-client.md`
- Zod 검증 규칙: `.codex/skills/frontend-development/zod.md`

## 공통 전제

이 섹션은 같은 폴더의 세부 문서가 반복해서 적지 않는 BFF 공통 전제입니다.

### BFF Boundary

- `web/app/api/**/route.ts`는 Biker Map의 BFF 계층입니다.
- 클라이언트 컴포넌트는 Supabase table이나 비용성 외부 API를 직접 다루지 않고 BFF API를 통해 접근합니다.
- 앱과 웹이 함께 소비할 가능성이 있는 응답은 `package-shared` contract 영향 여부를 확인합니다.

### Request Flow

- request body/query를 먼저 검증합니다.
- 인증이 필요한 API는 Supabase query 전에 session을 확인합니다.
- owner/admin 권한이 필요한 API는 write 전에 권한을 계산합니다.
- Supabase row를 그대로 응답하지 않고 mapper 또는 contract를 거칩니다.
- 실패 응답은 `badRequest`, `forbidden`, `notFound`, `internalServerError` 같은 response helper로 정리합니다.

### Auth와 Service Role

- RLS가 있어도 BFF authorization을 생략하지 않습니다.
- service role client를 쓰더라도 사용자 권한 검사는 먼저 수행합니다.
- refresh fallback은 client API helper 책임이며, API route나 Supabase client 내부에 중복 구현하지 않습니다.

## 세부 문서 역할

- `.codex/skills/bff-development/bff.md`: route handler 구현, validation, authorization, response contract 기준입니다.
- `.codex/skills/frontend-development/supabase-client.md`: Supabase client 종류, env, service client 생성 위치 기준입니다.
- `.codex/skills/frontend-development/zod.md`: Zod schema 위치와 검증 실패 처리 기준입니다.
- `.codex/skills/db-engineering/SKILL.md`: RLS, baseline, service role 공통 전제의 source of truth입니다.

---
name: biker-map-frontend-development
description: Use when working on Biker Map web frontend UI, FSD structure, TanStack Query, Zod validation, Supabase client boundaries, toast, and optimistic updates.
metadata:
  short-description: Web frontend guidance
---

# Frontend Development Skill

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 skill은 Biker Map의 프론트엔드 구현 컨벤션을 따를 때 사용합니다.

## 사용 시점

다음 작업을 할 때 이 skill을 사용합니다.

- `web` client component, page, widget, feature 구현
- TanStack Query query/mutation hook 작성
- form, env, API payload Zod 검증
- Supabase browser/realtime/API client 경계 확인
- toast, optimistic update, cache invalidation 설계
- FSD 구조에서 entity, feature, widget 조합 기준 확인

## 먼저 읽을 문서

- TanStack Query 서버 상태 관리: `.codex/skills/frontend-development/tanstack-query.md`
- Zod 검증 규칙: `.codex/skills/frontend-development/zod.md`
- Supabase client 사용 규칙: `.codex/skills/frontend-development/supabase-client.md`
- 지도 사이드패널 Parallel Route 기준: `.codex/skills/frontend-development/map-panel-parallel-route.md`

## 공통 전제

이 섹션은 같은 폴더의 세부 문서가 반복해서 적지 않는 프론트엔드 공통 전제입니다.

### FSD 경계

- `entities`는 도메인 데이터와 도메인 UI를 둡니다.
- `features`는 사용자 액션 단위 기능을 둡니다.
- `widgets`는 여러 entity와 feature를 조합한 화면 블록을 둡니다.
- 댓글, 반응, 즐겨찾기처럼 함께 쓰이는 기능은 세부 feature를 분리하되 화면에서는 widget에서 조합합니다.

### Server State

- API 응답 데이터, 로딩, 에러, 캐시, invalidation은 TanStack Query가 담당합니다.
- query hook과 mutation hook은 도메인별 model에 분리합니다.
- mutation 성공/실패 피드백은 가능한 mutation hook의 `onSuccess`, `onError`에서 처리합니다.
- reaction, favorite처럼 즉시 반응성이 필요한 기능은 optimistic update를 우선 검토합니다.

### Runtime Validation

- TypeScript 타입만으로 외부 입력을 신뢰하지 않습니다.
- API body, form input, env, 불확실한 error payload는 Zod로 런타임 검증합니다.
- ZodError 내부 구조를 사용자 응답에 그대로 노출하지 않습니다.

### Supabase Boundary

- 클라이언트 컴포넌트는 service role을 절대 사용하지 않습니다.
- 일반 데이터 접근과 비용성 외부 API 호출은 BFF API route를 통합니다.
- Realtime 수신 후 nav, dropdown처럼 즉시성이 필요한 UI는 query cache 직접 갱신을 우선 검토합니다.

## 세부 문서 역할

- `.codex/skills/frontend-development/tanstack-query.md`: query/mutation hook, toast, optimistic update, cache 기준입니다.
- `.codex/skills/frontend-development/zod.md`: API/form/env/error payload 런타임 검증 기준입니다.
- `.codex/skills/frontend-development/supabase-client.md`: Supabase client 종류, env, browser/server 경계 기준입니다.
- `.codex/skills/frontend-development/map-panel-parallel-route.md`: 지도 `@panel` parallel route, route-local UI, `/map/list` path 기준입니다.
- `.codex/skills/bff-development/bff.md`: API route authorization과 response contract의 source of truth입니다.
- `.codex/skills/db-engineering/SKILL.md`: RLS, baseline, service role 공통 전제의 source of truth입니다.

---
name: biker-map-db-engineering
description: Use when working on Biker Map Supabase Postgres schema, migrations, RLS policies, indexes, constraints, functions, triggers, Storage, Realtime, and DB audits.
metadata:
  short-description: Supabase DB guidance
---

# DB Engineering Skill

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

Supabase Postgres schema, migration, RLS, index, function, Storage, Realtime 작업 시 사용합니다.

## 사용 시점

다음 작업을 할 때 이 skill을 사용합니다.

- Supabase migration 작성 또는 검토
- RLS policy 작성 또는 수정
- table, column, index, constraint 설계
- Postgres function, trigger, security definer 점검
- Storage bucket 정책 검토
- Realtime publication 또는 notification flow 점검
- live DB baseline과 repo migration 정합성 확인

## 먼저 읽을 문서

- DB 설계 가이드: `.codex/skills/db-engineering/database-design-guide.md`
- DB auditor 상세 기준: `.codex/skills/db-engineering/db-auditor.md`
- Supabase client 규칙: `.codex/skills/frontend-development/supabase-client.md`
- BFF API 기준: `.codex/skills/bff-development/bff.md`
- baseline 안내: `supabase/migrations/README.md`
- 현재 live schema baseline: `supabase/baseline/current`

## 핵심 원칙

- 현재 live DB 기준은 `supabase/baseline/current`입니다.
- `supabase/migrations/legacy/pre-baseline`은 감사용 기록이며 완전한 rebuild 경로로 보지 않습니다.
- baseline 이후 변경은 정상 migration으로 추가합니다.
- RLS는 최종 방어선이고, BFF authorization은 별도로 유지합니다.
- service role은 서버 전용이며, RLS 회피용 일반 CRUD에 쓰지 않습니다.
- SQL 변경은 RLS, index, constraint, function 권한, search_path, advisor warning을 함께 확인합니다.

## 공통 전제

이 섹션은 같은 폴더의 세부 문서가 반복해서 적지 않는 공통 전제입니다.

### Baseline

- 초기 SQL migration이 완전하게 남아 있지 않았던 이력이 있습니다.
- live Supabase project의 migration tracking table이 비어 있었던 이력이 있습니다.
- 현재 상태 파악은 `supabase/baseline/current`를 우선합니다.
- legacy migration을 임의로 삭제하거나 rebuild 기준으로 사용하지 않습니다.

### RLS와 BFF Authorization

- RLS는 DB level의 최종 접근 차단 장치입니다.
- BFF API route는 session 확인, owner/admin 판단, 비용성 작업 제한, 명확한 error response를 담당합니다.
- RLS가 있다고 해서 BFF authorization을 생략하지 않습니다.
- 비용 제한이나 하루 생성 제한은 RLS보다 BFF API route에서 상수로 관리합니다.

### Service Role

- service role key는 서버 전용입니다.
- service role은 notification writer, count sync, auth admin 작업처럼 시스템 권한이 필요한 경우에만 사용합니다.
- 일반 CRUD의 RLS 우회, owner/admin 확인 생략, client bundle import는 금지합니다.
- Supabase client 종류, env key, 구현 위치는 `.codex/skills/frontend-development/supabase-client.md`를 source of truth로 봅니다.

## 세부 문서 역할

- `.codex/skills/db-engineering/database-design-guide.md`: schema, migration, RLS, index, constraint, function, trigger 설계와 작성 기준입니다.
- `.codex/skills/db-engineering/db-auditor.md`: DB 변경사항의 보안, 권한, 운영 리스크 점검 체크리스트입니다.
- `.codex/skills/bff-development/bff.md`: API route authorization, request validation, response 정책의 source of truth입니다.
- `.codex/skills/frontend-development/supabase-client.md`: Supabase client 종류, env, browser/server 경계의 source of truth입니다.

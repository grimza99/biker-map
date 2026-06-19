# Database Design Guide

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-21

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 Biker Map의 Supabase Postgres, migration, RLS, Storage, Realtime 작업 기준을 정리합니다.

## 문서 역할

이 문서는 DB를 설계, 작성, 수정할 때의 engineering source of truth입니다.

- schema, migration, RLS, index, constraint, function, trigger 설계 기준은 이 문서를 우선합니다.
- 변경사항을 리뷰하거나 보안 관점으로 감사할 때는 `.codex/skills/db-engineering/db-auditor.md`를 함께 봅니다.
- baseline, RLS/BFF 관계, service role 경계의 공통 전제는 `.codex/skills/db-engineering/SKILL.md`를 따릅니다.
- Supabase client 종류는 `.codex/skills/frontend-development/supabase-client.md`를 함께 봅니다.
- API authorization과 BFF 정책은 `.codex/skills/bff-development/bff.md`를 함께 봅니다.

## Migration 작성 기준

새 migration은 하나의 목적을 갖도록 작게 작성합니다.

- table 생성
- column 추가
- index 추가
- RLS policy 변경
- function/trigger 변경

파괴적 변경은 특히 명시합니다.

- `drop table`
- `drop column`
- `drop policy`
- `alter column type`
- 대량 update/delete

Supabase SQL editor가 destructive warning을 띄우면 실제 의도한 변경인지 다시 확인합니다.

## RLS 기준

RLS policy는 table별 작업 단위가 드러나도록 작성합니다.

- 읽기 정책과 쓰기 정책을 분리합니다.
- insert, update, delete 조건을 각각 명확히 둡니다.
- owner/admin 권한은 API authorization과 RLS 양쪽에서 일관되게 맞춥니다.
- 비용 제한이나 비즈니스 limit은 RLS만으로 처리하지 말고 BFF API route에서 관리합니다.

예시 기준:

- 공개 읽기 데이터는 `select using (true)`가 가능할 수 있습니다.
- insert는 로그인 사용자만 허용할 수 있습니다.
- update/delete는 owner 또는 admin으로 제한합니다.
- admin 판단은 `profiles.role = 'admin'` 기준과 일관되어야 합니다.

## Index 기준

목록 API에서 자주 사용하는 조건은 index 후보입니다.

검토 대상:

- `created_at` 정렬
- `user_id`, `author_id`, `profile_id`
- `target_type`, `target_id`
- `post_id`, `parent_id`
- route region, source type
- notification `recipient_id`, `read_at`, `source_type`

서버 메모리 필터링을 DB query 필터링으로 옮긴 뒤 실제 query shape에 맞춰 index를 설계합니다.

## Constraint 기준

DB constraint는 앱/BFF validation의 보조가 아니라 최종 정합성 장치입니다.

사용 후보:

- enum 성격의 `check`
- unique key
- foreign key
- not null
- count나 coordinate 범위 check

예시:

- reaction type: `like`, `dislike`
- reaction target type: `post`, `comment`
- favorite target type: `post`, `route`
- notification source type: `post`, `comment`, `system`

## Function / Trigger 기준

Postgres function은 권한과 `search_path`를 반드시 확인합니다.

특히 확인할 것:

- `security definer` 필요 여부
- anon/authenticated execute 권한
- `set search_path = public` 명시 여부
- service_role 전용이어야 하는지
- trigger가 삭제/수정 시 의도한 row만 건드리는지

Supabase advisor에서 mutable search_path 또는 security definer 관련 경고가 나오면 우선 점검 대상입니다.

## Service Role 기준

허용되는 경우:

- notification writer처럼 시스템이 작성해야 하는 row
- comment count sync처럼 서버가 정합성을 맞추는 작업
- auth metadata와 profile 정리처럼 일반 RLS로 처리하기 어려운 작업

금지되는 경우:

- 클라이언트에서 사용
- 단순 CRUD의 RLS 우회
- owner/admin 권한 확인 생략
- public bundle에 포함될 수 있는 파일에서 import

상세한 service role 공통 전제는 `.codex/skills/db-engineering/SKILL.md`, client 종류와 구현 위치는 `.codex/skills/frontend-development/supabase-client.md`를 source of truth로 봅니다.

## Storage 기준

Storage bucket 이름 자체는 보안 정보가 아닙니다.

보호해야 하는 것:

- write 권한
- delete 권한
- signed URL 정책
- service role key

이미지 URL이 404를 반환할 때는 먼저 bucket public/private 설정과 path를 확인합니다.

프로필 이미지 삭제처럼 bucket object를 함께 삭제해야 하는 경우, DB에는 public URL만 저장되어 있더라도 같은 bucket URL인지 판단해 삭제할 수 있습니다. 단, 외부 URL이나 다른 bucket object를 삭제하지 않도록 origin/path 검증을 둡니다.

## Realtime 기준

현재 알림은 Supabase Realtime 기반입니다.

- DB row change를 감지합니다.
- UI 즉시성은 client cache update와 invalidation에 영향을 받습니다.
- 알림 source type은 `post`, `comment`, `system`으로 분리합니다.

채팅이나 실시간 위치 공유는 별도 WebSocket 서버 도입을 검토합니다. 알림에 쓰는 Realtime 구조를 그대로 확장한다고 가정하지 않습니다.

## Route 관련 DB 메모

- curated route와 user custom route는 다른 개념입니다.
- 사용자 route 생성 UI는 현재 보류 상태입니다.
- geocoding 비용 때문에 route write 제한은 BFF API route에서 상수로 관리하는 방향입니다.
- routes insert/update/delete 정책은 owner/admin 요구사항과 비용 제한을 함께 고려해야 합니다.

## 금지 패턴

- destructive SQL을 warning 확인 없이 실행
- function의 `search_path`와 execute 권한 미확인
- 전체 조회 후 서버 메모리 필터링을 전제로 index 설계
- 앱/BFF validation만 믿고 DB constraint를 전혀 두지 않기

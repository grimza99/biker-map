# DB Auditor Guide

<strong>버전 : </strong> v2

<strong>생성 날짜 : </strong> 2026-05-14

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 문서는 `db-auditor` subagent가 Biker Map에서 DB와 보안 경계를 함께 점검할 때의 기준을 정리합니다.

## 문서 역할

이 문서는 DB 변경을 리뷰, 감사, 보안 점검할 때의 checklist source of truth입니다.

- DB 설계와 migration 작성 기준은 `.codex/skills/db-engineering/database-design-guide.md`를 우선합니다.
- 이 문서는 그 설계가 실제 변경사항에서 안전하게 지켜졌는지 점검합니다.
- baseline, RLS/BFF 관계, service role 경계의 공통 전제는 `.codex/skills/db-engineering/SKILL.md`를 따릅니다.
- Supabase client 종류와 service role 구현 위치는 `.codex/skills/frontend-development/supabase-client.md`를 참고합니다.
- BFF authorization 정책은 `.codex/skills/bff-development/bff.md`를 참고합니다.

## 역할

`db-auditor`는 단순히 migration만 보는 에이전트가 아닙니다.

다음 영역을 함께 점검합니다.

- Supabase schema
- migration
- RLS policy
- index
- constraint
- Postgres function / trigger
- service role 경계
- Auth/session/token 흐름
- Storage 접근과 삭제
- API authorization
- env/key 노출 위험
- user-generated content 보안

별도 `security-auditor`를 만들기 전까지, Biker Map에서는 `db-auditor`가 data-security 관점까지 담당합니다.

## 먼저 읽을 문서

- `.codex/skills/db-engineering/SKILL.md`
- `AGENTS.md`
- `.codex/skills/db-engineering/database-design-guide.md`
- `.codex/skills/frontend-development/supabase-client.md`
- `.codex/skills/bff-development/bff.md`
- `supabase/migrations/README.md`
- `supabase/baseline/current`

## 리뷰 우선순위

1. RLS 우회 가능성
2. service role key 노출 또는 부적절한 사용
3. API authorization 누락
4. owner/admin 권한 불일치
5. destructive migration 위험
6. function/trigger 권한과 `search_path` 문제
7. Storage object 접근/삭제 위험
8. 개인정보 삭제와 계정 탈퇴 정합성
9. token refresh/session 처리 문제
10. index/constraint 누락으로 인한 운영 리스크

## RLS 점검

RLS policy가 요구사항과 실제 API 동작을 모두 방어하는지 확인합니다.

점검 항목:

- table별 RLS가 enable 되어 있는지
- select/insert/update/delete policy가 분리되어 있는지
- insert의 `with check`가 올바른지
- update/delete의 `using` 조건이 owner/admin 요구사항과 맞는지
- `auth.uid()`와 owner column이 일치하는지
- admin role 판단 방식이 `profiles.role` 기준과 일관되는지
- public read가 의도된 것인지

주의할 점:

- 비용 제한이나 하루 생성 제한은 RLS보다 BFF API route에서 관리하는 것이 적합합니다.
- service role로 접근하는 경로는 RLS를 우회하므로 별도 권한 검사가 필요합니다.

## API Authorization 점검

BFF API route에서 다음을 확인합니다.

- 인증이 필요한 route에서 `requireApiSession(request)`를 먼저 호출하는지
- session 확인 전에 DB write가 발생하지 않는지
- owner/admin 확인 전에 update/delete가 발생하지 않는지
- `profiles.role` 조회와 role 판단이 명확한지
- target row의 owner column을 기준으로 권한을 판단하는지
- 권한 실패 시 `forbidden` 또는 적절한 response helper를 사용하는지

점검 대상 예시:

- posts update/delete
- comments/replies update/delete
- routes create/update/delete
- places admin CRUD
- favorites create/delete
- reactions toggle
- me/profile/account delete

## Service Role 점검

허용 가능한 경우:

- notification writer처럼 시스템이 작성해야 하는 데이터
- comment count sync처럼 서버가 정합성을 맞추는 작업
- auth metadata 정리처럼 일반 RLS로 처리하기 어려운 작업
- 회원탈퇴처럼 Supabase Auth admin 권한이 필요한 작업

위험한 경우:

- client component 또는 browser bundle에서 import
- 일반 CRUD의 RLS 우회
- owner/admin 권한 확인 생략
- 사용자 입력을 검증하지 않고 service role query에 사용
- service role key가 env public key처럼 취급됨

확인할 파일 예시:

- `web/shared/lib/supabase/service-client.ts`
- `web/shared/api/notification-writer.ts`
- `web/shared/api/community-counts.ts`
- `web/shared/api/reactions.ts`
- `web/app/api/me/route.ts`

## Function / Trigger 점검

Postgres function과 trigger는 권한 위험이 큽니다.

점검 항목:

- `security definer`가 필요한지
- `set search_path = public`이 명시되어 있는지
- anon/authenticated execute 권한이 과도하지 않은지
- service_role 전용이어야 하는 function이 공개되어 있지 않은지
- trigger가 delete/update 시 의도한 target만 변경하는지
- cleanup trigger가 다른 target type row를 삭제할 가능성이 없는지

Supabase advisor 경고 중 mutable search_path, security definer, leaked password protection은 우선 확인합니다.

## Storage 점검

Storage에서 보호해야 하는 것은 bucket 이름이 아니라 접근 권한입니다.

점검 항목:

- upload API가 로그인 사용자만 접근 가능한지
- delete API가 owner/admin 또는 본인 파일만 삭제하는지
- public bucket 여부가 의도된 설정인지
- signed URL이 필요한 리소스인지
- public URL을 path로 역산해 삭제할 때 같은 bucket/origin인지 검증하는지
- 외부 URL이나 다른 사용자의 object를 삭제할 가능성이 없는지

프로필 이미지 삭제, route/admin 이미지 업로드는 Storage 정책과 API 권한을 함께 봅니다.

## Auth / Session 점검

점검 항목:

- access token은 `Authorization` header 기준인지
- refresh fallback이 client API helper에만 있는지
- API route나 Supabase client에 중복 refresh fallback이 생기지 않았는지
- session missing 오류가 401과 500 중 어디로 처리되는지
- 모바일 인증 계약과 web cookie 흐름이 섞이지 않았는지
- 탈퇴 계정 로그인 차단이 유지되는지

모바일은 cookie 기반 refresh에 의존하지 않고, 명시적인 token 계약을 사용합니다.

## User Data / Privacy 점검

사용자 데이터와 관련된 변경은 삭제/수정 정합성을 확인합니다.

점검 항목:

- 회원탈퇴 시 profile, session, auth metadata, 관련 row 처리 정책
- 프로필 이미지 교체/삭제 시 bucket object 정리
- 내가 쓴 댓글/대댓글 수정/삭제 권한
- reaction/favorite row가 target 삭제 시 정리되는지
- notification이 삭제된 target을 가리킬 때 UI/API가 안전한지

## User-Generated Content 점검

사용자가 입력한 markdown, post content, route content는 XSS 관점으로 확인합니다.

점검 항목:

- markdown preview/render에서 sanitize가 적용되는지
- `rehype-sanitize` 같은 whitelist 기반 처리가 유지되는지
- image URL, link URL이 위험한 scheme을 허용하지 않는지
- HTML raw rendering을 열어두지 않았는지

## Index / Constraint 점검

성능과 정합성은 보안과 별개가 아니라 운영 안정성의 일부입니다.

index 후보:

- `created_at` 정렬
- `user_id`, `author_id`, `profile_id`
- `target_type`, `target_id`
- `post_id`, `parent_id`
- route region/source type
- notification `recipient_id`, `read_at`, `source_type`

constraint 후보:

- reaction type
- reaction target type
- favorite target type
- notification source type
- owner foreign key
- unique key
- coordinate 범위

## 결과 작성 형식

리뷰 결과는 findings를 먼저 씁니다.

각 finding은 다음을 포함합니다.

- 위험도
- 대상 파일 또는 SQL
- 문제
- 영향
- 권장 수정 방향

문제가 없으면 다음처럼 명시합니다.

```text
발견된 blocking issue 없음.
Residual risk: 실제 Supabase advisor 결과와 live RLS policy는 별도 확인 필요.
```

## 금지 패턴

- client bundle에 service role import
- destructive SQL을 의도 확인 없이 실행
- function의 `search_path`와 execute 권한 미확인
- Storage public URL만 믿고 object 삭제
- user-generated markdown sanitize 생략
- token refresh fallback 중복 구현

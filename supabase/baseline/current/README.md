# Biker Map 현재 데이터베이스 baseline

<strong>버전 : </strong> v1

<strong>생성 날짜 : </strong> 2026-05-14

<strong>최신 업데이트 날짜 : </strong> 2026-05-21

이 디렉터리는 Supabase project `caveyrhwcmfwrdfsstdu` (`biker-map`)의 현재 live database 구조를 source-of-truth 복구용 snapshot으로 저장합니다.

이 레포에는 최초 초기 schema migration이 누락되어 있었던 상태였습니다.
따라서 migration history를 어떻게 재구성할지 결정하기 전까지, 이 파일들은 의도적으로 `supabase/migrations/`와 분리하여`supabase/baseline/`하위에 보관합니다.

## 범위

- public application table
- primary key, foreign key, unique constraint, check constraint
- index
- RLS 활성화 여부와 policy
- trigger function, table trigger, auth trigger, event trigger
- live database에서 확인 가능한 function execute grant와 table grant

## 파일 구성

- `00_extensions.sql`: application schema와 관련된 설치 extension
- `00_common_functions.sql`: 공통 trigger/event-trigger function
- `tables/*.sql`: application table별 SQL 파일
- `20_storage.sql`: 현재 storage bucket과 storage object policy
- `99_auth_and_event_triggers.sql`: 대상 public table 외부의 trigger

## 중요 메모

- 이 디렉터리는 현재 live DB 상태의 snapshot이며, production audit 과정에서 확인된 알려진 이슈도 포함합니다.
- 이 파일들을 리뷰 없이 승인된 production migration으로 취급하면 안 됩니다.
- data dump는 포함하지 않습니다.
- 일부 SQL은 audit에서 권한 축소를 권장하더라도, 현재 관측된 broad grant와 `SECURITY DEFINER` RPC surface를 그대로 반영합니다.
- 이 snapshot보다 오래된 historical migration fragment는 `supabase/migrations/legacy/pre-baseline/`에 보존합니다.
